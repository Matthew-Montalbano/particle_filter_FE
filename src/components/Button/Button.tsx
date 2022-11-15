import React from "react";
import "./styles.css";

const STYLES = ["btn--green", "btn--pink", "btn--blue"];
interface ButtonProps {
  children?: React.ReactNode;
  type?: "submit" | "reset" | "button";
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  buttonStyle: string;
}

const Button = ({
  children,
  type,
  onClick,
  buttonStyle,
}: ButtonProps): JSX.Element => {
  const checkButtonStyle = STYLES.includes(buttonStyle)
    ? buttonStyle
    : STYLES[0];

  return (
    <button
      className={`custombtn ${checkButtonStyle}`}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
};

export default Button;
