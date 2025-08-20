import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import './TimeSeriesChart.scss';

const TimeSeriesChart = ({ ctx, templateHtml, templateCss }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [chartData, setChartData] = useState([]);

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

  useEffect(() => {
    if (chartRef.current && chartData.length > 0) {
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }

      chartInstance.current = echarts.init(chartRef.current);

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
          orient: ctx?.settings?.legendConfig?.direction === 'column' ? 'vertical' : 'horizontal',
          top: ctx?.settings?.legendConfig?.position === 'top' ? 10 : 'bottom',
          textStyle: {
            fontSize: 12,
            color: 'rgba(0, 0, 0, 0.76)'
          }
        },
        tooltip: {
          show: ctx?.settings?.showTooltip !== false,
          trigger: ctx?.settings?.tooltipTrigger || 'axis',
          backgroundColor: ctx?.settings?.tooltipBackgroundColor || 'rgba(255, 255, 255, 0.9)',
          textStyle: {
            fontSize: 12,
            color: 'rgba(0, 0, 0, 0.76)'
          },
          formatter: function(params) {
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
              color: ctx?.settings?.xAxis?.lineColor || 'rgba(0, 0, 0, 0.54)'
            }
          },
          axisTick: {
            show: ctx?.settings?.xAxis?.showTicks !== false,
            lineStyle: {
              color: ctx?.settings?.xAxis?.ticksColor || 'rgba(0, 0, 0, 0.54)'
            }
          },
          axisLabel: {
            show: ctx?.settings?.xAxis?.showTickLabels !== false,
            color: ctx?.settings?.xAxis?.tickLabelColor || 'rgba(0, 0, 0, 0.54)',
            fontSize: 10
          },
          splitLine: {
            show: ctx?.settings?.xAxis?.showSplitLines !== false,
            lineStyle: {
              color: ctx?.settings?.xAxis?.splitLinesColor || 'rgba(0, 0, 0, 0.12)'
            }
          }
        },
        yAxis: {
          type: 'value',
          show: ctx?.settings?.yAxis?.show !== false,
          axisLine: {
            show: ctx?.settings?.yAxis?.showLine !== false,
            lineStyle: {
              color: ctx?.settings?.yAxis?.lineColor || 'rgba(0, 0, 0, 0.54)'
            }
          },
          axisTick: {
            show: ctx?.settings?.yAxis?.showTicks !== false,
            lineStyle: {
              color: ctx?.settings?.yAxis?.ticksColor || 'rgba(0, 0, 0, 0.54)'
            }
          },
          axisLabel: {
            show: ctx?.settings?.yAxis?.showTickLabels !== false,
            color: ctx?.settings?.yAxis?.tickLabelColor || 'rgba(0, 0, 0, 0.54)',
            fontSize: 12
          },
          splitLine: {
            show: ctx?.settings?.yAxis?.showSplitLines !== false,
            lineStyle: {
              color: ctx?.settings?.yAxis?.splitLinesColor || 'rgba(0, 0, 0, 0.12)'
            }
          }
        },
        dataZoom: ctx?.settings?.dataZoom ? [{
          type: 'inside',
          start: 0,
          end: 100
        }, {
          type: 'slider',
          start: 0,
          end: 100
        }] : [],
        series: chartData
      };

      chartInstance.current.setOption(option);
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
    };
  }, [chartData, ctx]);

  useEffect(() => {
    const handleResize = () => {
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{position: 'relative', width: '100%', height: '100%'}}>
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
