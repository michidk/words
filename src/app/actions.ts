"use server";

import fs from "node:fs/promises";
import path from "node:path";
import { cache } from "react";

let words: string[] = [];

const loadWords = cache(async () => {
	if (words.length > 0) {
		return words;
	}

	try {
		const filePath = path.join(process.cwd(), "public", "words.txt");
		const fileContent = await fs.readFile(filePath, "utf-8");
		words = fileContent.split("\n").filter((word) => word.trim() !== "");
		return words;
	} catch (error) {
		console.error("Error loading words:", error);
		return ["Error", "Loading", "Words"];
	}
});

export async function getRandomWord(): Promise<string> {
	const wordList = await loadWords();
	return wordList[Math.floor(Math.random() * wordList.length)];
}
