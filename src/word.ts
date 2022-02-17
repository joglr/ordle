import WORDS from "../words.json";

const NOW_MS = new Date().getTime();
export const getWordIndexFromTimeMS = (timeMS: number) => {
  return Math.floor((timeMS - START_TIME_MS) / ONE_DAY_IN_MS) % WORDS.length;
};

const START_TIME = new Date("Fri Jan 14 2022 00:00:00 GMT+0100");
const START_TIME_MS = START_TIME.getTime();
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

export function getTodaysWord() {
  return WORDS[getWordIndexFromTimeMS(NOW_MS)];
}

export function getTodaysWordExpiry() {
  const wordIndex = getWordIndexFromTimeMS(NOW_MS);
  const expiry = new Date(START_TIME_MS + (wordIndex + 1) * ONE_DAY_IN_MS);
  return expiry;
}

export function isWord(word: string) {
  return WORDS.includes(word);
}
