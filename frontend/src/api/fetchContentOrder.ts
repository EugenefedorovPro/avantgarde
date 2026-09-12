import axios from "axios";
import { urlContentOrder } from "./urls";

export interface ContentOrderInterface {
  pk: number;
  order: number;
  content: "verse" | "reclamation" | "neologizm" | "rand_verse" | "print_copy";
  html_name: string;
}

export type ContentDirection = "prev" | "next";

export const fetchContentOrder = async (
  htmlName: string,
  dir: ContentDirection
): Promise<ContentOrderInterface> => {
  const url: string = `${urlContentOrder}${encodeURIComponent(htmlName)}/${encodeURIComponent(dir)}/`;
  const { data } = await axios.get(url);
  return data as ContentOrderInterface;
};
