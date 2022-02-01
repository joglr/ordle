import clsx from "clsx";
import type { NextPage } from "next";
import { Dispatch, HTMLAttributes, useEffect } from "react";
import { OrdleState, History, keyboard } from "../state";
import Head from "next/head";
import { createContext, SetStateAction, useContext } from "react";
import { useState } from "react";
import { ToastProvider, useToasts } from "react-toast-notifications";
import {
  LetterState,
  LoadingState,
  deleteLetter,
  guess,
  HISTORY_SIZE,
  WORD_SIZE,
  writeLetter,
  createEmptyState,
} from "../state";
import styles from "../styles/Home.module.css";
import { isLast } from "../util";

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
  const [
    {
      board: { history, currentAttempt },
    },
  ] = useOrdleContext();
  const attemptsRemaining = getRemainingAttempts(history);
  const currentLettersRemaining = WORD_SIZE - currentAttempt.length;
  const attemptsRemainingSquares = [];
  const currentAttemptRemainingSquares = [];
  for (let i = 0; i < (attemptsRemaining - 1) * WORD_SIZE; i++) {
    attemptsRemainingSquares.push(
      <Square className={getClassNameFromLetterEntryState(LetterState.EMPTY)}>
        {" "}
      </Square>
    );
  }

  if (attemptsRemaining > 0) {
    for (let i = 0; i < currentLettersRemaining; i++) {
      currentAttemptRemainingSquares.push(
        <Square className={getClassNameFromLetterEntryState(LetterState.EMPTY)}>
          {" "}
        </Square>
      );
    }
  }

  return (
    <div className={styles.display}>
      {history.map((row, i) => (
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
      {currentAttempt.map((letter, i) => (
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

function Square(props: { children: string; className: string }) {
  return (
    <div className={clsx(styles.square, props.className)}>{props.children}</div>
  );
}

function Keyboard() {
  const [os, setOrdleState] = useOrdleContext();
  const { addToast } = useToasts();

  async function keyupHandler(e: KeyboardEvent) {
    if (e.metaKey || e.ctrlKey || e.altKey) {
      return;
    }
    const letter = e.key.toUpperCase();
    if (keyboard.some((row: string[]) => row.includes(letter))) {
      setOrdleState((prev) => ({
        ...prev,
        board: writeLetter(letter, os.board),
      }));
      return;
    }
    if (e.key === "Backspace") {
      setOrdleState((prev: OrdleState) => ({
        ...prev,
        board: deleteLetter(os.board),
      }));
    }
    if (e.key === "Enter") {
      const response = await guess(os);
      if (response.loadingState === "ERROR") {
        addToast(response.responseText, {
          appearance: "error",
          autoDismiss: true,
        });
      }
      setOrdleState(response);
    }
  }
  useEffect(() => {
    window.addEventListener("keyup", keyupHandler);
    return () => window.removeEventListener("keyup", keyupHandler);
  });
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

    setOrdleState((prev: OrdleState) => ({
      ...prev,
      loadingState: LoadingState.LOADING,
    }));
    const response = await guess(ordleState);
    if (response.loadingState === "ERROR") {
      addToast(response.responseText, {
        appearance: "error",
        autoDismiss: true,
      });
    }
    setOrdleState(response);
  }
  const attemptsRemaining = getRemainingAttempts(board.history);

  const lettersDisabled =
    loadingState === LoadingState.LOADING || attemptsRemaining === 0;
  const guessKeyDisabled =
    lettersDisabled || board.currentAttempt.length < WORD_SIZE;
  const deleteKeyDisabled =
    lettersDisabled || board.currentAttempt.length === 0;
  return (
    <>
      {props.row.map((key, index) => {
        const letterState = ordleState.board.keyboardColors[key];
        const className = getClassNameFromLetterEntryState(letterState);
        return (
          <KeyboardButton
            key={`${key}-${letterState.toString()}`}
            text={key}
            disabled={lettersDisabled}
            // TODO: Map of best key state
            className={className}
            onClick={() =>
              setOrdleState((prev) => ({
                ...prev,
                board: writeLetter(key, board),
              }))
            }
            wide={false}
          />
        );
      })}
      {props.final ? (
        <KeyboardButton
          text="⬅"
          title="Delete"
          onClick={() =>
            setOrdleState((prev: OrdleState) => ({
              ...prev,
              board: deleteLetter(board),
            }))
          }
          wide
          disabled={deleteKeyDisabled}
        />
      ) : null}
      {props.final ? (
        <KeyboardButton
          disabled={guessKeyDisabled}
          text="Gæt"
          onClick={enterHandler}
          wide
        />
      ) : null}
    </>
  );
}

function KeyboardButton({
  text,
  wide,
  ...props
}: {
  text: string;
  disabled: boolean;
  wide: boolean;
} & HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={clsx([
        {
          [styles.key]: true,
          [styles.active]: props.disabled,
          [styles.wide]: wide,
          [props.className ?? ""]: Boolean(props.className),
        },
      ])}
    >
      {text}
    </button>
  );
}

function getRemainingAttempts(history: History) {
  return HISTORY_SIZE - history.length;
}

export default Home;
