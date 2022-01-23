import clsx from "clsx";
import type { NextPage } from "next";
import Head from "next/head";
import { createContext, Dispatch, SetStateAction, useContext } from "react";
import { useState } from "react";
import { ToastProvider, useToasts } from "react-toast-notifications";
import {
  deleteLetter,
  DF,
  guess,
  HISTORY_SIZE,
  LetterState,
  BoardState,
  WORD_SIZE,
  writeLetter,
  OrdleState,
  LoadingState,
} from "../state";
import styles from "../styles/Home.module.css";
import { isLast } from "../util";

const keyboard = [
  "QWERTYUIOPÅ".split(""),
  "ASDFGHJKLÆØ".split(""),
  "ZXCVBNM".split(""),
];

function getClassNameFromLetterEntryState(state: LetterState) {
  switch (state) {
    case LetterState.CORRECT:
      return styles.correct;
    case LetterState.CORRECT_LETTER:
      return styles.correctSpot;
    case LetterState.INCORRECT:
      return styles.incorrect;
    case LetterState.ATTEMPT:
      return styles.attempt;
    case LetterState.DEFAULT:
      return styles.default;
    default:
      return "";
  }
}

const OrdleContext = createContext<
  [OrdleState, Dispatch<SetStateAction<OrdleState>>]
>([createEmptyState(), createEmptyState]);

function useOrdleContext() {
  return useContext(OrdleContext);
}

const Home: NextPage = () => {
  return (
    <ToastProvider>
      <Head>
        <title>Ordle</title>
        <meta
          name="description"
          content="Ordle - Ordspil inspireret af Wordle"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <App />
    </ToastProvider>
  );
};

function createEmptyState(): OrdleState {
  return {
    board: {
      history: [],
      currentAttempt: [],
      keyboardColors: {},
    },
    loadingState: LoadingState.SUCCESS,
    responseText: null,
  };
}

function App() {
  const [ordleState, setOrdleState] = useState<OrdleState>(createEmptyState);

  return (
    <OrdleContext.Provider value={[ordleState, setOrdleState]}>
      <div className={styles.container}>
        <h1 className={styles.title}>Ordle</h1>
        <Display />
        <Keyboard />
      </div>
    </OrdleContext.Provider>
  );
}

function Display() {
  const [{ board }] = useOrdleContext();
  const attemptsRemaining =
    (HISTORY_SIZE - board.history.length - 1) * WORD_SIZE;
  const currentLettersRemaining = WORD_SIZE - board.currentAttempt.length;
  const attemptsRemainingSquares = [];
  const currentAttemptRemainingSquares = [];
  for (let i = 0; i < attemptsRemaining; i++) {
    attemptsRemainingSquares.push(
      <Square className={getClassNameFromLetterEntryState(LetterState.EMPTY)}>
        {" "}
      </Square>
    );
  }

  for (let i = 0; i < currentLettersRemaining; i++) {
    currentAttemptRemainingSquares.push(
      <Square className={getClassNameFromLetterEntryState(LetterState.EMPTY)}>
        {" "}
      </Square>
    );
  }

  return (
    <div className={styles.display}>
      {board.history.map((row, i) => (
        <>
          {row.map((letter, j) => (
            <Square
              key={`${JSON.stringify(letter)}-${i}-${j}`}
              className={getClassNameFromLetterEntryState(letter.state)}
            >
              {letter.letter}
            </Square>
          ))}
        </>
      ))}
      {board.currentAttempt.map((letter, i) => (
        <Square
          key={`${letter}-${i}`}
          className={getClassNameFromLetterEntryState(LetterState.ATTEMPT)}
        >
          {letter}
        </Square>
      ))}
      {currentAttemptRemainingSquares}
      {attemptsRemainingSquares}
    </div>
  );
}

function Square(props: {
  children: string;
  // onClick: () => void;
  className: string;
}) {
  return (
    <div
      className={clsx(styles.square, props.className)}
      // onClick={props.onClick}
    >
      {props.children}
    </div>
  );
}

function Keyboard() {
  return (
    <div className={styles.keyboard}>
      {keyboard.map((row, index) => (
        <KeyboardRow key={index} row={row} final={isLast(keyboard, index)} />
      ))}
    </div>
  );
}

function KeyboardRow(props: { row: string[]; final?: boolean }) {
  const [ordleState, setOrdleState] = useOrdleContext();
  const { board, loadingState } = ordleState;
  const { addToast } = useToasts();

  async function enterHandler() {
    if (loadingState === LoadingState.LOADING) return;
    // TODO: Block more submissions while waiting judgement
    setOrdleState((prev) => ({ ...prev, loadingState: LoadingState.LOADING }));
    const response = await guess(ordleState);
    if (response.loadingState === "ERROR") {
      addToast(response.responseText, {
        appearance: "error",
        autoDismiss: true,
      });
    }
    setOrdleState(response);
  }

  const lettersDisabled = loadingState === LoadingState.LOADING;
  const guessKeyDisabled =
    lettersDisabled || board.currentAttempt.length < WORD_SIZE;
  const deleteKeyDisabled =
    lettersDisabled || board.currentAttempt.length === 0;
  return (
    <div className={styles.keyrow}>
      {props.row.map((key, index) => (
        <KeyboardButton
          key={index}
          text={key}
          disabled={lettersDisabled}
          // TODO: Map of best key state
          // className={getClassNameFromLetterEntryState()}
          onClick={() =>
            setOrdleState((prev) => ({
              ...prev,
              board: writeLetter(key, board),
            }))
          }
        />
      ))}
      {props.final ? (
        <KeyboardButton
          text="⬅"
          title="Delete"
          onClick={() =>
            setOrdleState((prev) => ({ ...prev, board: deleteLetter(board) }))
          }
          disabled={deleteKeyDisabled}
        />
      ) : null}
      {props.final ? (
        <KeyboardButton
          disabled={guessKeyDisabled}
          text="Guess"
          onClick={enterHandler}
          className=""
        />
      ) : null}
    </div>
  );
}

function KeyboardButton(
  props: {
    text: string;
    disabled: boolean;
  } & React.HTMLAttributes<HTMLButtonElement>
) {
  return (
    <button
      {...props}
      className={clsx(styles.key, props.disabled && styles.active)}
    >
      {props.text}
    </button>
  );
}

export default Home;
