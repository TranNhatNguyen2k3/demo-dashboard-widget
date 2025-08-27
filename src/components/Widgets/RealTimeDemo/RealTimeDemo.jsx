import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../../../hooks/useWebSocket';
import './RealTimeDemo.scss';

const RealTimeDemo = ({ ctx, templateHtml, templateCss }) => {
  const [selectedDevice, setSelectedDevice] = useState('device_001');
  const [devices, setDevices] = useState([]);
  const [historicalData, setHistoricalData] = useState({ data: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [entityData, setEntityData] = useState(null);
  
  // WebSocket connection for real-time data
  const { isConnected, latestData, error: wsError } = useWebSocket(selectedDevice);

  // Fetch available devices
  useEffect(() => {
    const fetchDevices = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:8080/api/v1/telemetry/devices');
        const data = await response.json();
        if (data.success) {
          setDevices(data.data || []);
        } else {
          setError('Failed to fetch devices from backend');
          setDevices([]);
        }
      } catch (error) {
        console.error('Failed to fetch devices:', error);
        setError('Network error: Cannot connect to backend');
        setDevices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  // Fetch historical data when device changes
  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        const endTime = Date.now();
        const startTime = endTime - (60 * 60 * 1000); // 1 hour ago
        
        const response = await fetch('http://localhost:8080/api/v1/telemetry/timeseries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            deviceId: selectedDevice,
            keys: ['temperature', 'humidity', 'voltage', 'current'],
            startTs: startTime,
            endTs: endTime,
            interval: 60000
          })
        });
        
        const data = await response.json();
        if (data.success) {
          setHistoricalData(data.data || { data: {} });
        } else {
          setHistoricalData({ data: {} });
        }
      } catch (error) {
        console.error('Failed to fetch historical data:', error);
        setHistoricalData({ data: {} });
      }
    };

    if (selectedDevice) {
      fetchHistoricalData();
    }
  }, [selectedDevice]);

  const formatValue = (value, unit = '') => {
    if (typeof value === 'number') {
      return `${value.toFixed(2)}${unit}`;
    }
    if (typeof value === 'boolean') {
      return value ? 'ON' : 'OFF';
    }
    return String(value);
  };

  const getDeviceInfo = () => {
    if (!devices || devices.length === 0) return null;
    return devices.find(d => d.id === selectedDevice);
  };

  const getLatestValues = () => {
    if (!latestData || !latestData.values) return {};
    return latestData.values;
  };

  const getHistoricalValues = () => {
    if (!historicalData || !historicalData.data) return {};
    return historicalData.data;
  };

  // Fetch entity-based telemetry data
  const fetchEntityData = async (deviceId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/telemetry/entities/${deviceId}/data`);
      const data = await response.json();
      if (data.success) {
        setEntityData(data.data);
      } else {
        console.error('Failed to fetch entity data:', data.error);
      }
    } catch (error) {
      console.error('Error fetching entity data:', error);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="real-time-demo">
        <div className="demo-header">
          <h3>Real-Time Telemetry Demo</h3>
        </div>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div>Loading devices...</div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="real-time-demo">
        <div className="demo-header">
          <h3>Real-Time Telemetry Demo</h3>
        </div>
        <div style={{ textAlign: 'center', padding: '40px', color: '#f44336' }}>
          <div>⚠️ {error}</div>
          <div style={{ marginTop: '10px', fontSize: '0.9rem' }}>
            Please ensure backend is running on http://localhost:8080
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="real-time-demo">
      {/* Header */}
      <div className="demo-header">
        <h3>Real-Time Telemetry Demo</h3>
        <div className="connection-status">
          <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`} />
          <span>{isConnected ? 'Live Connected' : 'Offline'}</span>
          {wsError && <span className="error">Error: {wsError}</span>}
        </div>
      </div>

      {/* Device Selector */}
      <div className="device-selector">
        <label>Select Device:</label>
        <select 
          value={selectedDevice} 
          onChange={(e) => setSelectedDevice(e.target.value)}
          disabled={!devices || devices.length === 0}
        >
          {devices && devices.length > 0 ? (
            devices.map(device => (
              <option key={device.id} value={device.id}>
                {device.name} ({device.location})
              </option>
            ))
          ) : (
            <option value="">No devices available</option>
          )}
        </select>
      </div>

      {/* Device Info */}
      {getDeviceInfo() ? (
        <div className="device-info">
          <h4>{getDeviceInfo().name}</h4>
          <p>Type: {getDeviceInfo().type}</p>
          <p>Location: {getDeviceInfo().location}</p>
        </div>
      ) : (
        <div className="device-info">
          <h4>Device Information</h4>
          <p>No device selected or device not found</p>
        </div>
      )}

      {/* Real-Time Values */}
      <div className="real-time-section">
        <h4>Real-Time Values</h4>
        <div className="values-grid">
          {Object.entries(getLatestValues()).map(([key, value]) => (
            <div key={key} className="value-item">
              <span className="key">{key}</span>
              <span className="value">{formatValue(value)}</span>
            </div>
          ))}
        </div>
        {Object.keys(getLatestValues()).length === 0 && (
          <p className="no-data">No real-time data available</p>
        )}
      </div>

      {/* Historical Data */}
      <div className="historical-section">
        <h4>Historical Data (Last Hour)</h4>
        <div className="historical-grid">
          {Object.entries(getHistoricalValues()).map(([key, dataPoints]) => (
            <div key={key} className="historical-item">
              <span className="key">{key}</span>
              <span className="count">
                {Array.isArray(dataPoints) ? dataPoints.length : 0} points
              </span>
              {Array.isArray(dataPoints) && dataPoints.length > 0 && (
                <span className="latest">
                  Latest: {formatValue(dataPoints[dataPoints.length - 1][1])}
                </span>
              )}
            </div>
          ))}
        </div>
        {Object.keys(getHistoricalValues()).length === 0 && (
          <p className="no-data">No historical data available</p>
        )}
      </div>

      {/* WebSocket Info */}
      <div className="websocket-info">
        <h4>WebSocket Connection</h4>
        <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
        <p>Device: {selectedDevice}</p>
        <p>Endpoint: ws://localhost:8080/ws</p>
        {latestData && latestData.timestamp && (
          <p>Last Update: {new Date(latestData.timestamp).toLocaleTimeString()}</p>
        )}
      </div>

      {/* Entity-based Telemetry Data */}
      <div className="entity-section">
        <h4>Entity-based Telemetry Data</h4>
        <p>This section shows data in the new entity format for ETL pipeline integration.</p>
        <button 
          className="fetch-entity-btn"
          onClick={() => fetchEntityData(selectedDevice)}
        >
          Fetch Entity Data
        </button>
        {entityData && (
          <div className="entity-data">
            <h5>Entity ID: {entityData.entityId}</h5>
            <div className="entity-telemetry">
              {entityData.telemetry && entityData.telemetry.map((item, index) => (
                <div key={index} className="entity-item">
                  <span className="key-id">Key ID: {item.key}</span>
                  <span className="timestamp">{new Date(item.ts).toLocaleTimeString()}</span>
                  <span className="value">
                    {item.boolVal !== undefined && `Boolean: ${item.boolVal}`}
                    {item.intVal !== undefined && `Integer: ${item.intVal}`}
                    {item.stringVal !== undefined && `String: ${item.stringVal}`}
                    {item.doubleVal !== undefined && `Double: ${item.doubleVal}`}
                    {item.jsonVal !== undefined && `JSON: ${item.jsonVal}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeDemo;
