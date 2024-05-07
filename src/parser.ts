import { SAXParser } from "sax-ts";
import { BaseEmitter } from "./emitters.js";

export type XmlNode = {
	tagName: string;
	attributes: Record<string, string>;
	children: (XmlNode | string)[];
	parent?: XmlNode;
};

export type ParserEventMap = {
	tagStart: { node: XmlNode };
	tagEnd: { node: XmlNode };
	text: { text: string };
};

type SaxNode = {
	name: string;
	attributes: Record<string, string>;
};

export class SimpleParser extends BaseEmitter<ParserEventMap> {
	private currentElement: XmlNode | undefined = undefined;
	private root: XmlNode | undefined = undefined;

	parseString(xmlString: string) {
		const parser = new SAXParser(false, {
			lowercase: true,
			trim: true,
			normalize: true,
		});

		parser.onopentag = (node: SaxNode) => {
			const parent = this.currentElement;
			const newNode = {
				tagName: node.name,
				attributes: node.attributes,
				children: [],
				parent,
			};
			if (parent) {
				parent.children.push(newNode);
			} else {
				this.root = newNode;
			}
			this.currentElement = newNode;
			this.emit("tagStart", { node: newNode });
		};

		parser.onclosetag = () => {
			if (this.currentElement) {
				this.emit("tagEnd", { node: this.currentElement });
			}
			this.currentElement = this.currentElement?.parent;
		};

		parser.ontext = (text: string) => {
			if (this.currentElement) {
				this.currentElement.children.push(text);
			}
			this.emit("text", { text });
		};

		parser.write(xmlString).close();

		if (!this.root) {
			throw new Error("No root element found");
		}

		return this.root;
	}

	toTree(xmlNode?: XmlNode): XmlNode {
		const node = xmlNode ? xmlNode : this.root;
		if (!node) {
			throw new Error("No root element found");
		}
		const newNode = { ...node };
		newNode.parent = undefined;
		newNode.children = newNode.children.map((child) => {
			if (typeof child === "object") {
				return this.toTree(child);
			}
			return child;
		});
		return newNode;
	}
}
