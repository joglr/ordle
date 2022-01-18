import { GuessResponseBody } from "./pages/api/guess";
import { clone } from "./util";

const errors = {};

export enum LetterState {
  DEFAULT = "DEFAULT",
  INCORRECT = "INCORRECT",
  CORRECT = "CORRECT",
  CORRECT_LETTER = "CORRECT_LETTER",
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

export type OrdleState = {
  history: History;
  currentAttempt: string[];
  keyboardColors: Record<string, string>;
};

export const WORD_SIZE = 5;
export const HISTORY_SIZE = 6;
export const L = (l: string, s: LetterState) => ({ letter: l, state: s });

export const DF = (l: string) => L(l, LetterState.DEFAULT);

export const C = (l: string) => L(l, LetterState.CORRECT);

export const CL = (l: string) => L(l, LetterState.CORRECT_LETTER);

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

export function writeToSquare(
  s: OrdleState,
  r: number,
  c: number,
  v: HistoryLetter
) {
  s.history[r][c] = v;
  return s;
}

export function writeLetter(l: string, os: OrdleState): OrdleState {
  const { history, currentAttempt, keyboardColors } = clone(os);
  if (history.length < HISTORY_SIZE && currentAttempt.length < WORD_SIZE) {
    currentAttempt.push(l);
  }
  return { history, currentAttempt, keyboardColors };
}

export function deleteLetter(os: OrdleState): OrdleState {
  const { history, currentAttempt, keyboardColors } = clone(os);
  if (currentAttempt.length === 0) return os;

  return {
    history: history,
    currentAttempt: currentAttempt.slice(0, -1),
    keyboardColors,
  };
}

export async function guess(s: OrdleState): Promise<GuessResponseBody> {
  const url = new URL("/api/guess", window.location.href);

  const response = await fetch(url.toString(), {
    body: JSON.stringify(s),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const body = (await response.json()) as GuessResponseBody;

  if (response.status !== 200) {
    return { error: response.statusText, state: null };
  }
  return body;
}

export function colorize(os: OrdleState, todaysWord: string): OrdleState {
  const { history, currentAttempt, keyboardColors } = clone(os);
  const todaysLetters = todaysWord.split("") as (string | null)[];
  const historyEntry: HistoryEntry = [DF(""), DF(""), DF(""), DF(""), DF("")];
  for (let i = 0; i < currentAttempt.length; i++) {
    const letter = currentAttempt[i];
    const todaysLetter = todaysLetters[i];
    let value: HistoryLetter;
    if (letter === todaysLetter) {
      todaysLetters[i] = null;
      value = C(letter);
    } else if (todaysLetters.includes(letter)) {
      const index = todaysLetters.indexOf(letter);
      todaysLetters[index] = null;
      value = CL(letter);
    } else {
      value = L(letter, LetterState.DEFAULT);
    }
    historyEntry[i] = value;
    // TODO: Update keyboardColors
  }
  return {
    currentAttempt: [],
    keyboardColors,
    history: [...history, historyEntry],
  };
}
