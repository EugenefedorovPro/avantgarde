import type { ReactNode } from "react";
import type { AudioType } from "../api/verse";
import { baseUrl } from "../api/urls";

type AudioBoxProps = {
  audio: AudioType;
  children?: ReactNode;
};

export const AudioBox: React.FC<AudioBoxProps> = ({ audio, children }) => {
  const audioUrl = `${baseUrl}${audio.audio}`;

  return (
    <div className="audio-box">
      <div className="audio-frame">
        <audio className="square-audio" controls preload="metadata">
          <source src={audioUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      </div>

      {children && <div className="mt-3">{children}</div>}
    </div>
  );
};
