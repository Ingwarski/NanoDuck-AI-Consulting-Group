import assert from "node:assert/strict";
import test from "node:test";
import { createConsultationService } from "../src/server/consultation.mjs";
import { createMemoryStore, defaultSettings } from "../src/server/store.mjs";
import { testRuntimeInstructions } from "./fixtures/runtime-instructions.mjs";

const roles = ["Strategy Consultant", "Finance Consultant", "Operations Consultant", "Sales Consultant", "Marketing Consultant"];
const settings = { ...defaultSettings, runtimeInstructions: testRuntimeInstructions, specialistCount: "2", discussionDepth: "5" };
const waitFor = async predicate => {
  for (let attempt = 0; attempt < 300; attempt++) {
    if (await predicate()) return;
    await new Promise(resolve => setTimeout(resolve, 5));
  }
  throw new Error("timed_out");
};
const makeRun = async (body = "Should a fictional bakery test preorders?", overrides = {}) => {
  const store = createMemoryStore();
  const conversation = await store.createConversation();
  const accepted = await store.acceptMessage(conversation.id, { body, clientRequestId: "consultation-fixture-0001" }, { ...settings, ...overrides });
  return { store, id: conversation.id, run: accepted.run };
};
const response = (input, roster = roles.slice(0, 2)) => {
  switch (input.outputKind) {
    case "owner_deliverables": return "1. Give a recommendation.\n2. Provide supporting sources when current facts are needed.";
    case "auto_team": return `[TEAM: ${roster.join(", ")}]`;
    case "research_query": return "[RESEARCH: NONE]";
    case "head_task": return `Investigate the distinct ${input.recipient} evidence for the owner's decision.`;
    case "head_review": return "[REVIEW: CLOSE]";
    case "critic_final": return "The team has addressed the issue. [CONSILIUM: REACHED]";
    default: return `${input.outputKind} gives a grounded, complete response.`;
  }
};
const fakeProvider = (calls, custom = () => undefined, roster = roles.slice(0, 2)) => ({ async invoke(input) {
  calls.push(input);
  const customResult = custom(input, calls);
  return customResult ?? { ok: true, body: response(input, roster), sources: [] };
} });
const runToStatus = async (fixture, provider, status = "complete") => {
  const service = createConsultationService({ store: fixture.store, provider });
  await service.start(fixture.id, fixture.run);
  await waitFor(async () => (await fixture.store.run(fixture.id)).status === status);
  return service;
};

test("Head chooses actual roles and its exact full assignments are delivered without fallback or retries", async () => {
  const fixture = await makeRun("Compare two fictional preorder plans and give a recommendation.", { specialistCount: "2" });
  const calls = [];
  const longTask = "The owner needs a decision, and this is the Head's task in its original phrasing. ".repeat(14);
  await runToStatus(fixture, fakeProvider(calls, input => input.outputKind === "head_task" ? { ok: true, body: `${input.recipient}: ${longTask}`, sources: [] } : undefined, ["Sales Consultant", "Risk Consultant"]));
  const events = await fixture.store.events(fixture.id);
  const tasks = events.filter(event => event.role === "Head Consultant" && event.recipient);
  assert.deepEqual(tasks.map(event => event.recipient), ["Sales Consultant", "Risk Consultant"]);
  assert.equal(calls.filter(call => call.outputKind === "head_task").length, 2);
  assert.equal(tasks[0].body, `Sales Consultant: ${longTask}`);
  assert.equal(tasks[1].body, `Risk Consultant: ${longTask}`);
  for (const task of tasks) {
    const call = calls.find(item => item.outputKind === "specialist_position" && item.role === task.recipient);
    assert.ok(call.assignment.includes(task.body));
    assert.ok(call.evidence.owner.includes("Compare two fictional preorder plans"));
  }
  assert.deepEqual((await fixture.store.run(fixture.id)).snapshot.resolvedTeam, ["Sales Consultant", "Risk Consultant"]);
});

test("Head can select permitted specialist roles beyond the former keyword choice", async () => {
  const fixture = await makeRun(undefined, { specialistCount: "2", discussionDepth: "1" });
  const calls = [];
  await runToStatus(fixture, fakeProvider(calls, undefined, ["Psychotherapist", "Spiritual Consultant"]));
  assert.deepEqual((await fixture.store.run(fixture.id)).snapshot.resolvedTeam, ["Psychotherapist", "Spiritual Consultant"]);
  assert.deepEqual((await fixture.store.events(fixture.id)).filter(event => event.role === "Head Consultant" && event.recipient).map(event => event.recipient), ["Psychotherapist", "Spiritual Consultant"]);
});

