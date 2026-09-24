import { mkdtemp, writeFile, readFile, access, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createCodexProvider } from "../src/server/codex-provider.mjs";
import { createMemoryStore } from "../src/server/store.mjs";
import { testRuntimeInstructions as initialRuntimeInstructions } from "./fixtures/runtime-instructions.mjs";

const codexModels = [
  { id: "gpt-6-astra", efforts: ["xhigh", "ultra"] },
  { id: "gpt-6-sol", efforts: ["low", "medium", "high", "xhigh", "max", "ultra"] }
];
const syntheticGrant = refreshToken => Buffer.from(JSON.stringify({ auth_mode: "chatgpt", tokens: { access_token: "synthetic-access", refresh_token: refreshToken } }));

test("Codex allows a progressing answer past its idle budget, but bounds silence and total duration", async () => {
  for (const [suffix, expected] of [["", { ok: true, body: "A bounded answer.", sources: [] }], [" wrong turn", { ok: false, code: "provider_idle_timeout" }], [" never completes", { ok: false, code: "provider_timeout" }]]) {
    const provider = createCodexProvider({ readyForProvider: true, codexCommand: fileURLToPath(new URL("./fixtures/fake-codex.mjs", import.meta.url)) }, undefined, { idleMs: 300, maximumMs: suffix.includes("never") ? 550 : 2_000 });
    assert.deepEqual(await provider.invoke({ assignment: `Exercise progress deadline${suffix}`, model: "gpt-6-sol", effort: "max", evidence: { owner: "Synthetic question", discussion: "" }, research: false, runtimeInstructions: initialRuntimeInstructions }), expected);
  }
});

test("independent Codex turns run concurrently", { timeout: 5_000 }, async () => {
  const provider = createCodexProvider({ readyForProvider: true, codexCommand: fileURLToPath(new URL("./fixtures/fake-codex.mjs", import.meta.url)) });
  const input = { assignment: "Wait for a slow ephemeral turn.", model: "gpt-6-astra", effort: "xhigh", evidence: { owner: "Question", discussion: "" }, research: false, runtimeInstructions: initialRuntimeInstructions };
  const started = Date.now();
  const results = await Promise.all([provider.invoke(input), provider.invoke(input)]);
  assert.equal(results.every(result => result.ok), true);
  assert.ok(Date.now() - started < 4_500, "two 2.8 second calls must overlap");
});

test("a refreshed managed grant is saved before its private app-server home is removed", async () => {
  const store = createMemoryStore();
  await store.seedCodexGrant(syntheticGrant("synthetic-initial"));
  const command = fileURLToPath(new URL("./fixtures/rotating-auth-codex.mjs", import.meta.url));
  const provider = createCodexProvider({ readyForProvider: true, codexCommand: command }, store);
  assert.equal((await provider.inspect()).status, "ready");
  const current = await store.codexGrant();
  assert.equal(JSON.parse(current.bytes.toString()).tokens.refresh_token, "synthetic-rotated");
  assert.equal(current.generation, 2);
  assert.equal((await provider.inspect()).status, "ready");
  assert.equal((await store.codexGrant()).generation, 2);
});

test("a failed grant write-back cannot report Codex ready", async () => {
  const command = fileURLToPath(new URL("./fixtures/rotating-auth-codex.mjs", import.meta.url));
  const store = { codexGrant: async () => ({ bytes: syntheticGrant("synthetic-initial"), generation: 1 }), saveCodexGrant: async () => { throw new Error("database_unavailable"); } };
  const provider = createCodexProvider({ readyForProvider: true, codexCommand: command }, store);
  assert.equal((await provider.inspect()).status, "unavailable");
});

test("close retries a rotated grant after an earlier write-back exhausted retries", async () => {
  const command = fileURLToPath(new URL("./fixtures/rotating-auth-codex.mjs", import.meta.url));
  let attempts = 0;
  let saved;
  const store = {
    codexGrant: async () => ({ bytes: syntheticGrant("synthetic-initial"), generation: 1 }),
    saveCodexGrant: async bytes => {
      attempts += 1;
      if (attempts <= 3) throw new Error("database_unavailable");
      saved = Buffer.from(bytes);
      return 2;
    }
  };
  const provider = createCodexProvider({ readyForProvider: true, codexCommand: command }, store);
  assert.equal((await provider.inspect()).status, "unavailable");
  assert.equal(attempts, 4);
  assert.equal(JSON.parse(saved.toString()).tokens.refresh_token, "synthetic-rotated");
});

