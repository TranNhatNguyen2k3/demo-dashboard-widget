# React Widget Demo với Backend Go Real-time

Hệ thống demo hoàn chỉnh cho IoT widgets với backend Go cung cấp real-time telemetry data và frontend React hiển thị live updates.

## 🚀 Tính năng chính

- **Backend Go**: REST API + WebSocket server cho real-time telemetry
- **Frontend React**: Widget system với real-time updates
- **Device Simulation**: Mô phỏng 4 thiết bị IoT với dữ liệu thực tế
- **Real-time Charts**: TimeSeriesChart với live data streaming
- **WebSocket Integration**: Kết nối real-time giữa backend và frontend

## 🏗️ Cấu trúc dự án

```
react-widget-demo/
├── src/                          # Frontend React
│   ├── components/               # Widget components
│   ├── hooks/                    # Custom hooks (useWebSocket)
│   ├── services/                 # Data services
│   └── constants/                # Widget type definitions
├── backend/                      # Backend Go
│   ├── main.go                  # Entry point
│   ├── models/                   # Data models
│   ├── services/                 # Business logic
│   ├── handlers/                 # HTTP handlers
│   ├── routes/                   # API routes
│   └── config.yaml              # Configuration
└── README.md                     # This file
```

## 🛠️ Cài đặt và chạy

### 1. Backend Go

```bash
cd backend

# Cài đặt dependencies
go mod tidy

# Chạy backend
go run main.go
```

Backend sẽ chạy trên `http://localhost:8080`

**Scripts có sẵn:**
- Windows: `run.bat`
- Linux/Mac: `./run.sh`

### 2. Frontend React

```bash
# Cài đặt dependencies
npm install

# Chạy frontend
npm start
```

Frontend sẽ chạy trên `http://localhost:3000`

## 📡 API Endpoints

### REST API
- `GET /api/v1/telemetry/devices` - Danh sách thiết bị
- `GET /api/v1/telemetry/devices/:id` - Thông tin thiết bị
- `GET /api/v1/telemetry/devices/:id/latest` - Dữ liệu mới nhất
- `POST /api/v1/telemetry/timeseries` - Dữ liệu lịch sử
- `GET /api/v1/system/status` - Trạng thái hệ thống

### WebSocket
- `GET /ws` - Real-time telemetry updates

## 🔌 Thiết bị được mô phỏng

1. **Temperature Sensor 1** (device_001)
   - Temperature (°C), Humidity (%)

2. **Humidity Sensor 1** (device_002)
   - Humidity (%), Pressure (hPa)

3. **Power Meter 1** (device_003)
   - Voltage (V), Current (A), Power (kW), Energy (kWh)

4. **Water Flow Sensor 1** (device_004)
   - Flow Rate (L/min), Total Volume (L), Pump Status

## 📊 Widgets có sẵn

- **TimeSeriesChart**: Chart với real-time updates
- **RealTimeDemo**: Demo widget hiển thị live data
- **BarChart, PieChart, DoughnutChart**: Các loại chart khác
- **PowerButton, SliderWidget, LedIndicator**: Control widgets
- **ActionButton, ToggleButton, CommandButton**: Button widgets

## 🧪 Testing

### Test Backend API

```bash
cd backend/test
python test_api.py
```

### Test WebSocket

1. Mở browser console
2. Kết nối: `ws://localhost:8080/ws`
3. Subscribe: `{"type": "subscribe", "payload": {"deviceId": "device_001"}}`

### Test Frontend

1. Mở `http://localhost:3000`
2. Thêm RealTimeDemo widget
3. Chọn thiết bị và xem real-time updates

## 🔧 Cấu hình

### Backend Config (`backend/config.yaml`)

```yaml
server:
  port: 8080
  host: localhost

cors:
  enabled: true

websocket:
  enabled: true

telemetry:
  simulation_interval: 1000ms
```

### Frontend Config

Cập nhật `src/services/dataService.js` để thay đổi backend URL nếu cần.

## 📱 Sử dụng Real-time Widgets

### 1. TimeSeriesChart với Real-time Data

```jsx
// Widget sẽ tự động kết nối WebSocket
// và cập nhật chart với live data
<TimeSeriesChart 
  ctx={{
    datasources: [{
      deviceId: "device_001",
      dataKeys: [{ name: "temperature" }]
    }]
  }}
/>
```

### 2. RealTimeDemo Widget

```jsx
// Widget demo hoàn chỉnh với device selector
// và real-time telemetry display
<RealTimeDemo />
```

## 🚨 Troubleshooting

### Backend không khởi động
- Kiểm tra Go version (yêu cầu 1.21+)
- Kiểm tra port 8080 có bị chiếm không
- Chạy `go mod tidy` để cài dependencies

### WebSocket connection failed
- Đảm bảo backend đang chạy
- Kiểm tra CORS settings
- Kiểm tra firewall/antivirus

### Frontend không nhận data
- Kiểm tra backend URL trong dataService
- Kiểm tra browser console cho errors
- Đảm bảo backend và frontend cùng chạy

## 🔮 Phát triển thêm

### Thêm thiết bị mới
1. Cập nhật `backend/services/telemetry_service.go`
2. Thêm device vào `initializeDevices()`
3. Thêm logic mô phỏng trong `generateTelemetryData()`

### Thêm widget mới
1. Tạo component trong `src/components/Widgets/`
2. Thêm vào `src/constants/widgetTypes.js`
3. Import và export component

### Tích hợp ThingsBoard thực
1. Thay thế `TelemetryService` với ThingsBoard client
2. Cập nhật WebSocket để forward ThingsBoard messages
3. Sử dụng ThingsBoard device credentials

## 📚 Tài liệu tham khảo

- [ThingsBoard Documentation](https://thingsboard.io/docs/)
- [Go WebSocket](https://pkg.go.dev/github.com/gorilla/websocket)
- [React Hooks](https://reactjs.org/docs/hooks-intro.html)
- [ECharts](https://echarts.apache.org/)

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## 📄 License

MIT License - xem file LICENSE để biết thêm chi tiết.