test("Continue recovers a former run's committed roster without replacing confirmed Head tasks", async () => {
  const fixture = await makeRun(undefined, { specialistCount: "2", discussionDepth: "1" });
  const priorTask = "Assess the original finance evidence for this owner request.";
  const source = { title: "Legacy public source", url: "https://example.org/legacy", claim: "A public claim.", retrievedAt: "2026-09-23T00:00:00.000Z" };
  await fixture.store.appendAgentMessage(fixture.id, fixture.run.generation, { role: "Head Consultant", recipient: "Finance Consultant", body: priorTask, sources: [source] });
  await fixture.store.updateRunSnapshot(fixture.id, fixture.run.generation, { ...fixture.run.snapshot, resolvedSpecialistCount: 2 });
  const calls = [];
  await runToStatus({ ...fixture, run: await fixture.store.run(fixture.id) }, fakeProvider(calls, input => {
    if (input.outputKind === "research_query") return { ok: true, body: "public legacy source", sources: [] };
    if (input.outputKind === "public_research") return { ok: true, body: "One public claim.", sources: [source] };
    return undefined;
  }, ["Finance Consultant", "Risk Consultant"]));
  const events = await fixture.store.events(fixture.id);
  const tasks = events.filter(event => event.role === "Head Consultant" && event.recipient);
  assert.deepEqual(tasks.map(event => event.recipient), ["Finance Consultant", "Risk Consultant"]);
  assert.equal(tasks[0].body, priorTask);
  assert.equal(tasks[0].sources[0].url, source.url);
  assert.equal(events.find(event => event.role === "Finance Consultant" && event.recipient === "Critic").sources.length, 0);
  assert.equal(calls.filter(call => call.outputKind === "head_task").length, 1);
  assert.match(calls.find(call => call.outputKind === "auto_team").assignment, /Resume the already confirmed roster prefix exactly/u);
});

test("all roles see every owner message, the deliverable ledger and the untrimmed discussion", async () => {
  const fixture = await makeRun("First request: compare plans.", { specialistCount: "1", discussionDepth: "1" });
  const firstCalls = [];
  await runToStatus(fixture, fakeProvider(firstCalls, undefined, ["Strategy Consultant"]));
  const followup = "Second request: include the operational risk. ".repeat(2500);
  const accepted = await fixture.store.acceptMessage(fixture.id, { body: followup, clientRequestId: "consultation-fixture-0002" }, { ...settings, specialistCount: "1", discussionDepth: "1" });
  assert.ok(accepted);
  const calls = [];
  await runToStatus({ ...fixture, run: accepted.run }, fakeProvider(calls, undefined, ["Risk Consultant"]));
  const position = calls.find(call => call.outputKind === "specialist_position");
  const critic = calls.find(call => call.outputKind === "critic_challenge");
  assert.ok(position.evidence.owner.includes("First request: compare plans."));
  assert.ok(position.evidence.owner.includes(followup));
  assert.ok(critic.evidence.discussion.includes("Head's requested-output ledger"));
  assert.ok(critic.evidence.discussion.includes(followup));
  assert.ok(critic.evidence.discussion.length > 80_000);
});

test("Critic can direct a rework and the consultant gets the exact criticism", async () => {
  const fixture = await makeRun(); const calls = [];
  const directive = "Stop and rework: the claimed buyer count has no source. Remove that figure and state what evidence would establish demand.";
  await runToStatus(fixture, fakeProvider(calls, input => input.outputKind === "critic_challenge" ? { ok: true, body: directive, sources: [] } : undefined));
  const replies = calls.filter(call => call.outputKind === "specialist_reply");
  assert.equal(replies.length, 2);
  assert.ok(replies.every(reply => reply.evidence.discussion.includes(directive)));
  assert.ok(replies.every(reply => /materially correcting|materially correct/iu.test(reply.assignment)));
  assert.equal((await fixture.store.events(fixture.id)).filter(event => event.body === directive).length, 2);
});

test("discussion depth is a ceiling and Head closes when further rounds add no value", async t => {
  for (const depth of ["1", "3", "5", "auto"]) await t.test(depth, async () => {
    const fixture = await makeRun(undefined, { specialistCount: "1", discussionDepth: depth }); const calls = [];
    await runToStatus(fixture, fakeProvider(calls, undefined, ["Strategy Consultant"]));
    assert.equal(calls.filter(call => call.outputKind === "critic_challenge").length, 1);
    assert.equal(calls.filter(call => call.outputKind === "head_review").length, 1);
    assert.equal((await fixture.store.events(fixture.id)).at(-1).role, "Head Consultant");
  });
});

