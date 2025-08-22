import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import './PieChart.scss';

const PieChart = ({ ctx, templateHtml, templateCss }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current && ctx?.datasources) {
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
      chartInstance.current = echarts.init(chartRef.current);
      const data = ctx.datasources.flatMap(datasource =>
        datasource.dataKeys.map(dataKey => ({
          value: dataKey.data?.[0]?.[1] || 0,
          name: dataKey.label || dataKey.name,
          itemStyle: { color: dataKey.color }
        }))
      );
      const option = {
        title: {
          text: ctx?.title,
          show: ctx?.showTitle !== false,
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 500,
            color: ctx?.color || 'rgba(0, 0, 0, 0.87)'
          }
        },
        tooltip: {
          trigger: 'item',
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          textStyle: { fontSize: 12, color: '#888' }
        },
        series: [
          {
            name: ctx?.title,
            type: 'pie',
            radius: '60%',
            data,
            label: { show: true, fontSize: 12 },
            emphasis: {
              itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.2)' }
            }
          }
        ]
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
        className="pie-chart"
        style={{ width: '100%', height: '100%', backgroundColor: ctx?.settings?.background?.color || '#fff' }}
      />
    </div>
  );
};

export default PieChart;
