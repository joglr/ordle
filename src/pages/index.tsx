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
  OrdleBoardState,
  WORD_SIZE,
  writeLetter,
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
  [OrdleBoardState, Dispatch<SetStateAction<OrdleBoardState>>]
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

function createEmptyState(): OrdleBoardState {
  return {
    history: [],
    currentAttempt: [],
    keyboardColors: {},
  };
}

function App() {
  const [ordleState, setOrdleState] =
    useState<OrdleBoardState>(createEmptyState);

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
  const [ordleState] = useOrdleContext();
  const attemptsRemaining =
    (HISTORY_SIZE - ordleState.history.length - 1) * WORD_SIZE;
  const currentLettersRemaining = WORD_SIZE - ordleState.currentAttempt.length;
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
  console.log(ordleState);

  return (
    <div className={styles.display}>
      {ordleState.history.map((row, i) => (
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
      {ordleState.currentAttempt.map((letter, i) => (
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
      className={`${styles.square} ${props.className}`}
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
  const { addToast } = useToasts();
  const [ordleState, setOrdleState] = useOrdleContext();

  async function enterHandler() {
    // TODO: Block more submissions while waiting judgement
    const { state, error } = await guess(ordleState);
    if (error && state === null)
      addToast(error, { appearance: "error", autoDismiss: true });
    if (error === null && state !== null) setOrdleState(state);
  }
  return (
    <div className={styles.keyrow}>
      {props.final ? (
        <KeyboardButton text="Enter" onClick={enterHandler} className="" />
      ) : null}
      {props.row.map((key, index) => (
        <KeyboardButton
          key={index}
          text={key}
          className=""
          // TODO: Map of best key state
          // className={getClassNameFromLetterEntryState()}
          onClick={() => setOrdleState(writeLetter(key, ordleState))}
        />
      ))}
      {props.final ? (
        <KeyboardButton
          text="Delete"
          onClick={() => setOrdleState(deleteLetter(ordleState))}
          className=""
        />
      ) : null}
    </div>
  );
}

function KeyboardButton(props: {
  text: string;
  className: string;
  onClick: () => void;
}) {
  return (
    <button className={styles.key} onClick={props.onClick}>
      {props.text}
    </button>
  );
}

export default Home;
