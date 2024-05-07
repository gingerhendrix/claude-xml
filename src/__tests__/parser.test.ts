import fs from "node:fs";
import { dirname } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { expect } from "chai";

const __dirname = dirname(fileURLToPath(import.meta.url));

import { SimpleParser } from "../parser.js";

await describe("SimpleParser", async () => {
	await describe("parseString()", async () => {
		await describe("given the bookmarks sample", async () => {
			const xmlString = fs.readFileSync(`${__dirname}/bookmarks.xml`, "utf8");

			await it("parses the file correctly", async () => {
				const parser = new SimpleParser();
				const result = parser.parseString(xmlString);

				expect(result).to.have.property("tagName", "bookmarks");
				expect(result).to.have.property("children").with.length(2);

				expect(result.children[0]).to.have.property("tagName", "bookmark");
				expect(result.children[0]).to.have.property("children").with.length(2);
				expect(result.children[0].children[0]).to.have.property(
					"tagName",
					"name",
				);
				expect(result.children[0].children[0])
					.to.have.property("children")
					.with.length(1);
				expect(result.children[0].children[0].children[0]).to.equal(
					"Bookmark 1",
				);
			});

			await it("emits tagStart events", async () => {
				const parser = new SimpleParser();
				const events: string[] = [];
				parser.on("tagStart", ({ node }) => {
					events.push(`tagStart: ${node.tagName}`);
				});
				parser.parseString(xmlString);
				expect(events).to.deep.equal([
					"tagStart: bookmarks",
					"tagStart: bookmark",
					"tagStart: name",
					"tagStart: url",
					"tagStart: bookmark",
					"tagStart: name",
					"tagStart: url",
				]);
			});
		});
	});
});
