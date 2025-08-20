import React from 'react';
import './WidgetContainer.scss';

const WidgetContainer = ({ 
  children, 
  widgetId, 
  config, 
  sizeX = 1, 
  sizeY = 1,
  className = '' 
}) => {
  const containerStyle = {
    backgroundColor: config?.backgroundColor || '#fff',
    color: config?.color || 'rgba(0, 0, 0, 0.87)',
    padding: config?.padding || '12px',
    borderRadius: config?.borderRadius || '4px'
  };

  return (
    <div 
      className={`widget-container ${className}`}
      style={containerStyle}
      data-widget-id={widgetId}
    >
      {config?.showTitle && config?.title && (
        <div className="widget-title">
          <h3>{config.title}</h3>
        </div>
      )}
      <div className="widget-content">
        {children}
      </div>
    </div>
  );
};

export default WidgetContainer;
