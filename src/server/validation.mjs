import { containsSecretLikeContent } from "./content-policy.mjs";
import { currentClaudeCritic, currentClaudeCriticEfforts, currentSettingsRevision } from "./settings.mjs";
import { codexModelEfforts } from "./codex-models.mjs";
const text = (value, maximum) => typeof value === "string" && value.trim().length > 0 && value.length <= maximum;
const identifier = value => typeof value === "string" && /^[A-Za-z0-9_-]{16,128}$/u.test(value);
const forbiddenHostSuffixes = Object.freeze([".ru", ".by", ".su", ".xn--p1ai", ".xn--90ais"]);
// Shared vocabulary such as Ukrainian "які" cannot identify a prohibited
// language by itself. Match distinctive letters/words, including in mixed prose.
const forbiddenLanguage = /[\p{L}]*[ЁёЫыЪъЭэЎў][\p{L}]*|(?<!\p{L})(?:россия|русск(?:ий|ая|ие|ого|им|их)?|беларус(?:ь|ский|кая|кие|кого|ким|ких)?|как|это|какой|какая|какие|котор(?:ый|ая|ые|ого|ому|ых|ыми)?|сегодня|сейчас|только|может|нужно|должен|будет|время|деньги|рынок|решение|вопрос|источник|исследование|данные|продажи|цена|цены|гэта|якая|якія|крыніца|даследаванне|рашэнне|пытанне|сёння|цяпер|толькі|можа|павінен|будзе|рынак)(?!\p{L})/iu;
const sentenceSegmenter = new Intl.Segmenter("en", { granularity: "sentence" });

export const hasProhibitedLanguage = value => typeof value === "string" && forbiddenLanguage.test(value);
export function omitProhibitedLanguage(value) {
  if (typeof value !== "string") return { body: value, omittedCount: 0, substantive: false };
  let omittedCount = 0;
  const urls = [];
  const protectedUrls = value.replace(/\bhttps?:\/\/[^\s<>"']+/gu, url => {
    const terminal = /[.!?]$/u.test(url) ? url.at(-1) : "";
    const index = urls.push(terminal ? url.slice(0, -1) : url) - 1;
    return `\uE000${index}\uE001${terminal}`;
  });
  // Remove the sentence containing a distinctive prohibited-language signal.
  // Replacing just that signal would leak the remainder of a Russian sentence.
  const body = [...sentenceSegmenter.segment(protectedUrls)].map(({ segment }) => {
    if (!hasProhibitedLanguage(segment)) return segment;
    omittedCount += 1;
    return `[prohibited-language fragment omitted]${segment.match(/\s*$/u)?.[0] ?? ""}`;
  }).join("").replace(/\uE000(\d+)\uE001/gu, (_, index) => urls[Number(index)] ?? "");
  const remaining = body.replaceAll("[prohibited-language fragment omitted]", "")
    .replaceAll("[unapproved URL omitted]", "")
    .replaceAll("(source link omitted: unapproved URL)", "");
  return { body, omittedCount, substantive: /[\p{L}\p{N}]/u.test(remaining) };
}
export const hasProhibitedSourceHost = hostname => hostname === "ru" || hostname === "by" || hostname === "su" || hostname === "xn--p1ai" || hostname === "xn--90ais" || forbiddenHostSuffixes.some(suffix => hostname.endsWith(suffix));

export function parseJson(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return undefined;
  return value;
}

