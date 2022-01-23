import { VercelRequest, VercelResponse } from "@vercel/node";
import { colorize, BoardState, OrdleState, LoadingState } from "../../state";
import { getTodaysWord, isWord } from "../../word";

export interface GuessSuccessResponse extends OrdleState {
  board: BoardState;
  loadingState: LoadingState.SUCCESS;
  responseText: null;
}

export interface GuessErrorResponse extends OrdleState {
  board: BoardState;
  loadingState: LoadingState.ERROR;
  responseText: string;
}

export type GuessResponseBody = GuessSuccessResponse | GuessErrorResponse;

type GuessResponse = Omit<VercelResponse, "json"> & {
  json: (arg0: GuessResponseBody) => VercelResponse;
};

const todaysWord = getTodaysWord();

export default function guess(req: VercelRequest, res: GuessResponse) {
  // TODO: Stop logging todays word
  console.log("todaysWord: ", todaysWord);

  const { board } = req.body as unknown as OrdleState;

  if (board === undefined) {
    return res.json({
      loadingState: LoadingState.ERROR,
      responseText: "Intern fejl",
      board,
    });
  }

  const word = board.currentAttempt.join("");
  const wordLowercase = word.toLowerCase();

  const wordIsWord = isWord(wordLowercase);

  if (!wordIsWord)
    return res.json({
      loadingState: LoadingState.ERROR,
      responseText: `${word} er ikke et gyldigt ord`,
      board,
    });

  const newBoardState = colorize(board, todaysWord);

  return res.json({
    loadingState: LoadingState.SUCCESS,
    board: newBoardState,
    responseText: null,
  });
}
