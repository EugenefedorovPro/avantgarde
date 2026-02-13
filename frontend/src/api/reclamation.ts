import axios from "axios";
import { urlReclamation } from "./urls";

// {'answer': {'pk': 1, 'text': 'answer_1 to reclamation_1', 'repeat': 10},
//  'reclamation': {'pk': 1, 'text': 'reclamation_1', 'html_name': 'html_name_reclamation_1'}}

export type AnswerType = {
  pk: number;
  text: string;
  repeat: number;
};

export type ReclamationType = {
  pk: number;
  text: string;
  html_name: string;
};

export interface ReclamationInterface {
  answer: AnswerType;
  reclamation: ReclamationType;
}

export const reclamationRandomApi = async (): Promise<ReclamationInterface> => {
  try {
    const { data } = await axios.get(urlReclamation);
    return data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export const reclamationByNameApi = async (
  htmlName: string
): Promise<ReclamationInterface> => {
  const { data } = await axios.get(
    `${urlReclamation}${encodeURIComponent(htmlName)}/`
  );
  return data;
};
