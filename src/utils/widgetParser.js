import DOMPurify from 'dompurify';
import { WIDGET_TYPES } from '../constants/widgetTypes';

export class WidgetParser {
  static parseTemplate(templateHtml) {
    // Extract widget type first before sanitizing
    const widgetType = this.extractWidgetType(templateHtml);
    
    // Sanitize HTML with more permissive settings
    const cleanHtml = DOMPurify.sanitize(templateHtml, {
      ALLOWED_TAGS: [
        'div', 'span', 'canvas', 'svg', 
        'tb-time-series-chart-widget', 
        'tb-value-chart-card-widget', 
        'tb-value-card-widget', 
        'tb-aggregated-value-card-widget', 
        'tb-status-widget', 
        'tb-count-widget',
        'tb-doughnut-widget',
        'tb-pie-chart-widget',
        'tb-bar-chart-widget',
        'tb-progress-bar-widget',
        'tb-markdown-widget',
        'tb-label-card-widget'
      ],
      ALLOWED_ATTR: ['id', 'class', 'style', 'width', 'height', 'ctx', 'widgetTitlePanel'],
      KEEP_CONTENT: true
    });
    
    return {
      cleanHtml,
      widgetType,
      isValid: !!widgetType
    };
  }

  static extractWidgetType(templateHtml) {
    console.log('=== EXTRACT WIDGET TYPE DEBUG ===');
    console.log('Input templateHtml:', templateHtml);
    console.log('TemplateHtml type:', typeof templateHtml);
    console.log('TemplateHtml length:', templateHtml?.length);
    
    if (!templateHtml || typeof templateHtml !== 'string') {
      console.log('TemplateHtml is invalid:', templateHtml);
      return null;
    }
    
    // Match tb-*-widget pattern
    const match = templateHtml.match(/tb-([\w-]+)-widget/);
    console.log('Regex match result:', match);
    
    if (match) {
      const fullSelector = match[0]; // e.g., "tb-time-series-chart-widget"
      console.log('Found widget selector:', fullSelector);
      console.log('Available widget types:', Object.keys(WIDGET_TYPES));
      console.log('Mapped widget type:', WIDGET_TYPES[fullSelector]);
      return WIDGET_TYPES[fullSelector] || null;
    }
    console.log('No widget selector found in template');
    console.log('=== END DEBUG ===');
    return null;
  }

  static parseDescriptor(descriptor) {
    try {
      const config = JSON.parse(descriptor.defaultConfig);
      return {
        datasources: config.datasources || [],
        settings: config.settings || {},
        timewindow: config.timewindow || {},
        title: config.title || '',
        showTitle: config.showTitle !== false,
        backgroundColor: config.backgroundColor || 'transparent',
        color: config.color || 'rgba(0, 0, 0, 0.87)',
        padding: config.padding || '0px',
        units: config.units || '',
        decimals: config.decimals || 0,
        dropShadow: config.dropShadow !== false,
        enableFullscreen: config.enableFullscreen || false
      };
    } catch (error) {
      console.error('Error parsing descriptor:', error);
      return {};
    }
  }
}
