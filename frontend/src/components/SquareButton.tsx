import Button from "react-bootstrap/Button";

type SquareButtonProps = {
  onClick?: () => void;
  widthVw?: number; // width in vw
  heightVh?: number; // height in vh
  text?: string;
};

export const SquareButton = ({
  onClick,
  widthVw = 5,
  heightVh = 5,
  text,
}: SquareButtonProps) => {
  return (
    <Button
      onClick={onClick}
      variant="light"
      className="d-flex align-items-center justify-content-center rounded-0"
      style={{
        width: `${widthVw}vw`,
        height: `${heightVh}vh`,
        fontWeight: 800,
        fontSize: "1rem",

        outline: "none",
        boxShadow: "none",

        backgroundColor: "var(--color-bg-main)",
        border: "2px solid var(--color-border)",
        color: "var(--color-text-main)",
      }}
    >
      {text}
    </Button>
  );
};
