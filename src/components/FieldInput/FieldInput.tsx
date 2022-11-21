import React from "react";
import ToggleMessage from "../ToggleMessage/ToggleMessage";

import "./styles.css";

interface FieldInputProps {
  label: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  errorMessage?: string;
  defaultValue?: string | number;
}

const FieldInput = ({
  label,
  onChange,
  errorMessage,
  defaultValue,
}: FieldInputProps) => {
  const getDefaultValue = (): string => {
    if (defaultValue == undefined) {
      return "";
    } else if (typeof defaultValue == "number" && isNaN(defaultValue)) {
      return "";
    } else {
      return defaultValue.toString();
    }
  };

  return (
    <div className="field-input-container">
      <label className="field-label">{label}</label>
      <div className="field-input-div">
        <input
          defaultValue={getDefaultValue()}
          className="field-input"
          onChange={onChange}
        />
      </div>
      {errorMessage !== undefined ? (
        <ToggleMessage visible={errorMessage !== ""} style="error">
          {errorMessage}
        </ToggleMessage>
      ) : null}
    </div>
  );
};

export default FieldInput;
