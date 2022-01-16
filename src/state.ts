import { clone } from "./util";

export enum LetterState {
  DEFAULT,
  INCORRECT,
  CORRECT,
  CORRECT_SPOT,
}

export interface HistoryLetter {
  letter: string;
  keyboardColors: Record<string, string>;
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
};

export const WORD_SIZE = 5;
export const HISTORY_SIZE = 6;
export const L = (l: string, s: LetterState) => ({ letter: l, state: s });

export const DF = (l: string) => ({
  letter: l,
  state: LetterState.DEFAULT,
});

export const C = (l: string) => ({
  letter: l,
  state: LetterState.CORRECT,
});

export const CS = (l: string) => ({
  letter: l,
  state: LetterState.CORRECT_SPOT,
});

export function getColorFromLetterEntryState(styles: any, state: LetterState) {
  switch (state) {
    case LetterState.CORRECT:
      return styles.correct;
    case LetterState.CORRECT_SPOT:
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

export const writeLetter = (l: string, os: OrdleState) => {
  const { history, currentAttempt } = clone(os);
  if (history.length < HISTORY_SIZE && currentAttempt.length < WORD_SIZE) {
    currentAttempt.push(L(l, LetterState.DEFAULT));
  }
  return { history, currentAttempt };
};

export function deleteLetter(os: OrdleState) {
  if (os.currentAttempt.length === 0) return os;

  const [_, ...rest] = os.currentAttempt.slice().reverse();
  return {
    history: os.history,
    currentAttempt: rest,
  };
}

export async function guess(s: OrdleState) {
  const url = new URL("/api/guess", window.location.href);

  const response = await fetch(url.toString(), {
    body: JSON.stringify(s),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return await response.json();
}
