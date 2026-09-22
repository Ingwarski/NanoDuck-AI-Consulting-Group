#!/usr/bin/env node

const args = process.argv.slice(2);
if (args[0] === "auth" && args[1] === "status") {
  process.stdout.write(`${JSON.stringify({ loggedIn: true, authMethod: "oauth_token", apiProvider: "firstParty" })}\n`);
  process.exit(0);
}

const prompt = args.at(-1) ?? "";
let result = "A bounded Critic response.";
if (prompt.includes("challenge one material gap")) result = "That recommendation assumes those buyers will take calls; test their willingness before treating the interviews as evidence.";
else if (prompt.includes("reviewing every selected specialist's final position")) result = "The final positions support the same bounded buyer test, with no remaining conflict. [CONSILIUM: REACHED]";
process.stdout.write(`${JSON.stringify({ subtype: "success", result })}\n`);
