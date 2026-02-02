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

  onTag1?: () => void;
  onTag2?: () => void;
  onTag3?: () => void;

  onPrev?: () => void;
  onNext?: () => void;

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

  onTag1,
  onTag2,
  onTag3,
  onPrev,
  onNext,

  className = "verseBox",
}) => {
  return (
    <Container className={className}>
      {titleMd && (
        <Row>
          <Col>
            <ReactMarkdown>{titleMd}</ReactMarkdown>
          </Col>
        </Row>
      )}

      {textMd && (
        <Row>
          <Col>
            <ReactMarkdown>{textMd}</ReactMarkdown>
          </Col>
        </Row>
      )}

      <Row>
        <Col className="text-end fst-italic">{author}</Col>
      </Row>

      <Row className="mt-5">
        <Col className="d-flex justify-content-center">
          <SquareButton onClick={onTag1} text={tag1Text} />
        </Col>
      </Row>

      <Row className="mt-1">
        <Col className="d-flex justify-content-center">
          <SquareButton onClick={onTag2} text={tag2Text} />
        </Col>
      </Row>

      <Row className="mt-1">
        <Col className="d-flex justify-content-center">
          <SquareButton onClick={onTag3} text={tag3Text} />
        </Col>
      </Row>

      <Row className="mt-1 mb-3">
        <Col className="d-flex justify-content-between">
          <SquareButton onClick={onPrev} text={prevText} kind="square" />
          <SquareButton onClick={onNext} text={nextText} kind="square" />
        </Col>
      </Row>
    </Container>
  );
};
