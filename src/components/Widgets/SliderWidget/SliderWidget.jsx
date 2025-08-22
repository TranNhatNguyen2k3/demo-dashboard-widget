import React from 'react';
import './SliderWidget.scss';

const SliderWidget = ({ value, min = 0, max = 100, step = 1, onChange, disabled = false, label }) => {
  return (
    <div className="slider-widget">
      {label && <div className="slider-label">{label}</div>}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange && onChange(Number(e.target.value))}
        disabled={disabled}
        className="slider-input"
      />
      <div className="slider-value">{value}</div>
    </div>
  );
};

export default SliderWidget;
