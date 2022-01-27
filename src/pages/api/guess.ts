import { VercelRequest, VercelResponse } from "@vercel/node";
import {
  colorize,
  BoardState,
  OrdleState,
  LoadingState,
  createEmptyState,
} from "../../state";
import { getTodaysWord, isWord } from "../../word";

type GuessResponse = Omit<VercelResponse, "json"> & {
  json: (arg0: OrdleState) => VercelResponse;
};

const todaysWord = getTodaysWord();

export default function guess(req: VercelRequest, res: GuessResponse) {
  try {
    const state = req.body as OrdleState;

    if (state === undefined) {
      return res.json({
        ...createEmptyState(),
        loadingState: LoadingState.ERROR,
        responseText: "Intern fejl",
      });
    }

    const word = state.board.currentAttempt.join("");
    const wordLowercase = word.toLowerCase();

    const wordIsWord = isWord(wordLowercase);

    if (!wordIsWord)
      return res.json({
        loadingState: LoadingState.ERROR,
        responseText: `${word} er ikke et gyldigt ord`,
        board: state.board,
      });

    const newBoardState = colorize(state.board, todaysWord);

    return res.json({
      loadingState: LoadingState.SUCCESS,
      board: newBoardState,
      responseText: null,
    });
  } catch (e) {
    return res.json({
      loadingState: LoadingState.ERROR,
      responseText: "Intern fejl",
      board: createEmptyState().board,
    });
  }
}
