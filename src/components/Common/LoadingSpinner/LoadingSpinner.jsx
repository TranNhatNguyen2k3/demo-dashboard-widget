import React from 'react';
import './LoadingSpinner.scss';

const LoadingSpinner = ({ size = 'medium' }) => {
  return (
    <div className={`loading-spinner ${size}`}>
      <div className="spinner"></div>
      <p>Loading widget...</p>
    </div>
  );
};

export default LoadingSpinner;
