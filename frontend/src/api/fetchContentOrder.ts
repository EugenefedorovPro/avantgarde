import axios from "axios";
import { urlContentOrder } from "./urls";

export interface ContentOrderInterface {
  pk: string;
  order: string;
  content: string;   // "verse" | "reclamation" | "neologizm" | "rand_verse" | "print_copy"
  html_name: string; // slug
}

export const fetchContentOrder = async (
  htmlName: string,
  dir: string
): Promise<ContentOrderInterface> => {
  const url: string = `${urlContentOrder}${encodeURIComponent(htmlName)}/${dir}/`;
  const { data } = await axios.get(url);
  return data as ContentOrderInterface;
};
