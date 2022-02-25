import { VercelRequest, VercelResponse } from "@vercel/node";
import {
  colorize,
  OrdleState,
  LoadingState,
  createEmptyState,
  LetterState,
  GameState,
  HISTORY_SIZE,
  generateShareString,
} from "../../state";
import { getTodaysWord, isWord } from "../../word";

type GuessResponse = Omit<VercelResponse, "json"> & {
  json: (arg0: OrdleState) => VercelResponse;
};

const todaysWord = getTodaysWord();

export default function guess(req: VercelRequest, res: GuessResponse) {
  function logAndRespond(state: OrdleState) {
    console.log(state);
    return res.json(state);
  }

  try {
    const state = req.body as OrdleState;

    let response: OrdleState = createEmptyState();

    if (state === undefined) {
      return logAndRespond({
        ...createEmptyState(),
        loadingState: LoadingState.ERROR,
        responseText: "Intern fejl",
      });
    }

    const word = state.board.currentAttempt.join("");
    const wordLowercase = word.toLowerCase();

    const wordIsWord = isWord(wordLowercase);

    if (!wordIsWord) {
      return logAndRespond({
        ...state,
        loadingState: LoadingState.ERROR,
        responseText: `${word} er ikke et gyldigt ord`,
        board: state.board,
      });
    }

    const newBoardState = colorize(state.board, todaysWord);
    const gameState = newBoardState.history.some((historyEntry) =>
      historyEntry.every((l) => l.state === LetterState.CORRECT)
    )
      ? GameState.WIN
      : newBoardState.history.length === HISTORY_SIZE
      ? GameState.LOSE
      : GameState.PLAYING;

    const shareString = GameState.WIN
      ? generateShareString(newBoardState.history)
      : "";

    return logAndRespond({
      loadingState: LoadingState.SUCCESS,
      board: newBoardState,
      responseText: null,
      gameState,
      shareString,
      todaysWord: gameState === GameState.LOSE ? todaysWord : null,
    });
  } catch (e) {
    return logAndRespond({
      gameState: GameState.PLAYING,
      loadingState: LoadingState.ERROR,
      responseText: "Intern fejl",
      board: createEmptyState().board,
      todaysWord: null,
      shareString: "",
    });
  }
}
