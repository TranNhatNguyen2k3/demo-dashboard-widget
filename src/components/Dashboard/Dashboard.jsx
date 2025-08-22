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
  const [editMode, setEditMode] = useState(false);
  const [widgetStates, setWidgetStates] = useState({});
  const [layout, setLayout] = useState([]);

  useEffect(() => {
    const widgetApiUrls = [
      'http://localhost:8080/api/v1/admin/widgetsBundles/b1b8b378-bf74-498d-9306-17bab2abc5bb/widgets/92c7bfd0-6bcc-4918-8728-9ccd1ca8c0d4',
      'http://localhost:8080/api/v1/admin/widgetsBundles/b1b8b378-bf74-498d-9306-17bab2abc5bb/widgets/5cc13754-e053-4d03-b498-cb7f0f92efbd',
      'http://localhost:8080/api/v1/admin/widgetsBundles/b1b8b378-bf74-498d-9306-17bab2abc5bb/widgets/b9773fc4-0091-47af-ba06-f2c1adb87bc4',
      'http://localhost:8080/api/v1/admin/widgetsBundles/d99ca16c-c39c-4a75-98c5-60f79bf0a7f2/widgets/02b84073-e283-47bf-a4c7-777d4b63e6aa'
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
            templateHtml,
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

  useEffect(() => {
    console.log('Widget States:', widgetStates);
  }, [widgetStates]);

  // Update layout when widgets change
  useEffect(() => {
    setLayout(
      widgets.map((widget, idx) => ({
        i: widget.id,
        x: (idx * 2) % 12,
        y: Math.floor(idx / 6) * (widget.sizeY || 1),
        w: widget.sizeX || 1,
        h: widget.sizeY || 1,
        minW: 1,
        minH: 1
      }))
    );
  }, [widgets]);

  const handleWidgetStateChange = (id, value) => {
    setWidgetStates(prev => ({ ...prev, [id]: value }));
  };

  // Handler for layout change (drag/resize)
  const handleLayoutChange = (newLayout) => {
    setLayout(newLayout);
    // Log or send to API here
    console.log('Grid Layout State:', newLayout);
    // TODO: Call API to save layout to DB
  };

  return (
    <div className="dashboard">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button
          onClick={() => setEditMode(prev => !prev)}
          style={{
            padding: '8px 16px',
            borderRadius: 4,
            background: editMode ? '#1976d2' : '#eee',
            color: editMode ? '#fff' : '#333',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          {editMode ? 'Save' : 'Edit'}
        </button>
      </div>
      <GridLayout
        className="dashboard-grid"
        layout={layout}
        cols={12}
        rowHeight={100}
        width={1200}
        isDraggable={editMode}
        isResizable={editMode}
        onLayoutChange={handleLayoutChange}
      >
        {widgets.map((widget) => (
          <div key={widget.id} className="widget-item">
            <WidgetRenderer 
              widgetDescriptor={widget}
              widgetId={widget.id}
              onWidgetStateChange={value => handleWidgetStateChange(widget.id, value)}
            />
          </div>
        ))}
      </GridLayout>
    </div>
  );
};

export default Dashboard;
