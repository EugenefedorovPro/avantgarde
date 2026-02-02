import axios from "axios";
import { urlVerse } from "./urls";

export type VerseType = {
  pk: number;
  order: number;
  html_name: string;
  title: string;
  text: string;
  date_of_writing: string;
};

export type HermType = {
  pk: number;
  html_name: string;
  title: string;
  text: string;
  date_of_writing: string;
};

export type AudioType = {
  pk: number;
  audio: string;
  html_name: string;
};

export interface VerseInterface {
  verse: VerseType;
  herm: HermType;
  audio: AudioType;
}

export const verse = async (
  status: string = "current",
  verseOrder: string = "0"
): Promise<VerseInterface | null> => {
  const url = urlVerse + `${verseOrder}/` + `${status}/`;
  console.log(url);

  try {
    const { data } = await axios(url);

    // set the current unique html_name of the verse
    // for user to go back and forward across verses
    localStorage.setItem("verseOrder", data.verse.order);
    console.log(`new_verse_order = ${localStorage.getItem("verseOrder")}`);

    return data;
  } catch (e: any) {
    console.error("Error in verse.ts:");
    console.error(e);
    return null;
  }
};
