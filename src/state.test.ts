import {
  C,
  CL,
  colorize,
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
  it("allows writing if empty history and empty attempt", () => {
    const state = mkState();
    const newState = writeLetter("a", state);

    const expectedAttemptState = [...state.currentAttempt, "a"];
    expect(newState.currentAttempt.length).toBe(expectedAttemptState.length);
    expect(newState.currentAttempt).toStrictEqual(expectedAttemptState);
  });

  it("allows writing if the history is almost full", () => {
    const state = mkState(almostFullHistory);
    const newState = writeLetter("a", state);
    const expectedAttemptState = [...state.currentAttempt, "a"];
    expect(newState.currentAttempt.length).toBe(expectedAttemptState.length);
    expect(newState.currentAttempt).toStrictEqual(expectedAttemptState);
  });

  it("allow writing if attempt is almost full", () => {
    const state = mkState(almostFullHistory, almostFullAttempt);
    const newState = writeLetter("a", state);
    const expectedAttemptState = [...state.currentAttempt, "a"];
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
    expect(newState.currentAttempt).toStrictEqual(
      state.currentAttempt.slice(0, -1)
    );
  });

  it("does not affect an empty attempt", () => {
    const state = mkState();

    const newState = deleteLetter(state);
    expect(newState).toStrictEqual(state);
  });
});

describe("colorize", () => {
  it("increases history by one", () => {
    const state = mkState([], ["a", "b", "c", "d", "e"]);
    const newState = colorize(state, "abcde");
    expect(newState.history.length).toBe(1);
  });

  it("colorizses green if correct", () => {
    const state = mkState([], ["a", "b", "c", "d", "e"]);
    const newState = colorize(state, "abcde");
    for (const letter of newState.history[0]) {
      expect(letter).toStrictEqual(C(letter.letter));
    }
  });

  it("only colorize the first match if multiple", () => {
    const state = mkState([], "faaaa".split(""));
    const newState = colorize(state, "abcde");

    const [a, b, c, d, e] = newState.history[0];

    expect(a).toStrictEqual(DF("f"));
    expect(b).toStrictEqual(CL("a"));
    expect(c).toStrictEqual(DF("a"));
    expect(d).toStrictEqual(DF("a"));
    expect(e).toStrictEqual(DF("a"));
  });

  it("only colorize the first match if multiple", () => {
    const state = mkState([], "faaaa".split(""));
    const newState = colorize(state, "aacde");

    const [a, b, c, d, e] = newState.history[0];

    expect(a).toStrictEqual(DF("f"));
    expect(b).toStrictEqual(C("a"));
    expect(c).toStrictEqual(CL("a"));
    expect(d).toStrictEqual(DF("a"));
    expect(e).toStrictEqual(DF("a"));
  });

  it.todo("updates keyboard colors");
});
