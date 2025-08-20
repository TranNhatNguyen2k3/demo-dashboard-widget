import React, { useState, useEffect } from 'react';
import WidgetRenderer from '../WidgetRenderer/WidgetRenderer';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './Dashboard.scss';

const Dashboard = () => {
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const widgetApiUrls = [
      'http://localhost:8080/api/v1/admin/widgetsBundles/b1b8b378-bf74-498d-9306-17bab2abc5bb/widgets/92c7bfd0-6bcc-4918-8728-9ccd1ca8c0d4',
      'http://localhost:8080/api/v1/admin/widgetsBundles/b1b8b378-bf74-498d-9306-17bab2abc5bb/widgets/90142b78-e8d1-43a3-b541-64f2316dcd19',
      'http://localhost:8080/api/v1/admin/widgetsBundles/b1b8b378-bf74-498d-9306-17bab2abc5bb/widgets/dcf38bc4-4a02-4373-8165-348637be64c0'
    ];

    const fetchAllWidgets = async () => {
      setLoading(true);
      setError(null);
      try {
        const widgetPromises = widgetApiUrls.map(async (url) => {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const responseData = await response.json();
          const widgetData = responseData.data;
          const templateHtml = widgetData.descriptor?.templateHtml || widgetData.templateHtml;
          if (!templateHtml) {
            throw new Error('Template HTML is empty from API');
          }
          return {
            id: widgetData.id || Math.random().toString(36).substr(2, 9),
            type: widgetData.type || 'timeseries',
            sizeX: widgetData.descriptor?.sizeX || widgetData.sizeX || 8,
            sizeY: widgetData.descriptor?.sizeY || widgetData.sizeY || 5,
            templateHtml: templateHtml,
            templateCss: widgetData.descriptor?.templateCss || '',
            controllerScript: widgetData.descriptor?.controllerScript || '',
            settingsForm: widgetData.descriptor?.settingsForm || [],
            dataKeySettingsForm: widgetData.descriptor?.dataKeySettingsForm || [],
            latestDataKeySettingsForm: widgetData.descriptor?.latestDataKeySettingsForm || [],
            settingsDirective: widgetData.descriptor?.settingsDirective || '',
            dataKeySettingsDirective: widgetData.descriptor?.dataKeySettingsDirective || '',
            latestDataKeySettingsDirective: widgetData.descriptor?.latestDataKeySettingsDirective || '',
            hasBasicMode: widgetData.descriptor?.hasBasicMode || false,
            basicModeDirective: widgetData.descriptor?.basicModeDirective || '',
            defaultConfig: widgetData.descriptor?.defaultConfig || '{}'
          };
        });
        const widgetsData = await Promise.all(widgetPromises);
        setWidgets(widgetsData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllWidgets();
  }, []);

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h2>Error Loading Dashboard</h2>
        <p>{error}</p>
        <p>Using fallback widgets...</p>
      </div>
    );
  }

  // Prepare layout for react-grid-layout
  const layout = widgets.map((widget, idx) => ({
    i: widget.id,
    x: (idx * 2) % 12, // simple spread, can be improved
    y: Math.floor(idx / 6) * (widget.sizeY || 1),
    w: widget.sizeX || 1,
    h: widget.sizeY || 1,
    minW: 1,
    minH: 1
  }));

  return (
    <div className="dashboard">
      <GridLayout
        className="dashboard-grid"
        layout={layout}
        cols={12}
        rowHeight={100}
        width={1200}
        isDraggable={true}
        isResizable={true}
      >
        {widgets.map((widget) => (
          <div key={widget.id} className="widget-item">
            <WidgetRenderer 
              widgetDescriptor={widget}
              widgetId={widget.id}
            />
          </div>
        ))}
      </GridLayout>
    </div>
  );
};

export default Dashboard;
