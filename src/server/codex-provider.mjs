import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { chmod, copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createInterface } from "node:readline";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomId } from "./crypto.mjs";
import { createTurnDeadline, isTurnProgress } from "./turn-deadline.mjs";
import { createRuntimePrompts, RuntimeInstructionError } from "./prompt-contracts.mjs";
import { hasProhibitedLanguage, omitProhibitedLanguage, omitUnsafeExternalUrls, safeExternalUrl } from "./validation.mjs";
import { codexModelEfforts } from "./codex-models.mjs";
import { containsSecretLikeContent } from "./content-policy.mjs";

const waitFor = (promise, milliseconds, label, signal = undefined) => new Promise((resolve, reject) => {
  let settled = false;
  const finish = (callback, value) => {
    if (settled) return;
    settled = true; clearTimeout(timer); signal?.removeEventListener("abort", abort); callback(value);
  };
  const abort = () => finish(reject, new Error("cancelled"));
  const timer = milliseconds === undefined ? undefined : setTimeout(() => finish(reject, new Error(label)), milliseconds);
  if (signal?.aborted) return abort();
  signal?.addEventListener("abort", abort, { once: true });
  Promise.resolve(promise).then(value => finish(resolve, value), error => finish(reject, error));
});
const record = value => typeof value === "object" && value !== null && !Array.isArray(value);
const terminalTurn = value => record(value) && ["completed", "interrupted", "failed"].includes(value.status) ? value : undefined;
const providerLog = (event, details) => process.stdout.write(`${JSON.stringify({ event, ...details })}\n`);

const appServerErrorCategory = error => {
  const message = typeof error?.message === "string" ? error.message.toLocaleLowerCase() : "";
  if (error?.code === -32601 || /(?:method\s+(?:not\s+found|unsupported)|unknown\s+method)/u.test(message)) return "method_unavailable";
  if (/(?:auth(?:entication|orization)?|sign\s*in|log\s*in|credential|refresh\s*token)/u.test(message)) return "auth_required";
  if (/(?:rate\s*limit|quota|usage\s*limit|too\s*many\s*requests)/u.test(message)) return "quota_blocked";
  if (/(?:model|reasoning\s*effort).{0,80}(?:unsupported|unavailable|not\s+(?:found|available|supported))|(?:unsupported|unavailable)\s+(?:model|reasoning\s*effort)/u.test(message)) return "incompatible";
  if (/(?:subscription|entitlement|plan)/u.test(message)) return "subscription_unavailable";
  return "provider_unavailable";
};

class AppServerRequestError extends Error {
  constructor(method, error) {
    super("app_server_error");
    this.name = "AppServerRequestError";
    this.requestMethod = method;
    this.category = appServerErrorCategory(error);
    this.safeCode = Number.isSafeInteger(error?.code) ? `rpc_${error.code}` : "rpc_unknown";
  }
}

const providerFailureDetails = error => {
  if (error instanceof AppServerRequestError) return Object.freeze({
    code: error.safeCode,
    category: error.category,
    request: error.requestMethod
  });
  const code = ["cancelled", "provider_timeout", "provider_idle_timeout", "app_server_timeout", "app_server_closed"].includes(error?.message) ? error.message : "provider_error";
  return Object.freeze({ code, category: ["cancelled", "provider_timeout", "provider_idle_timeout"].includes(code) ? code : error?.message === "codex_grant_missing" ? "auth_required" : "provider_unavailable" });
};
const providerFailureCategory = error => providerFailureDetails(error).category;
const providerStatus = error => {
  const category = providerFailureCategory(error);
  return ["auth_required", "quota_blocked", "incompatible"].includes(category) ? category : "unavailable";
};
const grantDigest = bytes => createHash("sha256").update(bytes).digest();
const serialized = () => {
  let tail = Promise.resolve(); let pending = 0;
  const run = task => {
    pending += 1;
    const current = tail.then(task);
    tail = current.catch(() => {});
    void current.finally(() => { pending -= 1; }).catch(() => {});
    return current;
  };
  run.busy = () => pending > 0;
  return run;
};

