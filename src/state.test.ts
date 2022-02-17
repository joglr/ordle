import {
  GREEN,
  YELLOW,
  colorize,
  deleteLetter,
  History,
  GREY,
  BoardState,
  writeLetter,
  getBestLetterState,
  LetterState,
} from "./state";

const almostFullHistory: History = [
  [GREEN("A"), GREEN("B"), GREEN("C"), GREEN("D"), GREEN("E")],
  [GREEN("A"), GREEN("B"), GREEN("C"), GREEN("D"), GREEN("E")],
  [GREEN("A"), GREEN("B"), GREEN("C"), GREEN("D"), GREEN("E")],
  [GREEN("A"), GREEN("B"), GREEN("C"), GREEN("D"), GREEN("E")],
  [GREEN("A"), GREEN("B"), GREEN("C"), GREEN("D"), GREEN("E")],
];

const fullHistory: History = [
  [GREEN("A"), GREEN("B"), GREEN("C"), GREEN("D"), GREEN("E")],
  [GREEN("A"), GREEN("B"), GREEN("C"), GREEN("D"), GREEN("E")],
  [GREEN("A"), GREEN("B"), GREEN("C"), GREEN("D"), GREEN("E")],
  [GREEN("A"), GREEN("B"), GREEN("C"), GREEN("D"), GREEN("E")],
  [GREEN("A"), GREEN("B"), GREEN("C"), GREEN("D"), GREEN("E")],
  [GREEN("A"), GREEN("B"), GREEN("C"), GREEN("D"), GREEN("E")],
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
      expect(letter).toStrictEqual(GREEN(letter.letter));
    }
  });

  it("only colorize the first match if multiple", () => {
    const state = mkState([], "FAAAA".split(""));
    const newState = colorize(state, "ABCDE");

    expect(newState.history[0]).toStrictEqual([
      GREY("F"),
      YELLOW("A"),
      GREY("A"),
      GREY("A"),
      GREY("A"),
    ]);
  });

  it("only colorize the first match if multiple", () => {
    const state = mkState([], "FAAAA".split(""));
    const newState = colorize(state, "AACDE");

    expect(newState.history[0]).toStrictEqual([
      GREY("F"),
      GREEN("A"),
      YELLOW("A"),
      GREY("A"),
      GREY("A"),
    ]);
  });

  it("prefers correctly placed tiles over correct letters", () => {
    const state = mkState([], "HELSE".split(""));
    const newState = colorize(state, "HOLDE");
    expect(newState.history[0]).toStrictEqual([
      GREEN("H"),
      GREY("E"),
      GREEN("L"),
      GREY("S"),
      GREEN("E"),
    ]);
  });

  it("", () => {
    const state = mkState([], "DRIVE".split(""));
    const newState = colorize(state, "INDRE");
    expect(newState.history[0]).toStrictEqual([
      YELLOW("D"),
      YELLOW("R"),
      YELLOW("I"),
      GREY("V"),
      GREEN("E"),
    ]);
  });

  it.todo("updates keyboard colors correctly");
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
