import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { useWebSocket } from '../../../hooks/useWebSocket';
import './TimeSeriesChart.scss';

const TimeSeriesChart = ({ ctx, templateHtml, templateCss }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [chartData, setChartData] = useState([]);

  // Lấy deviceId cho WebSocket
  const deviceId = ctx?.datasources?.[0]?.deviceId;
  const { isConnected, latestData, error: wsError } = useWebSocket(deviceId);

  // Chuẩn bị series ban đầu từ ctx
  useEffect(() => {
    if (ctx?.datasources) {
      const series = ctx.datasources.flatMap(datasource =>
        datasource.dataKeys.map(dataKey => ({
          name: dataKey.label || dataKey.name,
          type: dataKey.settings?.type || 'line',
          data: dataKey.data || [],
          color: dataKey.color,
          smooth: true,
          lineWidth: 2,
          showSymbol: false
        }))
      );
      setChartData(series);
    }
  }, [ctx]);

  // Cập nhật dữ liệu mới từ WebSocket
  useEffect(() => {
    if (latestData && chartData.length > 0) {
      const newDataPoint = [
        latestData.timestamp?.getTime
          ? latestData.timestamp.getTime()
          : Date.now(),
        latestData.values[Object.keys(latestData.values)[0]] || 0
      ];

      const updatedSeries = [...chartData];
      updatedSeries[0].data = [...updatedSeries[0].data, newDataPoint];

      // Giữ lại tối đa 100 điểm
      if (updatedSeries[0].data.length > 100) {
        updatedSeries[0].data = updatedSeries[0].data.slice(-100);
      }

      setChartData(updatedSeries);
    }
  }, [latestData]);

  // Khởi tạo chart 1 lần
  useEffect(() => {
    if (chartRef.current && !chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, []);

  // Cập nhật option khi chartData hoặc ctx đổi
  useEffect(() => {
    if (chartInstance.current && chartData.length > 0) {
      const option = {
        title: {
          text: ctx?.title,
          show: ctx?.showTitle !== false,
          textStyle: {
            fontSize: 16,
            fontWeight: 500,
            color: ctx?.color || 'rgba(0, 0, 0, 0.87)'
          }
        },
        legend: {
          show: ctx?.settings?.showLegend !== false,
          type: 'scroll',
          orient:
            ctx?.settings?.legendConfig?.direction === 'column'
              ? 'vertical'
              : 'horizontal',
          top: ctx?.settings?.legendConfig?.position === 'top' ? 10 : 'bottom',
          textStyle: {
            fontSize: 12,
            color: 'rgba(0, 0, 0, 0.76)'
          }
        },
        tooltip: {
          show: ctx?.settings?.showTooltip !== false,
          trigger: ctx?.settings?.tooltipTrigger || 'axis',
          backgroundColor:
            ctx?.settings?.tooltipBackgroundColor ||
            'rgba(255, 255, 255, 0.9)',
          textStyle: {
            fontSize: 12,
            color: 'rgba(0, 0, 0, 0.76)'
          },
          formatter: function (params) {
            let result = '';
            if (ctx?.settings?.tooltipShowDate !== false) {
              const date = new Date(params[0].value[0]);
              result += `<div>${date.toLocaleString()}</div>`;
            }
            params.forEach(param => {
              result += `<div style="color: ${param.color}">
                ${param.seriesName}: ${param.value[1]}
              </div>`;
            });
            return result;
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'time',
          show: ctx?.settings?.xAxis?.show !== false,
          axisLine: {
            show: ctx?.settings?.xAxis?.showLine !== false,
            lineStyle: {
              color:
                ctx?.settings?.xAxis?.lineColor || 'rgba(0, 0, 0, 0.54)'
            }
          },
          axisTick: {
            show: ctx?.settings?.xAxis?.showTicks !== false,
            lineStyle: {
              color:
                ctx?.settings?.xAxis?.ticksColor || 'rgba(0, 0, 0, 0.54)'
            }
          },
          axisLabel: {
            show: ctx?.settings?.xAxis?.showTickLabels !== false,
            color:
              ctx?.settings?.xAxis?.tickLabelColor || 'rgba(0, 0, 0, 0.54)',
            fontSize: 10
          },
          splitLine: {
            show: ctx?.settings?.xAxis?.showSplitLines !== false,
            lineStyle: {
              color:
                ctx?.settings?.xAxis?.splitLinesColor ||
                'rgba(0, 0, 0, 0.12)'
            }
          }
        },
        yAxis: {
          type: 'value',
          show: ctx?.settings?.yAxis?.show !== false,
          axisLine: {
            show: ctx?.settings?.yAxis?.showLine !== false,
            lineStyle: {
              color:
                ctx?.settings?.yAxis?.lineColor || 'rgba(0, 0, 0, 0.54)'
            }
          },
          axisTick: {
            show: ctx?.settings?.yAxis?.showTicks !== false,
            lineStyle: {
              color:
                ctx?.settings?.yAxis?.ticksColor || 'rgba(0, 0, 0, 0.54)'
            }
          },
          axisLabel: {
            show: ctx?.settings?.yAxis?.showTickLabels !== false,
            color:
              ctx?.settings?.yAxis?.tickLabelColor || 'rgba(0, 0, 0, 0.54)',
            fontSize: 12
          },
          splitLine: {
            show: ctx?.settings?.yAxis?.showSplitLines !== false,
            lineStyle: {
              color:
                ctx?.settings?.yAxis?.splitLinesColor ||
                'rgba(0, 0, 0, 0.12)'
            }
          }
        },
        dataZoom: ctx?.settings?.dataZoom
          ? [
              { type: 'inside', start: 0, end: 100 },
              { type: 'slider', start: 0, end: 100 }
            ]
          : [],
        series: chartData
      };

      chartInstance.current.setOption(option);
    }
  }, [chartData, ctx]);

  // Resize chart khi parent thay đổi
  useEffect(() => {
    let resizeObserver;
    if (chartRef.current && chartInstance.current) {
      resizeObserver = new ResizeObserver(() => {
        chartInstance.current?.resize();
      });
      resizeObserver.observe(chartRef.current);
    }
    return () => {
      resizeObserver?.disconnect();
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* WebSocket Status Indicator */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 8px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '4px',
          fontSize: '12px',
          border: '1px solid #ddd'
        }}
      >
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isConnected ? '#4CAF50' : '#f44336'
          }}
        />
        <span style={{ color: isConnected ? '#4CAF50' : '#f44336' }}>
          {isConnected ? 'Live' : 'Offline'}
        </span>
        {wsError && (
          <span style={{ color: '#f44336', fontSize: '10px' }}>{wsError}</span>
        )}
      </div>

      <div
        ref={chartRef}
        className="time-series-chart"
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: ctx?.settings?.background?.color || '#fff'
        }}
      />
    </div>
  );
};

export default TimeSeriesChart;