const externalUrlMatch = /\bhttps?:\/\/[^\s<>"']+/gu;
const unsafeSchemeMatch = /\b(?:file|ftp|data|javascript|ws|wss):(?:\/\/)?[^\s<>"']+/giu;
const trimUrlPunctuation = value => value.replace(/[),.;:!?]+$/gu, "");
export const hasUnsafeExternalUrl = value => typeof value === "string" && ([...value.matchAll(unsafeSchemeMatch)].length > 0 || [...value.matchAll(externalUrlMatch)].some(match => !safeExternalUrl(trimUrlPunctuation(match[0]))));

// Model prose may include one unsuitable citation even when its advice is
// otherwise usable. Remove that link explicitly instead of discarding the
// whole answer; source metadata is validated separately.
export function omitUnsafeExternalUrls(value) {
  if (typeof value !== "string") return { body: value, omittedCount: 0 };
  let omittedCount = 0;
  const contentWithoutUnsafeLinks = value
    .replace(/\[([^\]\n]{1,280})\]\(((?:https?|file|ftp|data|javascript|ws|wss):[^\s)]+)\)/giu, (whole, _label, url) => safeExternalUrl(url) ? whole : "")
    .replace(externalUrlMatch, raw => safeExternalUrl(trimUrlPunctuation(raw)) ? raw : "")
    .replace(unsafeSchemeMatch, "");
  const onlyUnsafeLinks = !/[\p{L}\p{N}]/u.test(contentWithoutUnsafeLinks);
  const withoutBadMarkdownLinks = value.replace(/\[([^\]\n]{1,280})\]\(((?:https?|file|ftp|data|javascript|ws|wss):[^\s)]+)\)/giu, (whole, label, url) => {
    if (safeExternalUrl(url)) return whole;
    omittedCount += 1;
    return onlyUnsafeLinks ? "[unapproved URL omitted]" : `${label} (source link omitted: unapproved URL)`;
  });
  const body = withoutBadMarkdownLinks.replace(externalUrlMatch, raw => {
    const candidate = trimUrlPunctuation(raw);
    if (safeExternalUrl(candidate)) return raw;
    omittedCount += 1;
    return `[unapproved URL omitted]${raw.slice(candidate.length)}`;
  });
  const withoutUnsafeSchemes = body.replace(unsafeSchemeMatch, raw => {
    omittedCount += 1;
    return `[unapproved URL omitted]${raw.slice(trimUrlPunctuation(raw).length)}`;
  });
  return { body: withoutUnsafeSchemes, omittedCount };
}

export function parseMessage(value) {
  const body = parseJson(value);
  if (!body || typeof body.body !== "string" || !body.body.trim() || !identifier(body.clientRequestId) || hasProhibitedLanguage(body.body) || hasUnsafeExternalUrl(body.body) || containsSecretLikeContent(body.body)) return undefined;
  const attachmentIds = body.attachmentIds === undefined ? [] : body.attachmentIds;
  if (!Array.isArray(attachmentIds) || attachmentIds.length > maxAttachmentsPerMessage || attachmentIds.some(item => !identifier(item)) || new Set(attachmentIds).size !== attachmentIds.length) return undefined;
  return Object.freeze({ body: body.body.trim(), clientRequestId: body.clientRequestId, attachmentIds: Object.freeze([...attachmentIds]) });
}

export function messageError(value) {
  const body = parseJson(value);
  return body && (hasProhibitedLanguage(body.body) || hasUnsafeExternalUrl(body.body)) ? "language_not_supported" : "invalid_message";
}

const knownClaudeEfforts = new Set(["low", "medium", "high", "extra", "max"]);
const catalogFor = (catalog, provider) => Array.isArray(catalog)
  ? (provider === "codex" ? catalog : [])
  : Array.isArray(catalog?.[provider]?.models) ? catalog[provider].models : [];
const modelSupports = (models, model, effort) => models.some(candidate => candidate?.id === model && Array.isArray(candidate.efforts) && candidate.efforts.includes(effort));
const validModelId = value => typeof value === "string" && /^[A-Za-z0-9._-]{1,128}$/u.test(value);

