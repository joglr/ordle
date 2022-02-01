import {
  C,
  CL,
  colorize,
  deleteLetter,
  DF,
  History,
  INC,
  BoardState,
  writeLetter,
  getBestLetterState,
  LetterState,
} from "./state";

const almostFullHistory: History = [
  [C("A"), C("B"), C("C"), C("D"), C("E")],
  [C("A"), C("B"), C("C"), C("D"), C("E")],
  [C("A"), C("B"), C("C"), C("D"), C("E")],
  [C("A"), C("B"), C("C"), C("D"), C("E")],
  [C("A"), C("B"), C("C"), C("D"), C("E")],
];

const fullHistory: History = [
  [C("A"), C("B"), C("C"), C("D"), C("E")],
  [C("A"), C("B"), C("C"), C("D"), C("E")],
  [C("A"), C("B"), C("C"), C("D"), C("E")],
  [C("A"), C("B"), C("C"), C("D"), C("E")],
  [C("A"), C("B"), C("C"), C("D"), C("E")],
  [C("A"), C("B"), C("C"), C("D"), C("E")],
];

const fullAttempt = ["A", "B", "C", "D", "E"];
const almostFullAttempt = ["A", "B", "D", "D"];

function mkState(
  history: History = [],
  currentAttempt: string[] = []
): BoardState {
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
    const state = mkState([], ["A", "B", "C", "D", "E"]);
    const newState = colorize(state, "abcde");
    expect(newState.history.length).toBe(1);
  });

  it("colorizses green if correct", () => {
    const state = mkState([], ["A", "B", "C", "D", "E"]);
    const newState = colorize(state, "abcde");
    for (const letter of newState.history[0]) {
      expect(letter).toStrictEqual(C(letter.letter));
    }
  });

  it("only colorize the first match if multiple", () => {
    const state = mkState([], "FAAAA".split(""));
    const newState = colorize(state, "ABCDE");

    const [a, b, c, d, e] = newState.history[0];

    expect(a).toStrictEqual(INC("F"));
    expect(b).toStrictEqual(CL("A"));
    expect(c).toStrictEqual(INC("A"));
    expect(d).toStrictEqual(INC("A"));
    expect(e).toStrictEqual(INC("A"));
  });

  it("only colorize the first match if multiple", () => {
    const state = mkState([], "FAAAA".split(""));
    const newState = colorize(state, "AACDE");

    const [a, b, c, d, e] = newState.history[0];

    expect(a).toStrictEqual(INC("F"));
    expect(b).toStrictEqual(C("A"));
    expect(c).toStrictEqual(CL("A"));
    expect(d).toStrictEqual(INC("A"));
    expect(e).toStrictEqual(INC("A"));
  });

  it.todo("updates keyboard colors");
});

describe("getBestLetterState", () => {
  it("prefers C over CL", () => {
    expect(
      getBestLetterState(LetterState.CORRECT, LetterState.CORRECT_LETTER)
    ).toBe(LetterState.CORRECT);
    expect(
      getBestLetterState(LetterState.CORRECT_LETTER, LetterState.CORRECT)
    ).toBe(LetterState.CORRECT);
  });
  it("prefers CL over INC", () => {
    expect(
      getBestLetterState(LetterState.CORRECT_LETTER, LetterState.INCORRECT)
    ).toBe(LetterState.CORRECT_LETTER);
    expect(
      getBestLetterState(LetterState.INCORRECT, LetterState.CORRECT_LETTER)
    ).toBe(LetterState.CORRECT_LETTER);
  });
});
