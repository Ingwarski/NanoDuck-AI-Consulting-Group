import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { chmod, mkdtemp, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, firefox, webkit } from "playwright";
import { verifyProgressRecovery } from "./browser-progress-recovery.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const temporary = await mkdtemp(join(tmpdir(), "nanoduck-godaddy-browser-"));
const probe = createServer().listen(0, "127.0.0.1"); await once(probe, "listening"); const port = probe.address().port; await new Promise(resolve => probe.close(resolve));
const origin = `http://127.0.0.1:${port}`; const authPath = join(temporary, "auth.json"); const fakeCodex = join(root, "test", "fixtures", "fake-codex.mjs");
await writeFile(authPath, JSON.stringify({ auth_mode: "chatgpt", tokens: { access_token: "synthetic-access", refresh_token: "synthetic-refresh" } }), { mode: 0o600 }); await chmod(fakeCodex, 0o700);
const child = spawn(process.execPath, ["src/server/index.mjs"], { cwd: root, env: { ...process.env, NODE_ENV: "development", DEV_OWNER_EMAIL: "owner@local.test", PORT: String(port), CODEX_APP_SERVER_AUTH_PATH: authPath, CODEX_APP_SERVER_COMMAND: fakeCodex }, stdio: ["ignore", "pipe", "pipe"] });
let diagnostics = ""; child.stdout.on("data", value => { diagnostics += value; }); child.stderr.on("data", value => { diagnostics += value; });
try {
  const deadline = Date.now() + 30_000;
  while (true) {
    try { if ((await fetch(`${origin}/healthz`)).ok) break; } catch {}
    if (Date.now() > deadline || child.exitCode !== null) throw new Error(`Browser fixture did not start: ${diagnostics}`);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  for (const [name, engine] of [["chromium", chromium], ["firefox", firefox], ["webkit", webkit]]) {
    const browser = await engine.launch({ headless: true });
    try {
      const context = await browser.newContext({ baseURL: origin, viewport: { width: 1280, height: 900 } }); const page = await context.newPage(); const errors = [];
      page.on("pageerror", error => errors.push(error.message)); await page.goto(origin);
      await page.locator("#development-sign-in").click(); await page.locator("#consent-check").check(); await page.locator("#consent-button").click(); await page.locator("#app").waitFor({ state: "visible" });
      await page.locator('.desktop-nav [data-nav="settings"]').click(); await page.waitForFunction(() => document.querySelector("#settings-status").textContent.includes("Codex"));
      await page.locator("#critic-provider").selectOption("codex"); await page.locator("#settings-form button[type=submit]").click(); await page.waitForFunction(() => document.querySelector("#toast").textContent.includes("Settings saved"));
      await page.locator('.desktop-nav [data-nav="discussion"]').click(); await verifyProgressRecovery(page);
      assert.deepEqual(errors, [], `${name} page errors`); await context.close(); process.stdout.write(`${name}: progress recovery, usage coalescing, source claims and 320px reflow passed.\n`);
    } finally { await browser.close(); }
  }
} finally {
  if (child.exitCode === null && child.signalCode === null) { const stopped = once(child, "exit"); child.kill("SIGTERM"); await stopped; }
  await rm(temporary, { recursive: true, force: true });
}
