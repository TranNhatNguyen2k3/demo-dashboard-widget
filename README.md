# React ThingsBoard Widgets Demo

Demo project để render ThingsBoard widgets trong React, sử dụng descriptor JSON từ ThingsBoard.

## Cài đặt

```bash
cd react-widget-demo
npm install
```

## Chạy ứng dụng

```bash
npm start
```

Ứng dụng sẽ chạy tại `http://localhost:3000`

## Cấu trúc Project

```
react-widget-demo/
├── src/
│   ├── components/
│   │   ├── Common/           # Components chung
│   │   │   ├── LoadingSpinner/
│   │   │   └── WidgetContainer/
│   │   ├── Dashboard/        # Dashboard chính
│   │   ├── WidgetRenderer/   # Component render widget
│   │   └── Widgets/          # Các widget components
│   │       ├── TimeSeriesChart/
│   │       └── ValueChartCard/
│   ├── constants/            # Constants và configs
│   ├── hooks/                # Custom hooks
│   ├── services/             # Services xử lý data
│   ├── utils/                # Utilities
│   └── App.js               # Component chính
```

## Cách sử dụng

### 1. Widget Descriptor Format

```json
{
  "type": "timeseries",
  "sizeX": 8,
  "sizeY": 5,
  "templateHtml": "<tb-time-series-chart-widget [ctx]=\"ctx\"></tb-time-series-chart-widget>",
  "templateCss": "",
  "controllerScript": "self.onInit = function() {...}",
  "defaultConfig": "{\"datasources\":[...],\"settings\":{...}}"
}
```

### 2. Render Widget

```jsx
import WidgetRenderer from './components/WidgetRenderer/WidgetRenderer';

const MyComponent = () => {
  const widgetDescriptor = {
    // Your widget descriptor here
  };

  return (
    <WidgetRenderer 
      widgetDescriptor={widgetDescriptor}
      widgetId="my-widget"
    />
  );
};
```

### 3. Thêm Widget mới

1. Tạo component trong `src/components/Widgets/`
2. Thêm vào `src/constants/widgetTypes.js`
3. Import trong `src/constants/widgetTypes.js`

## Widget Types được hỗ trợ

- `tb-time-series-chart-widget` → TimeSeriesChart
- `tb-value-chart-card-widget` → ValueChartCard
- `tb-value-card-widget` → ValueCard
- `tb-aggregated-value-card-widget` → AggregatedValueCard
- `tb-status-widget` → StatusWidget
- `tb-count-widget` → CountWidget

## API Integration

Thay thế mock data trong `Dashboard.js` với API call thực tế:

```jsx
const fetchWidgets = async () => {
  try {
    const response = await fetch('/api/widgets');
    const widgets = await response.json();
    setWidgets(widgets);
  } catch (error) {
    console.error('Error fetching widgets:', error);
  }
};
```

## Features

- ✅ Render widget từ ThingsBoard descriptor
- ✅ Dynamic component loading
- ✅ Real-time data simulation
- ✅ Responsive grid layout
- ✅ Error handling
- ✅ Loading states
- ✅ CSS styling support
- ✅ ECharts integration

## Dependencies

- React 18
- ECharts
- DOMPurify (sanitization)
- Axios (API calls)
- SCSS (styling)
