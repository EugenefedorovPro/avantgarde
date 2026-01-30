import axios from "axios";
import { urlHerm } from "./urls";

export const herm = async () => {
  try {
    const { data } = await axios(urlHerm);
    return data;
  } catch (e) {
    console.log(e);
    throw e;
  }
};
