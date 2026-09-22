import assert from "node:assert/strict";
import test from "node:test";
import { capabilitiesForSettings, changesSavedCodexTuple } from "../src/server/settings-catalog.mjs";
import { parseSettings } from "../src/server/validation.mjs";

test("a busy Codex turn still permits future settings saves for saved GPT-6 Sol choices", () => {
  const current = {
    headModel: "gpt-6-sol", headReasoning: "high", criticProvider: "codex",
    criticCodexModel: "gpt-6-astra", criticCodexReasoning: "xhigh",
    criticModel: "gpt-6-astra", criticReasoning: "xhigh",
    specialistCount: "3", discussionDepth: "3", notificationSound: "knock"
  };
  const busy = { codex: { status: "busy", models: [] }, claude_code: { status: "unavailable", models: [] } };
  const catalog = capabilitiesForSettings(busy, current);
  assert.equal(catalog.codex.savedOnly, true);
  assert.deepEqual(catalog.codex.models, [
    { id: "gpt-6-sol", efforts: ["high"] },
    { id: "gpt-6-astra", efforts: ["xhigh"] }
  ]);
  const future = parseSettings({ ...current, specialistCount: "5" }, catalog);
  assert.equal(future?.specialistCount, "5");
  assert.equal(future?.headModel, "gpt-6-sol");
  assert.equal(changesSavedCodexTuple(future, current), false);
  const crossed = parseSettings({ ...current, headModel: "gpt-6-astra", headReasoning: "xhigh" }, catalog);
  assert.equal(changesSavedCodexTuple(crossed, current), true);
  assert.equal(parseSettings({ ...current, headReasoning: "ultra" }, catalog), undefined);
  const cached = capabilitiesForSettings({ ...busy, codex: { status: "busy", models: [
    { id: "gpt-6-sol", efforts: ["high", "max"] }, { id: "gpt-6-astra", efforts: ["xhigh"] }
  ] } }, current);
  assert.equal(cached.codex.savedOnly, true);
  assert.equal(parseSettings({ ...current, headReasoning: "max" }, cached), undefined);
  const currentSession = capabilitiesForSettings({ ...busy, codex: { status: "busy", catalogCurrent: true, models: [
    { id: "gpt-6-sol", efforts: ["high", "max"] }, { id: "gpt-6-astra", efforts: ["xhigh"] }
  ] } }, current);
  assert.equal(currentSession.codex.savedOnly, undefined);
  assert.equal(parseSettings({ ...current, headReasoning: "max" }, currentSession)?.headReasoning, "max");
});
