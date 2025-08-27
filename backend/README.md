# ThingsBoard Widget Backend

Backend Go cho React Widget Demo, cung cấp real-time telemetry data tương tự ThingsBoard.

## Tính năng

- **Real-time Telemetry**: WebSocket server cho live data updates
- **REST API**: RESTful endpoints cho historical data và device management
- **Device Simulation**: Mô phỏng 4 thiết bị IoT với dữ liệu thực tế
- **CORS Support**: Hỗ trợ cross-origin requests từ frontend
- **Configuration**: File config YAML linh hoạt

## Thiết bị được mô phỏng

1. **Temperature Sensor 1** (device_001)
   - Temperature (°C)
   - Humidity (%)

2. **Humidity Sensor 1** (device_002)
   - Humidity (%)
   - Pressure (hPa)

3. **Power Meter 1** (device_003)
   - Voltage (V)
   - Current (A)
   - Power (kW)
   - Energy (kWh)

4. **Water Flow Sensor 1** (device_004)
   - Flow Rate (L/min)
   - Total Volume (L)
   - Pump Status (boolean)

## API Endpoints

### REST API

- `GET /api/v1/telemetry/devices` - Danh sách tất cả thiết bị
- `GET /api/v1/telemetry/devices/:id` - Thông tin thiết bị cụ thể
- `GET /api/v1/telemetry/devices/:id/latest` - Dữ liệu telemetry mới nhất
- `GET /api/v1/telemetry/devices/:id/keys` - Các telemetry keys có sẵn
- `POST /api/v1/telemetry/timeseries` - Dữ liệu lịch sử
- `GET /api/v1/system/status` - Trạng thái hệ thống

### WebSocket

- `GET /ws` - WebSocket endpoint cho real-time updates

## Cài đặt và chạy

### Yêu cầu

- Go 1.21+
- Git

### Cài đặt dependencies

```bash
cd backend
go mod tidy
```

### Chạy backend

```bash
go run main.go
```

Backend sẽ chạy trên port 8080 (có thể thay đổi trong config.yaml).

### Build binary

```bash
go build -o thingsboard-backend main.go
./thingsboard-backend
```

## Cấu hình

Chỉnh sửa `config.yaml` để thay đổi:

- Port server
- CORS settings
- WebSocket settings
- Telemetry simulation interval
- Device configurations

## Kết nối với Frontend

Frontend React có thể kết nối với backend qua:

1. **REST API**: Gọi các endpoints để lấy dữ liệu lịch sử
2. **WebSocket**: Kết nối `/ws` để nhận real-time updates

## Cấu trúc dự án

```
backend/
├── main.go                 # Entry point
├── config.yaml            # Configuration file
├── go.mod                 # Go modules
├── models/                # Data models
│   └── telemetry.go
├── services/              # Business logic
│   ├── telemetry_service.go
│   └── websocket_manager.go
├── handlers/              # HTTP handlers
│   └── telemetry_handlers.go
└── routes/                # Route definitions
    └── routes.go
```

## WebSocket Message Format

### Subscribe to device
```json
{
  "type": "subscribe",
  "payload": {
    "deviceId": "device_001"
  }
}
```

### Telemetry update
```json
{
  "type": "telemetry_update",
  "payload": {
    "deviceId": "device_001",
    "timestamp": "2024-01-01T12:00:00Z",
    "values": {
      "temperature": 25.5,
      "humidity": 60.2
    }
  }
}
```

## Development

### Thêm thiết bị mới

1. Cập nhật `initializeDevices()` trong `telemetry_service.go`
2. Thêm logic mô phỏng trong `generateTelemetryData()`
3. Cập nhật `config.yaml` nếu cần

### Thêm telemetry keys

1. Cập nhật `initializeDevices()` với keys mới
2. Thêm logic xử lý trong `generateTelemetryData()`
3. Cập nhật handlers nếu cần

## Troubleshooting

### Port đã được sử dụng
Thay đổi port trong `config.yaml` hoặc kill process đang sử dụng port.

### WebSocket connection failed
Kiểm tra CORS settings và đảm bảo frontend kết nối đúng endpoint `/ws`.

### Dữ liệu không cập nhật
Kiểm tra log để đảm bảo telemetry service đang chạy và WebSocket manager hoạt động.
