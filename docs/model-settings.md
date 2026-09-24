# Model preservation record

14 September 2026. This is a model-preservation record and content-free capability evidence, not a saved-settings export or live deployment configuration.

## Current local capability read

On 14 September 2026, this checkout's controlled Codex app-server preflight read the current account/catalog/rate-limit state without starting a model turn, creating a conversation, contacting MySQL or changing GoDaddy. It returned `ready` and listed `gpt-6-astra` with both `xhigh` and `ultra` reasoning efforts. The [U-01 capability matrix](../forge/runs/U-01/phase3-local-preflight-20260914/capability-matrix.json) records the content-free result.

This confirms that the current Codex catalog supports the current tuples. It does not independently prove a model invocation at either effort or record actual rate-limit quantities.

## Current saved settings

On 14 September 2026, an authenticated owner session viewed the named current GoDaddy app's Settings screen without changing a value, opening a secret, exporting content or calling a model. Its saved active Codex fields were:

| Field | Current saved value |
|---|---|
| Head/specialist provider | `codex` |
| Head/specialist model | `gpt-6-astra` |
| Head/specialist reasoning | `xhigh` |
| Critic provider | `codex` |
| Critic model | `gpt-6-astra` |
| Critic reasoning | `xhigh` |

The settings UI labelled the selectable catalog entries unavailable because its catalog snapshot was stale, but the saved raw provider/model/effort values above were present and exact. The inactive Claude branch was not selected or exposed as a saved current value, so it remained unknown in that dated observation.

## Owner-directed Critic setting — 22 September 2026

The owner supplied a current Claude picker screenshot and directed the Critic to use **Claude Code**, **Opus 5.5** (`claude-opus-5-5`) and **Medium** effort. Head and specialists remain on Codex `gpt-6-astra` / `xhigh`. The picker showed Low, Medium (default), High, Extra and Max; the owner's subsequent correction limits the app's Opus 5.5 Critic effort choices to **Medium, High, Extra and Max**, with Medium still the default.

The repository applies this as a one-time saved-preference revision for future consultations. It preserves specialist count, discussion depth, sound and the Codex branch, and it never rewrites an accepted consultation snapshot. A later owner save is authoritative and is not overwritten on restart. This repository change does not prove a managed Claude grant, Opus 5.5 entitlement, a successful model turn or deployment.

## Additional Codex model choice — 22 September 2026

The owner subsequently requested **GPT-6 Sol** (`gpt-6-sol`) as an additional choice in every Codex model selector: Head/specialists and the independent Critic Codex branch. This expands the selectable catalog; it does not change the saved Head/specialist `gpt-6-astra` / `xhigh` tuple, the current Claude Code Opus 5.5 / Medium Critic tuple, or any accepted consultation snapshot. A later supported owner selection of GPT-6 Sol applies only to future consultations.

Offer GPT-6 Sol with only the reasoning efforts supported by the current inspected Codex catalog, and validate the selected model/effort pair on save and invocation. The owner's request is product intent, not evidence of current managed-account entitlement, quota or a successful GPT-6 Sol turn; those require separate live checks.

## Selection and execution rules

Do not silently substitute a model or effort from an unavailable catalog or from a historical record. Fresh and pre-Opus-revision saved preferences move once to the owner-directed Opus 5.5 / Medium Critic tuple. The obsolete revision-2 `Claude Code default`, `default`, and `xhigh` placeholders and the former Opus 5 preference normalize to that tuple. A preference stamped `critic-opus-5-5-medium-20260922` that selected Opus 5.5 / Low in either the active or inactive Claude branch moves once to the new `critic-opus-5-5-effort-floor-20260922` revision with Medium for that unsupported effort only. Its Codex choice, other supported Opus efforts, other Claude model choices and unrelated preferences remain unchanged. Accepted consultation snapshots retain their exact historical tuple; later supported owner choices remain authoritative.

The current source pins `@openai/codex` to `0.153.1` and `@anthropic-ai/claude-code` to `2.1.280`. [Claude Code's model configuration](https://code.claude.com/docs/en/model-config) requires CLI v2.1.280 or newer for Opus 5.5; in older releases the moving `opus` alias could select Opus 5. Codex exposes only its live inspected catalog. The 22 September screenshot established the Claude Code vocabulary, and the owner's later correction narrows the Critic Opus 5.5 selector to **Medium** (the default), **High**, **Extra**, and **Max**; Low is not offered for this model in NanoDuck. The app shows Opus 5.5 and those efforts as a labelled preview even when Claude Code is unavailable, but permits saving or using that branch only after its content-free managed-authentication check. Other owner-configured candidate IDs appear only when that check succeeds. It does not expose a fictitious “Claude Code default” model or unsupported `default`/`xhigh` effort values. At the isolated Claude CLI boundary, `claude-opus-5-5` passes as the exact `--model` ID, Medium passes through unchanged, and visible Extra maps to `xhigh`. A legacy `claude-opus-5` snapshot also retains its exact model ID at that boundary; an unsupported legacy ID fails visibly. Snapshots, Settings and exported records retain their owner-facing vocabulary. The rejected initial prototype offered only the historical Astra example. The three revision-2 candidates demonstrate selection using a copied, read-only local desktop Codex `model/list` catalog observed on 13 September: see [catalog evidence](../forge/design/evidence/local-model-catalog-20260913.json). This is local discovery evidence, not proof of the deployed app catalog or execution entitlement. Production must continue to inspect the selected provider before accepting a model/effort combination.

Preserve independent consultant settings and Critic provider/branch settings, specialist count, discussion depth, and immutable effective settings for a running consultation. Changing preferences affects future runs. Keep the no-API-key/PAYG/automatic-credit/Claude-Fast-Mode rule.

NanoDuck uses two independent controls: specialist count 1/2/3/5/Auto and discussion depth 1/3/5/Auto. Head selects an Auto team from one through five. Fixed depth selects exactly 1, 3 or 5 team review rounds on a successful run; Auto lets Head close when further review adds no value, up to ten. Only specialists with material findings must reply, and Critic explicitly assesses correction fulfillment. The application defaults to 2 specialists and one review round. Existing accepted legacy runs retain their original contract until terminal. Codex uses a 540,000 ms inactivity budget renewed only by matching-turn progress, with a 1,800,000 ms absolute ceiling. Claude retains its 540,000 ms absolute deadline. Exact selected model and reasoning settings never change to work around a timeout.

Before cutover, verify each exact active `(provider, model, effort)` separately without private conversation content. The existing Astra entitlement probe at xhigh supports catalog compatibility but is not an invocation proof. If an exact selection cannot run, preserve it, report the limitation and obtain a decision; never substitute a model/effort just to pass readiness.
