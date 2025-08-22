import React from 'react';
import './LedIndicator.scss';

const LedIndicator = ({ isOn = false, label }) => {
  return (
    <div className="led-indicator">
      <span className={`led-dot${isOn ? ' on' : ''}`} />
      {label && <span className="led-label">{label}</span>}
    </div>
  );
};

export default LedIndicator;
