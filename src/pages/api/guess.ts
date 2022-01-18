import { VercelRequest, VercelResponse } from "@vercel/node";
import { colorize, OrdleBoardState } from "../../state";
import { getTodaysWord, isWord } from "../../word";

export type GuessSuccessResponse = {
  state: OrdleBoardState;
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

const todaysWord = getTodaysWord();

export default function guess(req: VercelRequest, res: GuessResponse) {
  // TODO: Stop logging todays word
  console.log("todaysWord: ", todaysWord);

  const state = req.body as unknown as OrdleBoardState;

  if (state === undefined) {
    return res.json({
      error: "Intern fejl",
      state: null,
    });
  }

  const word = state.currentAttempt.join("");
  const wordLowercase = word.toLowerCase();

  const wordIsWord = isWord(wordLowercase);

  if (!wordIsWord)
    return res.json({
      error: `${word} er ikke et gyldigt ord`,
      state: null,
    });

  const newState = colorize(state, todaysWord);

  return res.json({
    state: newState,
    error: null,
  });
}
