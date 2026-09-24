# Product requirements

25 September 2026 · Revision 11 · Authority: current [product-idea.md](product-idea.md) · Working language: English

## Product identity

Use **NanoDuck Consulting Group** as the app name, following the product idea. The SVG brand mark and palette belong to the design brief. Product behavior, IDs and security obligations are unchanged; the named GoDaddy deployment target keeps its existing name.

## Problem Statement

The single owner needs useful advice, real expert challenge and an inspectable record on phone or desktop. The application should provide substantive agent exchanges, persistent preferences and a clear interface that reduces the effort of reaching a decision; this specification does not claim to identify every production incident cause.

## Solution and Product Boundary

The browser is the sole supported user interface.

Sign in with the existing Google owner identity; describe or dictate a question; follow separate consultants and Critic; inspect fresh sources; stop, continue, export or revisit the record. Normal use begins with owner sign-in and requires no routine integration setup. The public repository contains source and fictional design data; deployed account content stays private.

Phase 3 implementation is authorized in this repository, with Codex as executor. Deployment, GoDaddy changes and database deletion remain outside that authorization. The owner accepted Electric A v8 after the three-direction and three-palette comparisons. The use cases below define the intended product; local implementation and tests do not prove production provider operation, deployment or data migration.

Actors are the existing owner, separately invoked AI roles, Google, selected subscription providers and public research services. There are no public registrants, tenants or billing customers. Each use case records its trust and permission boundaries; shared controls are defined once under Security Requirements.

## Use Cases

### UC-001 — Sign in and return
Jobs: JOB-003. Actors: Owner; Google identity provider; application.
Trigger: Open the app or return after session expiry. Goal: Reach private work with the existing owner identity.
Preconditions: Owner identity is provisioned; ordinary AI-processing consent has not been assumed.
Success path: 1. Owner chooses the visible Login button on the desktop/mobile menu bar or Google sign-in on the entry screen. 2. System validates the response and owner identity. 3. First use presents concise AI-processing consent; returning use restores the latest record or a new consultation. 4. The authenticated menu shows Logoff, including while first-use consent is pending; it ends the app session and returns to sign-in, where Login is shown again.
Alternates/recovery: Cancel or denied identity exposes no private record. Expiry asks for sign-in without mislabelling provider authorization. A failed callback does not establish a session. Normal returning use, including inactivity and browser reopening, stays signed in for 24 hours after successful sign-in; sign-out, revocation and security invalidation remain immediate exceptions.
Postconditions: Only the authorized owner has a session; accepted history survives sign-out.
Authority/privacy: Authentication assertions are untrusted until validated; provider grants remain server-side. No public registration or extra app MFA.
Obligations and acceptance: FR-01.1, FR-01.2, NFR-10.1–NFR-10.3; AC-001

### UC-002 — Consult and decide
Jobs: JOB-001. Actors: Owner; Head; selected specialists; Critic; selected model providers.
Trigger: Owner submits a question. Goal: Receive an evidence-aware decision or an explicitly unresolved issue.
Preconditions: Signed in; ordinary AI processing consent established; selected settings available; no second active consultation.
Success path: 1. Owner submits text with optional supported attachments. 2. System confirms accepted work. 3. Head reads the exact accepted owner context once, records deliverables, creates or reuses the bounded specialist team and commits concise tasks and dependencies. 4. Independent ready specialists run concurrently and their successful results commit as they arrive. 5. Critic assesses current team results for the selected review depth, issues referenced correction orders only where material, and explicitly assesses targeted responses. 6. Head delivers Consolidated advice covering all requested outputs, reviewed results and evidence gaps, provisional when unresolved.
Alternates/recovery: A missing material fact gets one bounded question or an explicit assumption. Provider/research failure preserves confirmed work. Sound advice may receive agreement without a manufactured challenge; unresolved disagreement stays provisional.
Postconditions: Full confirmed discussion and conclusion are saved; no external business action is taken automatically.
Authority/privacy: Only selected providers receive permitted content; AI roles never imply human employment. Sensitive transfers and consequential external actions require specific permission.
Obligations and acceptance: FR-02.1–FR-02.15, FR-03.1, FR-03.2, NFR-12.1–NFR-12.3; AC-002, AC-003

### UC-003 — Steer, stop and continue
Jobs: JOB-002. Actors: Owner; active consultation; providers.
Trigger: Owner adds context, stops work, returns after interruption, or requests continuation. Goal: Control useful work without losing or duplicating the record.
Preconditions: Signed in with a current consultation; accepted and draft content are distinguishable.
Success path: 1. Owner reads complete ordered contributions. 2. Owner adds context or selects Stop. 3. System preserves accepted messages and rejects late visible results from stopped work. 4. Owner chooses Continue or New consultation; the single-active-run rule is enforced.
Alternates/recovery: Offline/restart resumes from the saved position. Stalled work gets an honest compact status. A retry cannot insert another copy of an already confirmed response; continuation never silently exceeds the boundary.
Postconditions: Accepted history remains canonical; at most one consultation is active.
Authority/privacy: Browser commands are authenticated requests, not authority to rewrite past agent messages or active settings.
Obligations and acceptance: FR-03.3–FR-03.6, NFR-01.1–NFR-01.4, NFR-11.2; AC-004

### UC-004 — Inspect and control the record
Jobs: JOB-004. Actors: Owner; private record store.
Trigger: Owner opens history, a source, export or whole-conversation deletion. Goal: Recover complete evidence and control the saved record.
Preconditions: Signed in; a saved consultation exists.
Success path: 1. Owner opens a conversation. 2. System returns its complete confirmed messages, attachments and sources. 3. Owner downloads the conversation as a formatted RTF document or explicitly confirms its deletion. 4. System reports the actual outcome.
Alternates/recovery: Missing/denied identifiers return no protected data. Cancel deletion preserves everything. Failed export/deletion retains truthful recoverable state; retries do not corrupt another conversation.
Postconditions: Export contains the selected record; confirmed deletion removes that conversation and its owned attachments under the deletion policy.
Authority/privacy: Private data never enters the public repository. A guessed resource ID or client-edited field grants no access.
Obligations and acceptance: FR-06.1–FR-06.3, NFR-10.3, NFR-14.1–NFR-14.3; AC-005

### UC-005 — Set preferences and understand limits
Jobs: JOB-003, JOB-005. Actors: Owner; supported model catalog; selected provider.
Trigger: Owner opens Settings or a provider condition pauses work. Goal: Choose model/reasoning deliberately and understand the next available action.
Preconditions: Signed in; saved selections and available catalog evidence are identified.
Success path: 1. Owner opens Settings and sees current controls after an app update. 2. Owner changes Head/specialist model and reasoning, Critic provider/model/reasoning, specialist count, discussion depth or incoming-message sound, or reviews and edits the validated runtime-instructions Markdown document. 3. System validates the combination/document and saves it for future runs, showing the active document revision; a direct sound preview remains optional. 4. Usage shows known remaining/reset facts; an actual selected-provider grant failure offers contextual reauthorization.
Alternates/recovery: A returning browser must not require a manual cache clear to reveal current settings. Unsupported combinations fail visibly without substitution. Unknown usage is labelled unavailable. Quota, outage, app-session expiry and provider authorization remain distinct; inactive Claude causes no warning. Revocation/sign-out ends the selected app sessions.
Postconditions: Preferences persist across devices; active work retains its exact earlier snapshot.
Authority/privacy: Provider credentials cannot be displayed or edited through general preference fields; revoking sessions requires renewed identity verification.
Obligations and acceptance: FR-05.1–FR-05.6, NFR-10.2, NFR-11.1; AC-006

