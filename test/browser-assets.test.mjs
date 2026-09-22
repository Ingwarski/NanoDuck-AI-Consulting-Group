import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { loadBrowserAssets } from "../src/server/browser-assets.mjs";
import { testRuntimeInstructionsBootstrap } from "./fixtures/runtime-instructions.mjs";

const digest = body => createHash("sha256").update(body).digest("hex");
const versionedPath = (body, pathname) => `/assets/${digest(body)}${pathname}`;

test("browser asset URLs change when a CSS file or imported module changes", async () => {
  const directory = await mkdtemp(join(tmpdir(), "nanoduck-assets-"));
  const publicDirectory = join(directory, "public");
  const clientDirectory = join(directory, "client");
  try {
    await mkdir(publicDirectory);
    await mkdir(clientDirectory);
    await writeFile(join(publicDirectory, "index.html"), '<link href="/styles.css"><link href="/conversation-list.css"><script src="/client/app.js"></script>');
    await writeFile(join(publicDirectory, "styles.css"), "body { color: white; }");
    await writeFile(join(publicDirectory, "conversation-list.css"), ".list { display: block; }");
    await writeFile(join(clientDirectory, "app.js"), 'import "/client/markdown.js";');
    await writeFile(join(clientDirectory, "markdown.js"), 'export const text = "old";');

    const first = await loadBrowserAssets(publicDirectory, clientDirectory);
    const firstHtml = first.html.toString();
    const firstApp = [...first.versioned.keys()].find(path => path.endsWith("/client/app.js"));
    const firstMarkdown = [...first.versioned.keys()].find(path => path.endsWith("/client/markdown.js"));
    assert.ok(firstHtml.includes(firstApp));
    assert.ok(first.versioned.get(firstApp).toString().includes(firstMarkdown));
    assert.equal(firstApp, versionedPath(first.versioned.get(firstApp), "/client/app.js"));
    assert.equal(firstMarkdown, versionedPath(first.versioned.get(firstMarkdown), "/client/markdown.js"));

    await writeFile(join(clientDirectory, "markdown.js"), 'export const text = "new";');
    await writeFile(join(publicDirectory, "styles.css"), "body { color: black; }");
    const second = await loadBrowserAssets(publicDirectory, clientDirectory);
    const secondHtml = second.html.toString();
    const secondApp = [...second.versioned.keys()].find(path => path.endsWith("/client/app.js"));
    assert.notEqual(secondApp, firstApp);
    assert.equal(secondHtml.includes(firstApp), false);
    assert.notEqual(secondHtml.match(/\/assets\/[a-f0-9]{64}\/styles\.css/u)?.[0], firstHtml.match(/\/assets\/[a-f0-9]{64}\/styles\.css/u)?.[0]);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("the application serves versioned CSS and JavaScript with matching bytes", async () => {
  const listener = createServer();
  listener.listen(0, "127.0.0.1");
  await once(listener, "listening");
  const port = listener.address().port;
  await new Promise(resolve => listener.close(resolve));
  const child = spawn(process.execPath, ["src/server/index.mjs"], {
    cwd: process.cwd(),
    env: { ...process.env, NODE_ENV: "development", DEV_OWNER_EMAIL: "owner@local.test", PORT: String(port), RUNTIME_INSTRUCTIONS_BOOTSTRAP_B64: testRuntimeInstructionsBootstrap },
    stdio: "ignore"
  });
  const origin = `http://127.0.0.1:${port}`;
  try {
    let ready = false;
    for (let attempt = 0; attempt < 100 && !ready; attempt += 1) {
      try { ready = (await fetch(`${origin}/healthz`)).ok; } catch { await new Promise(resolve => setTimeout(resolve, 30)); }
    }
    assert.equal(ready, true);
    const shell = await fetch(origin);
    assert.equal(shell.status, 200);
    assert.equal(shell.headers.get("cache-control"), "no-store");
    const html = await shell.text();
    assert.doesNotMatch(html, /(?:src|href)="(?:\/client\/app\.js|\/styles\.css|\/conversation-list\.css)"/u);
    const paths = [...html.matchAll(/(?:src|href)="(\/assets\/[a-f0-9]{64}\/(?:client\/app\.js|styles\.css|conversation-list\.css))"/gu)].map(match => match[1]);
    assert.equal(paths.length, 3);
    for (const path of paths) {
      const response = await fetch(`${origin}${path}`);
      assert.equal(response.status, 200);
      const body = Buffer.from(await response.arrayBuffer());
      assert.equal(path, versionedPath(body, path.slice(path.indexOf("/", "/assets/".length + 64))));
      assert.equal(response.headers.get("content-type"), path.endsWith(".css") ? "text/css; charset=utf-8" : "application/javascript; charset=utf-8");
      if (path.endsWith("/client/app.js")) {
        const imports = [...body.toString().matchAll(/"(\/assets\/[a-f0-9]{64}\/client\/(?:markdown|refresh-state)\.js)"/gu)].map(match => match[1]);
        assert.equal(imports.length, 2);
        for (const dependencyPath of imports) {
          const dependency = await fetch(`${origin}${dependencyPath}`);
          assert.equal(dependency.status, 200);
          const dependencyBody = Buffer.from(await dependency.arrayBuffer());
          assert.equal(dependencyPath, versionedPath(dependencyBody, dependencyPath.slice(dependencyPath.indexOf("/", "/assets/".length + 64))));
        }
      }
    }
    const wrongHash = paths[0].replace(/^\/assets\/([a-f0-9])/u, (_, character) => `/assets/${character === "0" ? "1" : "0"}`);
    assert.equal((await fetch(`${origin}${wrongHash}`)).status, 404);
  } finally {
    child.kill("SIGTERM");
    await once(child, "exit").catch(() => {});
  }
});