export function parseSettings(value, catalog = undefined) {
  const body = parseJson(value);
  if (!body) return undefined;
  const validSpecialistCounts = new Set(["1", "2", "3", "5", "auto"]);
  const validDiscussionDepths = new Set(["1", "3", "5", "auto"]);
  const validNotificationSounds = new Set(["knock", "chime", "ripple", "off"]);
  const codexModels = catalogFor(catalog, "codex");
  const claudeModels = catalogFor(catalog, "claude_code");
  const codexAllowed = (model, effort) => codexModels.length
    ? modelSupports(codexModels, model, effort)
    : model === "gpt-6-astra" && codexModelEfforts[model].includes(effort);
  const claudeAllowed = (model, effort) => claudeModels.length
    ? modelSupports(claudeModels, model, effort)
    : catalog === undefined && model === currentClaudeCritic.model && currentClaudeCriticEfforts.includes(effort);
  const criticProvider = body.criticProvider ?? "codex";
  const criticCodexModel = body.criticCodexModel ?? body.criticModel;
  const criticCodexReasoning = body.criticCodexReasoning ?? body.criticReasoning;
  // Obsolete placeholders resolve to the owner's current Opus 5.5 / Medium
  // choice. A real older model remains valid when the current catalog still
  // advertises it; the settings revision migration, not this request parser,
  // upgrades pre-revision stored preferences.
  const legacyClaudeModel = body.criticClaudeModel === "claude-code-default";
  const criticClaudeModel = legacyClaudeModel ? undefined : body.criticClaudeModel;
  const criticClaudeReasoning = legacyClaudeModel || ["default", "xhigh"].includes(body.criticClaudeReasoning) ? undefined : body.criticClaudeReasoning;
  const activeClaudeModel = criticClaudeModel ?? currentClaudeCritic.model;
  const activeClaudeReasoning = criticClaudeReasoning ?? currentClaudeCritic.effort;
  const criticAllowed = criticProvider === "codex"
    ? codexAllowed(criticCodexModel, criticCodexReasoning)
    : criticProvider === "claude_code" && claudeAllowed(activeClaudeModel, activeClaudeReasoning);
  const notificationSound = body.notificationSound ?? "knock";
  const inactiveCodexValid = validModelId(criticCodexModel) && codexModelEfforts[criticCodexModel]?.includes(criticCodexReasoning);
  const inactiveClaudeValid = (criticClaudeModel === undefined || validModelId(criticClaudeModel)) && (criticClaudeReasoning === undefined || knownClaudeEfforts.has(criticClaudeReasoning));
  if (!codexAllowed(body.headModel, body.headReasoning) || !criticAllowed || !inactiveCodexValid || !inactiveClaudeValid || !validSpecialistCounts.has(body.specialistCount) || !validDiscussionDepths.has(body.discussionDepth) || !validNotificationSounds.has(notificationSound)) return undefined;
  const criticModel = criticProvider === "claude_code" ? activeClaudeModel : criticCodexModel;
  const criticReasoning = criticProvider === "claude_code" ? activeClaudeReasoning : criticCodexReasoning;
  const savedClaudeModel = criticClaudeModel ?? (criticProvider === "claude_code" ? activeClaudeModel : undefined);
  const savedClaudeReasoning = criticClaudeReasoning ?? (criticProvider === "claude_code" ? activeClaudeReasoning : undefined);
  return Object.freeze({ settingsRevision: currentSettingsRevision, headModel: body.headModel, headReasoning: body.headReasoning, criticProvider, criticCodexModel, criticCodexReasoning, ...(savedClaudeModel === undefined ? {} : { criticClaudeModel: savedClaudeModel }), ...(savedClaudeReasoning === undefined ? {} : { criticClaudeReasoning: savedClaudeReasoning }), criticModel, criticReasoning, specialistCount: body.specialistCount, discussionDepth: body.discussionDepth, notificationSound });
}

export function parseConversationId(value) {
  return identifier(value) ? value : undefined;
}

export function parseConversationIds(value) {
  const body = parseJson(value);
  const ids = body?.conversationIds;
  if (!Array.isArray(ids) || ids.length < 1 || ids.length > 100 || ids.some(item => !identifier(item)) || new Set(ids).size !== ids.length) return undefined;
  return Object.freeze([...ids]);
}

export function safeExternalUrl(value) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/gu, "");
    const ipv4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/u.test(hostname);
    if (url.protocol !== "https:" || url.username || url.password || !hostname.includes(".") || hostname.includes(":") || hostname === "localhost" || hostname.endsWith(".local") || hostname.endsWith(".internal") || hasProhibitedSourceHost(hostname) || ipv4) return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}
import { maxAttachmentsPerMessage } from "./attachments.mjs";
