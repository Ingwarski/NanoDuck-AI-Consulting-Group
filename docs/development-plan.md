# Development plan

22 September 2026 · Status: **implementation and scoped cutover in progress**. Phase 3 and replacement deployment are authorized only for Personal AI Consulting Group (`wy2v0putg6`) and its verified application tables. The GitHub source switch is complete; live Opus 5.5 execution, hosted settings migration, preview/publish acceptance and any authorized database deletion remain evidence-gated.

## Source References

Product behavior: [PRD](prd.md), including all 60 distinct FR/NFR clauses, UC-001–UC-007 and AC-001–AC-010. [Context](project-context.md) and [terms](canonical-terms.md) are applied: single owner, browser-first use, literal Settings, separate AI roles and established vocabulary constrain local UI/API decisions. No context conflicts remain. [Guardrails](guardrails.md) supply authority and phase boundaries. [Journey](user-journey.md), [screen map](screen-map.md) and [wireframes](wireframes.md) supply all jobs, transitions, 9 surfaces and 44 states.

[Design brief](design-brief.md#approved-visual-baseline) is the sole visual authority: `nanoduck-electric-a-v8-20260914`, Electric A v8. [Architecture](architecture.md), [DoD](dod-evals.md) and [QA checklist](qa-checklist.md) have been reconciled in that order against this baseline. The plan consumes their full definitions, including shared evidence/scope/severity conventions, H1–H10 and representative-user tasks. [Model settings](model-settings.md) and [deployment boundary](deployment-boundary.md) provide qualified preserved settings and dated host observations, not fresh runtime proof. Exact consumed hashes are recorded by the orchestrator in the manifest.

## Implementation Strategy

Build one Node application with one MySQL database and the existing isolated provider adapters. Keep one canonical transaction-backed event stream, run leases/generation fencing and authenticated replay. Do not add a queue service, Redis, messenger, separate AI host, public registration or paid fallback. Requirements and architecture drive implementation; QA supplies evidence. Write meaningful tests at trust, transaction, provider and browser seams, not tests mirroring trivial CSS.

Sequence high-risk capability evidence first, then a small secure app foundation, approved presentation and settings, durable discussion, research, voice/attachments and record lifecycle. The final unit integrates verification and scoped release preparation. Unit owners below mean the later authorized implementation operator acting at the named layer; the product owner resolves material scope decisions and supplies representative-user observations. They do not imply separate staff, parallel agents or new services.

## Codebase Map

The local implementation has one Node application: `src/server/` contains HTTP, session, storage, coordinator and provider modules; `src/client/` contains browser handlers; `public/` contains the approved presentation assets; and `test/` contains trust, transaction, provider and HTTP seams. Frozen A v8 remains the visual reference. `prototype/` and `docs/design.md` are rejected history, never production seeds. `docs/source-provenance.json` records the design mapping and approval references.

Proposed implementation destinations below are a work allocation, not claims that files already exist. Keep modules inside this one application: `src/server/` for HTTP/session/storage/coordinator/adapters; `src/client/` for real browser handlers; `public/` for the bounded approved presentation assets; `tests/` for meaningful seam checks. Add dependencies only when the existing native/runtime mechanisms do not meet the specified boundary; pin and inventory them. No framework migration is required by this plan.

## Shared visual and UX contract

Every user-visible unit U-02–U-08 inherits baseline `nanoduck-electric-a-v8-20260914`, target SHA-256 `93231814431a1bbbf8a0ba07f515eefcfd63193534189898b70766ed45938cbc`, source-tree SHA-256 `1de020dcfe48f3feb80db0e58ba911b821825b48730d32c72d9518ad512eb0d9` and the exact scope/permitted variance from the design brief. Scope: S-01–S-09, ST-01–ST-44; 320/390/430/768/1280/1440 CSS px; English/Ukrainian content. The unit trace narrows what is implemented there; the matrix below preserves every state. U-01 is backend/infrastructure evidence that enables these visible states.

Run `approved_visual_baseline_fidelity` (QA-R40–QA-R42 plus each affected QA-S check), `heuristic_usability_review` (QA-H01–QA-H10; all apply to relevant default/recovery paths), and `representative_user_task_validation` for affected tasks. QA-U01 is voice without accidental send; QA-U02 is locating a Critic objection/response/source; QA-U03 is changing future settings without altering the active run; QA-U04 is stop/recover/export/cancel deletion without loss. Use the actual success criteria and phone/desktop evidence requirements in QA, never an AI-generated participant. U-02 uses entry as the prerequisite to these tasks; U-03 integrates all four; U-04 U02/U04; U-05 U02; U-06 U01; U-07 U04; U-08 all four.

Replace fictional content, remove inspection/version scaffolding, wire real services and accommodate accessible focus/errors, content wrapping and browser rasterization. Preserve hierarchy, Electric tokens, corrected logo geometry, control visibility and navigation. Material divergence needs a design-owner revision, not silent implementation discretion. Compare actual screenshots/DOM behavior with the frozen target, report differences and findings; visual scope is not proof all combinations were tested.

## Implementation Units

### U-01 — Verify the runtime and preserved provider capabilities

**Owner/layer:** authorized implementation operator, infrastructure / integration. **Depends on:** None; first Phase 3 work.

**Source trace:** All JOB-001–JOB-006, UC-001–UC-007, J-01–J-07 indirectly; enables every runtime surface. Exact clause allocation appears below; architecture's corresponding boundary controls the mechanism.

**Work:** Preserve Head/specialists Codex `gpt-6-astra` / `xhigh` and select Critic Claude Code `claude-opus-5-5` / `medium`, retaining Codex `gpt-6-astra` / `xhigh` as the independent Critic branch. Include optional GPT-6 Sol (`gpt-6-sol`) for both Codex branches only when the current inspected catalog returns the model and a supported effort; leave those saved selections unchanged. Preserve defaults of 2 specialists and a review-depth ceiling of 1 Critic ↔ specialist exchange. Never substitute, downgrade, buy credits or enable a paid fallback. Verify the selected Claude managed grant, catalog, quota/renewal state and a short bounded allowed turn. At the isolated process seam, prove the installed Claude Code CLI matches the pinned `2.1.280`, Opus 5.5 passes the exact `--model claude-opus-5-5` ID, Medium passes unchanged, Extra maps to `xhigh`, and a legacy `claude-opus-5` snapshot uses its exact ID and fails visibly if unsupported. Record the installed revision and actual model result; never rely on the moving `opus` alias. Verify restricted Codex research separately without giving Claude tools. Verify standard and WebKit browser recognition constructors in Safari and Chrome and a real Ukrainian `uk-UA` result, with no NanoDuck audio endpoint or subscription transcription adapter. Inspect the exact GoDaddy app runtime/subprocess, idle/background lifecycle, restart/redeploy storage, stream buffering, TLS, environment and logs only when later authorized, without resetting data. Resolve upload/research limits, the owner-only JPEG/PNG/WebP byte/type policy, session concurrency/federated termination, separated key handling with exact existing 32-byte key encodings or the exact same-name `.env` envelope accepted by architecture, backup retention/RPO/RTO and operator procedures through architecture before dependent release tests. Use isolated fixtures and keep secrets/content out of Git.

**Acceptance:** A dated capability matrix identifies actual supported and unavailable tuples, formats and host mechanisms, with source/runtime evidence. It records whether GPT-6 Sol is advertised with each supported effort in the current Codex catalog, without treating catalog presence as a successful turn. It records the installed Claude Code revision, exact Opus 5.5 model argument and result, and distinguishes a successful bounded turn from picker/catalog evidence. Choose SSE or the already permitted incremental polling using measured host behavior. No missing voice or security capability is labelled optional. An incompatible essential capability returns to architecture/product ownership; it does not authorize another host/provider or weakened requirement.

**Verification:** QA-R20–QA-R24, QA-R28–QA-R32, QA-R38–QA-R39, QA-R43–QA-R44, QA-R49–QA-R50, QA-R52–QA-R53, QA-R56–QA-R58. Capability observations are prerequisites, not complete passes for these checks. Tests remain not_run. Evidence lives under `forge/runs/U-01/{run_id}/` and records actual revision, sources, executor, time and scope.

**Risk/stop condition:** Browser recognition service or device incompatibility. Stop only the affected voice branch before release; typed input and other independent UI work remain available.

### U-02 — Build the private application and durable data foundation

**Owner/layer:** authorized implementation operator, full-stack. **Depends on:** U-01 identity, runtime, data and security decisions.

**Source trace:** JOB-003 → UC-001 → J-01 → S-01/ST-01–ST-04; also S-04/ST-25. Enables protected data for all other UCs. Exact clause allocation appears below; architecture's corresponding boundary controls the mechanism.

**Work:** Create one Node application and one MySQL schema for sessions, consent, preferences, conversations, runs, canonical messages, sources and owned attachment references. Implement shared owner authorization, typed envelopes, transaction helpers, authenticated encryption/key IDs, safe Markdown/URL handling, request-origin/CSRF/header policy and content-free protected operational events. Normalize MySQL JSON fields at the storage adapter so text, buffers and driver-decoded values produce the same validated settings, run snapshots and source arrays. Validate the Google callback and sole owner; implement concise first-use processing consent. Enforce the fixed 86400-second server deadline and persistent cookie through inactivity/browser reopening; sign-out/revocation/security invalidation end access earlier. Reauthenticate session-control actions; clear private client content even offline. Separate private data and keys from public build assets. Wire the approved entry/consent/denied/expired states through the presentation layer delivered by U-03.

**Acceptance:** Valid owner entry and consent reach private work; forged/replayed/non-owner entry and forged resource identifiers reveal nothing. Sessions work immediately before 24 hours and expire at the boundary; activity does not extend them. Parameterized writes and tamper-denying encryption underpin later transactions; database export without keys exposes no protected plaintext. Reopening a persisted GoDaddy record succeeds when its MySQL JSON columns arrive decoded by the driver.

**Verification:** QA-R01–QA-R02, QA-R43–QA-R46, QA-R48, QA-R52–QA-R55, QA-R58–QA-R59; QA-S01/QA-S04; QA-H01–QA-H10; shared visual checks. U-08 completes integrated session/security evidence. Tests remain not_run. Evidence lives under `forge/runs/U-02/{run_id}/` and records actual revision, sources, executor, time and scope.

**Risk/stop condition:** A mock login or browser-only owner check would bypass the actual trust boundary. Verify at authenticated and denied HTTP/storage seams.

### U-03 — Promote the approved presentation and connect Settings

**Owner/layer:** authorized implementation operator, full-stack. **Depends on:** U-01 catalog evidence and U-02 application/session foundation. Frozen presentation extraction can proceed while capability evidence is collected.

**Source trace:** All JOB-001–JOB-006 → UC-001–UC-007 → J-01–J-07 → S-01–S-09/ST-01–ST-44 for presentation; Settings primary trace JOB-003/JOB-005 → UC-005 → J-07 → S-04; navigation S-09. Exact clause allocation appears below; architecture's corresponding boundary controls the mechanism.

**Work:** Use the bounded path map below to retain the approved black Electric composition, corrected SVGs, Ember messages/tabs, Cobalt composer, mobile hamburger and floating desktop bar. Keep one Login/Logoff button directly on the desktop/mobile bar beside the mobile Menu trigger, outside the collapsed dropdown. Wire it to the existing session/auth routes, including authenticated consent-pending state, pending-action disabling, failure/retry feedback and clearing private page memory after logout. Verify QA-R01/QA-R33/QA-S01/QA-S09 for the changed states; preserve U-02 session enforcement. Keep New above the chat and in Conversations; preserve literal Settings, visible Send, a clear inline SVG microphone, and all owner labels as `You` with an `I` avatar on owner messages. Use distinct named role colours for Spiritual Consultant and Psychotherapist, without colour-only identity. Remove comparison/version/inspection scaffolding and fictional successful service behavior from production. Serve no-store HTML with content-addressed same-origin CSS/JavaScript and rewritten module imports through `src/server/browser-assets.mjs`, denying unregistered hashes so a returning browser receives current controls after an app update. Implement page-memory drafts, semantic focus/menu/dialog behavior, restricted DOM Markdown rendering for discussion/outcome content and English/Ukrainian fixtures. Support paragraphs, headings, lists, quotations, bold/italic emphasis, inline code and approved HTTPS links; raw HTML and unsafe/prohibited URLs stay inert or fail validation. Enter submits the chat composer; Shift+Enter adds a line break. During an active consultation render a text-labelled thought bubble and reachable Stop, not an in-progress title; write one concise history title only after the final synthesis. Connect actual provider/model/reasoning selectors, number-of-specialists (1/2/3/5/Auto), discussion-depth (1/3/5/Auto), and independent Knock/Chime/Ripple/Off message-sound preference with owner-activated Preview to U-01-supported catalog and encrypted preferences. Display Claude Code, Opus 5.5 and Medium (Default) for the current Critic selection. Offer GPT-6 Sol in both Codex model controls when supported by the inspected catalog, show only compatible reasoning efforts, and require a deliberate effort choice if a model switch invalidates the selected effort. This optional choice does not migrate or replace saved defaults. Apply the current settings revision `critic-opus-5-5-effort-floor-20260922`: fresh and pre-Opus owner preferences receive Claude Code Opus 5.5 / Medium once; from the immediately preceding `critic-opus-5-5-medium-20260922` revision, only an active or inactive Claude Opus 5.5 / Low choice advances to Medium. Preserve unrelated preferences, the retained Codex branch, other supported Claude choices and later owner saves across restart. The migration may change only `nanoduck_settings` and never accepted `nanoduck_runs` snapshots. Use the exact owner-accepted v5 CC0 table-ball triple-tap PCM WAV at `/sounds/table-taps-250ms-v5.wav` (250 ms onset-to-onset spacing; blended sharp/woody impacts; quiet 28 ms and 47 ms reflections ending within 92 ms; original recorded pitch) for both Preview and incoming alerts. Generate Chime/Ripple as local WAV media for the same HTML audio playback path. Serve the bundled asset as `audio/wav`, retain same-origin and `blob:` media in the restrictive policy, and retain visual feedback when audio is unavailable. Record the original source and editing details without labelling the retimed recording an unmodified original. Provide the full owner-visible runtime-instructions Markdown document from encrypted database storage through the one server runtime prompt-contract module. Bootstrap an empty database only through a one-time deployment-secret migration; do not read an instruction document from the repository. Validate model combinations and every required instruction heading/placeholder server-side; reject stale saves; retain encrypted saved-version metadata; require review before restore; create a fresh revision on restore; and make saves future-run-only. Explain that specialist count excludes Head and Critic, and depth is a ceiling for every selected specialist; Head decides whether another useful team-wide review is needed, and Auto permits at most 10 exchanges per specialist. Show real usage or unavailable information; separate app expiry, selected-provider reauthorization, quota and outage. Connect remaining controls as their owning runtime units arrive; no mock may be labelled functional.

**Acceptance:** Presentation matches exact A v8 within declared variance at every required surface/state. A returning browser with older cached CSS/JavaScript receives current Settings controls from newly versioned assets without manual cache clearing; unregistered asset hashes cannot return current bytes. Empty and pre-Opus preferences receive Opus 5.5 / Medium once with unrelated fields preserved; an immediately preceding Opus 5.5 / Low choice in either Claude branch advances only that effort to Medium once; a current-revision later Codex or supported Claude selection survives repeated reload/restart. A supported GPT-6 Sol/effort pair can be saved independently in each Codex branch; reload preserves it, the other branch and the accepted run snapshot. Saved valid settings, encrypted runtime-instructions document and encrypted version history survive reload while the active run retains its accepted tuple and document snapshot. Restore creates a fresh revision and never changes an accepted run. Unsupported choices never silently substitute. The product contains no inspection UI, connection checklist, palette-comparison controls or simulated provider success.

**Verification:** QA-R20, QA-R21, QA-R22, QA-R23, QA-R24, QA-R60, QA-R33, QA-R34, QA-R35, QA-R40, QA-R41, QA-R42; QA-R45–QA-R48, QA-R51, QA-R55; QA-S01–QA-S09; QA-H01–QA-H10; QA-U03. Tests remain not_run. Evidence lives under `forge/runs/U-03/{run_id}/` and records actual revision, sources, executor, time and scope.

**Risk/stop condition:** Copying mock state machinery can create false success. Reimplement handlers; require runtime interface tests and the future promotion receipt.

### U-04 — Implement real discussion, control and recovery

**Owner/layer:** authorized implementation operator, full-stack. **Depends on:** U-01 provider evidence; U-02 authorized transactional store; U-03 shell/settings.

**Source trace:** JOB-001/JOB-002 → UC-002/UC-003 → J-02/J-03/J-05/J-06 → S-02/ST-05–ST-17 and S-07/ST-37–ST-38. Exact clause allocation appears below; architecture's corresponding boundary controls the mechanism.

**Work:** Accept owner messages and runs atomically with idempotency; lease work outside HTTP lifetime and commit each actual role message and next step to the canonical stream. Retain the exact accepted settings and runtime-instructions Markdown/revision snapshot; later preference changes do not rewrite an active run. Every accepted question, including a simple one, follows the selected specialist team and Critic before Head's final advice. Head reads the complete ordered owner request and corrections, records every requested deliverable, chooses the actual permitted roster within the selected 1/2/3/5 or Auto 1–5 specialist count, writes a distinct considered task for each specialist and decides after each whole-team review whether another targeted round is useful. Code validates roster identity/count, persists decisions and routes messages; it does not choose roles by keywords. Commit each successful Head task verbatim to its named specialist without a task wrapper, wording gate, length trim, corrective rewrite or generic replacement brief. A failed Head invocation pauses with a truthful System notice. Recover an already committed task prefix from prior runs, selecting only missing roles and preserving confirmed tasks. No direct Head-answer route or preliminary Head advice reaches the owner.

Give every participating role the same complete ordered owner text, corrections, confirmed discussion and direct source ledger, then append its own role and exact Head task. State explicitly when a text-only provider cannot analyze image pixels. Render behavioral role, output and research contracts from the single validated Markdown snapshot through the runtime prompt-contract module; code enforces topology, authorization, policy and provider boundaries. Migrate exact former public task and Critic defaults in the encrypted saved document as a new reviewable revision, preserving owner-edited sections and prior history; apply the upgraded Critic contract to legacy accepted-run snapshots. Keep permitted role boundaries, including the Spiritual Consultant doctrine and the Psychotherapist non-clinical/emergency boundary. Do not fabricate numerical, market, customer or source claims; mark missing evidence specifically.

Critic checks each assigned answer against the entire owner request, requested deliverables, exact Head task, source evidence, numerical claims and contradictions. It issues a specific stop-and-rework directive for circular, irrelevant, fabricated or unsupported work, identifying the claim or omission, why it fails and what direct answer, calculation or evidence is needed. It does not invent a defect in sound work. The consultant materially revises, raises a specific evidence-based objection or acknowledges unavailable evidence. Head sees and arbitrates the exchange. Every selected specialist receives at least one Critic challenge and reply; 1/3/5 are ceilings rather than mandatory quotas, and Auto caps at 10 exchanges per specialist. After each full-team round, Head closes or directs another useful round within the ceiling. Preserve each final specialist position, Critic's joint assessment of all requested outputs and one Head Consolidated advice. Unresolved work is provisional, never labelled consensus. Persist roster/review/progress decisions so Stop, Continue, Retry, failure and restart do not replay confirmed messages or synthesize before a review completes.

Claude Critic remains text-only: deny known Claude Code tools at the command boundary, reject tool transcripts and allow only the existing bounded correction for tool-output violations. Keep full useful English/Ukrainian output and direct source links; omit whole generated Russian/Belarusian sentences and unsuitable generated Markdown/raw URLs with neutral markers, keeping safe adjacent prose. Validate source records independently. If only omission markers remain, give that same role/task one bounded correction; a second unusable answer saves a policy-specific System notice and exposes Retry. Distinguish unusable language, unusable link-only output and genuinely empty provider responses. Rejected drafts and System notices never enter later business context. Log only output kind, reason and counts. Reject prohibited owner input and source metadata at their existing boundaries. Do not silently trim owner questions, role messages, discussion, final advice or source records; finite HTTP/storage/provider ceilings return truthful capacity errors without provider substitution.

Consume completed message items and their matching successful terminal events from the ephemeral provider connection, retaining early events and rejecting partial, failed, cancelled or mismatched output. Categorize app-server JSON-RPC failures using bounded safe fields without persisting raw diagnostics. Use authenticated replay via the selected transport, Stop generation fencing, Continue for stopped runs, Retry for failed runs and New with one-active-run enforcement. Preserve the accepted snapshot and prior status/generation under the owner lock. Keep recovery notices visible in history/export but out of provider context. Maintain the provider budget and continuation boundary. Connect isolated public research through U-05 and persistent attachments through U-06.

**Acceptance:** Synthetic fixed and Auto runs show Head choosing an exact permitted roster and delivering a long, unusual, non-imperative task byte-for-byte to only its named specialist. Every role sees first and latest owner messages, complete discussion beyond the former 80,000-character window and the direct source ledger; long final advice survives history/export. Critic identifies a concrete unsupported claim, false number or missing owner output and obtains a real revision or justified objection, while sound work receives no invented defect. Head can close after one productive round under a higher ceiling or direct another specific round; a confirmed challenge resumes at the missing reply without duplication. Legacy committed task prefixes and upgraded public prompt defaults recover without replacing owner edits. Mixed prohibited-language and unsafe-link outputs retain useful surrounding advice; URL-only, language-only and empty completions receive distinct bounded recovery, and no rejected draft or System notice enters later prompts. A successful terminal provider event commits its matching completed output once; crash-after-acceptance, duplicate Retry, restart and Stop/late-result races produce exactly one confirmed visible step. New cannot bypass one active run. The final Head advice covers each requested deliverable, direct evidence where available and explicit missing items without an arbitrary three-action cap.

**Risk/stop condition:** Durability is the central failure seam. Exercise process termination and concurrent commands against real transactions before adding broad end-to-end polish.

### U-05 — Connect live research and inspectable sources

**Owner/layer:** authorized implementation operator, full-stack. **Depends on:** U-01 restricted research capability; U-02 authorization/storage; U-03 source presentation; U-04 coordinator.

**Source trace:** JOB-001/JOB-002 → UC-007 → J-04 → S-06/ST-34–ST-36; contributes to S-02/ST-15 and S-07/ST-38. Exact clause allocation appears below; architecture's corresponding boundary controls the mechanism.

**Work:** Trigger public research when a time-sensitive claim or material uncertainty needs evidence, without relying on keywords. Head first forms a minimal public query in a non-web step. Validate that actual outgoing query for contacts, credentials, unsafe destinations and private network targets. Only the approved query and public instructions enter a restricted Codex web-enabled step; private owner text, instructions and discussion never cross that boundary. A phone number elsewhere in the private consultation must not block a safe query, and a numeric ID in a safe public article URL must not be misclassified as a private contact. A text-only Claude Critic can identify a specific evidence gap for Head or a Codex specialist to pursue through the same isolated route. Save every independently valid direct source URL, title, supported claim, retrieval/publication date and limitation without an arbitrary eight-source cutoff. Enforce English/Ukrainian source metadata, deny prohibited-language metadata and disallowed hosts; validate schemes, addresses and redirects and treat retrieved text as untrusted. A withheld or failed search remains an explicit evidence limitation. Render Sources/detail and source-unavailable states; do not fabricate citations or fresh-check claims.

**Acceptance:** A synthetic public numeric article URL remains researchable despite a separate private contact in the owner request. The actual web-enabled provider prompt contains only the safe query and public instructions; unsafe query material is withheld. More than eight valid direct sources remain inspectable, while invalid metadata is dropped independently. A current-topic consultation traces a claim to fresh primary evidence. Conflicting or unavailable evidence remains qualified, and injected content cannot grant tools, expose private context, switch providers or initiate an external action.

**Risk/stop condition:** A successful public fetch does not prove SSRF or transfer isolation. Include redirects, private address targets and marked private fixtures at the actual egress seam.

### U-06 — Implement voice and safe attachments

**Owner/layer:** authorized implementation operator, full-stack. **Depends on:** U-01 browser/parser capability; U-02 protected storage; U-03 composer; U-04 accepted-input contract.

**Source trace:** JOB-006/JOB-001 → UC-006/UC-002 → J-02 → S-05/ST-26–ST-33 and S-02/ST-06–ST-07. Exact clause allocation appears below; architecture's corresponding boundary controls the mechanism.

**Work:** Implement Start-gated browser `SpeechRecognition`/`webkitSpeechRecognition`, explicit recognition-service disclosure, Stop-to-editable-text, Cancel-to-abort and background interruption. Use the browser language list to select Ukrainian `uk-UA` when available. Return editable text to the existing draft at a clear append boundary; no automatic Send. Distinguish permission, unavailable browser/service, language, network and interruption errors, preserving typing and explicit retry. Do not add `MediaRecorder`, audio blobs, a transcription endpoint, key or provider. Accept only owner-submitted JPEG/PNG/WebP images: enforce an 8 MiB streaming limit, ignore client MIME and validate the matching binary signature before encrypted opaque, non-executable storage. Do not parse, transform, thumbnail, server-render or scan the image. Reject PDF, SVG, video, audio, archives, mismatches and malformed/truncated content while retaining the typed draft. Owner-only retrieval uses the validated type, attachment disposition and `nosniff`.

**Acceptance:** On real Safari and Chrome devices, a spoken Ukrainian request becomes editable unsent text; Cancel/background/failure leaves no active hidden recognition and NanoDuck has received no audio. Valid JPEG/PNG/WebP images persist only as protected opaque records; all invalid type/signature/size cases fail without losing the typed draft. Typing fallback remains usable but cannot waive required voice acceptance.

**Verification:** QA-R04, QA-R28, QA-R29, QA-R30, QA-R31, QA-R32, QA-R50, QA-R55; QA-R40–QA-R42, QA-R45–QA-R47, QA-R50, QA-R53–QA-R55, QA-R59; QA-S05 and QA-S02; QA-H01–QA-H10; QA-U01. Tests remain not_run. Evidence lives under `forge/runs/U-06/{run_id}/` and records actual revision, sources, executor, time and scope.

**Risk/stop condition:** Browser recognition success does not prove mobile service availability or disclosure/privacy handling. The single-owner self-generated-image statement is not technical provenance proof. Exercise the full Start-to-editable-text seam, inspect Stop/Cancel/background behavior, and prove that the image boundary rejects every non-allowed/malformed/oversized fixture without parser or scanner execution.

### U-07 — Finish record ownership, export, deletion and restore

**Owner/layer:** authorized implementation operator, full-stack / operations. **Depends on:** U-02 data foundation; U-03 history UI; U-04 canonical records; U-05 sources; U-06 attachments.

**Source trace:** JOB-004/JOB-001 → UC-004/UC-002 → J-06 → S-03/ST-18–ST-20, S-06, S-07 and S-08/ST-39–ST-42. Exact clause allocation appears below; architecture's corresponding boundary controls the mechanism.

**Work:** Reopen complete confirmed records, sources and owned attachments across browser sessions. Make each accessible saved-conversation summary row open the record directly; retain Export and Delete as separate controls, with multi-select deletion as its own explicit action. Preserve same-tab browser refresh context using short-lived tab storage only: selected app surface, Discussion tab, open-record ID and reading position. Reload the protected record before returning to the position, keep the browser URL free of record data, store no draft or conversation content, and clear the state at Logoff. Correction R-15: make Export download a readable RTF through the existing authenticated endpoint. Add the small server renderer using the current restricted Markdown parser; escape all data as RTF text, preserve Unicode, bold roles/recipients, explicit browser-zone timestamps, paragraphs, emphasis, lists, headings, sources and image references. Keep image binaries separate and omit draft/credentials/runtime snapshots. Retain the existing action with a format tooltip; no extra service, package or format setting. Verify QA-R26/QA-R46/QA-S08 at the API, real browser download and native-reader seams. Confirm deletion of only the selected conversation and its owned content; cancellation is inert. Persist deletion decisions so isolated restores cannot resurrect deleted records. Implement encrypted backup/restore with separated keys and the U-01-reviewed retention/recovery objectives. Preserve indefinite accepted history until explicit deletion; report backup propagation truthfully. Fail closed on unavailable storage/export, retaining recoverable confirmed work.

**Acceptance:** Complete reopen/export matches canonical content. Guessed IDs cannot access private records. Cancel does nothing; confirmed delete changes only that record. Isolated restore recovers accepted history, respects deletion decisions and never accesses another app database.

**Verification:** QA-R25, QA-R26, QA-R27, QA-R56; QA-R45–QA-R46, QA-R52–QA-R56, QA-R59; QA-S03/QA-S06/QA-S07/QA-S08; QA-H01–QA-H10; QA-U04. Tests remain not_run. Evidence lives under `forge/runs/U-07/{run_id}/` and records actual revision, sources, executor, time and scope.

**Risk/stop condition:** Deletion-aware recovery must be proved with marked isolated records and keys before any target reset; do not treat a database dump as a tested restore.

### U-08 — Verify the integrated app and prepare the scoped release

**Owner/layer:** authorized implementation operator, integration / operations. **Depends on:** U-01–U-07 implemented with recorded unit evidence and no unresolved release-blocking capability.

**Source trace:** All JOB-001–JOB-006 → UC-001–UC-007 → J-01–J-07 → S-01–S-09/ST-01–ST-44; cross-cutting release integration. Exact clause allocation appears below; architecture's corresponding boundary controls the mechanism.

**Work:** Execute all 83 canonical QA checks at their required actual seams and all six DoD gates, retaining prior prototype observations as limited history. Cover real supported browsers/devices, keyboard, 320px reflow, 200% text sizing, relevant assistive technology, forced colors and long English/Ukrainian content. Run H1–H10 expert review and actual representative-owner tasks; classify findings and close blocking ones. Record dependency inventory and risk-based update/incident/backup ownership and deadlines. Prepare a production-only artifact, exact configuration inventory, compatible migration and rollback trigger. Before a Preview update, verify the GoDaddy package contract in the Git source: root name/version/main, `build` and `start`, entry-point existence, `process.env.PORT`, `0.0.0.0` binding, runtime imports in `dependencies`, and no tracked or uploaded `node_modules`. Verify the exact Personal AI Consulting Group app and exclusively owned database/table inventory, rehearse isolated restore, then present a concrete cutover package under the later implementation authorization. On an environment-secret-only host, provision the pinned Codex app-server package, exactly one supported auth secret and `NANODUCK_RUNTIME_MODE=production` where GoDaddy reserves `NODE_ENV`; GoDaddy uses `CODEX_APP_SERVER_AUTH_GZIP_B64`. Verify preflight sees Head/specialists `gpt-6-astra` / `xhigh` and Critic Claude Code Opus 5.5 / Medium, the settings revision is idempotent without touching accepted runs, and the installed Claude Code package matches the lockfile pin `2.1.280` and passes the exact `claude-opus-5-5` model ID for a bounded allowed turn; the only materialized `auth.json` exists in its removed-after-use private app-server home. Re-check scope and evidence before any reset. After an authorized cutover, inspect the live artifact, sign-in, actual provider tuples, research, voice, restart recovery and protected logs; rollback on required-gate failure. Feed observed incidents and task findings to the owning PRD/architecture/QA documents.

**Acceptance:** Release can be claimed only when required actual results pass, the scoped target/rollback evidence exists and representative-user tasks are observed. A build, health endpoint, pushed repository or owner design acceptance cannot replace release evidence. No other GoDaddy app, table, domain, shared credential or data is changed.

**Verification:** QA-R01–QA-R60, QA-S01–QA-S09, QA-H01–QA-H10, QA-U01–QA-U04; all six DoD gates. Tests remain not_run. Evidence lives under `forge/runs/U-08/{run_id}/` and records actual revision, sources, executor, time and scope.

**Risk/stop condition:** Unknown database ownership or host behavior blocks destructive cutover. Preserve unrelated resources and stop at the exact unresolved scope rather than widening access.

## Dependency Order

U-01 → U-02 → U-03 → U-04 → U-05/U-06 → U-07 → U-08. U-05 and U-06 are independent after U-04 once their U-01 capability evidence is settled. U-03 may prepare static presentation while U-01 runs, but cannot claim working login/settings before U-02 and verified catalogs. A unit is complete only with its source-bound acceptance evidence; a pending capability blocks the affected seam, not unrelated documentation. No calendar duration is invented before the preflight resolves provider/host limits.

## Cross-layer interfaces

These implementation seams instantiate architecture's existing boundaries, not new product APIs or services. Producers own schemas in `src/server/contracts/`; consumers use the same schema version. Route spelling and internal filenames may be resolved during U-02 without changing product meaning. Unknown fields and immutable field overrides fail validation. Incompatible contract changes require affected producer/consumer reconciliation before merge; never silently discard accepted data.

| Interface / producer → consumer | Contract and compatibility | Integration evidence |
|---|---|---|
| C-01 owner session, U-02 → U-03–U-08 | Owner-only principal, consent scope, server-issued absolute expiry and revocation; cookies never expose provider grants. All private HTTP/upload/export/run operations use the same authorization seam. | QA-R01–QA-R02, QA-R43–QA-R45, QA-R48, QA-R55; real denied reads/writes and 24-hour boundary. |
| C-02 preferences/catalog, U-03 → U-04 | Revisioned provider/model/reasoning, specialist-count and discussion-depth tuple, selected message-sound preference, compatible catalog choices including optional GPT-6 Sol in either Codex branch, saved runtime-instructions Markdown/revision and preference version. The fresh/pre-Opus preference transition and previous-revision Opus 5.5 / Low-only effort correction preserve unrelated values and later saves; U-04 copies an immutable snapshot on acceptance and never re-normalizes it. Auto runtime decisions are recorded with that snapshot. Real quota/reset or unavailable, categorized selected-provider authorization failure. | FR-05.1–FR-05.6 exact QA mappings below; migrate fresh/pre-Opus/previous/current rows, save while active, restart, and compare next/current run. |
| C-03 canonical work/events, U-04 → U-03/U-05/U-07 | Conversation/run IDs, client request ID, ordered event cursor, committed step, generation/lease, complete role/recipient/body/time and snapshot; transactional acceptance/step commits. U-03 renders an allowed Markdown subset through DOM nodes and never executes raw event markup. Same cursor semantics for SSE or polling. | QA-R03, QA-R11–QA-R16, QA-R36–QA-R39, QA-R47, QA-R59; restart/Stop/replay races. |
| C-04 role execution, U-04 → U-05 provider operations | Separate permitted role context and assignment, exact tuple, immutable validated runtime-instructions document/revision, scoped operation/tool permissions, English/Ukrainian output policy, one code-owned replacement after a policy-rejected draft, bounded cancellation and categorized failure. Research does not acquire general shell/filesystem/computer permissions. | QA-R05–QA-R10, QA-R12, QA-R17–QA-R19, QA-R51; compare to exact clause mapping below. |
| C-05 evidence, U-05 → U-04/U-03/U-07 | Conversation-bound direct URL/title/claim/retrieval/publication/limitations; source text is data. Accept English/Ukrainian evidence only and reject Russian/Belarusian metadata or `.ru`/`.by`/`.su`/Cyrillic-equivalent hosts before it reaches a conversation. No citation is promoted without actual source evidence. | QA-R17–QA-R19, QA-R49, QA-R54, QA-S06, QA-U02. |
| C-06 inputs, U-06 → U-04/U-03/U-07 | Owned, bounded JPEG/PNG/WebP attachment references and an editable unsent browser-recognized transcript; NanoDuck receives no audio. Explicit Send alone creates an accepted event. | FR-02.2/FR-07.1–FR-07.5 exact QA mappings below, QA-R50, QA-R55, QA-U01. |
| C-07 records/restore, U-07 → U-03/U-08 | Complete confirmed record and safe export; owner-scoped delete plus durable deletion decision; isolated restore applies tombstones before records become readable. | FR-06.1–FR-06.3 exact QA mappings below, QA-R52, QA-R56, QA-U04. |
| C-08 delivery/evidence, U-08 consumes all units | Exact production revision/config/dependency inventory, only named app + proven-owned database, actual gate evidence, rollback and post-deploy observations. | QA-R57–QA-R59 and all six gates; no health-only release claim. |

## Clause coverage

One primary implementation owner is assigned per distinct clause. Shared controls from U-02 and integrated verification by U-08 also apply; local consumers test enforcement at their own seam. This table is the authoritative unit-to-clause/QA allocation; no ordinal inference is allowed. Every row is an implementation obligation, not an executed result.

| PRD clause | Primary unit | Exact canonical QA IDs |
|---|---|---|
| FR-01.1 | U-02 | QA-R01 |
| FR-01.2 | U-02 | QA-R02 |
| FR-02.1 | U-04 | QA-R03 |
| FR-02.2 | U-06 | QA-R04 |
| FR-02.3 | U-04 | QA-R05 |
| FR-02.4 | U-04 | QA-R06 |
| FR-02.5 | U-04 | QA-R07 |
| FR-02.6 | U-04 | QA-R08 |
| FR-02.7 | U-04 | QA-R09 |
| FR-02.8 | U-04 | QA-R10 |
| FR-03.1 | U-04 | QA-R11 |
| FR-03.2 | U-04 | QA-R12 |
| FR-03.3 | U-04 | QA-R13 |
| FR-03.4 | U-04 | QA-R14 |
| FR-03.5 | U-04 | QA-R15 |
| FR-03.6 | U-04 | QA-R16 |
| FR-04.1 | U-05 | QA-R17 |
| FR-04.2 | U-05 | QA-R18 |
| FR-04.3 | U-05 | QA-R19 |
| FR-05.1 | U-03 | QA-R20 |
| FR-05.2 | U-03 | QA-R21 |
| FR-05.3 | U-03 | QA-R22 |
| FR-05.4 | U-03 | QA-R23 |
| FR-05.5 | U-03 | QA-R24 |
| FR-05.6 | U-03 | QA-R60 |
| FR-06.1 | U-07 | QA-R25 |
| FR-06.2 | U-07 | QA-R26 |
| FR-06.3 | U-07 | QA-R27 |
| FR-07.1 | U-06 | QA-R28 |
| FR-07.2 | U-06 | QA-R29 |
| FR-07.3 | U-06 | QA-R30 |
| FR-07.4 | U-06 | QA-R31 |
| FR-07.5 | U-06 | QA-R32 |
| FR-08.1 | U-03 | QA-R33 |
| FR-08.2 | U-03 | QA-R34 |
| FR-08.3 | U-03 | QA-R35 |
| NFR-01.1 | U-04 | QA-R36 |
| NFR-01.2 | U-04 | QA-R37 |
| NFR-01.3 | U-04 | QA-R38 |
| NFR-01.4 | U-04 | QA-R39 |
| NFR-02.1 | U-03 | QA-R40 |
| NFR-02.2 | U-03 | QA-R41 |
| NFR-02.3 | U-03 | QA-R42 |
| NFR-10.1 | U-02 | QA-R43 |
| NFR-10.2 | U-02 | QA-R44 |
| NFR-10.3 | U-02 | QA-R45 |
| NFR-11.1 | U-02 | QA-R46 |
| NFR-11.2 | U-04 | QA-R47 |
| NFR-11.3 | U-02 | QA-R48 |
| NFR-12.1 | U-05 | QA-R49 |
| NFR-12.2 | U-06 | QA-R50 |
| NFR-12.3 | U-05 | QA-R51 |
| NFR-13.1 | U-02 | QA-R52 |
| NFR-13.2 | U-02 | QA-R53 |
| NFR-14.1 | U-05 | QA-R54 |
| NFR-14.2 | U-06 | QA-R55 |
| NFR-14.3 | U-07 | QA-R56 |
| NFR-15.1 | U-08 | QA-R57 |
| NFR-16.1 | U-02 | QA-R58 |
| NFR-16.2 | U-04 | QA-R59 |

## Surface and state coverage

U-03 owns the approved presentation for every row; the runtime owner below connects the actual behavior. U-08 verifies the integrated result. IDs refer to the complete states and transitions in the screen map/wireframes; no state is excluded.

| Surface | State IDs | Runtime unit(s) | QA / journey / use case |
|---|---|---|---|
| S-01 | ST-01, ST-02, ST-03, ST-04 | U-02 | QA-S01; J-01; UC-001 |
| S-02 | ST-05, ST-06, ST-07, ST-08, ST-09, ST-10, ST-11, ST-12, ST-13, ST-14, ST-15, ST-16, ST-17 | U-04, U-05, U-06 | QA-S02; J-02/J-03/J-05; UC-002/UC-003 |
| S-03 | ST-18, ST-19, ST-20 | U-07 | QA-S03; J-06; UC-004 |
| S-04 | ST-21, ST-22, ST-23, ST-24, ST-25 | U-03, U-02 | QA-S04; J-07; UC-005 |
| S-05 | ST-26, ST-27, ST-28, ST-29, ST-30, ST-31, ST-32, ST-33 | U-06 | QA-S05; J-02; UC-006 |
| S-06 | ST-34, ST-35, ST-36 | U-05, U-07 | QA-S06; J-04/J-06; UC-007/UC-004 |
| S-07 | ST-37, ST-38 | U-04, U-07 | QA-S07; J-06; UC-002/UC-004 |
| S-08 | ST-39, ST-40, ST-41, ST-42 | U-07 | QA-S08; J-06; UC-004 |
| S-09 | ST-43, ST-44 | U-03 | QA-S09; J-01/J-05/J-07; UC-001/UC-003/UC-005 |

## Prototype Promotion Plan

Only U-03 reuses presentation files from candidate `a`, `v8`, root `forge/design/candidates/a/v8`, tree `1de020dcfe48f3feb80db0e58ba911b821825b48730d32c72d9518ad512eb0d9`, algorithm `sdd-tree-sha256-v1`, no external render dependencies. Baseline and target hash are the Shared visual contract above. Production base commit: `f99744d603b4e27cb7e89eccde2f12b9652e8a01`; this full commit precedes the documentation-only approval/plan commit. The Phase 3 runner must preserve and verify ancestry, frozen bytes and empty destinations before promotion. A changed destination/base requires a source-bound plan amendment, not fabricated history.

| Frozen source path | Production destination | Strategy |
|---|---|---|
| forge/design/candidates/a/v8/index.html | public/index.html | adapt |
| forge/design/candidates/a/v8/styles.css | public/styles.css | adapt |
| forge/design/candidates/a/v8/app.js | src/client/app.js | reimplement |
| forge/design/candidates/a/v8/nanoduck.svg | public/nanoduck.svg | copy |
| forge/design/candidates/a/v8/nanoduck-original.svg | public/nanoduck-original.svg | copy |

Adapt only within the visual variance above: remove candidate/inspection/version code and fictional data; wire real modules and state semantics; preserve approved CSS/geometry/tokens and exact copied SVG bytes. Reimplement the mock handlers with real authorization-aware endpoints and a durable stream consumer. No other prototype path is authorized for promotion by this map. Missing capabilities are all U-02–U-07 backend, consent/session, persistence, encryption/authorization, actual agents/research, voice/upload processing, real catalog/usage and export/deletion/restore behavior. The prototype supplies none of those capabilities.

Required future receipt: `forge/runs/U-03/{run_id}/prototype-promotion.json`. Only the separately authorized Phase 3 runner derives the actual Git diff and receipt, with all five expanded mappings and source/destination hashes, base/head commits, changed paths, patch hash, adaptation/variance list, baseline/plan hash, actual QA IDs, visual evidence and verification status. Required QA: QA-R33–QA-R35, QA-R40–QA-R42, QA-S01–QA-S09, QA-H01–QA-H10 and affected QA-U01–QA-U04. No receipt exists or is fabricated in this planning phase. A destination without the required matching receipt after promotion begins blocks fidelity acceptance.

## Verification Plan

All 83 formal checks remain **prepared / not_run**; six gates remain unevaluated. Run exact acceptance clauses from the QA checklist and AC-001–AC-010, then collect the additional visual, heuristic and representative-owner evidence. Preserve positive and negative security paths for all 17 security clauses in the Clause coverage table. Dependency maintenance, operational diagnosis, deletion propagation and isolated recovery belong to U-01/U-07/U-08 as allocated; they are not a separate service or optional checklist.

Unit evidence must distinguish local fixtures, actual provider results and live host results. Keep credentials, account identifiers and private business content out of public receipts; no NanoDuck audio artifact exists to retain. Use fictional/minimized fixtures with protected detailed logs when necessary. Record check, gate, revision, baseline/target/tree, source hashes, executor/time, route/state/device/viewport, expected/observed outcome and evidence hash, with classified findings. Use PRD severity/release-effect definitions exactly. Missing representative-user or assistive-technology evidence stays missing; a design approval is not that evidence.

Required gates: `product_functional_requirements`, `product_security_requirements`, `approved_visual_baseline_fidelity`, `heuristic_usability_review`, `representative_user_task_validation`, `lifecycle_and_continuity`. Run targeted checks per unit, then integrated cross-boundary checks and actual U-08 release evidence. Re-run only affected checks when source/runtime/baseline changes or findings justify it. `npm run check` remains an artifact/link/JavaScript syntax check and cannot pass production gates.

## Out Of Scope

This document authorizes deployment only to Personal AI Consulting Group (`wy2v0putg6`) and its verified application data; it does not authorize provider credential transfer, publication, database reset or any promotion outside that target. The product excludes messengers, public/multiuser SaaS, payments, extra hosts, paid fallback, automatic external business actions, required notifications, native apps, PDF/SVG/video/audio/archive uploads and arbitrary uploads. Unchosen palette alternatives are historical design references. Do not alter any unrelated GoDaddy resource. Any database reset remains conditional on proven exclusive ownership and recovery/cutover evidence.

## Open Questions

No further aesthetic or product-intent choice is needed to continue this plan. U-01 owns unresolved live Opus 5.5 entitlement/execution and installed CLI/exact-model evidence, mobile Safari/Android Chrome recognition evidence, host lifecycle/streaming/storage and configuration/security parameters described in architecture. The product owner resolves any material change of behavior, provider, budget or hosting scope; the implementation operator returns ordinary evidenced mechanism choices to architecture, then revalidates affected downstream artifacts. U-08 requires actual operational ownership, representative-owner availability and exact database/table identity before release. These questions do not make unrun checks pass and cannot be silently waived.

## Handoff and implementation boundary

The approved design, reconciled architecture/DoD/QA and this plan govern the authorized Phase 3 implementation and scoped source cutover. Orchestrator state: `implementation-in-progress`. The gate binds this plan's current hash and `nanoduck-electric-a-v8-20260914`; it does not expand the named GoDaddy boundary or replace production-provider, hosted-data and release evidence. The next release decision requires completed QA and operational evidence.
