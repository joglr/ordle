import { VercelRequest, VercelResponse } from "@vercel/node";
import { OrdleState } from "../../state";

import WORDS from "./../../../words.json";

const START_TIME = new Date("Fri Jan 14 2022 00:00:00 GMT+0100");

const START_TIME_MS = START_TIME.getTime();

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

const getWordIndexFromTimeMS = (timeMS: number) => {
  return Math.floor((timeMS - START_TIME_MS) / ONE_DAY_IN_MS) % WORDS.length;
};

const NOW_MS = new Date().getTime();
const todaysWord = WORDS[getWordIndexFromTimeMS(NOW_MS)];

export default function guess(req: VercelRequest, res: VercelResponse) {
  const { body: state } = req.query as unknown as { body: OrdleState };

  if (!Array.isArray(state.currentAttempt)) {
    res.status(400).json({ error: "Only specify one word" });
    return;
  }

  if (state === undefined) {
    res.status(400).json({ error: "State is required" });
    return;
  }

  const word = state.currentAttempt.map((x) => x.toLowerCase()).join("");

  const isWord = WORDS.includes(word);

  if (!isWord) res.json({ error: "Word not found" });

  // Iterate through each letter

  res.json(guess);
}
