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

export const VerseControls = ({
  tagText = "Это не поэзия",
  prevText = "сюда",
  nextText = "туда",
  onTop,
  onPrev,
  onNext,
  className,
}: VerseControlsProps) => {
  return (
    <nav className={["controlsBar", className].filter(Boolean).join(" ")}>
      <TriangleButton direction="left" onClick={onPrev} label={prevText} />
      <SquareButton onClick={onTop} text={tagText} />
      <TriangleButton direction="right" onClick={onNext} label={nextText} />
    </nav>
  );
};
