import type { NextPage } from "next";
import Head from "next/head";
import { createContext, Dispatch, SetStateAction, useContext } from "react";
import { useState } from "react";
import { DF, HISTORY_SIZE, LetterState, OrdleState, WORD_SIZE } from "../state";
import styles from "../styles/Home.module.css";

// for (let i = 3250; i < 3254; i++) {
//   const time = i * ONE_DAY_IN_MS;
//   const index = getWordIndexFromTimeMS(NOW_MS + time);
//   console.log(WORDS[index]);
// }

const keyboard = [
  "QWERTYUIOPÅ".split(""),
  "ASDFGHJKLÆØ".split(""),
  ["Enter", ..."ZXCVBNM".split(""), "Delete"],
];

function getClassNameFromLetterEntryState(state: LetterState) {
  switch (state) {
    case LetterState.CORRECT:
      return styles.correct;
    case LetterState.CORRECT_SPOT:
      return styles.correctSpot;
    case LetterState.INCORRECT:
      return styles.incorrect;
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
    <>
      <Head>
        <title>Ordle</title>
        <meta
          name="description"
          content="Ordle - Ordspil inspireret af Wordle"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <App />
    </>
  );
};

function createEmptyState(): OrdleState {
  return {
    history: [],
    currentAttempt: [],
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
  const [ordleState, setOrdleState] = useOrdleContext();
  const attemptsRemaining =
    (HISTORY_SIZE - ordleState.history.length) * WORD_SIZE;

  const attemptsRemainingSquares = [];
  for (let i = 0; i < attemptsRemaining; i++) {
    attemptsRemainingSquares.push(
      <Square className={getClassNameFromLetterEntryState(LetterState.DEFAULT)}>
        {" "}
      </Square>
    );
  }

  return (
    <div className={styles.display}>
      {ordleState.history.map((row, i) => (
        <>
          {row.map((letter, j) => (
            <>
              <Square
                // key={JSON.stringify(letter)}
                className={getClassNameFromLetterEntryState(letter.state)}
              >
                {letter.letter}
              </Square>
            </>
          ))}
        </>
      ))}
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
        <KeyboardRow key={index} row={row} />
      ))}
    </div>
  );
}

function KeyboardRow(props: { row: string[] }) {
  return (
    <div className={styles.keyrow}>
      {props.row.map((key, index) => (
        <KeyboardButton
          key={index}
          text={key}
          className={getClassNameFromLetterEntryState()}
          onClick={() => {}}
        />
      ))}
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
