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
    const now = 1690000000000; // timestamp cố định
    const widgetsData = [
      // Row 1: Header widgets - Temperature & Humidity monitoring
      {
        id: 'realtime-demo',
        name: 'Temperature & Humidity Monitor',
        type: 'RealTimeDemo',
        sizeX: 6,
        sizeY: 8,
        templateHtml: '<tb-real-time-demo-widget></tb-real-time-demo-widget>',
        templateCss: '',
        controllerScript: '',
        settingsDirective: '',
        basicModeDirective: '',
        dataKeySettingsDirective: '',
        hasBasicMode: false,
        defaultConfig: JSON.stringify({
          datasources: [
            {
              type: 'device',
              deviceId: 'device_001',
              dataKeys: [
                { name: 'temperature', label: 'Temperature', color: '#ff6384' },
                { name: 'humidity', label: 'Humidity', color: '#36a2eb' }
              ]
            }
          ],
          title: 'Temperature & Humidity Monitor',
          showTitle: true,
          settings: {},
          timewindow: {},
          backgroundColor: 'rgba(248, 249, 250, 0.95)',
          color: 'rgba(0, 0, 0, 0.87)',
          padding: '0px',
          units: '',
          decimals: 2,
          dropShadow: true,
          enableFullscreen: true
        })
      },
      {
        id: 'power-consumption',
        name: 'Power Consumption Monitor',
        type: 'PowerConsumption',
        sizeX: 6,
        sizeY: 8,
        templateHtml: '<tb-power-consumption-widget></tb-power-consumption-widget>',
        templateCss: '',
        controllerScript: '',
        settingsDirective: '',
        basicModeDirective: '',
        dataKeySettingsDirective: '',
        hasBasicMode: false,
        defaultConfig: JSON.stringify({
          datasources: [
            {
              type: 'device',
              deviceId: 'power_meter',
              dataKeys: [
                { name: 'voltage', label: 'Voltage', color: '#ff6384' },
                { name: 'current', label: 'Current', color: '#36a2eb' },
                { name: 'power', label: 'Power', color: '#4bc0c0' },
                { name: 'energy', label: 'Energy', color: '#ffcd56' },
                { name: 'cost', label: 'Cost', color: '#9c27b0' }
              ]
            }
          ],
          title: 'Power Consumption Monitor',
          showTitle: true,
          settings: {},
          timewindow: {},
          backgroundColor: 'rgba(102, 126, 234, 0.95)',
          color: 'rgba(255, 255, 255, 0.95)',
          padding: '0px',
          units: '',
          decimals: 2,
          dropShadow: true,
          enableFullscreen: true
        })
      },
      {
        id: 'realtime-chart',
        name: 'Real-Time Temperature Chart',
        type: 'TimeSeriesChart',
        sizeX: 4,
        sizeY: 8,
        templateHtml: '<tb-time-series-chart-widget [ctx]="ctx"></tb-time-series-chart-widget>',
        templateCss: '',
        controllerScript: '',
        settingsDirective: '',
        basicModeDirective: '',
        dataKeySettingsDirective: '',
        hasBasicMode: false,
        defaultConfig: JSON.stringify({
          datasources: [
            {
              type: 'device',
              deviceId: 'device_001',
              dataKeys: [
                {
                  name: 'temperature',
                  label: 'Temperature (°C)',
                  color: '#ff6384',
                  settings: { type: 'line', showInLegend: true },
                  data: []
                },
                {
                  name: 'humidity',
                  label: 'Humidity (%)',
                  color: '#36a2eb',
                  settings: { type: 'line', showInLegend: true },
                  data: []
                }
              ]
            }
          ],
          title: 'Real-Time Temperature & Humidity',
          showTitle: true,
          settings: {
            showLegend: true,
            showTooltip: true,
            dataZoom: true
          },
          timewindow: {},
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          color: 'rgba(0, 0, 0, 0.87)',
          padding: '0px',
          units: '',
          decimals: 2,
          dropShadow: true,
          enableFullscreen: true
        })
      },

      // // Row 2: Power monitoring widgets
      // {
      //   id: 'power-meter-demo',
      //   name: 'Power Meter Monitor',
      //   type: 'RealTimeDemo',
      //   sizeX: 6,
      //   sizeY: 6,
      //   templateHtml: '<tb-real-time-demo-widget></tb-real-time-demo-widget>',
      //   templateCss: '',
      //   controllerScript: '',
      //   settingsDirective: '',
      //   basicModeDirective: '',
      //   dataKeySettingsDirective: '',
      //   hasBasicMode: false,
      //   defaultConfig: JSON.stringify({
      //     datasources: [
      //       {
      //         type: 'device',
      //         deviceId: 'device_003',
      //         dataKeys: [
      //           { name: 'voltage', label: 'Voltage (V)', color: '#ff6384' },
      //           { name: 'current', label: 'Current (A)', color: '#36a2eb' },
      //           { name: 'power', label: 'Power (kW)', color: '#4bc0c0' }
      //         ]
      //       }
      //     ],
      //     title: 'Power Meter Real-Time',
      //     showTitle: true,
      //     settings: {},
      //     timewindow: {},
      //     backgroundColor: 'rgba(255, 255, 255, 0.95)',
      //     color: 'rgba(0, 0, 0, 0.87)',
      //     padding: '0px',
      //     units: '',
      //     decimals: 2,
      //     dropShadow: true,
      //     enableFullscreen: true
      //   })
      // },
      // {
      //   id: 'water-flow-demo',
      //   name: 'Water Flow Monitor',
      //   type: 'RealTimeDemo',
      //   sizeX: 6,
      //   sizeY: 6,
      //   templateHtml: '<tb-real-time-demo-widget></tb-real-time-demo-widget>',
      //   templateCss: '',
      //   controllerScript: '',
      //   settingsDirective: '',
      //   basicModeDirective: '',
      //   dataKeySettingsDirective: '',
      //   hasBasicMode: false,
      //   defaultConfig: JSON.stringify({
      //     datasources: [
      //       {
      //         type: 'device',
      //         deviceId: 'device_004',
      //         dataKeys: [
      //           { name: 'flow_rate', label: 'Flow Rate (L/min)', color: '#ff6384' },
      //           { name: 'total_volume', label: 'Total Volume (L)', color: '#36a2eb' },
      //           { name: 'pump_status', label: 'Pump Status', color: '#4bc0c0' }
      //         ]
      //       }
      //     ],
      //     title: 'Water Flow Real-Time',
      //     showTitle: true,
      //     settings: {},
      //     timewindow: {},
      //     backgroundColor: 'rgba(240, 248, 255, 0.95)',
      //     color: 'rgba(0, 0, 0, 0.87)',
      //     padding: '0px',
      //     units: '',
      //     decimals: 2,
      //     dropShadow: true,
      //     enableFullscreen: true
      //   })
      // },

      // // Row 3: Chart widgets
      // {
      //   id: 'bar1',
      //   name: 'Performance Metrics',
      //   type: 'BarChart',
      //   sizeX: 4,
      //   sizeY: 6,
      //   templateHtml: '<tb-bar-chart-widget></tb-bar-chart-widget>',
      //   templateCss: '',
      //   controllerScript: '',
      //   settingsDirective: '',
      //   basicModeDirective: '',
      //   dataKeySettingsDirective: '',
      //   hasBasicMode: false,
      //   defaultConfig: JSON.stringify({
      //     datasources: [
      //       {
      //         type: 'function',
      //         dataKeys: [
      //           { name: 'Efficiency', label: 'Efficiency (%)', color: '#4bc0c0', funcBody: '', data: [[1690000000000, 85], [1690000060000, 92], [1690000120000, 88]] },
      //           { name: 'Uptime', label: 'Uptime (%)', color: '#ffcd56', funcBody: '', data: [[1690000000000, 95], [1690000060000, 98], [1690000120000, 97]] }
      //         ]
      //       }
      //     ],
      //     title: 'System Performance',
      //     showTitle: true,
      //     settings: {},
      //     timewindow: {},
      //     backgroundColor: 'rgba(255, 255, 255, 0.9)',
      //     color: 'rgba(0, 0, 0, 0.87)',
      //     padding: '0px',
      //     units: '%',
      //     decimals: 1,
      //     dropShadow: true,
      //     enableFullscreen: false
      //   })
      // },
      // {
      //   id: 'doughnut1',
      //   name: 'Resource Distribution',
      //   type: 'DoughnutChart',
      //   sizeX: 4,
      //   sizeY: 6,
      //   templateHtml: '<tb-doughnut-widget></tb-doughnut-widget>',
      //   templateCss: '',
      //   controllerScript: '',
      //   settingsDirective: '',
      //   basicModeDirective: '',
      //   dataKeySettingsDirective: '',
      //   hasBasicMode: false,
      //   defaultConfig: JSON.stringify({
      //     datasources: [
      //       {
      //         type: 'function',
      //         dataKeys: [
      //           { name: 'CPU', label: 'CPU Usage', color: '#ff6384', funcBody: '', data: [[1690000000000, 45]] },
      //           { name: 'Memory', label: 'Memory Usage', color: '#36a2eb', funcBody: '', data: [[1690000000000, 30]] },
      //           { name: 'Storage', label: 'Storage Usage', color: '#4bc0c0', funcBody: '', data: [[1690000000000, 25]] }
      //         ]
      //       }
      //     ],
      //     title: 'System Resources',
      //     showTitle: true,
      //     settings: {},
      //     timewindow: {},
      //     backgroundColor: 'rgba(255, 255, 255, 0.9)',
      //     color: 'rgba(0, 0, 0, 0.87)',
      //     padding: '0px',
      //     units: '%',
      //     decimals: 1,
      //     dropShadow: true,
      //     enableFullscreen: false
      //   })
      // },
      // {
      //   id: 'led-indicator',
      //   name: 'System Status',
      //   type: 'LedIndicator',
      //   sizeX: 4,
      //   sizeY: 6,
      //   templateHtml: '<tb-led-indicator-widget></tb-led-indicator-widget>',
      //   templateCss: '',
      //   controllerScript: '',
      //   settingsDirective: '',
      //   basicModeDirective: '',
      //   dataKeySettingsDirective: '',
      //   hasBasicMode: false,
      //   defaultConfig: JSON.stringify({
      //     datasources: [
      //       {
      //         type: 'function',
      //         dataKeys: [
      //           { name: 'System', label: 'System Status', color: '#4CAF50', funcBody: '', data: [[1690000000000, true]] },
      //           { name: 'Network', label: 'Network Status', color: '#2196F3', funcBody: '', data: [[1690000000000, true]] },
      //           { name: 'Database', label: 'Database Status', color: '#FF9800', funcBody: '', data: [[1690000000000, false]] }
      //         ]
      //       }
      //     ],
      //     title: 'System Health',
      //     showTitle: true,
      //     settings: {},
      //     timewindow: {},
      //     backgroundColor: 'rgba(255, 255, 255, 0.9)',
      //     color: 'rgba(0, 0, 0, 0.87)',
      //     padding: '0px',
      //     units: '',
      //     decimals: 0,
      //     dropShadow: true,
      //     enableFullscreen: false
      //   })
      // },

      // // Row 4: Control widgets
      // {
      //   id: 'power-button',
      //   name: 'Power Control',
      //   type: 'PowerButton',
      //   sizeX: 3,
      //   sizeY: 4,
      //   templateHtml: '<tb-power-button-widget></tb-power-button-widget>',
      //   templateCss: '',
      //   controllerScript: '',
      //   settingsDirective: '',
      //   basicModeDirective: '',
      //   dataKeySettingsDirective: '',
      //   hasBasicMode: false,
      //   defaultConfig: JSON.stringify({
      //     datasources: [
      //       {
      //         type: 'function',
      //         dataKeys: [
      //           { name: 'Power', label: 'Power Status', color: '#43a047', funcBody: '', data: [[now, true]] }
      //         ]
      //       }
      //     ],
      //     title: 'Power Control',
      //     showTitle: true,
      //     settings: {},
      //     timewindow: {},
      //     backgroundColor: 'rgba(255, 255, 255, 0.9)',
      //     color: 'rgba(0, 0, 0, 0.87)',
      //     padding: '0px',
      //     units: '',
      //     decimals: 0,
      //     dropShadow: true,
      //     enableFullscreen: false
      //   })
      // },
      // {
      //   id: 'toggle-button',
      //   name: 'System Toggle',
      //   type: 'ToggleButton',
      //   sizeX: 3,
      //   sizeY: 4,
      //   templateHtml: '<tb-toggle-button-widget></tb-toggle-button-widget>',
      //   templateCss: '',
      //   controllerScript: '',
      //   settingsDirective: '',
      //   basicModeDirective: '',
      //   dataKeySettingsDirective: '',
      //   hasBasicMode: false,
      //   defaultConfig: JSON.stringify({
      //     datasources: [
      //       {
      //         type: 'function',
      //         dataKeys: [
      //           { name: 'AutoMode', label: 'Auto Mode', color: '#9c27b0', funcBody: '', data: [[now, false]] }
      //         ]
      //       }
      //     ],
      //     title: 'Auto Mode',
      //     showTitle: true,
      //     settings: {},
      //     timewindow: {},
      //     backgroundColor: 'rgba(255, 255, 255, 0.9)',
      //     color: 'rgba(0, 0, 0, 0.87)',
      //     padding: '0px',
      //     units: '',
      //     decimals: 0,
      //     dropShadow: true,
      //     enableFullscreen: false
      //   })
      // },
      // {
      //   id: 'action-button',
      //   name: 'Emergency Stop',
      //   type: 'ActionButton',
      //   sizeX: 3,
      //   sizeY: 4,
      //   templateHtml: '<tb-action-button-widget></tb-action-button-widget>',
      //   templateCss: '',
      //   controllerScript: '',
      //   settingsDirective: '',
      //   basicModeDirective: '',
      //   dataKeySettingsDirective: '',
      //   hasBasicMode: false,
      //   defaultConfig: JSON.stringify({
      //     datasources: [
      //       {
      //         type: 'function',
      //         dataKeys: [
      //           { name: 'Emergency', label: 'Emergency Stop', color: '#f44336', funcBody: '', data: [[now, false]] }
      //         ]
      //       }
      //     ],
      //     title: 'Emergency Stop',
      //     showTitle: true,
      //     settings: {},
      //     timewindow: {},
      //     backgroundColor: 'rgba(255, 255, 255, 0.9)',
      //     color: 'rgba(0, 0, 0, 0.87)',
      //     padding: '0px',
      //     units: '',
      //     decimals: 0,
      //     dropShadow: true,
      //     enableFullscreen: false
      //   })
      // },
      // {
      //   id: 'slider-widget',
      //   name: 'Threshold Control',
      //   type: 'SliderWidget',
      //   sizeX: 3,
      //   sizeY: 4,
      //   templateHtml: '<tb-slider-widget></tb-slider-widget>',
      //   templateCss: '',
      //   controllerScript: '',
      //   settingsDirective: '',
      //   basicModeDirective: '',
      //   dataKeySettingsDirective: '',
      //   hasBasicMode: false,
      //   defaultConfig: JSON.stringify({
      //     datasources: [
      //       {
      //         type: 'function',
      //         dataKeys: [
      //           { name: 'Threshold', label: 'Temperature Threshold', color: '#ff9800', funcBody: '', data: [[now, 25]] }
      //         ]
      //       }
      //     ],
      //     title: 'Temp Threshold',
      //     showTitle: true,
      //     settings: {},
      //     timewindow: {},
      //     backgroundColor: 'rgba(255, 255, 255, 0.9)',
      //     color: 'rgba(0, 0, 0, 0.87)',
      //     padding: '0px',
      //     units: '°C',
      //     decimals: 1,
      //     dropShadow: true,
      //     enableFullscreen: false
      //   })
      // }
    ];
    setWidgets(widgetsData);
    setLoading(false);
  }, []);

  useEffect(() => {
    console.log('Widget States:', widgetStates);
  }, [widgetStates]);

  // Update layout when widgets change - Better positioning
  useEffect(() => {
    if (Array.isArray(widgets) && widgets.length > 0) {
      const newLayout = [
        // Row 1: Temperature & Power monitoring (side by side)
        { i: 'realtime-demo', x: 0, y: 0, w: 6, h: 8, minW: 4, minH: 6 },
        { i: 'power-consumption', x: 6, y: 0, w: 6, h: 8, minW: 4, minH: 6 },
        { i: 'realtime-chart', x: 0, y: 8, w: 12, h: 6, minW: 8, minH: 4 },
        
        // Row 2: Power monitoring (side by side)
        { i: 'power-meter-demo', x: 0, y: 8, w: 6, h: 6, minW: 4, minH: 4 },
        { i: 'water-flow-demo', x: 6, y: 8, w: 6, h: 6, minW: 4, minH: 4 },
        
        // Row 3: Charts and indicators (4 columns)
        { i: 'bar1', x: 0, y: 14, w: 4, h: 6, minW: 3, minH: 4 },
        { i: 'doughnut1', x: 4, y: 14, w: 4, h: 6, minW: 3, minH: 4 },
        { i: 'led-indicator', x: 8, y: 14, w: 4, h: 6, minW: 3, minH: 4 },
        
        // Row 4: Control widgets (4 columns)
        { i: 'power-button', x: 0, y: 20, w: 3, h: 4, minW: 2, minH: 3 },
        { i: 'toggle-button', x: 3, y: 20, w: 3, h: 4, minW: 2, minH: 3 },
        { i: 'action-button', x: 6, y: 20, w: 3, h: 4, minW: 2, minH: 3 },
        { i: 'slider-widget', x: 9, y: 20, w: 3, h: 4, minW: 2, minH: 3 }
      ];
      setLayout(newLayout);
    }
  }, [widgets]);

  const handleWidgetStateChange = (id, value) => {
    setWidgetStates(prev => ({ ...prev, [id]: value }));
  };

  // Handler for layout change (drag/resize)
  const handleLayoutChange = (newLayout) => {
    setLayout(newLayout);
    console.log('Grid Layout State:', newLayout);
  };

  return (
    <div className="dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, padding: '0 20px' }}>
        <h1 style={{ margin: 0, color: '#1976d2', fontSize: '24px' }}>IoT Dashboard - Real-Time Monitoring</h1>
        <button
          onClick={() => setEditMode(prev => !prev)}
          style={{
            padding: '10px 20px',
            borderRadius: 6,
            background: editMode ? '#1976d2' : '#f5f5f5',
            color: editMode ? '#fff' : '#333',
            border: editMode ? 'none' : '1px solid #ddd',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
        >
          {editMode ? '💾 Save Layout' : '✏️ Edit Layout'}
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
        margin={[20, 20]}
        containerPadding={[20, 20]}
        useCSSTransforms={true}
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