### UC-006 — Dictate and review
Jobs: JOB-006. Actors: Owner; browser-native speech-recognition service.
Trigger: Owner explicitly chooses voice input. Goal: Convert a thought into an editable, deliberately sent message.
Preconditions: Signed in; a draft may already exist; browser recognition has not started.
Success path: 1. Owner explicitly starts browser recognition and grants browser permission if required. 2. System clearly indicates active recognition and discloses that the browser recognition service may process speech. 3. Owner stops recognition. 4. The browser returns an editable transcript. 5. Owner reviews/edits and explicitly sends or cancels.
Alternates/recovery: Permission denial, unavailable browser support or service, unsupported language, network failure and interruption preserve the typed draft and offer retry or typing. Cancel aborts recognition. A background transition ends recognition; no silent background recognition occurs.
Postconditions: Only the reviewed text explicitly sent by the owner becomes accepted conversation input.
Authority/privacy: Browser recognition is an external trust boundary and is disclosed at the point of use. NanoDuck receives only text the owner chooses to insert and later send; it does not receive, store or transcribe audio.
Obligations and acceptance: FR-07.1–FR-07.5, NFR-12.2, NFR-14.2; AC-007

### UC-007 — Research and evaluate a claim
Jobs: JOB-001, JOB-002. Actors: Owner; consultants; Critic; public search/retrieval provider.
Trigger: A current claim, referenced resource or material uncertainty needs evidence. Goal: Use fresh evidence that can change the decision.
Preconditions: Consultation has an identified question; no special research keyword is required.
Success path: 1. A consultant or Critic identifies a current claim or evidence gap. 2. Head forms a minimal public query without web access; the application validates that outgoing query. 3. Only the safe query and public instructions enter the restricted web-enabled step. 4. System saves every valid direct source and freshness record; consultants relate evidence to claims, and Critic may prompt isolated follow-up research. 5. Owner inspects direct sources or sees the explicit research limitation.
Alternates/recovery: Unavailable or conflicting sources are reported; cached knowledge is not a fresh check. A page requesting secrets or new actions cannot authorize either. Private context requires specific authorization before search transfer.
Postconditions: Supported claims have inspectable evidence; unsupported claims remain qualified.
Authority/privacy: Retrieved content is evidence, never instructions. A tool-free Claude Critic receives team research without a provider switch.
Obligations and acceptance: FR-04.1–FR-04.3, NFR-12.1, NFR-12.3; AC-008

## Functional and Nonfunctional Requirements

### Access

| ID | Observable obligation | Use cases |
|---|---|---|
| FR-01.1 | Existing Google owner sign-in is the sole app-entry path; a returning owner reaches work without a connection checklist and remains signed in for the 24-hour lifetime in NFR-10.2. | UC-001 |
| FR-01.2 | Initial ordinary AI-processing consent is concise, explicit and reused until its scope changes. | UC-001 |

### Useful consultation

| ID | Observable obligation | Use cases |
|---|---|---|
| FR-02.1 | Text submission receives a distinguishable accepted state; an unsent draft never appears accepted. In the chat composer, Enter submits and Shift+Enter creates a line break. | UC-002 |
| FR-02.2 | The authenticated owner can attach a JPEG, PNG or WebP image of at most 8 MiB. PDF, SVG, video, archives and every other file type are rejected. | UC-002 |
| FR-02.3 | Every accepted question uses the owner-selected specialist count: 1, 2, 3, 5, or a 1–5 count chosen by Head in Auto; Head and Critic are excluded from the count. Head chooses reusable, adapted or new task-specific roles under FR-02.9. Predefined names are not an allowlist. Retain substantive prohibitions on esoteric practice and clinical/emergency misrepresentation; role names cannot bypass them. Spiritual Consultant retains its evangelical Protestant doctrine and Psychotherapist its non-clinical boundary. | UC-002 |
| FR-02.4 | Head, consultants and Critic are separate actual model invocations using accepted settings and instruction snapshots. Head authors tasks and dependencies; the application executes them under FR-02.9–FR-02.14. Each receives complete owner context once and its necessary work context. No single completion impersonates the team, no generic task fallback or wording rejection is permitted, and no direct Head-only answer bypasses specialist and Critic review. | UC-002 |
| FR-02.5 | Critic can directly order a consultant to stop circular, evasive, fabricated or unsupported work and make a specific correction. Consultants must respond substantively or provide a supported objection or evidence gap. The persisted fulfillment and escalation contract is FR-02.13; reply arrival alone is not compliance. | UC-002 |
| FR-02.6 | Consensus is stated only when Head, participating specialists and Critic support the same adequately grounded recommendation and every requested output has been checked. Otherwise Head marks the conclusion provisional and names unresolved issues and evidence gaps. | UC-002 |
| FR-02.7 | Head labels its final message Consolidated advice and synthesizes current reviewed specialist results and Critic assessments, including unresolved orders without inventing new evidence. It includes a self-contained recommendation or explicitly provisional uncertainty, every distinct owner-requested deliverable, direct supporting source links where available, an explicit list of missing outputs, actions sufficient for the actual request, the main risk and a revisit condition. An arbitrary answer-length or three-action limit cannot omit requested material. Outcome must not present a Head assignment or a previous question's conclusion as the current answer. | UC-002 |
| FR-02.8 | The optional focused interview asks one question at a time, usually 1–3 and at most five, with a suggested answer or explicit assumption available. | UC-002 |
| FR-02.9 | Head may reuse, adapt or create a task-specific specialist within the selected team count. The reusable role library is guidance, not an allowlist. Head receives a compact role index and only needed detailed entries; each consultant receives only its own role guidance. New role guidance remains private to the consultation and is not automatically added to the library. Role creation never grants additional tools, provider choices or permissions. | UC-002 |
| FR-02.10 | One Head planning invocation can produce separately addressed individual assignments and explicit dependencies. Each assignment is concise, task-specific Head-authored text delivered verbatim, without retelling the complete owner request, generic application replacement, arbitrary word limits or wording-based rejection. Show each assignment separately in chat; hide internal role instructions and routing metadata. | UC-002 |
| FR-02.11 | Execute independent ready assignments concurrently and publish and save each successful result when it arrives. Only Head declares substantive dependencies or changes work; the application schedules and protects execution. A delayed or failed consultant cannot conceal completed work from another. Provider-required queuing is reported truthfully and never causes a silent model or effort change. | UC-002 |
| FR-02.12 | The chat is the canonical record: preserve exact owner messages, corrections, ordering and attachment references. Every participant receives the complete ordered user request through its accepted message boundary exactly once, plus its own role, task and necessary evidence or dependencies. Critic receives all current team results and assignments; Head receives reviewed current results and unresolved findings. Do not indiscriminately resend technical events, unrelated role guidance or obsolete drafts. Context selection uses explicit assignment and result references, not keyword-based omission or lossy replacement of owner text. | UC-002 |
| FR-02.13 | Persist every material Critic stop-and-rework order with its recipient, defective result, exact issue and required correction. A consultant must correct it, give a specific evidence-based objection or identify unavailable evidence. A submitted reply alone cannot resolve the order: Critic assesses the referenced response and records whether corrected, objection upheld, still unresolved or blocked by evidence. Repetitive replies remain unresolved and are escalated to Head; no hidden retries or automatic pass. | UC-002 |
| FR-02.14 | Critic reviews the team together in each user-selected review round; only affected consultants must answer specific findings. Fixed 1, 3 or 5 depth completes the selected number of substantive team assessments unless stopped or failed; Auto lets Head close when useful, up to ten rounds. No forced objection, ceremonial consultant reply or automatic closing speech. A final-round correction receives a focused Critic resolution assessment before synthesis; it does not authorize another full round or endless rework. Remaining unresolved findings must be carried into provisional advice. | UC-002 |
| FR-02.15 | Measure efficiency using comparable synthetic cases, the same accepted settings and depth, complete deliverable coverage and reported input, output, cached and reasoning token categories where available. Record model-call counts and context bytes when token metrics are unavailable, without calling bytes tokens or API cache discounts subscription savings. No optimization may silently shorten owner context, drop material evidence or reduce chosen depth. | UC-002 |

