import React, { useState } from 'react';
import './PowerButton.scss';

const PowerButton = ({ defaultOn = false, disabled = false, onChange }) => {
  const [isOn, setIsOn] = useState(defaultOn);
  const handleClick = () => {
    if (disabled) return;
    setIsOn((prev) => {
      const next = !prev;
      if (onChange) onChange(next);
      return next;
    });
  };
  return (
    <button
      className={`power-button${isOn ? ' on' : ''}`}
      onClick={handleClick}
      disabled={disabled}
      aria-pressed={isOn}
    >
      <span className="power-icon">&#x23FB;</span>
      <span className="power-label">{isOn ? 'ON' : 'OFF'}</span>
    </button>
  );
};

export default PowerButton;
