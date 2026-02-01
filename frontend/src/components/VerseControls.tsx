import React from "react";
import { Row, Col } from "react-bootstrap";
import { SquareButton } from "./SquareButton";

type VerseControlsProps = {
  tagText?: string;

  prevText?: string;
  nextText?: string;

  onPrev?: () => void;
  onNext?: () => void;

  buttonWidthVw?: number;
  buttonHeightVh?: number;

  className?: string;
};

export const VerseControls: React.FC<VerseControlsProps> = ({
  tagText = "Это не поэзия",
  prevText = "сюда",
  nextText = "туда",
  onPrev,
  onNext,
  buttonWidthVw,
  buttonHeightVh,
  className,
}) => {
  return (
    <div className={className}>
      <Row>
        <Col className="d-flex justify-content-center">
          <SquareButton
            widthVw={buttonWidthVw}
            heightVh={buttonHeightVh}
            text={tagText}
          />
        </Col>
      </Row>

      <Row>
        <Col className="d-flex justify-content-between">
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
    </div>
  );
};
