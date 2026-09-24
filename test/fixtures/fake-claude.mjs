#!/usr/bin/env node

const args = process.argv.slice(2);
if (args[0] === "auth" && args[1] === "status") {
  process.stdout.write(`${JSON.stringify({ loggedIn: true, authMethod: "oauth_token", apiProvider: "firstParty" })}\n`);
  process.exit(0);
}

let prompt = "";
for await (const chunk of process.stdin) prompt += chunk.toString("utf8");
let result = "A bounded Critic response.";
if (prompt.includes('Return only JSON: {"summary"')) result = JSON.stringify({ summary: "The strategy answer assumes prospects will accept interviews; finance gives a bounded test cost.", findings: [{ assignment: 1, issue: "The strategy answer assumes those buyers will take calls without evidence.", correction: "Recruit calls from a defined prospect list and measure interview acceptance." }] });
else if (prompt.includes('Return only JSON: {"assessments"')) result = JSON.stringify({ assessments: [{ orderId: prompt.match(/order ([A-Za-z0-9_-]{32})/u)?.[1], state: "resolved_corrected", reason: "The revision now measures interview acceptance from a defined prospect list." }] });
else if (prompt.includes("Check the actual assignment")) result = "That recommendation assumes those buyers will take calls; test their willingness before treating the interviews as evidence.";
else if (prompt.includes("reviewing every selected specialist's final position")) result = "The final positions support the same bounded buyer test, with no remaining conflict. [CONSILIUM: REACHED]";
process.stdout.write(`${JSON.stringify({ subtype: "success", result })}\n`);
