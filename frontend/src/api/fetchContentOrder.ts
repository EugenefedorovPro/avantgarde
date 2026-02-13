import axios from "axios";
import { urlContentOrder } from "./urls";

export interface ContentOrderInterface {
  pk: string;
  order: string;
  content: string;
  html_name: string;
}

export const fetchContentOrder = async (
  htmlName: string,
  dir: string
): Promise<ContentOrderInterface> => {
  const url: string = urlContentOrder + htmlName + "/" + dir + "/";
  console.log(`url=${url}`);
  try {
    const { data } = await axios.get(url);
    return data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
