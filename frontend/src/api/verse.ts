import axios from "axios";
import { urlVerse } from "./urls";

export type VerseType = {
  pk: number;
  order: number | null;
  html_name: string;
  title: string | null;
  text: string | null;
  date_of_writing: string | null;
};

export type HermType = {
  pk: number;
  html_name: string | null;
  title: string | null;
  text: string;
  date_of_writing: string | null;
};

export type AudioType = {
  pk: number;
  audio: string | null;
  html_name: string | null;
};

export interface VerseInterface {
  verse: VerseType;
  herm: HermType | null;
  audio: AudioType | null;
}

export const verse = async (
  htmlName: string = "noHtmlName"
): Promise<VerseInterface | null> => {
  const url = urlVerse + `${htmlName}/`;

  try {
    const { data } = await axios(url);
    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};