### Discussion and control

| ID | Observable obligation | Use cases |
|---|---|---|
| FR-03.1 | Full submitted business messages appear in canonical order with role, recipient where relevant and time; routine protocol paragraphs are omitted. While a run is active, the discussion shows a textual thought-bubble state and reachable Stop control. New agent messages receive a polite semantic announcement and may play the owner's selected sound; visual feedback remains when sound is off or unavailable. The discussion has no in-progress title; after the completed final synthesis, the saved record receives a concise deterministic title from the owner decision question. | UC-002 |
| FR-03.2 | Owner input and source metadata reject distinctive Russian/Belarusian language, terminology and prohibited URLs at their own boundaries; shared Ukrainian words and English descriptors such as Russian or Belarusian remain valid. For generated prose, remove an entire prohibited sentence or unsuitable Markdown/raw URL before persistence, show a neutral omission marker and retain substantive English/Ukrainian remainder. Omission markers alone are not a contribution: retry the same role/task once. After a second unusable output, save a truthful System notice and offer Retry at the missing step. Tool invocation/transcript material is rejected with its bounded text-only retry. Rejected drafts and System notices never become business context; logs contain only policy reason, output kind and omission count. | UC-002 |
| FR-03.3 | Owner context added during work is accepted into the same consultation without rewriting prior messages. | UC-003 |
| FR-03.4 | Stop remains reachable during active work and prevents late work from becoming a newly visible result. | UC-003 |
| FR-03.5 | Continue resumes stopped work; Retry retries failed or missing assignments and assessments without repeating successful results. Preserve accepted settings and instructions, message boundaries, exact assignments, directive states and append-only confirmed messages. Dependency and review readiness, not message position alone, determine what can run. Old records remain readable and existing accepted runs retain their contract version. | UC-003 |
| FR-03.6 | New consultation creates a separate record while enforcing only one active consultation. New is available above the chat and in Conversations, and is absent from global desktop/mobile navigation. | UC-003 |

### Research

| ID | Observable obligation | Use cases |
|---|---|---|
| FR-04.1 | When current claims, requested sources or a Critic evidence gap require public facts, Head forms a minimal public query in a non-web step. The application validates the actual outgoing query for private contacts, credentials and unsafe destinations, then sends only the safe query with public instructions to the web-enabled step; a private phone elsewhere in the owner conversation does not block safe research. Failed or withheld research is an explicit evidence limitation. | UC-007 |
| FR-04.2 | Every valid cited source remains inspectable with title, direct public HTTPS URL, supported claim, retrieval time and publication date when available; no arbitrary eight-source cap applies. Source metadata is validated independently of generated prose and excludes prohibited language, terminology and hosts including `.ru`, `.by`, `.su` and Cyrillic equivalents. An unsuitable prose URL is omitted and never promoted to a source. | UC-007 |
| FR-04.3 | Claude Critic can evaluate targeted evidence already committed by the existing Codex research capability without silently changing the selected provider. It has no direct browsing or tool authority. | UC-007 |

### Settings and limits

| ID | Observable obligation | Use cases |
|---|---|---|
| FR-05.1 | Settings exposes functioning model and reasoning selectors separately for Head/specialists and Critic, including the visible Critic Claude Code provider, using only current supported choices. Its Opus 5.5 Critic effort choices are Medium (default), High, Extra and Max; Low is excluded. GPT-6 Sol (`gpt-6-sol`) is an additional choice in both Codex model selectors with only catalog-supported reasoning efforts; adding it does not change current selections. After an app update, a returning browser receives current Settings controls without manual cache clearing. | UC-005 |
| FR-05.2 | Saved changes apply to future runs; each active run retains the exact provider/model/reasoning, specialist-count, discussion-depth and validated runtime-instructions Markdown/revision snapshot used at acceptance. An older saved Opus 5.5 / Low choice, active or inactive, advances once to Medium when Low is removed; preserve all other supported owner choices and accepted snapshots. | UC-005 |
| FR-05.3 | Settings provides specialist count 1/2/3/5/Auto and discussion depth 1/3/5/Auto. Count excludes Head and Critic. Fixed depth selects the number of team review rounds; Auto permits Head-directed closure within ten. FR-02.14 governs targeted replies and final-round assessment without mandatory closing speeches. Accepted runs retain their selected depth and contract version. Settings retains Knock, Chime, Ripple and Off with direct owner-activated Preview. Local browser WAV playback never requests notification permission and has a visual equivalent. Provider waiting budgets remain separate: Codex renews its 540,000 ms inactivity budget only on real matching-turn progress and has a 1,800,000 ms absolute ceiling; Claude retains its 540,000 ms absolute deadline. Timeout feedback identifies the cause, preserves confirmed work and points to Retry. | UC-005 |
| FR-05.4 | Usage presents real known quota/reset information or explicitly unavailable information; it never invents a per-session charge. | UC-005 |
| FR-05.5 | Only a genuine authorization failure for the selected provider offers contextual reauthorization; quota and outage show their actual next action. | UC-005 |
| FR-05.6 | Settings shows the complete current runtime-instructions Markdown document encrypted in the app database and metadata for its encrypted saved versions. A fresh database receives its initial validated document only through a one-time deployment-secret bootstrap; no repository document is an active private instruction source. Each owner edit validates required headings/placeholders and a current revision, creating a new future-run version; restore creates a fresh current revision. Exact former public defaults, including Head-task, output-length and Critic challenge/final-review text, migrate to new defaults in saved documents and legacy run snapshots without replacing owner edits or prior versions. Editable instructions never weaken server authorization, role topology, resource ceilings or language/source validation. | UC-005 |

### History

| ID | Observable obligation | Use cases |
|---|---|---|
| FR-06.1 | Clicking or keyboard-activating a saved conversation row reopens its complete confirmed conversation content, owned attachments and source records. A same-tab browser refresh restores the authenticated owner to the active surface and reading position; when Discussion had an open record, it reopens that record and selected local tab. The short-lived tab state contains no draft or conversation content and is cleared at Logoff. Export and Delete remain separate row actions. | UC-004 |
| FR-06.2 | Export downloads the selected complete confirmed discussion as an RTF attachment: conversation title, bold speaker/recipient names, date/time stamps in the browser time zone (explicit UTC if absent), paragraphs, supported emphasis/lists/headings and source references. Unicode English/Ukrainian text is preserved; valid emphasis appears formatted instead of raw Markdown markers. Include saved image references; image binaries remain available separately in the conversation. Exclude unsent drafts, credentials, runtime instructions and hidden run metadata. | UC-004 |
| FR-06.3 | Explicit whole-conversation deletion removes its record and owned attachments; cancellation leaves them unchanged. | UC-004 |