test("Settings inspection returns busy promptly while a Codex turn holds the grant", async () => {
  const command = fileURLToPath(new URL("./fixtures/fake-codex.mjs", import.meta.url));
  const provider = createCodexProvider({ readyForProvider: true, codexCommand: command });
  const turn = provider.invoke({ assignment: "Wait for a slow ephemeral turn.", model: "gpt-6-astra", effort: "xhigh", evidence: { owner: "Question", discussion: "" }, research: false, runtimeInstructions: initialRuntimeInstructions, signal: new AbortController().signal });
  assert.deepEqual(await provider.inspect(), { status: "busy", models: [], catalogCurrent: false });
  assert.equal((await turn).ok, true);
});

test("Codex turns use an owned workspace and deny local tool channels", async () => {
  const command = fileURLToPath(new URL("./fixtures/fake-codex.mjs", import.meta.url));
  const provider = createCodexProvider({ readyForProvider: true, codexCommand: command, codexAuthPath: undefined });
  assert.deepEqual(await provider.inspect(), { status: "ready", models: codexModels });
  const result = await provider.invoke({ assignment: "Give a practical answer.", model: "gpt-6-astra", effort: "xhigh", evidence: { owner: "Question", discussion: "" }, research: false, runtimeInstructions: initialRuntimeInstructions, signal: new AbortController().signal });
  assert.deepEqual(result, { ok: true, body: "A bounded answer.", sources: [] });
});

test("GPT-6 Sol is advertised and its selected model and effort reach an isolated turn", async () => {
  const command = fileURLToPath(new URL("./fixtures/fake-codex.mjs", import.meta.url));
  const provider = createCodexProvider({ readyForProvider: true, codexCommand: command, codexAuthPath: undefined });
  assert.deepEqual(await provider.inspect(), { status: "ready", models: codexModels });
  const result = await provider.invoke({ assignment: "Give a practical answer.", model: "gpt-6-sol", effort: "high", evidence: { owner: "Question", discussion: "" }, research: false, runtimeInstructions: initialRuntimeInstructions, signal: new AbortController().signal });
  assert.deepEqual(result, { ok: true, body: "A bounded answer.", sources: [] });
});

test("Codex auth from a host secret exists only in the private app-server home", async () => {
  const command = fileURLToPath(new URL("./fixtures/auth-file-codex.mjs", import.meta.url));
  const provider = createCodexProvider({
    readyForProvider: true,
    codexCommand: command,
    codexAuthPath: undefined,
    codexAuthBytes: Buffer.from('{"test":"owned-auth-state"}')
  });
  assert.deepEqual(await provider.inspect(), { status: "ready", models: [{ id: "gpt-6-astra", efforts: ["xhigh"] }] });
});

test("live research keeps source metadata out of natural agent prose", async () => {
  const command = fileURLToPath(new URL("./fixtures/fake-codex.mjs", import.meta.url));
  const provider = createCodexProvider({ readyForProvider: true, codexCommand: command, codexAuthPath: undefined });
  const result = await provider.invoke({ assignment: "Give a practical answer.", model: "gpt-6-astra", effort: "xhigh", evidence: { owner: "What is the current market evidence?", discussion: "" }, research: true, runtimeInstructions: initialRuntimeInstructions, signal: new AbortController().signal });
  assert.equal(result.ok, true);
  assert.equal(result.body, "A bounded answer.");
  assert.deepEqual(result.sources, [{ url: "https://example.com/buyer-evidence", title: "Buyer evidence", claim: "Buyer willingness must be measured before positioning.", retrievedAt: result.sources[0].retrievedAt, publishedAt: "2026-09-01" }]);
  assert.match(result.sources[0].retrievedAt, /^\d{4}-\d{2}-\d{2}T/u);
});

