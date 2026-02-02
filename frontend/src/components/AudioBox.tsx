// components/AudioBox.tsx
import type { ReactNode } from "react";
import type { AudioType } from "../api/verse";
import { baseUrl } from "../api/urls";

type AudioBoxProps = {
  audio: AudioType;
  children?: ReactNode;
};

export const AudioBox = ({ audio, children }: AudioBoxProps): JSX.Element => {
  const audioUrl = `${baseUrl}${audio.audio}`;

  return (
    <section className="audio-box">
      <div className="audio-frame">
        <audio
          className="square-audio"
          controls
          preload="metadata"
          aria-label="Audio player"
        >
          <source src={audioUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      </div>

      {children && <div className="mt-3">{children}</div>}
    </section>
  );
};