### Voice

| ID | Observable obligation | Use cases |
|---|---|---|
| FR-07.1 | Browser speech recognition begins only after explicit Start and required browser permission; active recognition is visibly indicated and identifies the browser recognition-service boundary. | UC-006 |
| FR-07.2 | Stop ends recognition and exposes editable text; Cancel aborts recognition. NanoDuck does not receive temporary audio. | UC-006 |
| FR-07.3 | The owner receives an editable transcript before any send, with no automatic submission. | UC-006 |
| FR-07.4 | Permission, unavailable browser/service, language, network and interruption failures preserve the typed draft and offer retry or typing. | UC-006 |
| FR-07.5 | Background recognition is prevented and the browser recognition session is stopped or aborted when it ends. | UC-006 |

### Required design behavior

| ID | Observable obligation | Use cases |
|---|---|---|
| FR-08.1 | Desktop navigation is a standard floating bar available while scrolling; mobile navigation uses a labelled hamburger menu. Both expose Discussion, Conversations and Settings. The bar also keeps one directly visible session button: Login when signed out, Logoff when authenticated. At mobile widths it stays beside the hamburger trigger and is never hidden inside the collapsed menu. The action is unavailable while session state or its request is pending. Failed authentication actions show retry feedback without falsely changing the session label; New remains a contextual action. | UC-001, UC-003, UC-005 |
| FR-08.2 | The preference destination is literally labelled Settings; the rejected slogan and Your space label are removed. | UC-005 |
| FR-08.3 | The initial three distinct full-product candidates establish the comparison. The owner-requested next revision combines Ember black styling, message formatting and local tabs with Cobalt chat/composer layout, an icon-only microphone and clearly visible Send. The three expressive agent-colour palettes have been presented with identical coverage; the owner accepted Electric A v8 for implementation fidelity. Solar and Prismatic remain historical comparison references, not a required app palette selector. Review states is absent from the app and normal preview; inspection remains a separate development surface. | UC-001, UC-002, UC-003, UC-004, UC-005, UC-006, UC-007 |

### Continuity and bounded work

| ID | Observable obligation | Use cases |
|---|---|---|
| NFR-01.1 | An acknowledged message survives browser refresh, network interruption and application restart. A browser refresh remains in the same tab and restores the authenticated owner’s surface, open record where applicable and reading position without persisting draft text or conversation content. | UC-003 |
| NFR-01.2 | Reconnect/retry cannot duplicate a confirmed reply or allow concurrent runs to corrupt the canonical record. | UC-003 |
| NFR-01.3 | Enforce the accepted user-selected depth under FR-02.14: exactly 1, 3 or 5 team assessments on successful fixed-depth runs, or Head-directed Auto closure up to ten. Stop or failure can interrupt, never silently mark unperformed rounds complete. Resolution assessments do not add full rounds or trigger unbounded inference. Preserve confirmed work across Stop, Continue, provider failure and restart without duplicates. Keep finite HTTP, storage and provider resource ceilings with explicit failure rather than silent shortening, and retain the ten-minute continuation target as a recovery target rather than a provider deadline. | UC-003 |
| NFR-01.4 | Measure the existing 5-second acknowledgment, 30-second first useful contribution and 60-second stalled-work visibility targets without presenting filler as useful output. | UC-003 |

### Accessible browser use

| ID | Observable obligation | Use cases |
|---|---|---|
| NFR-02.1 | Core flows meet the WCAG 2.2 AA planning target, including keyboard, visible/unobscured focus, semantic names/states, errors, contrast and relevant assistive technology interactions. | UC-001, UC-002, UC-003, UC-004, UC-005, UC-006, UC-007 |
| NFR-02.2 | Core flows reflow from 320 CSS px without page-level horizontal scroll and remain usable at 200% text size; genuine two-dimensional content retains an accessible way to inspect it. | UC-001, UC-002, UC-003, UC-004, UC-005, UC-006, UC-007 |
| NFR-02.3 | Release evidence covers current Safari, Chrome, Firefox and Edge on relevant mobile/desktop devices; an unavailable microphone has the FR-07.4 fallback. | UC-001, UC-006 |

## Security Requirements

Planning target: **OWASP ASVS 5.0.0 Level 2**. The intended browser/API service has a private account, business/personal conversations, attachments and provider grants. This is requirements assessment, not compliance, certification or a security test. Covered surfaces are browser UI, API, owner Google sign-in, sessions, private storage, file and browser-recognition input, provider/research boundaries and operation. All 17 chapters were considered and all 253 L1/L2 controls read; 176 map to obligations and 77 have explicit scope/provider-mechanism exclusions. No L3-wide impact/adversary is established. AI authority, voice privacy and retention/restore include supplemental product-specific rules. Security clauses below are independently traceable; they apply across the listed use cases without adding an integration setup journey.

### NFR-10.1 — Owner identity
Applies to UC-001. Authenticate the configured Google identity using validated issuer, subject, audience, signature, purpose, lifetime and transaction binding; reject unsigned, replayed, wrong-issuer/audience and non-owner assertions without revealing history. Document all authentication routes and abuse controls; default accounts and unrecorded bypasses are forbidden. Google supplies account-factor/recovery operations; the app adds no MFA step. Architecture must verify provider assurance and specify the documented minimum-assurance fallback and mitigations before implementation acceptance; unverified Google assurance is never labelled L2 compliant.
ASVS: v5.0.0-6.1.1, v5.0.0-6.1.3, v5.0.0-6.3.1, v5.0.0-6.3.2, v5.0.0-6.3.3, v5.0.0-6.3.4, v5.0.0-6.8.2, v5.0.0-6.8.4, v5.0.0-9.1.1, v5.0.0-9.1.2, v5.0.0-9.1.3, v5.0.0-9.2.1, v5.0.0-9.2.2, v5.0.0-9.2.3, v5.0.0-10.1.1, v5.0.0-10.1.2, v5.0.0-10.2.1, v5.0.0-10.5.1, v5.0.0-10.5.2, v5.0.0-10.5.3, v5.0.0-10.5.4.

### NFR-10.2 — Session control
Applies to UC-001, UC-005. Use server-verified, unguessable dynamic sessions renewed at authentication, with a normal absolute lifetime of 24 hours from successful sign-in and no shorter inactivity timeout, plus documented concurrency and federated termination rules. Browser reopening and inactivity do not reset or shorten that lifetime; server-side revocation, explicit sign-out and security invalidation still apply immediately. Sign-out/expiry/revocation invalidates further use; Settings permits the reauthenticated owner to view and revoke active sessions through one small security action. Operators can terminate compromised sessions. Evidence must show an invalidated token cannot read or mutate private state and an unrelated identity cannot revoke owner sessions. The owner-requested 24-hour lifetime is fixed product intent. Architecture implements it and owns concurrency/federated termination details before session checks execute. For ASVS 7.1.1/7.3.1/7.3.2, the recorded rationale is uninterrupted daily use by the single private owner, with bounded absolute expiry and revocation; device access during that period remains a risk to assess alongside actual Google assurance. No NIST assurance or runtime compliance claim is made.
ASVS: v5.0.0-7.1.1, v5.0.0-7.1.2, v5.0.0-7.1.3, v5.0.0-7.2.1, v5.0.0-7.2.2, v5.0.0-7.2.3, v5.0.0-7.2.4, v5.0.0-7.3.1, v5.0.0-7.3.2, v5.0.0-7.4.1, v5.0.0-7.4.2, v5.0.0-7.4.3, v5.0.0-7.4.4, v5.0.0-7.4.5, v5.0.0-7.5.2, v5.0.0-7.6.1, v5.0.0-7.6.2.

