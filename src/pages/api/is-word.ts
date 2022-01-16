import { VercelRequest, VercelResponse } from "@vercel/node";

import fs from "fs/promises";

// Vercel Serverless Function

let words: string[] = [];

if (process.env.WORDS) {
  const url = new URL(process.env.WORDS);
  url.searchParams.set("t", new Date().getTime().toString());
  words = JSON.parse(await fs.readFile("./words.json", "utf8"));
}

export default function isWord(req: VercelRequest, res: VercelResponse) {
  const { word } = req.query;

  if (Array.isArray(word)) {
    res.status(400).json({ error: "Only specify one word" });
    return;
  }

  if (word === undefined) {
    res.status(400).json({ error: "Missing required parameter: word" });
    return;
  }

  // const isWord = words.includes(word.toLowerCase());
  const matches = words.filter((x) =>
    x.toLowerCase().includes(word.toLowerCase())
  );

  res.json({
    words: words.length,
    matches,
    isWord: matches.length === 1,
  });
}
