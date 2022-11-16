import React from "react";

import "./styles.css";

interface ErrorMessageProps {
  children: React.ReactNode;
  visible: boolean;
}

const ErrorMessage = ({ children, visible }: ErrorMessageProps) => {
  return !visible ? null : <div className="error-message">{children}</div>;
};

export default ErrorMessage;