### NFR-10.3 — Private resource authorization
Applies to UC-001, UC-002, UC-003, UC-004, UC-005, UC-006. Enforce documented owner-only function, object and field permissions at the trusted service boundary on every read, attachment fetch, export, deletion, setting and run command. Reject anonymous/non-owner or forged identifiers and immutable-field updates without disclosing protected content or changing state; hiding UI and unpredictable IDs are insufficient.
ASVS: v5.0.0-8.1.1, v5.0.0-8.1.2, v5.0.0-8.2.1, v5.0.0-8.2.2, v5.0.0-8.2.3, v5.0.0-8.3.1, v5.0.0-15.3.1, v5.0.0-15.3.3.

### NFR-11.1 — Untrusted input and execution
Applies to UC-002, UC-004, UC-005, UC-006, UC-007. Document and enforce server-side input structure, related-value rules and type/size constraints. Use context-correct encoding, safe Markdown/text rendering, parameterized database/OS boundaries and safe deserialization; reject executable templates, unsafe URLs, malformed types, prototype pollution and parameter collisions. Resource parsing must handle ranges and release resources safely. Adversarial text, filenames, provider output and source titles must render as inert content and must not execute commands or alter queries.
ASVS: v5.0.0-1.1.1, v5.0.0-1.1.2, v5.0.0-1.2.1, v5.0.0-1.2.2, v5.0.0-1.2.3, v5.0.0-1.2.4, v5.0.0-1.2.5, v5.0.0-1.2.9, v5.0.0-1.3.1, v5.0.0-1.3.2, v5.0.0-1.3.3, v5.0.0-1.3.5, v5.0.0-1.3.7, v5.0.0-1.3.10, v5.0.0-1.4.1, v5.0.0-1.4.2, v5.0.0-1.4.3, v5.0.0-1.5.2, v5.0.0-2.1.1, v5.0.0-2.1.2, v5.0.0-2.2.1, v5.0.0-2.2.2, v5.0.0-2.2.3, v5.0.0-3.2.1, v5.0.0-3.2.2, v5.0.0-15.3.5, v5.0.0-15.3.6, v5.0.0-15.3.7.

### NFR-11.2 — State and resource abuse
Applies to UC-002, UC-003, UC-005, UC-006, UC-007. Enforce valid action order and documented per-owner/application limits at the trusted boundary. Accepted-state transitions are atomic and concurrency protected; duplicate submissions, stale workers and excessive research/provider requests cannot consume unbounded subscriptions, overwrite accepted history or bypass Stop. A browser voice start cannot mutate accepted application state. Architecture owns bounded request/upload/research limits before affected checks are prepared; use the confirmed run ceilings rather than invented latency promises.
ASVS: v5.0.0-2.1.3, v5.0.0-2.3.1, v5.0.0-2.3.2, v5.0.0-2.3.3, v5.0.0-2.3.4, v5.0.0-2.4.1, v5.0.0-15.1.3, v5.0.0-15.2.2.

### NFR-11.3 — Browser and HTTP boundaries
Applies to UC-001, UC-002, UC-003, UC-004, UC-005, UC-006. Protect authenticated requests against cross-origin forgery, embedding and untrusted redirects. Apply secure host-only HttpOnly session cookies with purpose-appropriate SameSite, HSTS, restrictive CSP, correct MIME/nosniff, referrer minimization and trusted-origin rules. All API bodies/HTTP boundaries and proxy-derived identity data are validated; spoofed forwarded headers cannot confer trust. A forged cross-origin state change must be denied without changing history. Keep this app on an isolated origin from other GoDaddy apps.
ASVS: v5.0.0-3.3.1, v5.0.0-3.3.2, v5.0.0-3.3.3, v5.0.0-3.3.4, v5.0.0-3.4.1, v5.0.0-3.4.2, v5.0.0-3.4.3, v5.0.0-3.4.4, v5.0.0-3.4.5, v5.0.0-3.4.6, v5.0.0-3.5.1, v5.0.0-3.5.2, v5.0.0-3.5.3, v5.0.0-3.5.4, v5.0.0-3.7.1, v5.0.0-3.7.2, v5.0.0-4.1.1, v5.0.0-4.1.2, v5.0.0-4.1.3, v5.0.0-4.2.1, v5.0.0-15.3.4.

### NFR-12.1 — Restricted research reach
Applies to UC-007. Document permitted outbound communication and prevent server-side fetches from reaching private/link-local/metadata networks or unapproved protocols, destinations and redirects. Public source content cannot expand tool access or authorize disclosure/actions. A malicious URL or page instruction must produce a denied/qualified result with the private record unchanged.
ASVS: v5.0.0-1.3.6, v5.0.0-13.1.1, v5.0.0-13.2.4, v5.0.0-13.2.5, v5.0.0-15.3.2.

### NFR-12.2 — Safe attachments and browser voice
Applies to UC-002, UC-004, UC-006. This is a single-owner image path: the owner stated they will submit only images they generated, but that statement is a trust boundary rather than technical provenance proof. Accept only JPEG, PNG or WebP, with a maximum upload size of 8 MiB enforced before storage; ignore the client MIME declaration and verify the matching binary signature. Reject PDF, SVG, video, audio, archives, mismatched, truncated or oversized content. Store an accepted image as encrypted, opaque, non-executable data under an internal name; do not invoke it, transform it, generate a thumbnail or expose a server path. Any owner download requires normal owner authorization, a fixed validated content type, `nosniff` and attachment disposition. No external or local malware scanner is required for this owner-only path. Browser voice is never sent as an application upload. Every rejected image must leave the typed draft intact and disclose no server path. A multiuser scope, externally sourced upload or new file type requires a new PRD security review before implementation.
ASVS: v5.0.0-5.1.1, v5.0.0-5.2.1, v5.0.0-5.2.2, v5.0.0-5.2.3, v5.0.0-5.3.1, v5.0.0-5.3.2, v5.0.0-5.4.1, v5.0.0-5.4.2, v5.0.0-5.4.3.

### NFR-12.3 — Bounded AI authority
Applies to UC-002, UC-005, UC-007. Keep untrusted owner attachments and retrieved pages separate from trusted instructions; restrict each agent/tool to needed data and authorized actions. No API-key/PAYG, automatic credits, Claude Fast Mode or silent provider/model/effort substitution is permitted. Claude Critic has no browsing, shell, file or other tool authority; it receives only the reconstructed consultation context and its text-only role/output contract. Its command-level tool denial and output filter reject internal tool invocation/transcript material before persistence or rendering. Specific permission is required for sensitive external transfers and consequential external actions; unchanged ordinary consent is reused. Malicious prompt injection cannot reveal secrets, widen data access, spend through fallback or send an external message. Preserve the existing high-stakes advice and coaching boundaries.
Supplemental AI authority and subscription-use constraints come from the product brief and do not map to a specific ASVS control.

### NFR-13.1 — Cryptographic protection
Applies to UC-001, UC-004, UC-005. Maintain a key/certificate/algorithm inventory and key lifecycle with separated storage access, least privilege, rotation and recovery. Use maintained approved primitives with at least 128-bit security, authenticated encryption/integrity, strong randomness and algorithm/key replacement support; reject tampered ciphertext. An exported database alone must not expose conversations, attachments or provider grants, and the restore test must demonstrate recovery using the authorized separated key material.
ASVS: v5.0.0-11.1.1, v5.0.0-11.1.2, v5.0.0-11.2.1, v5.0.0-11.2.2, v5.0.0-11.2.3, v5.0.0-11.3.1, v5.0.0-11.3.2, v5.0.0-11.3.3, v5.0.0-11.4.1, v5.0.0-11.4.3, v5.0.0-11.5.1, v5.0.0-11.6.1, v5.0.0-13.3.1, v5.0.0-13.3.2.