test("Head can request another targeted round but the configured ceiling still applies", async () => {
  const fixture = await makeRun(undefined, { specialistCount: "1", discussionDepth: "3" }); const calls = [];
  await runToStatus(fixture, fakeProvider(calls, input => input.outputKind === "head_review" ? { ok: true, body: calls.filter(call => call.outputKind === "head_review").length === 1 ? "[REVIEW: CONTINUE]" : "[REVIEW: CLOSE]", sources: [] } : undefined, ["Strategy Consultant"]));
  assert.equal(calls.filter(call => call.outputKind === "critic_challenge").length, 2);
  assert.deepEqual((await fixture.store.run(fixture.id)).snapshot.headReviewDecisions, ["CONTINUE", "CLOSE"]);
});

test("phone numbers in private context do not suppress isolated public research or leak into its prompt", async () => {
  const privateNumber = "+1 415 555 0199";
  const fixture = await makeRun(`Use this public article https://support.upwork.com/hc/en-us/articles/211063718 and assess the current rule. My contact is ${privateNumber}.`, { specialistCount: "1", discussionDepth: "1" });
  const calls = [];
  const sources = Array.from({ length: 12 }, (_, index) => ({ title: `Public source ${index}`, url: `https://example.org/page-${index}`, claim: `Claim ${index}`, retrievedAt: "2026-09-23T00:00:00.000Z" }));
  await runToStatus(fixture, fakeProvider(calls, input => {
    if (input.outputKind === "research_query") return { ok: true, body: "https://support.upwork.com/hc/en-us/articles/211063718 current rule", sources: [] };
    if (input.outputKind === "public_research") return { ok: true, body: "The public article states a rule that needs review.", sources };
    return undefined;
  }, ["Strategy Consultant"]));
  const researchCall = calls.find(call => call.outputKind === "public_research");
  assert.equal(researchCall.research, true);
  assert.equal(researchCall.evidence.owner.includes("211063718"), true);
  assert.equal(researchCall.evidence.owner.includes(privateNumber), false);
  assert.equal(researchCall.evidence.discussion, "");
  assert.equal(researchCall.runtimeInstructions.documents, undefined);
  const events = await fixture.store.events(fixture.id);
  const headTask = events.find(event => event.role === "Head Consultant" && event.recipient);
  const firstPosition = events.find(event => event.role === "Strategy Consultant" && event.recipient === "Critic");
  assert.equal(headTask.sources.length, 0);
  assert.equal(firstPosition.sources.length, 12);
  assert.ok(events.indexOf(headTask) < events.indexOf(firstPosition));
  assert.ok(calls.find(call => call.outputKind === "head_final").evidence.discussion.includes("https://example.org/page-11"));
});

test("a deferred public search begins after a durable Head assignment and failure stays an evidence limitation", async () => {
  const fixture = await makeRun("Find public evidence for a fictional bakery.", { specialistCount: "1", discussionDepth: "1" });
  const calls = []; let release;
  const provider = fakeProvider(calls, input => {
    if (input.outputKind === "research_query") return { ok: true, body: "public bakery demand evidence", sources: [] };
    if (input.outputKind === "public_research") return new Promise(resolve => { release = () => resolve({ ok: false, code: "provider_unavailable" }); });
    return undefined;
  }, ["Strategy Consultant"]);
  const service = createConsultationService({ store: fixture.store, provider });
  await service.start(fixture.id, fixture.run);
  await waitFor(() => Boolean(release));
  const pending = await fixture.store.events(fixture.id);
  assert.deepEqual(pending.map(event => [event.role, event.recipient]), [["owner", null], ["Head Consultant", "Strategy Consultant"]]);
  assert.equal((await fixture.store.run(fixture.id)).status, "active");
  assert.equal(pending[1].sources.length, 0);
  release();
  await waitFor(async () => (await fixture.store.run(fixture.id)).status === "complete");
  const run = await fixture.store.run(fixture.id);
  assert.equal(run.snapshot.researchAttempted, true);
  assert.equal(run.snapshot.researchUnavailable, true);
  assert.equal(run.snapshot.researchUnavailableReason, "provider_unavailable");
  assert.equal((await fixture.store.events(fixture.id)).some(event => event.role === "System"), false);
  const position = calls.find(call => call.outputKind === "specialist_position");
  const final = calls.find(call => call.outputKind === "head_final");
  assert.match(position.evidence.discussion, /research attempt did not complete on the selected provider/u);
  assert.match(final.evidence.discussion, /this attempt verified nothing new/u);
  assert.equal(calls.filter(call => call.outputKind === "head_task").length, 1);
});

