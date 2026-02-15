import axios from "axios";
import { urlNeologizm } from "./urls";

export type YearType = {
  pk: number;
  word_of_year: string | null;
  year: string;
};

export type HermType = {
  pk: number;
  title: string;
  text: string;
};

export interface NeologizmInterface {
  harmony_words: string[];
  disharmony_words: string[];
  spontaneity_words: string[];

  years: YearType[];

  herm: HermType | null;
}

export const neologizm = async (): Promise<NeologizmInterface> => {
  try {
    const { data } = await axios.get(urlNeologizm);
    return data as NeologizmInterface;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
