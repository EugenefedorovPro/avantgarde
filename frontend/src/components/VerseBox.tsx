import React from "react";
import type { ReactNode } from "react";
import { Container, Row, Col } from "react-bootstrap";
import ReactMarkdown from "react-markdown";

type VerseBoxProps = {
  titleMd?: string;
  textMd?: string;
  className?: string;

  childrenTop?: ReactNode;
  childrenBottom?: ReactNode;
};

export const VerseBox: React.FC<VerseBoxProps> = ({
  titleMd,
  textMd,
  className = "verseBox",
  childrenTop,
  childrenBottom,
}) => {
  return (
    <Container className={className}>
      {/* Title */}
      <Row>
        <Col className="mb-2">
          <h5>{titleMd}</h5>
        </Col>
      </Row>

      {/* Text */}
      <Row>
        <Col>
          <ReactMarkdown>{textMd}</ReactMarkdown>
        </Col>
      </Row>

      {/* Author */}
      <Row>{childrenTop && <Row className="mt-1">{childrenTop}</Row>}</Row>

      {/* Bottom slot */}
      {childrenBottom && <Row className="mt-1">{childrenBottom}</Row>}
    </Container>
  );
};