test("prohibited source hosts, language and provider prose never reach a consultation", async () => {
  const command = fileURLToPath(new URL("./fixtures/fake-codex.mjs", import.meta.url));
  const provider = createCodexProvider({ readyForProvider: true, codexCommand: command, codexAuthPath: undefined });
  const source = await provider.invoke({ assignment: "Return a prohibited source.", model: "gpt-6-astra", effort: "xhigh", evidence: { owner: "Question", discussion: "" }, research: true, runtimeInstructions: initialRuntimeInstructions, signal: new AbortController().signal });
  assert.deepEqual(source, { ok: true, body: "A bounded answer.", sources: [] });
  const prose = await provider.invoke({ assignment: "Return prohibited prose.", model: "gpt-6-astra", effort: "xhigh", evidence: { owner: "Question", discussion: "" }, research: false, runtimeInstructions: initialRuntimeInstructions, signal: new AbortController().signal });
  assert.deepEqual(prose, { ok: false, code: "language_policy" });
  const bodyUrl = await provider.invoke({ assignment: "Return prohibited body URL.", model: "gpt-6-astra", effort: "xhigh", evidence: { owner: "Question", discussion: "" }, research: false, runtimeInstructions: initialRuntimeInstructions, signal: new AbortController().signal });
  assert.deepEqual(bodyUrl, { ok: true, body: "Read blocked (source link omitted: unapproved URL).", sources: [] });
});

test("Codex keeps useful prose around an omitted sentence and retains all valid direct sources", async () => {
  const command = fileURLToPath(new URL("./fixtures/fake-codex.mjs", import.meta.url));
  const provider = createCodexProvider({ readyForProvider: true, codexCommand: command });
  const base = { model: "gpt-6-astra", effort: "xhigh", evidence: { owner: "Public synthetic question", discussion: "" }, research: false, runtimeInstructions: initialRuntimeInstructions };
  const mixed = await provider.invoke({ ...base, assignment: "Return mixed-language prose." });
  assert.deepEqual(mixed, { ok: true, body: "The buyer test should run for two weeks. [prohibited-language fragment omitted] Measure qualified replies and conversion.", sources: [] });
  const onlyUrl = await provider.invoke({ ...base, assignment: "Return only a prohibited body URL." });
  assert.deepEqual(onlyUrl, { ok: false, code: "output_policy" });
  const many = await provider.invoke({ ...base, assignment: "Return twelve direct sources." });
  assert.equal(many.ok, true);
  assert.equal(many.sources.length, 12);
});

test("a completed Codex turn without a message is distinct from filtered output", async () => {
  const provider = createCodexProvider({ readyForProvider: true, codexCommand: fileURLToPath(new URL("./fixtures/fake-codex.mjs", import.meta.url)) });
  const result = await provider.invoke({ assignment: "Return an empty completed answer.", model: "gpt-6-astra", effort: "xhigh", evidence: { owner: "Question", discussion: "" }, research: false, runtimeInstructions: initialRuntimeInstructions });
  assert.deepEqual(result, { ok: false, code: "empty_response" });
});

test("a completed provider notification clears its deadline waiter", async () => {
  const command = fileURLToPath(new URL("./fixtures/fake-codex.mjs", import.meta.url));
  const provider = createCodexProvider({ readyForProvider: true, codexCommand: command, codexAuthPath: undefined });
  const result = await provider.invoke({ assignment: "Wait for the notification.", model: "gpt-6-astra", effort: "xhigh", evidence: { owner: "Question", discussion: "" }, research: false, runtimeInstructions: initialRuntimeInstructions, signal: new AbortController().signal });
  assert.deepEqual(result, { ok: true, body: "A bounded answer.", sources: [] });
});

test("valid Ukrainian prose and source metadata survive Codex output validation", async () => {
  const provider = createCodexProvider({ readyForProvider: true, codexCommand: fileURLToPath(new URL("./fixtures/fake-codex.mjs", import.meta.url)) });
  const result = await provider.invoke({ assignment: "Return a Ukrainian relative-pronoun example.", model: "gpt-6-astra", effort: "xhigh", evidence: { owner: "Які умови вступу?", discussion: "" }, research: false, runtimeInstructions: initialRuntimeInstructions });
  assert.equal(result.ok, true);
  assert.equal(result.body, "Уточніть, які умови потрібно виконати.");
  assert.equal(result.sources[0].title, "Курси, які доступні");
  assert.equal(result.sources[0].claim, "Вимоги, які підтверджує програма.");
});