test("failed non-web research planning does not erase Head work or invoke web research", async () => {
  const fixture = await makeRun(undefined, { specialistCount: "1", discussionDepth: "1" }); const calls = [];
  await runToStatus(fixture, fakeProvider(calls, input => input.outputKind === "research_query" ? { ok: false, code: "provider_unavailable" } : undefined, ["Strategy Consultant"]));
  assert.equal(calls.some(call => call.outputKind === "public_research"), false);
  assert.equal((await fixture.store.run(fixture.id)).snapshot.researchUnavailableReason, "provider_unavailable");
  assert.equal((await fixture.store.events(fixture.id)).some(event => event.role === "System"), false);
  assert.equal((await fixture.store.events(fixture.id)).filter(event => event.role === "Head Consultant" && event.recipient).length, 1);
});

test("research provider-contract failures and tool traces remain rejected", async t => {
  for (const failingKind of ["research_query", "public_research"]) await t.test(failingKind, async () => {
    const fixture = await makeRun(undefined, { specialistCount: "1", discussionDepth: "1" }); const calls = [];
    await runToStatus(fixture, fakeProvider(calls, input => {
      if (input.outputKind === "research_query") return failingKind === "research_query"
        ? { ok: false, code: "provider_contract" }
        : { ok: true, body: "public bakery demand evidence", sources: [] };
      if (input.outputKind === "public_research") return { ok: true, body: '<invoke name="Bash">unsafe</invoke>', sources: [] };
      return undefined;
    }, ["Strategy Consultant"]), "failed");
    const events = await fixture.store.events(fixture.id);
    assert.equal(events.filter(event => event.role === "Head Consultant" && event.recipient).length, 1);
    assert.equal(events.at(-1).role, "System");
    assert.equal(events.some(event => event.body.includes("<invoke")), false);
    assert.equal((await fixture.store.run(fixture.id)).snapshot.researchAttempted, undefined);
  });
});

test("Stop during research preserves Head work and Continue does not repeat its assignment", async () => {
  const fixture = await makeRun(undefined, { specialistCount: "1", discussionDepth: "1" }); const calls = []; let started = false;
  const provider = fakeProvider(calls, input => {
    if (input.outputKind === "research_query") return { ok: true, body: "public bakery demand evidence", sources: [] };
    if (input.outputKind === "public_research" && !started) {
      started = true;
      return new Promise(resolve => input.signal.addEventListener("abort", () => resolve({ ok: false, code: "cancelled" }), { once: true }));
    }
    return undefined;
  }, ["Strategy Consultant"]);
  const service = createConsultationService({ store: fixture.store, provider });
  await service.start(fixture.id, fixture.run);
  await waitFor(() => started);
  assert.ok(await service.stop(fixture.id));
  assert.equal((await fixture.store.run(fixture.id)).status, "stopped");
  assert.equal((await fixture.store.events(fixture.id)).some(event => event.role === "System"), false);
  assert.ok(await service.continue(fixture.id));
  await waitFor(async () => (await fixture.store.run(fixture.id)).status === "complete");
  assert.equal(calls.filter(call => call.outputKind === "head_task").length, 1);
  assert.equal((await fixture.store.events(fixture.id)).filter(event => event.role === "Head Consultant" && event.recipient).length, 1);
});

test("Retry after a later provider failure does not replay Head tasks or research", async () => {
  const fixture = await makeRun(undefined, { specialistCount: "1", discussionDepth: "1" }); const calls = []; let fail = true;
  const provider = fakeProvider(calls, input => {
    if (input.outputKind === "research_query") return { ok: true, body: "public bakery demand evidence", sources: [] };
    if (input.outputKind === "specialist_position" && fail) return { ok: false, code: "provider_unavailable" };
    return undefined;
  }, ["Strategy Consultant"]);
  const service = await runToStatus(fixture, provider, "failed");
  fail = false;
  assert.ok(await service.continue(fixture.id));
  await waitFor(async () => (await fixture.store.run(fixture.id)).status === "complete");
  assert.equal(calls.filter(call => call.outputKind === "head_task").length, 1);
  assert.equal(calls.filter(call => call.outputKind === "public_research").length, 1);
});

