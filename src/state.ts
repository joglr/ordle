import { clone } from "./util";
import { getWordIndexFromTimeMS } from "./word";

export interface OrdleState {
  board: BoardState;
  loadingState: LoadingState;
  gameState: GameState;
  responseText: string | null;
  todaysWord: string | null;
  shareString: string;
}

export enum LoadingState {
  LOADING = "LOADING",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}

export enum GameState {
  PLAYING = "PLAYING",
  WIN = "WIN",
  LOSE = "LOSE",
}

export enum LetterState {
  DEFAULT = "DEFAULT",
  INCORRECT = "INCORRECT",
  CORRECT = "CORRECT",
  CORRECT_LETTER = "CORRECT_LETTER",
  EMPTY = "EMPTY",
  ATTEMPT = "ATTEMPT",
}

export interface HistoryLetter {
  letter: string;
  state: LetterState;
}
// Word State Entry
export type wse = string | null;

export type HistoryEntry = [
  HistoryLetter,
  HistoryLetter,
  HistoryLetter,
  HistoryLetter,
  HistoryLetter
];
export type History = HistoryEntry[];

export type BoardState = {
  history: History;
  currentAttempt: string[];
  keyboardColors: Record<string, LetterState>;
};

export const keyboard = [
  "QWERTYUIOPÅ".split(""),
  "ASDFGHJKLÆØ".split(""),
  "ZXCVBNM".split(""),
];

export const WORD_SIZE = 5;
export const HISTORY_SIZE = 6;
export const L = (l: string, s: LetterState) => ({
  letter: l.toUpperCase(),
  state: s,
});

export const DF = (l: string) => L(l.toUpperCase(), LetterState.DEFAULT);

export const C = (l: string) => L(l.toUpperCase(), LetterState.CORRECT);
export const INC = (l: string) => L(l.toUpperCase(), LetterState.INCORRECT);

export const CL = (l: string) => L(l.toUpperCase(), LetterState.CORRECT_LETTER);

export function createEmptyState(): OrdleState {
  const state = {
    board: {
      history: [],
      currentAttempt: [],
      keyboardColors: {},
    },
    loadingState: LoadingState.SUCCESS,
    responseText: null,
    gameState: GameState.PLAYING,
    todaysWord: null,
    shareString: "",
  } as OrdleState;
  const letters = [...keyboard[0], ...keyboard[1], ...keyboard[2]];
  letters.forEach((letter) => {
    state.board.keyboardColors[letter] = LetterState.DEFAULT;
  });
  return state;
}

export function getColorFromLetterEntryState(styles: any, state: LetterState) {
  switch (state) {
    case LetterState.CORRECT:
      return styles.correct;
    case LetterState.CORRECT_LETTER:
      return styles.correctSpot;
    default:
      return "";
  }
}

export function writeLetter(l: string, os: BoardState): BoardState {
  const { history, currentAttempt, keyboardColors } = clone(os);
  if (history.length < HISTORY_SIZE && currentAttempt.length < WORD_SIZE) {
    currentAttempt.push(l);
  }
  return { history, currentAttempt, keyboardColors };
}

export function deleteLetter(os: BoardState): BoardState {
  const { history, currentAttempt, keyboardColors } = clone(os);
  if (currentAttempt.length === 0) return os;

  return {
    history: history,
    currentAttempt: currentAttempt.slice(0, -1),
    keyboardColors,
  };
}

export async function guess(os: OrdleState): Promise<OrdleState> {
  const { board } = os;
  const url = new URL("/api/guess", window.location.href);

  try {
    const response = await fetch(url.toString(), {
      body: JSON.stringify(os),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const body = (await response.json()) as OrdleState;

    if (response.ok && response.status === 200) {
      return body;
    } else {
      throw new Error(body.responseText ?? "Intern fejl");
    }
  } catch (e) {
    return {
      gameState: GameState.PLAYING,
      loadingState: LoadingState.ERROR,
      responseText: "Der kunne ikke oprettes forbindelse",
      board,
      todaysWord: null,
      shareString: "",
    };
  }
}

export function colorize(os: BoardState, todaysWord: string): BoardState {
  const { history, currentAttempt, keyboardColors } = clone(os);
  const todaysLetters = todaysWord.split("").map((x) => x.toUpperCase()) as (
    | string
    | null
  )[];
  const historyEntry = currentAttempt.map((l) => INC(l)) as HistoryEntry;

  // Check correct letters
  for (let i = 0; i < currentAttempt.length; i++) {
    const letter = currentAttempt[i];
    const todaysLetter = todaysLetters[i];

    if (todaysLetter === null) continue;

    if (letter === todaysLetter) {
      todaysLetters[i] = null;
      historyEntry[i] = C(letter);
    }
  }

  // Check correct letter, wrong spot
  for (let i = 0; i < currentAttempt.length; i++) {
    const letter = currentAttempt[i];
    const todaysLetter = todaysLetters[i];

    if (letter === null) continue;
    if (todaysLetter === null) continue;

    if (todaysLetters.includes(letter)) {
      const index = todaysLetters.indexOf(letter);
      todaysLetters[index] = null;
      historyEntry[i] = CL(letter);
    }
  }

  // Update keyboard colors
  for (let i = 0; i < currentAttempt.length; i++) {
    let letter = currentAttempt[i];
    keyboardColors[letter] = getBestLetterState(
      historyEntry[i].state,
      keyboardColors[letter] ?? LetterState.INCORRECT
    );
  }

  return {
    currentAttempt: [],
    keyboardColors,
    history: [...history, historyEntry],
  };
}

export function getBestLetterState(l1: LetterState, l2: LetterState) {
  if (l1 === LetterState.CORRECT || l2 === LetterState.CORRECT) {
    return LetterState.CORRECT;
  }
  if (l1 === LetterState.CORRECT_LETTER || l2 === LetterState.CORRECT_LETTER) {
    return LetterState.CORRECT_LETTER;
  }
  if (l1 === LetterState.INCORRECT || l2 === LetterState.INCORRECT) {
    return LetterState.INCORRECT;
  }
  return LetterState.DEFAULT;
}

export function generateShareString(history: History) {
  const stateToEmojiMap: Record<LetterState, string> = {
    [LetterState.CORRECT]: "🟩",
    [LetterState.CORRECT_LETTER]: "🟨",
    [LetterState.INCORRECT]: "⬛",
    [LetterState.DEFAULT]: "⬛",
    [LetterState.ATTEMPT]: "⬛",
    [LetterState.EMPTY]: "⬛",
  };
  const result = history
    .map((line) => line.map((x) => stateToEmojiMap[x.state]).join(""))
    .join("\n");

  const ordleNum = getWordIndexFromTimeMS(new Date().getTime()) + 1;

  return [`ordle.app #${ordleNum}`, result].join("\n");
}