test("a slow ephemeral turn uses matching completed items and terminal events without reading stored history", async () => {
  const command = fileURLToPath(new URL("./fixtures/fake-codex.mjs", import.meta.url));
  const provider = createCodexProvider({ readyForProvider: true, codexCommand: command, codexAuthPath: undefined });
  const result = await provider.invoke({ assignment: "Wait for a slow ephemeral turn.", model: "gpt-6-astra", effort: "xhigh", evidence: { owner: "Question", discussion: "" }, research: false, runtimeInstructions: initialRuntimeInstructions, signal: new AbortController().signal });
  assert.deepEqual(result, { ok: true, body: "A bounded answer.", sources: [] });
});

test("a completion received before the start response is retained", async () => {
  const provider = createCodexProvider({ readyForProvider: true, codexCommand: fileURLToPath(new URL("./fixtures/fake-codex.mjs", import.meta.url)) });
  const result = await provider.invoke({ assignment: "Complete before the start response.", model: "gpt-6-astra", effort: "xhigh", evidence: { owner: "Question", discussion: "" }, research: false, runtimeInstructions: initialRuntimeInstructions });
  assert.deepEqual(result, { ok: true, body: "A bounded answer.", sources: [] });
});

test("a failed turn never accepts a previously completed message item", async () => {
  const provider = createCodexProvider({ readyForProvider: true, codexCommand: fileURLToPath(new URL("./fixtures/fake-codex.mjs", import.meta.url)) });
  const result = await provider.invoke({ assignment: "Fail after a completed item.", model: "gpt-6-astra", effort: "xhigh", evidence: { owner: "Question", discussion: "" }, research: false, runtimeInstructions: initialRuntimeInstructions });
  assert.deepEqual(result, { ok: false, code: "quota_blocked" });
});

test("a provider connection closing without completion releases the invocation", { timeout: 3_000 }, async () => {
  const provider = createCodexProvider({ readyForProvider: true, codexCommand: fileURLToPath(new URL("./fixtures/fake-codex.mjs", import.meta.url)) });
  const result = await provider.invoke({ assignment: "Close without completion.", model: "gpt-6-astra", effort: "xhigh", evidence: { owner: "Question", discussion: "" }, research: false, runtimeInstructions: initialRuntimeInstructions });
  assert.deepEqual(result, { ok: false, code: "provider_unavailable" });
});

test("Stop cancels an unresolved ephemeral turn", { timeout: 3_000 }, async () => {
  const provider = createCodexProvider({ readyForProvider: true, codexCommand: fileURLToPath(new URL("./fixtures/fake-codex.mjs", import.meta.url)) });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 100);
  try {
    const result = await provider.invoke({ assignment: "Wait until cancelled.", model: "gpt-6-astra", effort: "xhigh", evidence: { owner: "Question", discussion: "" }, research: false, runtimeInstructions: initialRuntimeInstructions, signal: controller.signal });
    assert.deepEqual(result, { ok: false, code: "cancelled" });
  } finally { clearTimeout(timer); }
});

test("provider shutdown aborts an active Codex session before leadership can move", { timeout: 3_000 }, async () => {
  const provider = createCodexProvider({ readyForProvider: true, codexCommand: fileURLToPath(new URL("./fixtures/fake-codex.mjs", import.meta.url)) });
  const turn = provider.invoke({ assignment: "Wait until cancelled.", model: "gpt-6-astra", effort: "xhigh", evidence: { owner: "Question", discussion: "" }, research: false, runtimeInstructions: initialRuntimeInstructions });
  await new Promise(resolve => setTimeout(resolve, 100));
  await provider.close();
  assert.deepEqual(await turn, { ok: false, code: "cancelled" });
  assert.equal((await provider.inspect()).status, "unavailable");
});

