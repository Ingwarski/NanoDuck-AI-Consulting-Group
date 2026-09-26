import assert from "node:assert/strict";

export async function verifyProgressRecovery(page) {
  await page.locator("#new-conversation").click();
  await page.waitForFunction(() => document.querySelector("#thread .empty"));
  await page.locator("#message").fill("Synthetic progress recovery. Wait until cancelled");
  const acceptance = page.waitForResponse(response => response.request().method() === "POST" && response.url().endsWith("/messages"));
  await page.locator("#send").click();
  const accepted = await acceptance; const url = accepted.url().replace(/\/messages$/u, "");
  await page.locator("#stop").waitFor({ state: "visible" });
  let polls = 0;
  await page.route(url, async route => {
    if (route.request().method() !== "GET") return route.continue();
    if (++polls === 1) return route.abort("failed");
    const response = await route.fetch(); const data = await response.json();
    data.events[0].sources = ["First supported claim", "Second supported claim"].map(claim => ({ url: "https://example.com/shared-evidence", title: "Shared evidence", claim, retrievedAt: "2026-09-26T00:00:00.000Z" }));
    return route.fulfill({ response, json: data });
  });
  await page.locator("#connection-status").waitFor({ state: "visible" });
  assert.match(await page.locator("#connection-status").innerText(), /Reconnecting automatically/);
  await page.locator("#connection-status").waitFor({ state: "hidden", timeout: 10_000 });
  assert.ok(polls >= 2);
  await page.getByRole("tab", { name: "Sources", exact: true }).click();
  assert.equal(await page.locator("#sources .source-card").count(), 2);

  let inFlight = 0; let maximum = 0; let usageCalls = 0;
  await page.route("**/api/usage*", async route => {
    usageCalls += 1; maximum = Math.max(maximum, ++inFlight);
    const response = await route.fetch(); const data = await response.json(); data.usage.total = usageCalls === 1 ? 101 : 202;
    await new Promise(resolve => setTimeout(resolve, 3_200)); inFlight -= 1;
    await route.fulfill({ response, json: data });
  });
  await page.getByRole("tab", { name: "Usage", exact: true }).click();
  await page.waitForFunction(() => document.querySelector("#usage-status").textContent.startsWith("Usage updates"), undefined, { timeout: 10_000 });
  assert.equal(maximum, 1); assert.ok(usageCalls >= 1);
  await page.locator("#stop").click();
  await page.waitForFunction(() => document.querySelector(".usage-total")?.textContent === "202", undefined, { timeout: 12_000 });
  await page.getByRole("tab", { name: "Discussion", exact: true }).click();
  await page.locator("#composer").waitFor({ state: "visible" });
  await page.waitForTimeout(3_500); const stoppedPolls = polls; await page.waitForTimeout(4_500); assert.equal(polls, stoppedPolls);
  await page.setViewportSize({ width: 320, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  assert.equal(await page.evaluate(() => document.querySelector("#usage-tab").getBoundingClientRect().right <= document.querySelector(".tabs").getBoundingClientRect().right), true);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.unroute(url); await page.unroute("**/api/usage*");
}
