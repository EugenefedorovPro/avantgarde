import axios from "axios";
import { urlVerse } from "./urls";

export interface VerseInterface {
  html_name: string;
  title: string;
  text: string;
  date_of_writing: string;
}

export const verse = async (
  status: string = "current"
): Promise<VerseInterface | null> => {

  const html_name: string | null = localStorage.getItem("html_name") ?? "verse_avantgarde_at_war";
  
  const url = urlVerse + `${html_name}/` + `${status}/`;

  try {
    const { data } = await axios(url);

    // set the current unique html_name of the verse
    // for user to go back and forward across verses
    console.log(`data.html_name in verse.ts = ${data.html_name}`);
    localStorage.setItem("html_name", data.html_name);

    return data;
  } catch (e) {
    console.error("Error in verse.ts:");
    console.error(e);
    return null;
  }
};
