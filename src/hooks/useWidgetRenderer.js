import { useState, useEffect } from 'react';
import { WidgetParser } from '../utils/widgetParser';
import { DataService } from '../services/dataService';

export const useWidgetRenderer = (widgetDescriptor) => {
  const [widgetData, setWidgetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processWidget = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Processing widget descriptor:', widgetDescriptor);
        console.log('TemplateHtml from descriptor:', widgetDescriptor.templateHtml);
        console.log('TemplateHtml type:', typeof widgetDescriptor.templateHtml);
        console.log('TemplateHtml length:', widgetDescriptor.templateHtml?.length);

        // 1. Parse template
        const templateInfo = WidgetParser.parseTemplate(widgetDescriptor.templateHtml);
        console.log('Template info:', templateInfo);
        
        if (!templateInfo.isValid) {
          throw new Error(`Invalid widget template: ${widgetDescriptor.templateHtml}`);
        }

        // 2. Parse descriptor
        const config = WidgetParser.parseDescriptor(widgetDescriptor);
        console.log('Parsed config:', config);

        // 3. Process data sources
        const processedDataSources = await Promise.all(
          config.datasources.map(async (datasource) => {
            const processedDataKeys = await Promise.all(
              datasource.dataKeys.map(async (dataKey) => {
                let data;
                if (Array.isArray(dataKey.data) && dataKey.data.length > 0) {
                  // Nếu đã có dữ liệu cứng, giữ nguyên
                  data = dataKey.data;
                } else if (datasource.type === 'function') {
                  data = await DataService.generateMockData(dataKey);
                } else {
                  data = await DataService.fetchRealData(datasource);
                }

                return {
                  ...dataKey,
                  data: data || []
                };
              })
            );

            return {
              ...datasource,
              dataKeys: processedDataKeys
            };
          })
        );

        const finalWidgetData = {
          type: templateInfo.widgetType,
          config: {
            ...config,
            datasources: processedDataSources
          },
          templateHtml: templateInfo.cleanHtml,
          templateCss: widgetDescriptor.templateCss
        };

        console.log('Final widget data:', finalWidgetData);
        setWidgetData(finalWidgetData);

      } catch (err) {
        console.error('Error processing widget:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (widgetDescriptor) {
      processWidget();
    }
  }, [widgetDescriptor]);

  return { widgetData, loading, error };
};