test("unsafe public query is withheld without blocking the consultation", async () => {
  const fixture = await makeRun("Find the current public rule. My number is +1 415 555 0199.", { specialistCount: "1", discussionDepth: "1" }); const calls = [];
  await runToStatus(fixture, fakeProvider(calls, input => input.outputKind === "research_query" ? { ok: true, body: "Call +1 415 555 0199 for the rule", sources: [] } : undefined, ["Strategy Consultant"]));
  assert.equal(calls.some(call => call.outputKind === "public_research"), false);
  assert.equal((await fixture.store.run(fixture.id)).snapshot.researchUnavailable, true);
  assert.ok(calls.find(call => call.outputKind === "head_final").evidence.discussion.includes("research attempt was withheld"));
});

test("a local-file public query is withheld before any web-enabled call", async () => {
  const fixture = await makeRun("Find a current public source.", { specialistCount: "1", discussionDepth: "1" });
  const calls = [];
  await runToStatus(fixture, fakeProvider(calls, input => input.outputKind === "research_query" ? { ok: true, body: "file://private/report", sources: [] } : undefined, ["Strategy Consultant"]));
  assert.equal(calls.some(call => call.outputKind === "public_research"), false);
  assert.equal((await fixture.store.run(fixture.id)).snapshot.researchUnavailable, true);
});

test("a tool-free Claude Critic's evidence gap can trigger isolated Codex follow-up research", async () => {
  const fixture = await makeRun("Assess current demand for a fictional bakery.", { specialistCount: "1", discussionDepth: "3", criticProvider: "claude_code", criticClaudeModel: "claude-opus-5", criticClaudeReasoning: "high" });
  const calls = [];
  const source = { title: "Public demand survey", url: "https://example.org/demand", claim: "The survey reports a testable demand signal.", retrievedAt: "2026-09-23T00:00:00.000Z" };
  await runToStatus(fixture, fakeProvider(calls, input => {
    if (input.outputKind === "research_query") return { ok: true, body: calls.filter(call => call.outputKind === "research_query").length === 1 ? "[RESEARCH: NONE]" : "public bakery demand survey", sources: [] };
    if (input.outputKind === "head_review") return { ok: true, body: calls.filter(call => call.outputKind === "head_review").length === 1 ? "[REVIEW: CONTINUE]" : "[REVIEW: CLOSE]", sources: [] };
    if (input.outputKind === "critic_challenge") return { ok: true, body: "Stop and verify the demand claim with a direct public source.", sources: [] };
    if (input.outputKind === "public_research") return { ok: true, body: "The public survey provides one testable signal.", sources: [source] };
    return undefined;
  }, ["Strategy Consultant"]));
  assert.equal(calls.filter(call => call.outputKind === "public_research").length, 1);
  assert.equal(calls.filter(call => call.outputKind === "critic_challenge").every(call => call.provider === "claude_code" && call.research === false), true);
  const secondChallenge = (await fixture.store.events(fixture.id)).filter(event => event.role === "Critic" && event.recipient === "Strategy Consultant")[1];
  assert.equal(secondChallenge.sources[0].url, source.url);
  assert.ok(calls.find(call => call.outputKind === "head_final").evidence.discussion.includes(source.url));
});

test("a failed follow-up search keeps earlier valid sources and names the later limitation", async () => {
  const fixture = await makeRun("Check public bakery evidence, then revisit a gap.", { specialistCount: "1", discussionDepth: "3" }); const calls = [];
  const source = { title: "Public survey", url: "https://example.org/survey", claim: "The survey reports a testable signal.", retrievedAt: "2026-09-23T00:00:00.000Z" };
  await runToStatus(fixture, fakeProvider(calls, input => {
    if (input.outputKind === "research_query") return { ok: true, body: calls.filter(call => call.outputKind === "research_query").length === 1 ? "public bakery demand survey" : "new public market evidence", sources: [] };
    if (input.outputKind === "public_research") return calls.filter(call => call.outputKind === "public_research").length === 1
      ? { ok: true, body: "A public survey gives one testable signal.", sources: [source] }
      : { ok: false, code: "provider_unavailable" };
    if (input.outputKind === "head_review") return { ok: true, body: calls.filter(call => call.outputKind === "head_review").length === 1 ? "[REVIEW: CONTINUE]" : "[REVIEW: CLOSE]", sources: [] };
    return undefined;
  }, ["Strategy Consultant"]));
  const run = await fixture.store.run(fixture.id);
  assert.equal(run.snapshot.followupResearch[0].status, "unavailable");
  assert.equal(run.snapshot.researchUnavailableReason, "provider_unavailable");
  const firstPosition = (await fixture.store.events(fixture.id)).find(event => event.role === "Strategy Consultant" && event.recipient === "Critic");
  assert.equal(firstPosition.sources[0].url, source.url);
  const finalContext = calls.find(call => call.outputKind === "head_final").evidence.discussion;
  assert.match(finalContext, /https:\/\/example\.org\/survey/u);
  assert.match(finalContext, /research attempt did not complete on the selected provider/u);
});