### NFR-13.2 — Protected transport and service identity
Applies to UC-001, UC-002, UC-004, UC-005, UC-006, UC-007. Use current approved TLS/ciphers and trusted certificate validation for external and applicable internal connections, without insecure fallback. Backend services authenticate with distinct least-privilege identities and managed credentials rather than privileged shared/default accounts. Invalid certificates or service identity must deny data transfer and preserve record state. Architecture must verify the GoDaddy database/service credential and TLS mechanisms before those runtime checks are prepared.
ASVS: v5.0.0-12.1.1, v5.0.0-12.1.2, v5.0.0-12.2.1, v5.0.0-12.2.2, v5.0.0-12.3.1, v5.0.0-12.3.2, v5.0.0-12.3.3, v5.0.0-12.3.4, v5.0.0-13.2.1, v5.0.0-13.2.2, v5.0.0-13.2.3.

### NFR-14.1 — Private data classification and transfer
Applies to UC-002, UC-004, UC-006, UC-007. Classify conversation text, attachments, browser-recognized transcripts, identity/session data, grants, settings and operational records; define their access, integrity, encryption, logging and retention treatment. Sensitive values must not appear in URLs, third-party trackers or unintended caches. A minimized public query cannot silently include private business content. Verify allowed selected-provider processing and denied unauthorized search transfer separately.
ASVS: v5.0.0-14.1.1, v5.0.0-14.1.2, v5.0.0-14.2.1, v5.0.0-14.2.2, v5.0.0-14.2.3, v5.0.0-14.2.4.

### NFR-14.2 — Client and voice privacy
Applies to UC-001, UC-004, UC-006. Use no-store for sensitive responses; keep private drafts/transcripts out of persistent browser storage and clear authenticated client content on sign-out/termination, including when offline. Cancel, failure, completion or a background transition ends browser recognition; NanoDuck never receives audio. Verify that returning through browser history after sign-out does not disclose private conversation content.
ASVS: v5.0.0-14.3.1, v5.0.0-14.3.2, v5.0.0-14.3.3.

### NFR-14.3 — Retention, deletion and restore
Applies to UC-003, UC-004. Retain confirmed conversations and their owned attachments encrypted indefinitely until explicit owner deletion. Document deletion propagation to replicas/backups and restoration handling so deleted records cannot reappear as active history; do not promise immediate physical backup erasure without evidence. Define and test backup/restore and data-integrity outcomes, with recovery objectives and ownership resolved by architecture before release checks. An isolated restore must recover accepted records and retain confirmed deletion decisions without touching another GoDaddy app.
Supplemental indefinite retention and deletion-aware recovery constraints come from the product brief and do not map to a specific ASVS control.

### NFR-15.1 — Secure delivery and maintenance
Applies to UC-001, UC-002, UC-004. Maintain dependency provenance/inventory and supported runtime/provider pins; define risk-based vulnerability/update deadlines with a responsible operator. Production artifacts expose only required functions and no repository metadata, debug mode, directory listing, TRACE or private monitoring/docs. Verify forbidden endpoints and extraneous files are inaccessible. Later deployment must establish the exact authorized app/database boundary, compatible migration, rollback criteria and post-deploy evidence before any irreversible reset; no such operation is part of this design phase.
ASVS: v5.0.0-15.1.1, v5.0.0-15.1.2, v5.0.0-15.2.1, v5.0.0-15.2.3, v5.0.0-13.4.1, v5.0.0-13.4.2, v5.0.0-13.4.3, v5.0.0-13.4.4, v5.0.0-13.4.5.

### NFR-16.1 — Useful protected evidence
Applies to UC-001, UC-002, UC-003, UC-004, UC-005, UC-006, UC-007. Document event inventory, timestamps, format, retention, access and incident ownership. Capture authentication/authorization/validation failures and control/transport errors with correlatable metadata, without credentials, hidden reasoning or unnecessary conversation content. Encode untrusted log fields, protect logs from reading/modification, and retain a logically separate protected analysis copy. Evidence must support a recovery investigation while a crafted log field cannot forge an event.
ASVS: v5.0.0-16.1.1, v5.0.0-16.2.1, v5.0.0-16.2.2, v5.0.0-16.2.3, v5.0.0-16.2.4, v5.0.0-16.2.5, v5.0.0-16.3.1, v5.0.0-16.3.2, v5.0.0-16.3.3, v5.0.0-16.3.4, v5.0.0-16.4.1, v5.0.0-16.4.2, v5.0.0-16.4.3.

### NFR-16.2 — Secure degraded operation
Applies to UC-001, UC-002, UC-003, UC-004, UC-005, UC-006, UC-007. Unexpected errors return a concise actionable state without stack traces, queries or secrets. Failed validation, provider/research access, logging dependency or transport never grants access or partially commits invalid work. A provider tool trace is treated as invalid output: one bounded text-only retry may recover it, while a second trace leaves the accepted question intact and exposes neither trace. Recovery retains accepted context and distinguishes an outage from quota/authorization conditions; tests must observe both successful retry and denied unsafe retry.
ASVS: v5.0.0-16.5.1, v5.0.0-16.5.2, v5.0.0-16.5.3.

### ASVS chapter coverage and scoped exclusions

| Reviewed scope | Coverage or exclusion |
|---|---|
| V1 — Encoding and Sanitization | 27 controls read at L1/L2; NFR-11.1, NFR-12.1; 8 scoped exclusions below. |
| V2 — Validation and Business Logic | 11 controls read at L1/L2; NFR-11.1, NFR-11.2; 0 scoped exclusions below. |
| V3 — Web Frontend Security | 19 controls read at L1/L2; NFR-11.1, NFR-11.3; 1 scoped exclusions below. |
| V4 — API and Web Service | 10 controls read at L1/L2; NFR-11.3; 6 scoped exclusions below. |
| V5 — File Handling | 9 controls read at L1/L2; NFR-12.2; 0 scoped exclusions below. |
| V6 — Authentication | 35 controls read at L1/L2; NFR-10.1; 27 scoped exclusions below. |
| V7 — Session Management | 18 controls read at L1/L2; NFR-10.2; 1 scoped exclusions below. |
| V8 — Authorization | 7 controls read at L1/L2; NFR-10.3; 1 scoped exclusions below. |
| V9 — Self-contained Tokens | 7 controls read at L1/L2; NFR-10.1; 1 scoped exclusions below. |
| V10 — OAuth and OIDC | 29 controls read at L1/L2; NFR-10.1; 22 scoped exclusions below. |
| V11 — Cryptography | 14 controls read at L1/L2; NFR-13.1; 2 scoped exclusions below. |
| V12 — Secure Communication | 9 controls read at L1/L2; NFR-13.2; 1 scoped exclusions below. |
| V13 — Configuration | 13 controls read at L1/L2; NFR-12.1, NFR-13.1, NFR-13.2, NFR-15.1; 0 scoped exclusions below. |
| V14 — Data Protection | 9 controls read at L1/L2; NFR-14.1, NFR-14.2; 0 scoped exclusions below. |
| V15 — Secure Coding and Architecture | 13 controls read at L1/L2; NFR-10.3, NFR-11.1, NFR-11.2, NFR-11.3, NFR-12.1, NFR-15.1; 0 scoped exclusions below. |
| V16 — Security Logging and Error Handling | 16 controls read at L1/L2; NFR-16.1, NFR-16.2; 0 scoped exclusions below. |
| V17 — WebRTC | 7 controls read at L1/L2; No in-scope mechanism; 7 scoped exclusions below. |

