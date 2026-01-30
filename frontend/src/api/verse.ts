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
  status: string = "current"
): Promise<VerseInterface | null> => {
  const DefaultVerseOrder: string = "0";

  const verseOrder: string | null =
    localStorage.getItem("verseOrder") ?? DefaultVerseOrder;

  const url = urlVerse + `${verseOrder}/` + `${status}/`;

  try {
    const { data } = await axios(url);

    // set the current unique html_name of the verse
    // for user to go back and forward across verses
    localStorage.setItem("verseOrder", data.verse.order);
    console.log(data);

    return data;
  } catch (e: any) {
    console.error("Error in verse.ts:");
    console.error(e);
    return null;
  }
};
