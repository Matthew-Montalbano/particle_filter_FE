import React from "react";

import "./styles.css";

interface ToggleMessageProps {
  children: React.ReactNode;
  visible: boolean;
  style?: string;
}

enum ToggleMessageStyles {
  SUCCESS = "success",
  ERROR = "error",
}

const ToggleMessage = ({ children, visible, style }: ToggleMessageProps) => {
  const getStyle = (): string => {
    switch (style) {
      case ToggleMessageStyles.SUCCESS:
        return "success-message";
      case ToggleMessageStyles.ERROR:
        return "error-message";
      default:
        return "default-message";
    }
  };
  return !visible ? null : (
    <div className={"toggle-message " + getStyle()}>{children}</div>
  );
};

export default ToggleMessage;