class AppServerConnection {
  constructor(child, workspace, cleanup) {
    this.child = child; this.workspace = workspace; this.cleanup = cleanup; this.pending = new Map(); this.notifications = new Set(); this.nextId = 1;
    this.reader = createInterface({ input: child.stdout, crlfDelay: Infinity });
    this.reader.on("line", line => this.receive(line));
    this.closed = new Promise(resolve => { this.resolveClosed = resolve; });
    this.exited = new Promise(resolve => child.once("close", resolve));
    const fail = error => {
      this.closeError = error;
      this.resolveClosed(error);
      for (const pending of this.pending.values()) { clearTimeout(pending.timer); pending.reject(error); }
      this.pending.clear();
    };
    child.stdin.on("error", fail); child.once("error", fail); child.once("exit", () => fail(new Error("app_server_closed")));
  }
  receive(line) {
    let value; try { value = JSON.parse(line); } catch { return; }
    if (!record(value)) return;
    if (typeof value.id === "number") {
      const pending = this.pending.get(value.id); if (!pending) return;
      this.pending.delete(value.id); clearTimeout(pending.timer);
      Object.hasOwn(value, "result") ? pending.resolve(value.result) : pending.reject(new AppServerRequestError(pending.method, value.error)); return;
    }
    if (typeof value.method === "string") for (const listener of this.notifications) listener({ method: value.method, params: value.params });
  }
  request(method, params, milliseconds = 20_000) {
    if (this.closeError) return Promise.reject(this.closeError);
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error("app_server_timeout")); }, milliseconds);
      this.pending.set(id, { resolve, reject, timer, method });
      this.child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id, method, params })}\n`, error => {
        if (!error) return; const pending = this.pending.get(id); if (!pending) return; this.pending.delete(id); clearTimeout(timer); reject(error);
      });
    });
  }
  notify(method, params) { this.child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", method, params })}\n`); }
  on(listener) { this.notifications.add(listener); return () => this.notifications.delete(listener); }
  async close() {
    this.closing ??= (async () => {
      this.reader.close();
      this.child.kill("SIGTERM");
      await waitFor(this.exited, 1_000, "close_timeout").catch(async () => {
        this.child.kill("SIGKILL");
        await this.exited;
      });
      await this.cleanup();
    })();
    return this.closing;
  }
}

