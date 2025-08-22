import React from 'react';
import './ActionButton.scss';

const ActionButton = ({ label = 'Action', onClick, disabled = false, icon }) => {
  return (
    <button className="action-button" onClick={onClick} disabled={disabled}>
      {icon && <span className="action-button-icon">{icon}</span>}
      <span className="action-button-label">{label}</span>
    </button>
  );
};

export default ActionButton;
