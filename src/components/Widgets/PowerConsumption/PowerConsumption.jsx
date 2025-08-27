import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../../../hooks/useWebSocket';
import './PowerConsumption.scss';

const PowerConsumption = ({ ctx, templateHtml, templateCss }) => {
  const [powerData, setPowerData] = useState({
    current: 0,
    voltage: 0,
    power: 0,
    energy: 0,
    cost: 0
  });
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [dailyUsage, setDailyUsage] = useState([]);
  const [monthlyUsage, setMonthlyUsage] = useState([]);

  // WebSocket connection for real-time power data
  const { isConnected: wsConnected, latestData, error: wsError } = useWebSocket('power_meter');

  // Update power data when WebSocket receives new data
  useEffect(() => {
    if (latestData && latestData.values) {
      const newPowerData = {
        current: latestData.values.current || 0,
        voltage: latestData.values.voltage || 0,
        power: latestData.values.power || 0,
        energy: latestData.values.energy || 0,
        cost: latestData.values.cost || 0
      };
      
      setPowerData(newPowerData);
      setLastUpdate(new Date());
      setIsConnected(true);

      // Add to daily usage for chart
      if (newPowerData.power > 0) {
        setDailyUsage(prev => {
          const now = new Date();
          const newPoint = {
            time: now.toLocaleTimeString(),
            power: newPowerData.power,
            energy: newPowerData.energy
          };
          
          // Keep only last 24 points (24 hours)
          const updated = [...prev, newPoint];
          if (updated.length > 24) {
            return updated.slice(-24);
          }
          return updated;
        });
      }
    }
  }, [latestData]);

  // Calculate power factor and efficiency
  const powerFactor = powerData.voltage > 0 && powerData.current > 0 
    ? (powerData.power / (powerData.voltage * powerData.current)) * 100 
    : 0;

  const efficiency = powerData.power > 0 
    ? Math.min((powerData.power / 5000) * 100, 100) // Assuming max power is 5kW
    : 0;

  // Format values with units
  const formatValue = (value, unit, decimals = 2) => {
    if (typeof value === 'number') {
      return `${value.toFixed(decimals)} ${unit}`;
    }
    return `0 ${unit}`;
  };

  // Get status color based on power consumption
  const getStatusColor = (power) => {
    if (power < 1000) return '#4CAF50'; // Green - Low consumption
    if (power < 3000) return '#FF9800'; // Orange - Medium consumption
    return '#F44336'; // Red - High consumption
  };

  // Get status text
  const getStatusText = (power) => {
    if (power < 1000) return 'Low';
    if (power < 3000) return 'Medium';
    return 'High';
  };

  return (
    <div className="power-consumption">
      {/* Header */}
      <div className="widget-header">
        <h3>⚡ Power Consumption Monitor</h3>
        <div className="connection-status">
          <div className={`status-dot ${wsConnected ? 'connected' : 'disconnected'}`} />
          <span>{wsConnected ? 'Live' : 'Offline'}</span>
        </div>
      </div>

      {/* Main Power Display */}
      <div className="main-power-display">
        <div className="power-value">
          <span className="value">{formatValue(powerData.power, 'kW')}</span>
          <span className="label">Current Power</span>
        </div>
        <div className="power-status">
          <div 
            className="status-indicator"
            style={{ backgroundColor: getStatusColor(powerData.power) }}
          />
          <span>{getStatusText(powerData.power)} Consumption</span>
        </div>
      </div>

      {/* Real-time Values Grid */}
      <div className="values-grid">
        <div className="value-item">
          <span className="label">Voltage</span>
          <span className="value">{formatValue(powerData.voltage, 'V')}</span>
        </div>
        <div className="value-item">
          <span className="label">Current</span>
          <span className="value">{formatValue(powerData.current, 'A')}</span>
        </div>
        <div className="value-item">
          <span className="label">Energy</span>
          <span className="value">{formatValue(powerData.energy, 'kWh')}</span>
        </div>
        <div className="value-item">
          <span className="label">Cost</span>
          <span className="value">{formatValue(powerData.cost, 'VND')}</span>
        </div>
      </div>

      {/* Efficiency Metrics */}
      <div className="efficiency-section">
        <div className="metric">
          <span className="label">Power Factor</span>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${Math.min(powerFactor, 100)}%` }}
            />
          </div>
          <span className="value">{powerFactor.toFixed(1)}%</span>
        </div>
        <div className="metric">
          <span className="label">Efficiency</span>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${efficiency}%` }}
            />
          </div>
          <span className="value">{efficiency.toFixed(1)}%</span>
        </div>
      </div>

      {/* Daily Usage Chart */}
      <div className="usage-chart">
        <h4>Daily Power Usage (24h)</h4>
        <div className="chart-container">
          {dailyUsage.length > 0 ? (
            <div className="chart-bars">
              {dailyUsage.map((point, index) => (
                <div 
                  key={index} 
                  className="chart-bar"
                  style={{ 
                    height: `${(point.power / 5000) * 100}%`,
                    backgroundColor: getStatusColor(point.power)
                  }}
                  title={`${point.time}: ${point.power.toFixed(2)} kW`}
                />
              ))}
            </div>
          ) : (
            <div className="no-data">No data available</div>
          )}
        </div>
      </div>

      {/* Last Update */}
      <div className="last-update">
        <span>Last Update: {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Never'}</span>
        {wsError && <span className="error">Error: {wsError}</span>}
      </div>
    </div>
  );
};

export default PowerConsumption;