async function startConnection(config, signal, store, persistSerialized = task => task()) {
  if (signal?.aborted) throw new Error("cancelled");
  const grant = store?.codexGrant ? await store.codexGrant() : undefined;
  if (store?.codexGrant && !grant && config.readyForProvider) throw new Error("codex_grant_missing");
  const directory = await mkdtemp(join(tmpdir(), "nanoduck-codex-"));
  let connection;
  try {
    const codexHome = join(directory, "codex-home"); await mkdir(codexHome, { mode: 0o700 });
    await writeFile(join(codexHome, "config.toml"), 'cli_auth_credentials_store = "file"\n', { mode: 0o600 });
    const authDestination = join(codexHome, "auth.json");
    if (grant) await writeFile(authDestination, grant.bytes, { mode: 0o600 });
    else if (config.codexAuthPath) await copyFile(config.codexAuthPath, authDestination);
    else if (config.codexAuthBytes) await writeFile(authDestination, config.codexAuthBytes, { mode: 0o600 });
    if (grant || config.codexAuthPath || config.codexAuthBytes) await chmod(authDestination, 0o600);
    let savedDigest = grant ? grantDigest(grant.bytes) : undefined;
    let savedGeneration = grant?.generation;
    grant?.bytes.fill(0);
    let pendingPersist = Promise.resolve(); let grantWriteDisabled = false;
    const persistGrant = () => {
      const current = pendingPersist.then(async () => {
        if (!grant || grantWriteDisabled) return;
        const bytes = await readFile(authDestination);
        try {
          const currentDigest = grantDigest(bytes);
          if (currentDigest.equals(savedDigest)) return;
          for (let attempt = 0; ; attempt += 1) {
            try { savedGeneration = await persistSerialized(() => store.saveCodexGrant(bytes, savedGeneration)); break; }
            catch (error) {
              if (error?.message === "codex_grant_conflict") {
                const latest = await store.codexGrant();
                if (!latest) throw error;
                savedGeneration = latest.generation; savedDigest = grantDigest(latest.bytes); latest.bytes.fill(0); grantWriteDisabled = true; return;
              }
              if (attempt >= 2 || error?.message === "codex_grant_invalid") throw error;
              await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));
            }
          }
          savedDigest = currentDigest;
        } finally { bytes.fill(0); }
      });
      pendingPersist = current.catch(() => {});
      return current;
    };
    if (signal?.aborted) throw new Error("cancelled");
    const child = spawn(config.codexCommand, ["app-server", "--stdio"], {
      cwd: directory,
      env: { PATH: process.env.PATH ?? "/usr/local/bin:/usr/bin:/bin", HOME: directory, TMPDIR: directory, CODEX_HOME: codexHome, NO_COLOR: "1" },
      stdio: ["pipe", "pipe", "ignore"]
    });
    connection = new AppServerConnection(child, directory, async () => {
      try { await persistGrant(); } finally { await rm(directory, { recursive: true, force: true }); }
    });
    connection.persistGrant = persistGrant;
    await waitFor(connection.request("initialize", { clientInfo: { name: "nanoduck-consulting-group", title: "NanoDuck Consulting Group", version: "0.1.0" }, capabilities: { experimentalApi: true } }), 20_000, "app_server_timeout", signal);
    connection.notify("initialized", {});
    await connection.persistGrant();
    if (signal?.aborted) throw new Error("cancelled");
    return connection;
  } catch (error) {
    if (connection) await connection.close();
    else await rm(directory, { recursive: true, force: true });
    throw error;
  }
}

const bodyFrom = value => {
  if (!record(value) || !Array.isArray(value.items)) return undefined;
  return [...value.items].reverse().find(item => record(item) && item.type === "agentMessage" && typeof item.text === "string" && item.text.trim())?.text;
};

const cleanText = (value, maximum) => typeof value === "string" && value.length <= maximum ? value.replace(/\s+/gu, " ").trim() : undefined;
const publishedAt = value => typeof value === "string" && /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z)?$/u.test(value) && !Number.isNaN(Date.parse(value)) ? value : undefined;
const sentenceNear = (text, index) => cleanText(text.slice(Math.max(0, text.lastIndexOf(".", index - 1) + 1), Math.min(text.length, (() => { const end = text.indexOf(".", index); return end === -1 ? text.length : end + 1; })())), 1_000);

function sourceRecord(value, retrievedAt) {
  if (!record(value)) return undefined;
  const url = safeExternalUrl(value.url);
  const title = cleanText(value.title, 280);
  const claim = cleanText(value.claim, 1_000);
  if (!url || !title || !claim || hasProhibitedLanguage(title) || hasProhibitedLanguage(claim) || containsSecretLikeContent(title) || containsSecretLikeContent(claim)) return undefined;
  return Object.freeze({ url, title, claim, retrievedAt, ...(publishedAt(value.publishedAt) ? { publishedAt: publishedAt(value.publishedAt) } : {}) });
}

