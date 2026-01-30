import React from "react";
import type { AudioType } from "../api/verse";
import { baseUrl } from "../api/urls";

type AudioBoxProps = {
  audio: AudioType;
};

export const AudioBox: React.FC<AudioBoxProps> = ({ audio }) => {
  const audioUrl: string = `${baseUrl}${audio.audio}`;
  return (
    <div className="audio-box p-3">
      <audio controls preload="metadata" style={{ width: "100%" }}>
        <source src={audioUrl} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};
