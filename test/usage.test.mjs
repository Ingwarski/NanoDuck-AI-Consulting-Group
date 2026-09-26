import assert from "node:assert/strict";
import test from "node:test";
import { randomBytes } from "node:crypto";
import { createMemoryStore } from "../src/server/store.mjs";
import { randomId } from "../src/server/crypto.mjs";
import { claudeTokens, codexTokens, normalizeUsageAttempt } from "../src/server/usage.mjs";
import { sealRecoverySnapshot, openRecoveryEnvelope } from "../src/server/recovery.mjs";

const tokens = { input: 100, output: 40, total: 140, cachedInput: 60, cacheWriteInput: 0, reasoningOutput: 30 };
const attempt = (patch = {}) => ({ id: randomId(), provider: "codex", model: "gpt-6-sol", status: "completed", startedAt: "2026-09-25T12:00:00.000Z", finishedAt: "2026-09-25T12:01:00.000Z", usage: [{ model: "gpt-6-sol", tokens }], ...patch });

test("provider usage categories do not double count cache or reasoning subsets", () => {
  assert.deepEqual(codexTokens({ inputTokens: 100, outputTokens: 40, totalTokens: 140, cachedInputTokens: 60, reasoningOutputTokens: 30 }), tokens);
  const [claude] = claudeTokens(JSON.stringify({ modelUsage: { "claude-opus-5-5": { inputTokens: 2, outputTokens: 40, cacheReadInputTokens: 60, cacheCreationInputTokens: 38 } } }));
  assert.deepEqual(claude.tokens, { ...tokens, cacheWriteInput: 38, reasoningOutput: null });
  assert.deepEqual(claudeTokens("not JSON"), []);
  assert.equal(normalizeUsageAttempt(attempt({ usage: [{ model: "gpt-6-sol", tokens: { ...tokens, total: -1 } }] })), undefined);
});

test("usage is idempotent per attempt and separates conversation and provider totals", async () => {
  const store = createMemoryStore(); const a = await store.createConversation(); const b = await store.createConversation();
  assert.equal((await store.usageSummary(a.id)).total, null);
  const first = attempt();
  await store.recordUsage(a.id, { ...first, status: "running", finishedAt: null, usage: [] });
  await store.recordUsage(a.id, first); await store.recordUsage(a.id, first);
  await store.recordUsage(a.id, attempt({ status: "failed" }));
  await store.recordUsage(a.id, attempt({ status: "cancelled", usage: [] }));
  await store.recordUsage(b.id, attempt({ provider: "claude_code", model: "claude-opus-5-5", usage: [{ model: "claude-opus-5-5", tokens }] }));
  const summary = await store.usageSummary(a.id);
  assert.equal(summary.total, 280); assert.equal(summary.attempts, 3); assert.equal(summary.unavailable, 1);
  assert.equal((await store.usageSummary()).total, 420); assert.equal((await store.usageSummary()).models.length, 2);
  await store.deleteConversation(a.id);
  assert.equal(await store.recordUsage(a.id, attempt()), false);
  assert.equal((await store.usageSummary()).total, 140); assert.equal(await store.usageSummary(a.id), undefined);
});

test("encrypted recovery preserves usage, interrupts stale calls and honors deletion tombstones", async () => {
  const key = randomBytes(32); const source = createMemoryStore(); const conversation = await source.createConversation();
  await source.recordUsage(conversation.id, attempt());
  await source.recordUsage(conversation.id, attempt({ status: "running", finishedAt: null, usage: [] }));
  await source.interruptUsage();
  const envelope = sealRecoverySnapshot(await source.recoverySnapshot(), key);
  assert.equal(JSON.stringify(envelope).includes("gpt-6-sol"), false);
  const backup = openRecoveryEnvelope(envelope, key);
  assert.equal(backup.conversations[0].usage[1].status, "interrupted");
  const restored = createMemoryStore(); await restored.restoreRecovery(backup);
  assert.equal((await restored.usageSummary(conversation.id)).total, 140);
  await restored.deleteConversation(conversation.id); await restored.restoreRecovery(backup);
  assert.equal((await restored.usageSummary()).attempts, 0);
  const corrupt = structuredClone(backup); corrupt.conversations[0].usage[0].usage[0].tokens.total = "private content";
  assert.equal(await restored.restoreRecovery(corrupt), undefined);
});