function sourcesFrom(text) {
  const retrievedAt = new Date().toISOString();
  const sources = [];
  const body = text.replace(/<nanoduck-source>([\s\S]*?)<\/nanoduck-source>/giu, (_, raw) => {
    try {
      const source = sourceRecord(JSON.parse(raw), retrievedAt);
      if (source) sources.push(source);
    } catch { /* Ignore malformed model-provided metadata. */ }
    return "";
  }).trim();
  for (const match of body.matchAll(/\[([^\]\n]{1,280})\]\((https:\/\/[^\s)]+)\)/gu)) {
    const source = sourceRecord({ title: match[1], url: match[2], claim: sentenceNear(body, match.index ?? 0) }, retrievedAt);
    if (source) sources.push(source);
  }
  const deduplicated = new Map();
  for (const source of sources) if (!deduplicated.has(source.url)) deduplicated.set(source.url, source);
  const filtered = omitUnsafeExternalUrls(body);
  const language = omitProhibitedLanguage(filtered.body);
  const failureReason = !language.body.trim() ? "empty_response" : !language.substantive ? (language.omittedCount ? "prohibited_language" : "no_usable_content") : undefined;
  return Object.freeze({ body: failureReason ? undefined : language.body, sources: Object.freeze([...deduplicated.values()]), urlOmissionCount: filtered.omittedCount, languageOmissionCount: language.omittedCount, failureReason });
}

async function supportedCatalog(connection, rpcTimeout = 20_000) {
  const models = [];
  let cursor;
  for (let page = 0; page < 20; page += 1) {
    const result = await connection.request("model/list", { limit: 100, includeHidden: true, ...(cursor ? { cursor } : {}) }, rpcTimeout);
    if (!record(result) || !Array.isArray(result.data)) throw new Error("invalid_catalog");
    models.push(...result.data);
    if (result.nextCursor === null || result.nextCursor === undefined) { cursor = undefined; break; }
    if (typeof result.nextCursor !== "string" || !result.nextCursor || result.nextCursor === cursor) throw new Error("invalid_catalog");
    cursor = result.nextCursor;
  }
  if (cursor || models.length > 2_000) throw new Error("invalid_catalog");
  const supported = Object.entries(codexModelEfforts).flatMap(([model, allowedEfforts]) => {
    const available = models.find(item => record(item) && item.model === model && typeof item.id === "string" && Array.isArray(item.supportedReasoningEfforts));
    if (!available) return [];
    const efforts = available.supportedReasoningEfforts.flatMap(item => record(item) && typeof item.reasoningEffort === "string" && allowedEfforts.includes(item.reasoningEffort) ? [item.reasoningEffort] : []);
    return efforts.length ? [Object.freeze({ id: model, efforts: Object.freeze([...new Set(efforts)]) })] : [];
  });
  return supported.length ? Object.freeze(supported) : undefined;
}

