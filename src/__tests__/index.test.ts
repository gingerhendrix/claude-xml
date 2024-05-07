import { describe, it } from "node:test";
import { expect } from "chai";

import { SimpleParser } from "../index.js";

await describe("exports", async () => {

	await it("exports all the required functions", async () => {
		expect(SimpleParser).to.be.a("function");
	});
});