test("complete long final is saved without an arbitrary character trim", async () => {
  const fixture = await makeRun(undefined, { specialistCount: "1", discussionDepth: "1" }); const calls = [];
  const final = "Specific recommendation and evidence. ".repeat(300);
  await runToStatus(fixture, fakeProvider(calls, input => input.outputKind === "head_final" ? { ok: true, body: final, sources: [] } : undefined, ["Strategy Consultant"]));
  assert.equal((await fixture.store.events(fixture.id)).at(-1).body, `## Consolidated advice\n\n${final.trim()}`);
});

test("a failed specialist reply resumes after the confirmed challenge without repeating it", async () => {
  const fixture = await makeRun(undefined, { specialistCount: "1", discussionDepth: "1" }); const calls = []; let fail = true;
  const provider = fakeProvider(calls, input => input.outputKind === "specialist_reply" && fail ? { ok: false, code: "provider_unavailable" } : undefined, ["Strategy Consultant"]);
  const service = await runToStatus(fixture, provider, "failed");
  const preserved = await fixture.store.events(fixture.id);
  assert.equal(preserved.at(-2).role, "Critic");
  fail = false;
  assert.ok(await service.continue(fixture.id));
  await waitFor(async () => (await fixture.store.run(fixture.id)).status === "complete");
  assert.equal(calls.filter(call => call.outputKind === "critic_challenge").length, 1);
  assert.deepEqual((await fixture.store.events(fixture.id)).slice(0, preserved.length), preserved);
});

test("content-free policy output retries the same role without losing confirmed work", async () => {
  const fixture = await makeRun(undefined, { specialistCount: "1", discussionDepth: "1" });
  const calls = [];
  await runToStatus(fixture, fakeProvider(calls, input => input.outputKind === "specialist_position" && calls.filter(call => call.outputKind === "specialist_position").length === 1
    ? { ok: false, code: "output_policy" } : undefined, ["Strategy Consultant"]));
  const positions = calls.filter(call => call.outputKind === "specialist_position");
  assert.equal(positions.length, 2);
  assert.equal(positions[0].role, positions[1].role);
  assert.equal(positions[0].recipient, positions[1].recipient);
  assert.match(positions[1].assignment, /Return a complete replacement now/u);
  assert.equal((await fixture.store.events(fixture.id)).some(event => event.role === "System"), false);
});

test("unusable language, link-only and genuinely empty answers have distinct recovery notices", async t => {
  for (const [code, notice, expectedCalls] of [["language_policy", /prohibited-language prose was withheld/u, 2], ["output_policy", /unsafe link was withheld/u, 2], ["empty_response", /completed without an answer/u, 1]]) await t.test(code, async () => {
    const fixture = await makeRun(undefined, { specialistCount: "1", discussionDepth: "1" });
    const calls = [];
    await runToStatus(fixture, fakeProvider(calls, input => input.outputKind === "specialist_position" ? { ok: false, code } : undefined, ["Strategy Consultant"]), "failed");
    assert.equal(calls.filter(call => call.outputKind === "specialist_position").length, expectedCalls);
    const events = await fixture.store.events(fixture.id);
    assert.match(events.at(-1).body, notice);
    assert.equal(events.some(event => event.role === "Strategy Consultant"), false);
  });
});

test("a provider failure never silently substitutes another model or a generic Head task", async () => {
  const fixture = await makeRun(undefined, { specialistCount: "1", discussionDepth: "1" }); const calls = [];
  await runToStatus(fixture, fakeProvider(calls, input => input.outputKind === "head_task" ? { ok: false, code: "incompatible" } : undefined, ["Strategy Consultant"]), "failed");
  assert.equal(calls.filter(call => call.outputKind === "head_task").length, 1);
  assert.equal((await fixture.store.events(fixture.id)).some(event => event.role === "Head Consultant"), false);
  assert.match((await fixture.store.events(fixture.id)).at(-1).body, /model and reasoning configuration is unavailable/u);
});
