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
  verseOrder: string = "0"
): Promise<VerseInterface | null> => {
  const url = urlVerse + `${verseOrder}/`;
  console.log(url);

  try {
    const { data } = await axios(url);
    return data;
  } catch (e: any) {
    console.error("Error in verse.ts:");
    console.error(e);
    return null;
  }
};
