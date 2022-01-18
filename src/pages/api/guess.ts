import { VercelRequest, VercelResponse } from "@vercel/node";
import { colorize, OrdleState } from "../../state";
import WORDS from "./../../../words.json";

const START_TIME = new Date("Fri Jan 14 2022 00:00:00 GMT+0100");
const START_TIME_MS = START_TIME.getTime();
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

export type GuessSuccessResponse = {
  state: OrdleState;
  error: null;
};

export type GuessErrorResponse = {
  state: null;
  error: string;
};

export type GuessResponseBody = GuessSuccessResponse | GuessErrorResponse;

type GuessResponse = Omit<VercelResponse, "json"> & {
  json: (arg0: GuessResponseBody) => VercelResponse;
};

const getWordIndexFromTimeMS = (timeMS: number) => {
  return Math.floor((timeMS - START_TIME_MS) / ONE_DAY_IN_MS) % WORDS.length;
};

const NOW_MS = new Date().getTime();
const todaysWord = WORDS[getWordIndexFromTimeMS(NOW_MS)];

export default function guess(req: VercelRequest, res: GuessResponse) {
  const state = req.body as unknown as OrdleState;

  if (!Array.isArray(state.currentAttempt)) {
    return res.json({
      error: "Only specify one word",
      state: null,
    });
  }

  if (state === undefined) {
    return res.json({
      error: "State is required",
      state: null,
    });
  }

  const word = state.currentAttempt.map((x) => x.toLowerCase()).join("");

  const isWord = WORDS.includes(word);

  if (!isWord)
    return res.json({
      error: "Word not found",
      state: null,
    });

  const newState = colorize(state, todaysWord);

  return res.json({
    state: newState,
    error: null,
  });
}
