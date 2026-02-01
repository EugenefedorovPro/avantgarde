import type { ReactNode } from "react";
import { Container, Row, Col } from "react-bootstrap";
import type { AudioType } from "../api/verse";
import { baseUrl } from "../api/urls";
import "./AudioBox.css";

type AudioBoxProps = {
  audio: AudioType;
  children?: ReactNode;
};

export const AudioBox: React.FC<AudioBoxProps> = ({ audio, children }) => {
  const audioUrl = `${baseUrl}${audio.audio}`;

  return (
    <Container className="audio-box">
      {/* Audio player */}
      <Row>
        <Col className="">
          <div className="audio-frame">
            <audio className="square-audio" controls preload="metadata">
              <source src={audioUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        </Col>
      </Row>

      {children && (
        <Row className="mt-3">
          <Col>{children}</Col>
        </Row>
      )}
    </Container>
  );
};
