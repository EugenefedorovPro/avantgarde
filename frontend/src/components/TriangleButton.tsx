import React from "react";

type TriangleButtonProps = {
  direction: "left" | "right";
  onClick?: () => void;
  label?: string;       // optional accessible label
  disabled?: boolean;
};

export const TriangleButton: React.FC<TriangleButtonProps> = ({
  direction,
  onClick,
  label,
  disabled,
}) => {
  const ariaLabel =
    label ?? (direction === "left" ? "Previous" : "Next");

  return (
    <button
      type="button"
      className={`tri-btn tri-btn--${direction}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      title={ariaLabel}
    />
  );
};

