import Button from "react-bootstrap/Button";

type SquareButtonProps = {
  onClick?: () => void;
  text?: string;
  disabled?: boolean;
  kind?: "default" | "wide" | "square";
};

export const SquareButton = ({
  onClick,
  text = "",
  disabled,
  kind = "default",
}: SquareButtonProps) => (
  <Button
    type="button"
    onClick={onClick}
    disabled={disabled}
    variant="light"
    className={`u-btn ${kind === "wide" ? "u-btn--wide" : ""} ${
      kind === "square" ? "u-btn--square" : ""
    }`}
  >
    {text}
  </Button>
);
