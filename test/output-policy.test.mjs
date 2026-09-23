import assert from "node:assert/strict";
import test from "node:test";
import { hasProhibitedLanguage, hasUnsafeExternalUrl, omitProhibitedLanguage, omitUnsafeExternalUrls, parseMessage, safeExternalUrl } from "../src/server/validation.mjs";

test("generated prohibited sentences are removed whole while useful text survives", () => {
  for (const generated of [
    "Keep the supported finding. Как это работает https://example.com/article?id=123? Verify the buyer count next.",
    "Keep the supported finding. Как это работает https://example.su/article.\nVerify the buyer count next."
  ]) {
    const filtered = omitProhibitedLanguage(omitUnsafeExternalUrls(generated).body);
    assert.equal(filtered.substantive, true);
    assert.match(filtered.body, /^Keep the supported finding\. \[prohibited-language fragment omitted\]/u);
    assert.match(filtered.body, /Verify the buyer count next\./u);
    assert.doesNotMatch(filtered.body, /Как|это|article|id=123/u);
  }
});

test("unsafe generated links are omitted, but markers alone are not answers", () => {
  const mixed = omitUnsafeExternalUrls("Check [this report](https://example.su/report) before deciding.");
  assert.equal(mixed.body, "Check this report (source link omitted: unapproved URL) before deciding.");
  assert.equal(mixed.omittedCount, 1);
  const onlyUrl = omitProhibitedLanguage(omitUnsafeExternalUrls("https://example.su/report").body);
  assert.equal(onlyUrl.substantive, false);
  const onlyMarkdownLink = omitProhibitedLanguage(omitUnsafeExternalUrls("[source](https://example.su/report)").body);
  assert.equal(onlyMarkdownLink.substantive, false);
  const onlyLanguage = omitProhibitedLanguage("Как это работает?");
  assert.equal(onlyLanguage.substantive, false);
  assert.equal(omitUnsafeExternalUrls("Read [private file](file:///private/report) first.").body, "Read private file (source link omitted: unapproved URL) first.");
  assert.equal(hasUnsafeExternalUrl("file:///private/report"), true);
  assert.equal(safeExternalUrl("https://[::ffff:127.0.0.1]/private"), undefined);
});

test("shared Ukrainian words and English language descriptors are allowed in long owner input", () => {
  const long = `Які умови для Russian and Belarusian market labels? ${"Аналізуйте факти. ".repeat(2_500)}`;
  assert.equal(hasProhibitedLanguage(long), false);
  assert.equal(parseMessage({ body: long, clientRequestId: "long-policy-request-0001" })?.body, long.trim());
  assert.equal(parseMessage({ body: "Как это работает?", clientRequestId: "rejected-request-0001" }), undefined);
});