export function createCodexProvider(config, store = undefined, deadlineOptions = undefined) {
  const exclusive = serialized();
  const persistSerialized = serialized();
  const activeConnections = new Set();
  const activeTurnConnections = new Set();
  let activeInvocations = 0;
  const shutdown = new AbortController();
  const close = async () => {
    shutdown.abort();
    await Promise.allSettled([...activeConnections].map(connection => connection.close()));
  };
  const inspect = async () => {
    if (shutdown.signal.aborted) return Object.freeze({ status: "unavailable", models: Object.freeze([]) });
    if (!config.readyForProvider) return Object.freeze({ status: "unavailable", models: Object.freeze([]) });
    if (activeInvocations || activeConnections.size || exclusive.busy()) {
      const connection = activeTurnConnections.values().next().value;
      const savedOnly = Object.freeze({ status: "busy", models: Object.freeze([]), catalogCurrent: false });
      if (!connection) return savedOnly;
      try {
        const models = await waitFor(supportedCatalog(connection, 1_500), 2_000, "app_server_timeout", shutdown.signal);
        await connection.persistGrant();
        return models && activeTurnConnections.has(connection) && !shutdown.signal.aborted
          ? Object.freeze({ status: "busy", models, catalogCurrent: true }) : savedOnly;
      } catch {
        try { await connection.persistGrant(); }
        catch { await connection.close().catch(() => {}); }
        return savedOnly;
      }
    }
    try {
      const capability = await exclusive(async () => {
        let connection;
        try {
          connection = await startConnection(config, shutdown.signal, store, persistSerialized);
          activeConnections.add(connection);
          const account = await connection.request("account/read", { refreshToken: false });
          await connection.persistGrant();
          if (!record(account) || !record(account.account) || account.account.type !== "chatgpt") return Object.freeze({ status: "auth_required", models: Object.freeze([]) });
          const [models, limits] = await Promise.all([supportedCatalog(connection), connection.request("account/rateLimits/read", {})]);
          await connection.persistGrant();
          if (!models) return Object.freeze({ status: "incompatible", models: Object.freeze([]) });
          const quotaBlocked = record(limits) && record(limits.rateLimits) && limits.rateLimits.rateLimitReachedType !== null && limits.rateLimits.rateLimitReachedType !== undefined;
          return Object.freeze({ status: quotaBlocked ? "quota_blocked" : "ready", models });
        } catch (error) {
          return Object.freeze({ status: providerStatus(error), models: Object.freeze([]) });
        } finally {
          try { await connection?.close(); }
          finally { activeConnections.delete(connection); }
        }
      });
      return capability;
    } catch { return Object.freeze({ status: "unavailable", models: Object.freeze([]) }); }
  };
  const invoke = async ({ assignment, model, effort, evidence, research, outputKind = "discussion", maximumCharacters = undefined, runtimeInstructions, signal }) => {
    if (shutdown.signal.aborted) return { ok: false, code: "provider_unavailable" };
    if (!config.readyForProvider) return { ok: false, code: "provider_unavailable" };
    if (!runtimeInstructions) throw new RuntimeInstructionError("Provider invocation is missing its runtime-instructions contract.");
    const runSignal = signal ? AbortSignal.any([signal, shutdown.signal]) : shutdown.signal;
    activeInvocations += 1;
    let connection; let threadId; let unsubscribe = () => {}; let deadline;
    let startedAt; let lastProgressAt; let progressCount = 0;
    try {
    try {
      connection = await startConnection(config, runSignal, store, persistSerialized);
      activeConnections.add(connection);
      if (runSignal.aborted) throw new Error("cancelled");
      const started = await connection.request("thread/start", { model, ephemeral: true, cwd: connection.workspace, sandbox: "read-only", approvalPolicy: "never", environments: [], config: { web_search: research ? "live" : "disabled", features: { shell_tool: false, unified_exec: false, view_image: false, shell_snapshot: false, apps: false, plugins: false, hooks: false, memories: false, browser_use: false, browser_use_external: false, browser_use_full_cdp_access: false, computer_use: false, image_generation: false, workspace_dependencies: false, code_mode: false, code_mode_host: false, multi_agent: false, multi_agent_v2: false, skill_search: false, tool_suggest: false, request_permissions_tool: false } } });
      await connection.persistGrant();
      if (!record(started) || !record(started.thread) || typeof started.thread.id !== "string") return { ok: false, code: "provider_unavailable" };
      threadId = started.thread.id;
      const prompts = createRuntimePrompts(runtimeInstructions);
      const outputContract = prompts.outputContract({ outputKind, maximumCharacters });
      const prompt = `${assignment}\n\nOwner question:\n${evidence.owner}\n\nPrior confirmed discussion:\n${evidence.discussion}\n\n${outputContract} ${prompts.providerPolicy(research)}`;
      if (Buffer.byteLength(prompt, "utf8") > 8 * 1024 * 1024) return { ok: false, code: "context_too_large" };
      let resolveTurn; const turnDone = new Promise(resolve => { resolveTurn = resolve; });
      let expectedTurnId;
      deadline = createTurnDeadline(deadlineOptions);
      const completedTurns = new Map();
      const completedBodies = new Map();
      unsubscribe = connection.on(notification => {
        const params = notification.params;
        if (!record(params) || params.threadId !== threadId) return;
        if (isTurnProgress(notification, threadId, expectedTurnId)) {
          lastProgressAt = Date.now(); progressCount += 1; deadline.progress();
        }
        if (notification.method === "item/completed" && typeof params.turnId === "string") {
          const body = bodyFrom({ items: [params.item] });
          if (body) completedBodies.set(params.turnId, body);
        }
        if (notification.method !== "turn/completed") return;
        const completed = terminalTurn(params.turn);
        if (!completed || typeof completed.id !== "string") return;
        completedTurns.set(completed.id, completed);
        if (completed.id === expectedTurnId) resolveTurn(completed);
      });
      if (runSignal.aborted) throw new Error("cancelled");
      const turn = await waitFor(connection.request("turn/start", { threadId, input: [{ type: "text", text: prompt, text_elements: [] }], model, approvalPolicy: "never", sandboxPolicy: { type: "readOnly", networkAccess: research }, environments: [], effort }), 20_000, "app_server_timeout", runSignal);
      await connection.persistGrant();
      activeTurnConnections.add(connection);
      const startedTurn = record(turn) && record(turn.turn) ? turn.turn : undefined;
      if (!record(startedTurn) || typeof startedTurn.id !== "string") throw new Error("provider_error");
      expectedTurnId = startedTurn.id;
      startedAt = Date.now(); lastProgressAt ??= startedAt;
      deadline.start();
      providerLog("nanoduck.provider.turn_started", { outputKind, research, effort });
      // Ephemeral threads have no saved turn history. Consume the subscribed event
      // stream; thread/read(includeTurns:true) is rejected by the pinned app server.
      const resolvedTurn = terminalTurn(startedTurn) ?? completedTurns.get(expectedTurnId) ?? await waitFor(
        Promise.race([turnDone, deadline.promise, connection.closed.then(error => { throw error; })]),
        undefined, "provider_timeout", runSignal
      );
      if (resolvedTurn.status !== "completed") throw new AppServerRequestError("turn/completed", resolvedTurn.error);
      const resultBody = bodyFrom(resolvedTurn) ?? completedBodies.get(expectedTurnId);
      const completionSource = terminalTurn(startedTurn) ? "turn_start" : "notification";
      providerLog("nanoduck.provider.turn_completed", { outputKind, completionSource, durationMs: Date.now() - startedAt });
      unsubscribe();
      const output = typeof resultBody === "string" ? sourcesFrom(resultBody) : undefined;
      if (output?.urlOmissionCount) providerLog("nanoduck.provider.output_policy", { outputKind, reason: "unapproved_url_omitted", count: output.urlOmissionCount });
      if (output?.languageOmissionCount) providerLog("nanoduck.provider.output_policy", { outputKind, reason: "prohibited_fragment_omitted", count: output.languageOmissionCount });
      if (output?.failureReason) providerLog("nanoduck.provider.output_policy", { outputKind, reason: output.failureReason });
      return output?.body ? { ok: true, body: output.body, sources: output.sources } : output ? { ok: false, code: output.failureReason === "prohibited_language" ? "language_policy" : output.failureReason === "no_usable_content" ? "output_policy" : "empty_response" } : { ok: false, code: "empty_response" };
    } finally {
      deadline?.stop();
      unsubscribe();
      if (connection && threadId && !runSignal.aborted) await connection.request("thread/unsubscribe", { threadId }, 1_000).catch(() => {});
      try { await connection?.close(); }
      finally {
        activeTurnConnections.delete(connection);
        activeConnections.delete(connection);
      }
    }
    } catch (error) {
      const details = providerFailureDetails(error);
      providerLog("nanoduck.provider.turn_failed", { outputKind, ...details, ...(startedAt ? { durationMs: Date.now() - startedAt, idleMs: Date.now() - lastProgressAt, progressCount } : {}) });
      return { ok: false, code: runSignal.aborted || error?.message === "cancelled" ? "cancelled" : details.category };
    } finally { activeInvocations -= 1; }
  };
  return Object.freeze({ inspect, invoke, close, id: () => randomId() });
}
