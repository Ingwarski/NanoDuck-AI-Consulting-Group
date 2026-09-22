import { currentSettingsRevision, defaultSettings, upgradeSettings } from "./settings.mjs";

const storedSettings = value => {
  const source = Buffer.isBuffer(value) ? value.toString("utf8") : value;
  const parsed = typeof source === "string" ? JSON.parse(source) : source;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("stored_settings_invalid");
  return parsed;
};

export async function migrateSettingsStorage(connection) {
  await connection.beginTransaction();
  try {
    const [rows] = await connection.execute("SELECT settings_json FROM nanoduck_settings WHERE owner_id='owner' FOR UPDATE");
    if (!rows.length) {
      await connection.execute("INSERT INTO nanoduck_settings (owner_id,settings_json) VALUES ('owner',?)", [JSON.stringify(defaultSettings)]);
      await connection.commit();
      return Object.freeze({ created: true, migrated: true, revision: currentSettingsRevision });
    }
    const stored = storedSettings(rows[0].settings_json);
    if (stored.settingsRevision === currentSettingsRevision) {
      await connection.commit();
      return Object.freeze({ created: false, migrated: false, revision: currentSettingsRevision });
    }
    const upgraded = upgradeSettings(stored);
    await connection.execute("UPDATE nanoduck_settings SET settings_json=? WHERE owner_id='owner'", [JSON.stringify(upgraded)]);
    await connection.commit();
    return Object.freeze({ created: false, migrated: true, revision: currentSettingsRevision });
  } catch (error) {
    await connection.rollback().catch(() => {});
    throw error;
  }
}