Every listed applicable control is an obligation above. Exclusions below are mechanism/scope decisions, not waived security outcomes. A new mechanism returns to PRD review.
- v5.0.0-1.2.6, v5.0.0-1.2.7, v5.0.0-1.2.8, v5.0.0-1.3.8, v5.0.0-1.3.9, v5.0.0-1.3.11, v5.0.0-1.5.1: No LDAP, XPath, LaTeX, JNDI, memcache, mail-system or XML processing is required; architecture must return any introduced interpreter/parser to this review.
- v5.0.0-1.3.4: User-supplied SVG is outside the accepted JPEG/PNG/WebP formats; any future SVG intake requires review.
- v5.0.0-3.5.5: No postMessage integration is required; reassess before adding one.
- v5.0.0-4.3.1, v5.0.0-4.3.2, v5.0.0-4.4.1, v5.0.0-4.4.2, v5.0.0-4.4.3, v5.0.0-4.4.4: No GraphQL or WebSocket product capability is required; architecture must reassess if selecting either transport.
- v5.0.0-6.2.1, v5.0.0-6.2.2, v5.0.0-6.2.3, v5.0.0-6.2.4, v5.0.0-6.2.5, v5.0.0-6.2.6, v5.0.0-6.2.7, v5.0.0-6.2.8, v5.0.0-6.2.9, v5.0.0-6.2.10, v5.0.0-6.2.11, v5.0.0-6.2.12, v5.0.0-6.4.1, v5.0.0-6.4.2, v5.0.0-6.4.3, v5.0.0-6.4.4, v5.0.0-6.5.1, v5.0.0-6.5.2, v5.0.0-6.5.3, v5.0.0-6.5.4, v5.0.0-6.5.5, v5.0.0-6.6.1, v5.0.0-6.6.2, v5.0.0-6.6.3, v5.0.0-6.1.2: Google owns password, factor enrollment/recovery and out-of-band authentication. The app has no local password/factor API; provider assurance remains NFR-10.1, not a compliance claim.
- v5.0.0-6.8.1, v5.0.0-6.8.3: There is one Google identity provider and no SAML assertion consumer; issuer/subject verification is still required by NFR-10.1.
- v5.0.0-7.5.1: The app does not modify account authentication attributes; Google owns those changes. Session termination after provider factor changes remains NFR-10.2.
- v5.0.0-8.4.1: Single-owner product has no tenant partition feature; owner-only authorization applies to all resources under NFR-10.3.
- v5.0.0-10.3.1, v5.0.0-10.3.2, v5.0.0-10.3.3, v5.0.0-10.3.4, v5.0.0-10.4.1, v5.0.0-10.4.2, v5.0.0-10.4.3, v5.0.0-10.4.4, v5.0.0-10.4.5, v5.0.0-10.4.6, v5.0.0-10.4.7, v5.0.0-10.4.8, v5.0.0-10.4.9, v5.0.0-10.4.10, v5.0.0-10.4.11, v5.0.0-10.6.1, v5.0.0-10.6.2, v5.0.0-10.7.1, v5.0.0-10.7.2, v5.0.0-10.7.3, v5.0.0-9.2.4, v5.0.0-10.2.2: The app is a token consumer, not a token issuer, authorization/resource server or OpenID provider; provider contracts and least scopes remain NFR-10.1. Additional Critic subscription grants must remain segregated and are reassessed if implemented as another OIDC login route.
- v5.0.0-10.5.5: OIDC back-channel logout is not confirmed; architecture must reassess this exact control if used. App-session revocation is still mandatory.
- v5.0.0-11.4.2, v5.0.0-11.4.4: No app passwords or password-derived encryption keys are allowed; Google and managed grants provide access.
- v5.0.0-12.1.3: mTLS client authentication is not a confirmed mechanism; architecture reassesses if selected.
- v5.0.0-17.1.1, v5.0.0-17.2.1, v5.0.0-17.2.2, v5.0.0-17.2.3, v5.0.0-17.2.4, v5.0.0-17.3.1, v5.0.0-17.3.2: Voice means browser-native recognition after an explicit Start, not audio capture/upload, peer calling, TURN, RTP media or WebRTC signaling. Reassess all V17 controls if that boundary changes.

## Product-level Implementation Decisions

Use the reusable specialist guidance library and Head-created roles while preserving the high-stakes and external-action boundaries. These are AI roles; no claim of human employment or licensure is allowed. Psychotherapist does not diagnose, replace clinical care or handle emergencies, while Spiritual Consultant follows the specified evangelical Protestant doctrine and excludes esoteric practice. Dynamic naming cannot bypass these restrictions. Use the existing Codex live search and the supported browser-native recognition path, without an application transcription provider or invented Claude tool access.

Head/specialists remain on Codex `gpt-6-astra` / `xhigh`. The owner's 22 September selection changes Critic for future consultations to Claude Code Opus 5.5 (`claude-opus-5-5`) / Medium, while retaining Codex `gpt-6-astra` / `xhigh` as the independently selectable Critic branch. Apply that new Critic tuple once to fresh and pre-revision saved preferences without rewriting accepted run snapshots; later supported owner selections remain authoritative. Keep the independent specialist-count and discussion-depth defaults of 2 and 1. Verify the exact selected provider/model/reasoning tuple and entitlement separately before cutover; picker/catalog evidence is not execution proof. Preserve Codex `0.153.1` and Claude Code `2.1.280`, the minimum CLI version for Opus 5.5, in this phase; the provider boundary must use the exact `claude-opus-5-5` model ID. Architecture owns mechanisms; this PRD does not select a stack or build order.

The owner's later 22 September request adds GPT-6 Sol as an optional Codex model for Head/specialists and the Critic Codex branch. It is a selectable future preference, not a migration or new default. Validate the chosen effort against the current Codex catalog; selecting GPT-6 Sol cannot alter an accepted run.

The owner's latest correction makes the Critic Claude Code branch visible with Opus 5.5 and only Medium, High, Extra and Max effort options. Medium remains the default. The immediately preceding preference revision may hold Opus 5.5 / Low in the active or inactive Claude branch; normalize only that now-unsupported effort to Medium once, retaining other supported owner choices and accepted snapshots. Browser updates must deliver these current settings controls without making the owner clear a stale cache; architecture owns asset and cache mechanisms.

All three design candidates cover the same use cases and recovery states, including interactive model/reasoning selection and the complete voice lifecycle. The initial comparison used three substantial design directions. The owner subsequently selected and approved Electric A v8 within that combined layout; its full flow coverage is retained. The floating bar remains available on scroll and is not arbitrarily draggable. A 44 CSS px touch target is the design default; WCAG 2.2 AA minimum-target rules are distinct. Longer calculations are allowed; the proposed 60–140-word ordinary-reply target never permits truncation of an actual message.

## Canonical finding severity and release effect

The SDD verification contract supplies this shared scale. Severity and release effect are separate fields; downstream owners reference this definition.

