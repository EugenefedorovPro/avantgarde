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
      className="d-flex align-items-center justify-content-center m-1 p-0 rounded-0"
      style={{
        width: `${widthVw}vw`,
        height: `${heightVh}vh`,
        fontWeight: 800,
        fontSize: "1rem",

        outline: "none",
        boxShadow: "none",

        backgroundColor: "#0E0E0E",
        border: "2px solid #2A2A2A",
        color: "#EAEAEA",
      }}
    >
      {text}
    </Button>
  );
};
