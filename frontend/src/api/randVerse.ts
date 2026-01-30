import axios from "axios";
import { urlRandVerse } from "./urls";

export const randVerse = async (): Promise<Record<string, string>> => {
  try {
    const { data } = await axios.get(urlRandVerse);
    return data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
