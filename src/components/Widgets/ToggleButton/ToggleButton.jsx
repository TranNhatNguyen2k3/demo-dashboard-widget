import React from 'react';
import './ToggleButton.scss';

const ToggleButton = ({ checked, onChange, labelOn = 'On', labelOff = 'Off', disabled = false }) => {
  return (
    <button
      className={`toggle-button${checked ? ' checked' : ''}`}
      onClick={() => !disabled && onChange && onChange(!checked)}
      disabled={disabled}
    >
      <span className="toggle-indicator" />
      <span className="toggle-label">{checked ? labelOn : labelOff}</span>
    </button>
  );
};

export default ToggleButton;