test("an active Codex grant stream exposes its freshly inspected catalog without opening another child", { timeout: 3_000 }, async () => {
  const provider = createCodexProvider({ readyForProvider: true, codexCommand: fileURLToPath(new URL("./fixtures/fake-codex.mjs", import.meta.url)) });
  const turn = provider.invoke({ assignment: "Wait until cancelled.", model: "gpt-6-sol", effort: "high", evidence: { owner: "Question", discussion: "" }, research: false, runtimeInstructions: initialRuntimeInstructions });
  let capability;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    capability = await provider.inspect();
    if (capability.catalogCurrent) break;
    await new Promise(resolve => setTimeout(resolve, 25));
  }
  assert.equal(capability?.status, "busy");
  assert.equal(capability?.catalogCurrent, true);
  assert.ok(capability.models.some(item => item.id === "gpt-6-sol" && item.efforts.includes("max")));
  await provider.close();
  assert.equal((await turn).code, "cancelled");
});

test("busy Settings checks the active child again and falls back when that catalog fails", { timeout: 3_000 }, async () => {
  const command = fileURLToPath(new URL("./fixtures/fake-codex.mjs", import.meta.url));
  for (const [assignment, secondStatus] of [["Wait with catalog changes.", "changed"], ["Wait with catalog failure.", "fallback"]]) {
    const provider = createCodexProvider({ readyForProvider: true, codexCommand: command });
    const turn = provider.invoke({ assignment, model: "gpt-6-sol", effort: "high", evidence: { owner: "Question", discussion: "" }, research: false, runtimeInstructions: initialRuntimeInstructions });
    let first;
    for (let attempt = 0; attempt < 40; attempt += 1) {
      first = await provider.inspect();
      if (first.catalogCurrent) break;
      await new Promise(resolve => setTimeout(resolve, 25));
    }
    assert.equal(first?.catalogCurrent, true);
    assert.ok(first.models.some(item => item.id === "gpt-6-sol"));
    const second = await provider.inspect();
    if (secondStatus === "changed") {
      assert.equal(second.catalogCurrent, true);
      assert.deepEqual(second.models.map(item => item.id), ["gpt-6-astra"]);
    } else {
      assert.deepEqual(second, { status: "busy", models: [], catalogCurrent: false });
    }
    await provider.close();
    assert.equal((await turn).code, "cancelled");
  }
});

test("provider RPC failures retain a safe category and failed operation without logging the raw response", async () => {
  const command = fileURLToPath(new URL("./fixtures/fake-codex.mjs", import.meta.url));
  const provider = createCodexProvider({ readyForProvider: true, codexCommand: command, codexAuthPath: undefined });
  const originalWrite = process.stdout.write;
  let logs = "";
  process.stdout.write = chunk => {
    logs += String(chunk);
    return true;
  };
  try {
    const result = await provider.invoke({ assignment: "Fail the turn RPC.", model: "gpt-6-astra", effort: "xhigh", evidence: { owner: "Question", discussion: "" }, research: false, runtimeInstructions: initialRuntimeInstructions, signal: new AbortController().signal });
    assert.deepEqual(result, { ok: false, code: "method_unavailable" });
  } finally {
    process.stdout.write = originalWrite;
  }
  assert.match(logs, /"code":"rpc_-32601"/u);
  assert.match(logs, /"category":"method_unavailable"/u);
  assert.match(logs, /"request":"turn\/start"/u);
  assert.doesNotMatch(logs, /authentication material/u);
});

 test("failed initialization kills the child and removes its private credential directory", { timeout: 5_000 }, async () => {
  const root = await mkdtemp(join(tmpdir(), "nanoduck-provider-test-"));
  const command = join(root, "reject-init.mjs"); const evidence = join(root, "started.json");
  try {
    await writeFile(command, `#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
writeFileSync(${JSON.stringify(evidence)}, JSON.stringify({ pid: process.pid, cwd: process.cwd() }));
createInterface({ input: process.stdin }).on('line', line => { const message = JSON.parse(line); process.stdout.write(JSON.stringify({ id: message.id, error: { code: -32601, message: 'initialize unsupported' } }) + '\\n'); });
`, { mode: 0o700 });
    const provider = createCodexProvider({ readyForProvider: true, codexCommand: command, codexAuthBytes: Buffer.from('{"test":"fake-grant"}') });
    assert.equal((await provider.inspect()).status, "unavailable");
    const observed = JSON.parse(await readFile(evidence,"utf8"));
    await assert.rejects(access(observed.cwd));
    assert.throws(() => process.kill(observed.pid,0), { code: "ESRCH" });
  } finally { await rm(root, { recursive: true, force: true }); }
 });
