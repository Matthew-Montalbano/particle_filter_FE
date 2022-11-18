import React from "react";

import "./styles.css";

interface CheckboxProps {
  title?: string;
  active: boolean;
  onClick: React.MouseEventHandler;
}

const CheckBox = ({ title, active, onClick }: CheckboxProps) => {
  return (
    <div className="checkbox-container">
      <div className="checkbox-box" onClick={onClick}>
        <div className={active ? "checkbox-active" : ""} />
      </div>
      <label className="checkbox-label" onClick={onClick}>
        {title}
      </label>
    </div>
  );
};

export default CheckBox;
