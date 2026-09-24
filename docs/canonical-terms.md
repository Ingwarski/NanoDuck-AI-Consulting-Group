# Canonical terms

Working language: English. Product content and source metadata: English and Ukrainian only; role names and model IDs remain English by the product brief. Russian and Belarusian language, terminology, sources and URLs are prohibited. Sources: [product idea](product-idea.md), [PRD](prd.md).

| Term | Meaning and usage | Avoid |
|---|---|---|
| NanoDuck Consulting Group | Exact current product name; NanoDuck and Consulting Group may form two lines of one wordmark. | Personal AI Consulting Group as current UI branding; implying a human firm |
| Personal AI Consulting Group | Historical name of the existing GoDaddy app; retain it only for legacy evidence and exact deployment targeting. | Renaming or broadening the deployment target |
| Login / Logoff | Exact labels for the always-visible desktop and mobile menu-bar button for starting sign-in / ending an authenticated app session. Logoff also applies before first-use consent. | Concurrent Login and Logoff actions; hiding the action in the mobile dropdown |
| Settings | Literal navigation label for models, reasoning, specialist count, discussion depth, optional incoming-message sound, editable runtime instructions and account actions. | Your space; Preferences as the destination name |
| Thinking indicator | A quiet visible thought bubble and text that the team is preparing the next confirmed message. It is active-run feedback, not a claim about a named agent or hidden chain of thought. | A decorative loader with no textual state; a progress claim that names an unverified agent |
| Conversation title | A deterministic, concise decision-question label created in the stored record only after successful final synthesis; it never occupies the active discussion header. | A clipped first message or a generated title model turn |
| Policy replacement | One bounded invocation of the same role and task when a generated response has no substantive text after whole-sentence or unsafe-link omission. The rejected draft is neither stored nor shown; a second unusable result produces a truthful System notice and Retry. | Treating the first blocked draft as a successful response or immediate terminal consultation failure |
| Runtime instructions | One owner-visible Markdown behavioral contract encrypted in the private app database for future model prompts. The server validates fixed headings/placeholders, retains encrypted saved versions, snapshots exact Markdown and revision at acceptance, and renders it only through the runtime prompt-contract module. A fresh database receives the first document from a one-time deployment secret, not a repository file. | A browser-only prompt, user-submitted instruction or a way to weaken server-enforced topology/security controls |
| Head Consultant | AI orchestrator that creates or reuses specialist roles, authors each individual task and dependency, directs follow-up, and synthesizes reviewed results. Fixed review depth is user-selected; Head controls Auto closure. | A fictional human partner, a passive task receiver or a server-chosen generic task |
| Consultant / specialist | Separate AI context with a relevant assignment. | Several role labels on one completion |
| Spiritual Consultant | AI specialist using evangelical Protestant doctrine: Jesus Christ as Lord and Saviour, finished work, salvation by faith alone and salvation that cannot be lost. | Esoteric, occult, syncretic, manifestation or therapeutic claims |
| Psychotherapist | AI specialist that may use major classical psychotherapy schools and Internal Family Systems, without diagnosing or replacing clinical/emergency care. | A licensed human clinician or emergency service |
| Prohibited language/source | Russian and Belarusian language, terminology, sources and URLs including `.ru`, `.by`, `.su` and Cyrillic equivalents. Reject owner input/source metadata; omit whole guilty sentences or unsuitable links from generated prose before persistence, retaining useful remainder. | Treating a source as acceptable because its domain uses another TLD |
| Critic | Separate reviewer that identifies material weaknesses, issues referenced rework orders and assesses whether the matching correction fulfills them. Only its assessment resolves an order; repetition stays unresolved. Claude remains text-only with no direct browsing or tool authority. | Forced opposition, endless repetition, automatic approval or an internal tool transcript |
| Discussion | Complete confirmed, ordered business messages. | Hidden reasoning, tool logs, service announcements |
| Consolidated advice | Literal heading on Head's final synthesis of current reviewed results and resolved or unresolved Critic findings after the required depth; can be explicitly provisional. | Fresh Head advice or an automatic consensus claim |
| Outcome | Current question's final Consolidated advice covering every requested output, direct evidence, risk and the actions actually needed. | Consensus when participants have not agreed |
| Sources | Direct evidence links, claims, freshness and limitations. | Invented research or unsupported certainty |
| RTF export | Rich Text Format document downloaded by Export; bold names, timestamps and formatted paragraphs can be read without a Markdown renderer. Image references do not embed the image files. | Raw JSON as the normal export; renaming plain text to .rtf |
| Conversations | The owner's saved consultation history. | Infrastructure identifiers |
| Model | Selected provider model, kept separately for consultants and Critic. The current Critic selection is Claude Code Opus 5.5 (`claude-opus-5-5`), visible in its own provider branch and passed as the exact CLI model ID; its retained Codex branch and Head/specialists remain `gpt-6-astra`. GPT-6 Sol (`gpt-6-sol`) is an additional selectable Codex model in both branches, with catalog-supported effort. | An invented capability list; treating a moving CLI alias as the saved model ID |
| Reasoning strength | User-facing selection of supported provider effort. The current Critic selection is Medium; NanoDuck offers Medium, High, Extra and Max for Opus 5.5, with Low excluded by the owner's correction. A saved Opus 5.5 / Low effort from the immediately preceding preference revision advances once to Medium, without changing accepted snapshots or other supported selections. Head/specialists retain Codex `xhigh`. | Quietly mapping an unavailable catalog value to a default; presenting Low for the Opus 5.5 Critic choice |
| Number of specialists | Owner setting for 1, 2, 3, 5 or Auto relevant specialists. The count excludes Head Consultant and Critic; Auto lets Head select 1–5. | Treating Head or Critic as part of the count |
| Discussion depth | User-selected 1, 3 or 5 team review rounds; Auto allows Head-selected closure within ten. Only affected specialists reply. Focused resolution assessments do not add a full round. | Silent reduction of fixed rounds, mandatory filler, model reasoning strength, token budget or hidden process messages |
| Voice input | Deliberate browser-native speech recognition, then editable transcript review before Send. Safari and Chrome may process speech through their recognition service after Start; NanoDuck receives no audio. | Always listening, recording upload, automatic submission |
| Image attachment | Optional owner-generated JPEG, PNG or WebP image, at most 8 MiB. The single-owner statement is a trust boundary, not provenance verification; PDF/SVG/video/audio/archive uploads are excluded. | Generic file upload, PDF attachment, a malware-scanner claim |
| Draft | Content not accepted by the server; prototype drafts exist only in page memory. | Saved conversation or submitted work |
| Send | Explicitly accept the reviewed draft for consultation. Enter sends in the chat composer; Shift+Enter adds a line break. | An accidental send while composing a multiline draft |
| New | Start a separate consultation from above the chat or Conversations; not a global menu destination. | Duplicate New navigation item |
| Review states | Development-only prototype inspection, outside the normal preview and absent from the app. | A production menu or settings control |
| App session | Owner access lasting 24 hours from sign-in under NFR-10.2, with explicit termination exceptions. | Confusing it with a consultation run or provider grant |
| Stop / Continue | Interrupt current work / resume preserved context. | Deleting history or restarting silently |
| Reconnect provider | Contextual recovery for an actual selected-provider grant failure. | A required integration setup panel |
| Floating navigation | Conventional persistent desktop navigation bar; mobile uses a hamburger button and menu. | Arbitrarily draggable toolbars |
| Design preview | Clearly labelled, fictional interactive simulation. | Production-ready application |

Internal-only terms include run generation, lease, event cursor, model tuple, SSE, ASVS and SDD. Keep them out of routine app conversation and navigation. Exact IDs, filenames and provider names remain unchanged in technical records. Ukrainian conversations use natural Ukrainian prose, including «лійка продажів»; language-switch testing keeps English role names. No vocabulary question remains unresolved for this comparison.

## Parallel work vocabulary

| Term | Meaning | Boundary |
|---|---|---|
| Role library | Reusable role guidance and a compact index for Head | Not an allowed-name list; new roles remain consultation-private |
| Assignment | Exact Head-authored task, recipient and declared dependencies | Task visible; internal role guidance hidden |
| Context boundary | Last accepted owner-message ID plus run/context revision | Internal, not a second user-facing document |
| Critic order | Specific defect and required correction linked to a result and recipient | A response is not a resolution |
| Resolution assessment | Critic's decision on a referenced correction or supported objection | Blocked or unresolved is never passed |
| Worker | Application-managed separate model invocation executing Head's work | No provider-native subagent feature or extra AI orchestrator |
