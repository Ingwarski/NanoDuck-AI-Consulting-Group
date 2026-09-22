import assert from "node:assert/strict";
import test from "node:test";
import { migrateSettingsStorage } from "../src/server/settings-migration.mjs";
import { currentSettingsRevision, defaultSettings } from "../src/server/settings.mjs";

const connectionFixture = initial => {
  let row = initial === undefined ? undefined : JSON.stringify(initial);
  const commands = [];
  return {
    commands,
    value: () => row === undefined ? undefined : JSON.parse(row),
    connection: {
      async beginTransaction() { commands.push("BEGIN"); },
      async commit() { commands.push("COMMIT"); },
      async rollback() { commands.push("ROLLBACK"); },
      async execute(statement, values = []) {
        commands.push(statement);
        if (statement.startsWith("SELECT settings_json")) return [[...(row === undefined ? [] : [{ settings_json: row }])]];
        if (statement.startsWith("INSERT INTO nanoduck_settings") || statement.startsWith("UPDATE nanoduck_settings")) { row = values[0]; return [{ affectedRows: 1 }]; }
        throw new Error(`Unexpected statement: ${statement}`);
      }
    }
  };
};

test("the settings migration selects Opus 5.5 once and preserves unrelated preferences", async () => {
  const old = {
    headModel: "gpt-6-astra", headReasoning: "ultra",
    criticProvider: "codex", criticCodexModel: "gpt-6-astra", criticCodexReasoning: "xhigh",
    criticModel: "gpt-6-astra", criticReasoning: "xhigh",
    specialistCount: "3", discussionDepth: "5", notificationSound: "ripple"
  };
  const fixture = connectionFixture(old);
  assert.deepEqual(await migrateSettingsStorage(fixture.connection), { created: false, migrated: true, revision: currentSettingsRevision });
  assert.deepEqual(fixture.value(), {
    ...defaultSettings,
    headReasoning: "ultra",
    specialistCount: "3",
    discussionDepth: "5",
    notificationSound: "ripple"
  });
  const updates = fixture.commands.filter(command => command.startsWith("UPDATE nanoduck_settings")).length;
  assert.deepEqual(await migrateSettingsStorage(fixture.connection), { created: false, migrated: false, revision: currentSettingsRevision });
  assert.equal(fixture.commands.filter(command => command.startsWith("UPDATE nanoduck_settings")).length, updates);
  assert.equal(fixture.commands.some(command => command.includes("nanoduck_runs")), false);
});

test("a current settings revision preserves a later owner-selected Codex Critic", async () => {
  const selected = {
    ...defaultSettings,
    criticProvider: "codex",
    criticModel: "gpt-6-astra",
    criticReasoning: "xhigh"
  };
  const fixture = connectionFixture(selected);
  assert.deepEqual(await migrateSettingsStorage(fixture.connection), { created: false, migrated: false, revision: currentSettingsRevision });
  assert.deepEqual(fixture.value(), selected);
  assert.equal(fixture.commands.some(command => command.startsWith("UPDATE nanoduck_settings")), false);
});

test("a current settings revision preserves a later supported legacy Claude choice", async () => {
  const selected = {
    ...defaultSettings,
    criticClaudeModel: "claude-opus-5",
    criticClaudeReasoning: "high",
    criticModel: "claude-opus-5",
    criticReasoning: "high"
  };
  const fixture = connectionFixture(selected);
  assert.deepEqual(await migrateSettingsStorage(fixture.connection), { created: false, migrated: false, revision: currentSettingsRevision });
  assert.deepEqual(fixture.value(), selected);
  assert.equal(fixture.commands.some(command => command.startsWith("UPDATE nanoduck_settings")), false);
});

test("the prior revision normalizes only unsupported Opus 5.5 Low to Medium", async () => {
  const priorRevision = "critic-opus-5-5-medium-20260922";
  const active = connectionFixture({
    ...defaultSettings,
    settingsRevision: priorRevision,
    headReasoning: "ultra",
    criticClaudeReasoning: "low",
    criticReasoning: "low",
    notificationSound: "ripple"
  });
  assert.deepEqual(await migrateSettingsStorage(active.connection), { created: false, migrated: true, revision: currentSettingsRevision });
  assert.deepEqual(active.value(), { ...defaultSettings, headReasoning: "ultra", notificationSound: "ripple" });
  assert.equal(active.commands.some(command => command.includes("nanoduck_runs")), false);

  const inactive = connectionFixture({
    ...defaultSettings,
    settingsRevision: priorRevision,
    criticProvider: "codex",
    criticModel: "gpt-6-astra",
    criticReasoning: "xhigh",
    criticClaudeReasoning: "low"
  });
  await migrateSettingsStorage(inactive.connection);
  assert.deepEqual(inactive.value(), { ...defaultSettings, criticProvider: "codex", criticModel: "gpt-6-astra", criticReasoning: "xhigh" });

  const supported = connectionFixture({
    ...defaultSettings,
    settingsRevision: priorRevision,
    criticClaudeReasoning: "high",
    criticReasoning: "high"
  });
  await migrateSettingsStorage(supported.connection);
  assert.deepEqual(supported.value(), { ...defaultSettings, criticClaudeReasoning: "high", criticReasoning: "high" });
});

test("a fresh database receives the current Critic settings", async () => {
  const fixture = connectionFixture(undefined);
  assert.deepEqual(await migrateSettingsStorage(fixture.connection), { created: true, migrated: true, revision: currentSettingsRevision });
  assert.deepEqual(fixture.value(), defaultSettings);
});