- **P0:** catastrophic actual or imminent severe harm, or system-wide unusability; blocking.
- **P1:** a broken primary journey, core capability, release invariant or high-impact requirement without an acceptable workaround for material supported scope; blocking.
- **P2:** a localized meaningful defect, gap, regression or drift. Blocking only for a required gate, critical journey, applicable accessibility/security/privacy/legal/payment/data-integrity requirement, supported device/viewport, approved hierarchy or interaction meaning, or combined P1 impact; otherwise advisory. Payment obligations remain excluded from this product.
- **P3:** low-impact polish with no material effect on behavior, comprehension, accessibility, trust or completion; advisory.

Each finding needs applicability, source, evidence and rationale. This scale does not evaluate release or create product scope.

## Testing Decisions and Minimum End-to-End Acceptance Scenarios

Use the highest practical external seam: authenticated browser through the intended service and actual provider/test fixture boundaries. Mark fixture/prototype evidence separately from production evidence. Prepared checks remain not run until executed. No screenshot or document checker proves runtime performance, security, recovery, actual multi-agent exchange or cross-browser release support.

| Scenario | Minimum observable allowed and denied outcomes |
|---|---|
| AC-001 — Owner entry (UC-001) | Known owner signs in and resumes; cancelled, forged, replayed and non-owner callbacks expose no record. First consent is explicit; unchanged scope does not prompt repeatedly. Normal sessions remain usable just before 24 hours, including after inactivity/browser reopening; the 24-hour boundary expires them. Sign-out/revocation denies the old session immediately. |
| AC-002 — Useful exchange (UC-002) | Head creates concise individual assignments, including an unlisted specialist, and independent workers overlap. User context remains complete and nonduplicated. Critic orders against an evasive answer remain unresolved after a repeated answer; only a matching Critic assessment can resolve them. Complete the selected review depth, avoid mandatory unaffected replies and closing speeches, and synthesize all requested deliverables or explicit gaps. No generic task substitution or false consensus. |
| AC-003 — Honest outcome (UC-002) | Head's conclusion matches actual agreement or clearly names uncertainty, evidence and risk. It covers every requested deliverable with as many actions as the request needs. English role names coexist with the established session language. |
| AC-004 — Interruption (UC-003) | Accepted message survives refresh/offline/server restart; duplicate retry yields one confirmed response. Stop rejects a late result; Continue resumes context; New cannot create a concurrent second run. Measure stated timing/continuation targets. |
| AC-005 — Private record (UC-004) | Open/export returns the whole selected record; cancel deletion is inert; confirmed deletion affects only its record/attachments. Guessed identifiers and revoked sessions reveal nothing. Isolated restore respects deletion decisions. |
| AC-006 — Preferences and limits (UC-005) | In a returning browser after an app update, Settings displays current controls without a manual cache clear. Head and Critic model/reasoning selectors genuinely change valid future preferences while an active run retains its tuple. Critic Claude Code exposes Opus 5.5 with Medium, High, Extra and Max, defaults to Medium and rejects Low for that model. Both Codex selectors offer GPT-6 Sol with a supported effort; choosing it for future work leaves the current defaults and accepted runs intact. Fresh and pre-Opus preferences receive the owner-selected Opus 5.5 / Medium Critic once; an immediately preceding saved Opus 5.5 / Low choice in either Claude branch advances to Medium only, while other supported choices and accepted snapshots remain intact. Invalid combinations cannot silently substitute. Quota, outage, expired app session and selected-provider reauthorization have distinct truthful recovery; an unused provider causes no warning. |
| AC-007 — Voice (UC-006) | In Safari and Chrome, a Ukrainian browser-recognition session begins only after Start, exposes an active state and disclosure, returns editable text after Stop, and requires explicit Send. Cancel aborts recognition. Permission/service/language/network/interruption failures preserve the typed draft. A background transition never leaves hidden recognition active or sends audio to NanoDuck. |
| AC-008 — Evidence (UC-007) | A time-sensitive question researches without a keyword; direct source metadata supports the stated claim. Failed/conflicting sources stay qualified; prompt injection and unauthorized private search transfer are denied. |
| AC-009 — Integrated design (all UCs) | Each of three candidates exposes all core and recovery flows, floating desktop navigation, mobile hamburger and literal Settings, using fictional data. Keyboard/touch/reflow and text resizing remain usable; no real-provider claim is inferred from a simulated control. |
| AC-010 — Security/lifecycle (all UCs) | Allowed operations and adversarial denied outcomes cover every NFR security clause. Exact deployed artifact, dependency/configuration, authorization, file, session, encryption, restore and operational evidence are required later; design review supplies none of these runtime results. |

## Out Of Scope

Public registration or multiuser SaaS; payments; extra hosts or paid research by default; automatic external business actions; required notifications; native apps; PDF/SVG/video/audio/archive and arbitrary file uploads; restoration of the rejected green design. Production GoDaddy changes and any deletion are excluded from this phase. Only the named Personal AI Consulting Group app and its proven-owned database may be reset later; no other app, database, shared table or credential is authorized.

## Open Questions and Resolution Owners

No unresolved product-intent choice blocks the authorized browser implementation. Architecture must resolve live Opus 5.5 entitlement/execution evidence, mobile Safari/Chrome recognition evidence, provider reauthorization, Google assurance, session/resource parameters, safe file processing, isolated service credentials, restore objectives and GoDaddy lifecycle/storage/streaming evidence before affected release checks can be executed. The operational owner and incident/update/deletion procedures must be named before release; no invented recovery objective or security deadline is adopted here. A conflict requiring new user behavior returns to the product-idea owner instead of being silently waived.

## Source Notes

The current product brief is the sole product authority consumed for this PRD. Its owner corrections authorize voice, explicit model/reasoning controls, Settings, three bold designs, the 22 September Opus 5.5 / Medium Critic preference, the later GPT-6 Sol choice in both Codex selectors, and the latest visible Claude Code effort and current-browser-control correction. Historical code/model evidence is inherited only as qualified by that brief; the supplied picker establishes owner-facing vocabulary and selection, while the hosting warning is an operational observation; neither proves a successful provider turn or current Settings behavior. Supplemental security requirements derive from the pinned offline OWASP ASVS 5.0.0 catalog (SHA-256 `bcdbec214d70abcfad9284a31d4f9e5134305831d628aad3aa85d7e26626cb35`) and the skill's security-authoring, accessibility and lifecycle rules. ASVS requirements are copyright OWASP contributors under CC-BY-SA-4.0; this document paraphrases requirements and references their IDs rather than reproducing the catalog. Catalog: [OWASP ASVS v5.0.0](https://github.com/OWASP/ASVS/tree/v5.0.0).

## Parallel execution security reassessment

The 25 September correction extends existing UC-002, UC-003 and UC-005 within the same owner, providers and GoDaddy data boundary. NFR-10.3 requires conversation-bound task, result and order references; NFR-11.1 requires safe role-name, task and schema rendering; NFR-11.2 requires atomic per-task commits, dependency ordering, bounded scheduling and Stop fencing; NFR-12.3 prohibits dynamic roles from escalating tools, models or resolving their own Critic orders; NFR-13.1 and NFR-14.1–14.3 protect private role guidance and context and include it in deletion and restore; NFR-16.1 permits content-free usage counts only. Rechecked pinned ASVS 5.0.0 business-flow and transaction controls 2.3.1–2.3.4, authorization 8.2.1 and data protection 14.2.1 under the retained Level 2 planning assessment. Other chapter applicability and exclusions remain unchanged. This is a requirements review, not a live security or provider concurrency claim.
