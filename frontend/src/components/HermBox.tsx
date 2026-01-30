import React from "react";
import ReactMarkdown from "react-markdown";
import type { HermType } from "../api/verse";

type HermBoxProps = {
  herm: HermType;
};

export const HermBox: React.FC<HermBoxProps> = ({ herm }) => {
  return (
    <div className="herm-box p-3">
      <h4 className="mb-3">{herm.title}</h4>

      <div className="herm-text">
        <ReactMarkdown>{herm.text}</ReactMarkdown>
      </div>
    </div>
  );
};
