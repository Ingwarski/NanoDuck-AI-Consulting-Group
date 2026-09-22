const previousSettingsRevision = "critic-opus-5-5-medium-20260922";
export const currentSettingsRevision = "critic-opus-5-5-effort-floor-20260922";

export const currentClaudeCritic = Object.freeze({
  provider: "claude_code",
  model: "claude-opus-5-5",
  label: "Opus 5.5",
  effort: "medium"
});

export const currentClaudeCriticEfforts = Object.freeze(["medium", "high", "extra", "max"]);

export const defaultSettings = Object.freeze({
  settingsRevision: currentSettingsRevision,
  headModel: "gpt-6-astra",
  headReasoning: "xhigh",
  criticProvider: currentClaudeCritic.provider,
  criticCodexModel: "gpt-6-astra",
  criticCodexReasoning: "xhigh",
  criticClaudeModel: currentClaudeCritic.model,
  criticClaudeReasoning: currentClaudeCritic.effort,
  criticModel: currentClaudeCritic.model,
  criticReasoning: currentClaudeCritic.effort,
  specialistCount: "2",
  discussionDepth: "1",
  notificationSound: "knock"
});

export function upgradeSettings(value) {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const merged = { ...defaultSettings, ...source };
  if (source.settingsRevision === currentSettingsRevision) return Object.freeze(merged);
  if (source.settingsRevision === previousSettingsRevision) {
    // The former catalog offered Low for Opus 5.5. Normalize only that now
    // unsupported choice; preserve later supported selections and all run snapshots.
    const opusLow = merged.criticClaudeModel === currentClaudeCritic.model && merged.criticClaudeReasoning === "low";
    const activeOpusLow = merged.criticProvider === "claude_code" && merged.criticModel === currentClaudeCritic.model && merged.criticReasoning === "low";
    return Object.freeze({
      ...merged,
      settingsRevision: currentSettingsRevision,
      criticClaudeReasoning: opusLow ? currentClaudeCritic.effort : merged.criticClaudeReasoning,
      criticReasoning: activeOpusLow ? currentClaudeCritic.effort : merged.criticReasoning
    });
  }
  return Object.freeze({
    ...merged,
    settingsRevision: currentSettingsRevision,
    criticProvider: currentClaudeCritic.provider,
    criticClaudeModel: currentClaudeCritic.model,
    criticClaudeReasoning: currentClaudeCritic.effort,
    criticModel: currentClaudeCritic.model,
    criticReasoning: currentClaudeCritic.effort
  });
}
