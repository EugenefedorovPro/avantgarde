import axios from "axios";
import { urlRandVerse } from "./urls";

export interface RandVerseInterface {
  rand_verse: Record<string, string>;
  herm: string
}



export const randVerse = async (): Promise<RandVerseInterface> => {
  try {
    const { data } = await axios.get(urlRandVerse);
    return data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
