import React from "react";
import { Row, Col } from "react-bootstrap";
import { SquareButton } from "./SquareButton";
import { TriangleButton } from "./TriangleButton";

type VerseControlsProps = {
  tagText?: string;

  prevText?: string;
  nextText?: string;

  onTop?: () => void;
  onPrev?: () => void;
  onNext?: () => void;

  className?: string;
};

export const VerseControls: React.FC<VerseControlsProps> = ({
  tagText = "Это не поэзия",
  prevText = "сюда",
  nextText = "туда",
  onTop,
  onPrev,
  onNext,
  className,
}) => {
  return (
    <div className={className}>
      <Row className="align-items-center">
        <Col xs="auto" className="d-flex justify-content-start">
          <TriangleButton direction="left" onClick={onPrev} label={prevText} />
        </Col>

        <Col className="d-flex justify-content-center">
          <SquareButton onClick={onTop} text={tagText} />
        </Col>

        <Col xs="auto" className="d-flex justify-content-end">
          <TriangleButton direction="right" onClick={onNext} label={nextText} />
        </Col>
      </Row>
    </div>
  );
};
