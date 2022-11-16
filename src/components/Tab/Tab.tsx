import React from "react";

import "./styles.css";

interface TabProps {
  children: React.ReactNode;
  onClick: React.MouseEventHandler<HTMLDivElement>;
  active: boolean;
}

const Tab = ({ children, onClick, active }: TabProps) => {
  return (
    <div className={`tab ${active ? "active" : ""}`} onClick={onClick}>
      {children}
    </div>
  );
};

export default Tab;
