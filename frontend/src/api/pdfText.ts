import axios from "axios";
import { urlPdfText } from "./urls";

export type TextType = {
  pk: number;
  title: string;
  text: string;
};

export interface PdfTextInterface {
  herm: TextType;
}

export const pdfText= async (): Promise<PdfTextInterface> => {
  try {
    const { data } = await axios.get(urlPdfText);
    return data as PdfTextInterface;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

