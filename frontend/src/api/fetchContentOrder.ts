import axios from "axios";
import { urlContentOrder } from "./urls";

export interface ContentOrderInterface {
  pk: string;
  order: string;
  content: string;
}

export const fetchContentOrder = async (
  passedOrder: string,
  passedNew: string
): Promise<ContentOrderInterface> => {
  const url: string = urlContentOrder + passedOrder + "/" + passedNew + "/";
  try {
    const { data } = await axios.get(url);
    return data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
