import { codexModelEfforts } from "./codex-models.mjs";

// A running Codex session owns the grant, so Settings cannot open a second
// session to inspect models. Retain only saved pairs when no live catalog was
// cached; those pairs can be saved again without inventing new entitlement.
export function capabilitiesForSettings(capabilities, settings) {
  if (capabilities.codex.status !== "busy") return capabilities;
  if (capabilities.codex.catalogCurrent && capabilities.codex.models.length) return capabilities;
  const savedPairs = [
    [settings.headModel, settings.headReasoning],
    [settings.criticCodexModel ?? settings.criticModel, settings.criticCodexReasoning ?? settings.criticReasoning]
  ];
  const models = [];
  for (const [model, effort] of savedPairs) {
    if (!codexModelEfforts[model]?.includes(effort)) continue;
    const existing = models.find(item => item.id === model);
    if (existing) { if (!existing.efforts.includes(effort)) existing.efforts.push(effort); }
    else models.push({ id: model, efforts: [effort] });
  }
  return { ...capabilities, codex: { ...capabilities.codex, models, savedOnly: true } };
}

export function changesSavedCodexTuple(next, current) {
  return next.headModel !== current.headModel || next.headReasoning !== current.headReasoning ||
    next.criticCodexModel !== (current.criticCodexModel ?? current.criticModel) ||
    next.criticCodexReasoning !== (current.criticCodexReasoning ?? current.criticReasoning);
}
