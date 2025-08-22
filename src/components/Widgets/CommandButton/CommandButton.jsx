import React from 'react';
import './CommandButton.scss';

const CommandButton = ({ label = 'Command', onClick, disabled = false, loading = false }) => {
  return (
    <button className="command-button" onClick={onClick} disabled={disabled || loading}>
      {loading ? <span className="command-spinner" /> : null}
      <span className="command-label">{label}</span>
    </button>
  );
};

export default CommandButton;
