import React from 'react';
import { useWidgetRenderer } from '../../hooks/useWidgetRenderer';
import { WIDGET_COMPONENTS, WIDGET_TYPES } from '../../constants/widgetTypes';
import WidgetContainer from '../Common/WidgetContainer/WidgetContainer';
import LoadingSpinner from '../Common/LoadingSpinner/LoadingSpinner';
import './WidgetRenderer.scss';

const WidgetRenderer = ({ widgetDescriptor, widgetId }) => {
  const { widgetData, loading, error } = useWidgetRenderer(widgetDescriptor);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <WidgetContainer widgetId={widgetId} config={{}}>
        <div className="widget-error">
          <h3>Widget Error</h3>
          <p>{error}</p>
        </div>
      </WidgetContainer>
    );
  }

  if (!widgetData) {
    return null;
  }

  // Determine widget type from templateHtml selector if available
  let widgetType = widgetData.type;
  if (widgetDescriptor?.templateHtml) {
    // Extract selector from templateHtml
    const match = widgetDescriptor.templateHtml.match(/tb-[\w-]+-widget/);
    if (match && WIDGET_TYPES[match[0]]) {
      widgetType = WIDGET_TYPES[match[0]];
    }
  }
  const WidgetComponent = WIDGET_COMPONENTS[widgetType];

  if (!WidgetComponent) {
    return (
      <WidgetContainer widgetId={widgetId} config={{}}>
        <div className="widget-error">
          <h3>Widget Error</h3>
          <p>Widget type '{widgetData.type}' not supported</p>
        </div>
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer
      widgetId={widgetId}
      config={widgetData.config}
      sizeX={widgetDescriptor.sizeX}
      sizeY={widgetDescriptor.sizeY}
    >
      <div className="widget-renderer-root">
        <WidgetComponent
          ctx={widgetData.config}
          templateHtml={widgetData.templateHtml}
          templateCss={widgetData.templateCss}
        />
      </div>
    </WidgetContainer>
  );
};

export default WidgetRenderer;
