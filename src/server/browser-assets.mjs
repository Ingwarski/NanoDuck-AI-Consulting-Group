import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const clientSpecifier = /(["'])\/client\/([A-Za-z0-9_-]+\.js)\1/gu;

export async function loadBrowserAssets(publicDirectory, clientDirectory) {
  const versioned = new Map();
  const clients = new Map();
  const loading = new Set();

  const register = (pathname, body) => {
    const digest = createHash("sha256").update(body).digest("hex");
    const url = `/assets/${digest}${pathname}`;
    versioned.set(url, body);
    return url;
  };

  const client = async name => {
    if (clients.has(name)) return clients.get(name);
    if (loading.has(name)) throw new Error(`Circular browser module import: ${name}`);
    loading.add(name);
    try {
      const source = await readFile(join(clientDirectory, name), "utf8");
      const dependencies = [...source.matchAll(clientSpecifier)].map(match => match[2]);
      const dependencyUrls = new Map();
      for (const dependency of dependencies) dependencyUrls.set(dependency, await client(dependency));
      const body = Buffer.from(source.replace(clientSpecifier, (_, quote, dependency) => `${quote}${dependencyUrls.get(dependency)}${quote}`));
      const url = register(`/client/${name}`, body);
      clients.set(name, url);
      return url;
    } finally {
      loading.delete(name);
    }
  };

  const references = new Map([
    ["/styles.css", register("/styles.css", await readFile(join(publicDirectory, "styles.css")))],
    ["/conversation-list.css", register("/conversation-list.css", await readFile(join(publicDirectory, "conversation-list.css")))],
    ["/client/app.js", await client("app.js")]
  ]);
  let html = await readFile(join(publicDirectory, "index.html"), "utf8");
  for (const [pathname, url] of references) {
    const attribute = pathname.endsWith(".css") ? "href" : "src";
    const original = `${attribute}="${pathname}"`;
    if (!html.includes(original)) throw new Error(`Missing browser asset reference: ${pathname}`);
    html = html.replaceAll(original, `${attribute}="${url}"`);
  }

  return { html: Buffer.from(html), versioned };
}
