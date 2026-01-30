import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import ReactMarkdown from "react-markdown";
import { SquareButton } from "./SquareButton";

type VerseBoxProps = {
  titleMd?: string;
  textMd?: string;

  author?: string;

  tag1Text?: string;
  tag2Text?: string;
  tag3Text?: string;

  prevText?: string;
  nextText?: string;

  onHemr?: () => void;
  onVoice?: () => void;

  onPrev?: () => void;
  onNext?: () => void;

  buttonWidthVw?: number;
  buttonHeightVh?: number;

  className?: string;
};

export const VerseBox: React.FC<VerseBoxProps> = ({
  titleMd,
  textMd,
  author = "Евгений Проскуликов",

  tag1Text = "голос",
  tag2Text = "герменевтика",
  tag3Text = "Это не поэзия",

  prevText = "сюда",
  nextText = "туда",

  onPrev,
  onNext,

  buttonWidthVw = 90,
  buttonHeightVh = 5,

  className = "verseBox",
}) => {
  return (
    <Container className={className}>
      <Row>
        <Col>
          <ReactMarkdown>{titleMd}</ReactMarkdown>
        </Col>
      </Row>

      <Row>
        <Col>
          <ReactMarkdown>{textMd}</ReactMarkdown>
        </Col>
      </Row>

      <Row>
        <div className="text-end fst-italic">{author}</div>
      </Row>

      <Row>
        <Col className="mt-5 d-flex justify-content-center">
          <SquareButton
            widthVw={buttonWidthVw}
            heightVh={buttonHeightVh}
            text={tag1Text}
          />
        </Col>
      </Row>

      <Row>
        <Col className="mt-1 d-flex justify-content-center">
          <SquareButton
            widthVw={buttonWidthVw}
            heightVh={buttonHeightVh}
            text={tag2Text}
          />
        </Col>
      </Row>

      <Row>
        <Col className="mt-1 d-flex justify-content-center">
          <SquareButton
            widthVw={buttonWidthVw}
            heightVh={buttonHeightVh}
            text={tag3Text}
          />
        </Col>
      </Row>

      <Row>
        <Col className="d-flex justify-content-between mt-1 mb-3">
          <SquareButton
            onClick={onPrev}
            widthVw={buttonWidthVw}
            heightVh={buttonHeightVh}
            text={prevText}
          />
          <SquareButton
            onClick={onNext}
            widthVw={buttonWidthVw}
            heightVh={buttonHeightVh}
            text={nextText}
          />
        </Col>
      </Row>
    </Container>
  );
};
