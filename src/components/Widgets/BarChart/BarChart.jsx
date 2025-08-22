import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import './BarChart.scss';

const BarChart = ({ ctx, templateHtml, templateCss }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current && ctx?.datasources) {
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
      chartInstance.current = echarts.init(chartRef.current);
      const series = ctx.datasources.flatMap(datasource =>
        datasource.dataKeys.map(dataKey => ({
          name: dataKey.label || dataKey.name,
          type: 'bar',
          data: dataKey.data || [],
          color: dataKey.color
        }))
      );
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
          orient: 'horizontal',
          top: 10,
          textStyle: {
            fontSize: 12,
            color: 'rgba(0, 0, 0, 0.76)'
          }
        },
        tooltip: {
          show: true,
          trigger: 'axis',
        },
        xAxis: {
          type: 'category',
          data: series[0]?.data?.map(d => d[0]) || [],
          axisLabel: { color: '#888' }
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: '#888' }
        },
        series: series.map(s => ({ ...s, data: s.data.map(d => d[1]) }))
      };
      chartInstance.current.setOption(option);
    }
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
    };
  }, [ctx]);

  useEffect(() => {
    let resizeObserver;
    if (chartRef.current) {
      resizeObserver = new window.ResizeObserver(() => {
        if (chartInstance.current) {
          chartInstance.current.resize();
        }
      });
      resizeObserver.observe(chartRef.current);
    }
    return () => {
      if (resizeObserver && chartRef.current) {
        resizeObserver.unobserve(chartRef.current);
      }
    };
  }, []);

  return (
    <div style={{position: 'relative', width: '100%', height: '100%'}}>
      <div 
        ref={chartRef} 
        className="bar-chart"
        style={{ width: '100%', height: '100%', backgroundColor: ctx?.settings?.background?.color || '#fff' }}
      />
    </div>
  );
};

export default BarChart;
