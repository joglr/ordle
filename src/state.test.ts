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
    keyboardColors: {},
  };
}

describe("writeToSquare", () => {
  it("allows writing if empty history and empty attempt", async () => {
    const state = mkState();
    const newState = await writeLetter("a", state);

    const expectedAttemptState = [...state.currentAttempt, "a"];
    expect(newState.currentAttempt.length).toBe(expectedAttemptState.length);
    expect(newState.currentAttempt).toStrictEqual(expectedAttemptState);
  });

  it("allows writing if the history is almost full", async () => {
    const state = mkState(almostFullHistory);
    const newState = await writeLetter("a", state);
    const expectedAttemptState = [...state.currentAttempt, "a"];
    expect(newState.currentAttempt.length).toBe(expectedAttemptState.length);
    expect(newState.currentAttempt).toStrictEqual(expectedAttemptState);
  });

  it("allow writing if attempt is almost full", async () => {
    const state = mkState(almostFullHistory, almostFullAttempt);
    const newState = await writeLetter("a", state);
    const expectedAttemptState = [...state.currentAttempt, "a"];
    expect(newState.currentAttempt.length).toBe(expectedAttemptState.length);
    expect(newState.currentAttempt).toStrictEqual(expectedAttemptState);
  });

  it("does not allow writing if the history is full", async () => {
    const state = mkState(fullHistory);
    const newState = await writeLetter("a", state);
    expect(newState).toStrictEqual(state);
  });

  it("does not allow writing if attempt is full", async () => {
    const state = mkState([], fullAttempt);
    const newState = await writeLetter("a", state);
    expect(newState).toStrictEqual(state);
  });
});

describe("deleteLetter", () => {
  it("deletes the most recent letter", async () => {
    const state = mkState(almostFullHistory, almostFullAttempt);

    const newState = await deleteLetter(state);
    expect(newState.currentAttempt.length).toBe(
      state.currentAttempt.length - 1
    );
    expect(newState.currentAttempt).toStrictEqual(
      state.currentAttempt.slice(0, -1)
    );
  });

  it("does not affect an empty attempt", async () => {
    const state = mkState();

    const newState = await deleteLetter(state);
    expect(newState).toStrictEqual(state);
  });
});

describe("guess", () => {
  // it("");
});
