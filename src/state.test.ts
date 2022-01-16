import {
  C,
  deleteLetter,
  DF,
  guess,
  History,
  HistoryLetter,
  LetterState,
  OrdleState,
  writeLetter,
} from "./state";
import { last } from "./util";

const almostFullHistory: History = [
  [C("a"), C("b"), C("c"), C("d"), C("e")],
  [C("a"), C("b"), C("c"), C("d"), C("e")],
  [C("a"), C("b"), C("c"), C("d"), C("e")],
  [C("a"), C("b"), C("c"), C("d"), C("e")],
  [C("a"), C("b"), C("c"), C("d"), C("e")],
];

const fullHistory: History = [
  [C("a"), C("b"), C("c"), C("d"), C("e")],
  [C("a"), C("b"), C("c"), C("d"), C("e")],
  [C("a"), C("b"), C("c"), C("d"), C("e")],
  [C("a"), C("b"), C("c"), C("d"), C("e")],
  [C("a"), C("b"), C("c"), C("d"), C("e")],
  [C("a"), C("b"), C("c"), C("d"), C("e")],
];

const fullAttempt = ["a", "b", "c", "d", "e"];
const almostFullAttempt = ["a", "b", "d", "d"];

function mkState(
  history: History = [],
  currentAttempt: string[] = []
): OrdleState {
  return {
    history,
    currentAttempt,
  };
}

describe("writeToSquare", () => {
  it("allows writing if empty history and empty attempt", () => {
    const state = mkState();
    const newState = writeLetter("a", state);

    const expectedAttemptState = [...state.currentAttempt, DF("a")];
    expect(newState.currentAttempt.length).toBe(expectedAttemptState.length);
    expect(newState.currentAttempt).toStrictEqual(expectedAttemptState);
  });

  it("allows writing if the history is almost full", () => {
    const state = mkState(almostFullHistory);
    const newState = writeLetter("a", state);
    const expectedAttemptState = [...state.currentAttempt, DF("a")];
    expect(newState.currentAttempt.length).toBe(expectedAttemptState.length);
    expect(newState.currentAttempt).toStrictEqual(expectedAttemptState);
  });

  it("allow writing if attempt is almost full", () => {
    const state = mkState(almostFullHistory, almostFullAttempt);
    const newState = writeLetter("a", state);
    const expectedAttemptState = [...state.currentAttempt, DF("a")];
    expect(newState.currentAttempt.length).toBe(expectedAttemptState.length);
    expect(newState.currentAttempt).toStrictEqual(expectedAttemptState);
  });

  it("does not allow writing if the history is full", () => {
    const state = mkState(fullHistory);
    const newState = writeLetter("a", state);
    expect(newState).toStrictEqual(state);
  });

  it("does not allow writing if attempt is full", () => {
    const state = mkState([], fullAttempt);
    const newState = writeLetter("a", state);
    expect(newState).toStrictEqual(state);
  });
});

describe("deleteLetter", () => {
  it("deletes the most recent letter", () => {
    const state = mkState(almostFullHistory, almostFullAttempt);

    const newState = deleteLetter(state);
    expect(newState.currentAttempt.length).toBe(
      state.currentAttempt.length - 1
    );
  });

  it("does not affect an empty attempt", () => {
    const state = mkState();

    const newState = deleteLetter(state);
    expect(newState).toStrictEqual(state);
  });
});

describe("guess", () => {
  // it("");
});
