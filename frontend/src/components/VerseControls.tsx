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
  className = "",
}) => {
  return (
    <div className={className}>
      <Row className="w-100 g-0">
        <Col className="d-flex align-items-center justify-content-between w-100">
          <TriangleButton direction="left" onClick={onPrev} label={prevText} />
          <SquareButton onClick={onTop} text={tagText} />
          <TriangleButton direction="right" onClick={onNext} label={nextText} />
        </Col>
      </Row>
    </div>
  );
};
