import { loadConfig } from "./config.mjs";
import { createCodexProvider } from "./codex-provider.mjs";
import { createMySqlStore } from "./store.mjs";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const config = loadConfig();
const syntheticCommand = fileURLToPath(new URL("../../test/fixtures/fake-codex.mjs", import.meta.url));
if (!config.databaseUrl && !(config.mode === "test" && config.codexCommand === syntheticCommand)) throw new Error("Persistent database leadership is required for managed Codex preflight.");
const observedAt = new Date().toISOString();
let store;
let capability;
try {
  if (config.databaseUrl) {
    store = await createMySqlStore(config.databaseUrl, config.dataKey, config.databaseSslCaPath);
    if (!await store.acquireLeadership()) capability = Object.freeze({ status: "busy", models: Object.freeze([]) });
    else {
      if (config.readyForProvider) {
        try { await store.seedCodexGrant(config.codexAuthPath ? await readFile(config.codexAuthPath) : config.codexAuthBytes); }
        catch (error) {
          if (error?.message !== "codex_grant_invalid") throw error;
          process.stderr.write("NanoDuck Codex bootstrap grant is invalid; any previously stored managed grant remains in use.\n");
        }
      }
      capability = await createCodexProvider(config, store).inspect();
    }
  } else capability = await createCodexProvider(config).inspect();
} finally { await store?.close(); }
const report = Object.freeze({
  schema_version: 1,
  observed_at: observedAt,
  scope: config.databaseUrl
    ? "Codex account/catalog/rate-limit inspection with exclusive access to the owned encrypted provider grant; it may update that grant in MySQL, but starts no model turn or conversation. Busy while the app owns database leadership."
    : "Synthetic test-only Codex account/catalog/rate-limit inspection; no model turn, conversation, database access or GoDaddy mutation.",
  codex: capability
});
process.stdout.write(`${JSON.stringify(report)}\n`);
if (capability.status !== "ready") process.exitCode = 2;
