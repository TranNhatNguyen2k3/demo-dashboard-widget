# ⚡ Power Consumption Widget - Real-Time Monitoring System

## 🎯 **Mục tiêu**
Tạo một hệ thống monitoring điện năng tiêu thụ real-time với:
- **Backend Go**: Liên tục gửi telemetry data
- **Frontend React**: Widget hiển thị data real-time
- **WebSocket**: Kết nối real-time giữa BE và FE
- **Data Visualization**: Biểu đồ và metrics trực quan

## 🏗️ **Kiến trúc Hệ thống**

```
┌─────────────────┐    WebSocket    ┌─────────────────┐
│   Go Backend    │ ◄──────────────► │  React Frontend │
│                 │                  │                 │
│ • Telemetry     │                  │ • Power Widget  │
│ • WebSocket     │                  │ • Real-time UI  │
│ • Data Sim      │                  │ • Charts        │
└─────────────────┘                  └─────────────────┘
```

## 🚀 **Cách Sử Dụng**

### **1. Khởi động Backend**
```bash
cd backend
go run main.go
```

**Backend sẽ:**
- Tạo device `power_meter` với telemetry keys:
  - `voltage` (V) - Điện áp
  - `current` (A) - Dòng điện  
  - `power` (kW) - Công suất
  - `energy` (kWh) - Năng lượng tiêu thụ
  - `cost` (VND) - Chi phí điện

- Gửi data mỗi giây qua WebSocket
- Tính toán cost dựa trên energy (2,500 VND/kWh)

### **2. Khởi động Frontend**
```bash
npm start
```

**Frontend sẽ:**
- Hiển thị Power Consumption Widget
- Kết nối WebSocket với backend
- Cập nhật data real-time mỗi giây
- Hiển thị biểu đồ 24h usage

### **3. Test Hệ thống**
```bash
python test-power-consumption.py
```

**Script test sẽ:**
- Kiểm tra backend health
- Test WebSocket connection
- Verify telemetry data
- Monitor real-time updates

## 📊 **Widget Features**

### **Real-time Display**
- ⚡ **Current Power**: Hiển thị công suất hiện tại (kW)
- 🔌 **Status Indicator**: Low/Medium/High consumption
- 📈 **Live Updates**: Cập nhật mỗi giây

### **Metrics Grid**
- **Voltage**: Điện áp (V)
- **Current**: Dòng điện (A)  
- **Energy**: Năng lượng tiêu thụ (kWh)
- **Cost**: Chi phí điện (VND)

### **Efficiency Metrics**
- **Power Factor**: Hệ số công suất (%)
- **Efficiency**: Hiệu suất sử dụng (%)

### **Usage Chart**
- **24h History**: Biểu đồ cột 24 giờ
- **Color Coding**: Green (Low) / Orange (Medium) / Red (High)
- **Hover Info**: Chi tiết từng điểm thời gian

## 🔧 **Technical Details**

### **Backend (Go)**
```go
// Device Configuration
{
  ID: "power_meter",
  Name: "Smart Power Meter", 
  Type: "meter",
  Location: "Main Panel"
}

// Telemetry Keys
- voltage: 220-240V
- current: 0-50A  
- power: 0-5kW
- energy: cumulative kWh
- cost: calculated VND
```

### **Frontend (React)**
```jsx
// WebSocket Hook
const { isConnected, latestData, error } = useWebSocket('power_meter');

// Real-time Updates
useEffect(() => {
  if (latestData?.values) {
    setPowerData({
      current: latestData.values.current,
      voltage: latestData.values.voltage,
      power: latestData.values.power,
      energy: latestData.values.energy,
      cost: latestData.values.cost
    });
  }
}, [latestData]);
```

### **Data Flow**
1. **Backend** simulates power consumption data
2. **WebSocket** broadcasts data mỗi giây
3. **Frontend** receives và updates UI
4. **Widget** displays real-time values
5. **Charts** update với historical data

## 🎨 **UI/UX Features**

### **Visual Design**
- **Gradient Background**: Blue to Purple theme
- **Glass Morphism**: Backdrop blur effects
- **Responsive Layout**: Mobile-friendly design
- **Smooth Animations**: Pulse effects cho real-time data

### **Status Indicators**
- **Connection Status**: Live/Offline dot
- **Power Level**: Color-coded consumption
- **Progress Bars**: Power factor & efficiency
- **Real-time Chart**: 24h usage visualization

### **Interactive Elements**
- **Hover Effects**: Chart bars, value items
- **Tooltips**: Detailed information
- **Responsive Grid**: Adaptive layout
- **Smooth Transitions**: CSS animations

## 📱 **Responsive Design**

### **Desktop (1200px+)**
- Full widget layout
- Side-by-side metrics
- Large charts và displays

### **Tablet (768px-1199px)**
- Adjusted spacing
- Stacked metrics
- Medium-sized elements

### **Mobile (<768px)**
- Single column layout
- Compact displays
- Touch-friendly interactions

## 🧪 **Testing & Debugging**

### **Backend Tests**
```bash
# Health check
curl http://localhost:8080/health

# Get devices
curl http://localhost:8080/api/v1/telemetry/devices

# Get latest telemetry
curl http://localhost:8080/api/v1/telemetry/latest/power_meter
```

### **Frontend Tests**
```bash
# Run test script
python test-power-consumption.py

# Check WebSocket
# Open browser console, look for WebSocket messages
```

### **Common Issues**
- **Backend not running**: Check port 8080
- **WebSocket errors**: Verify backend WebSocket endpoint
- **No data**: Check device ID 'power_meter'
- **UI not updating**: Verify WebSocket connection

## 🚀 **Deployment**

### **Production Backend**
```bash
cd backend
go build -o power-monitor
./power-monitor
```

### **Production Frontend**
```bash
npm run build
# Deploy dist/ folder to web server
```

### **Environment Variables**
```bash
# Backend config.yaml
server:
  port: 8080
  host: "0.0.0.0"

telemetry:
  simulation_interval: 1000  # 1 second
  devices:
    - power_meter
```

## 📈 **Performance & Scalability**

### **Current Limits**
- **Data Points**: 1000 per device
- **Update Rate**: 1 second
- **WebSocket Clients**: Unlimited
- **Memory Usage**: ~50MB

### **Optimization Tips**
- Reduce update frequency nếu cần
- Implement data aggregation
- Add caching layer
- Use connection pooling

## 🔮 **Future Enhancements**

### **Planned Features**
- **Alert System**: Threshold notifications
- **Data Export**: CSV/JSON download
- **Multi-device**: Multiple power meters
- **Historical Analysis**: Trends & patterns
- **Mobile App**: Native mobile support

### **Advanced Analytics**
- **Predictive Maintenance**: AI-powered insights
- **Energy Optimization**: Usage recommendations
- **Cost Forecasting**: Bill predictions
- **Peak Demand**: Load management

## 📚 **API Documentation**

### **WebSocket Messages**
```json
// Subscribe to device
{
  "type": "subscribe",
  "deviceId": "power_meter"
}

// Telemetry data
{
  "type": "telemetry",
  "deviceId": "power_meter",
  "timestamp": 1703123456789,
  "values": {
    "voltage": 230.5,
    "current": 15.2,
    "power": 3.5,
    "energy": 1250.8,
    "cost": 3127000
  }
}
```

### **REST Endpoints**
```
GET  /health                    - Backend health
GET  /api/v1/telemetry/devices - List all devices
GET  /api/v1/telemetry/latest/{deviceId} - Latest data
POST /api/v1/telemetry/timeseries - Historical data
```

## 🤝 **Contributing**

### **Development Setup**
1. Fork repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

### **Code Standards**
- **Go**: Follow Go formatting standards
- **React**: Use functional components + hooks
- **CSS**: BEM methodology + SCSS
- **Testing**: Unit tests for critical functions

## 📄 **License**

MIT License - Feel free to use và modify!

## 🆘 **Support**

### **Issues**
- Check existing issues trên GitHub
- Create new issue với detailed description
- Include logs và error messages

### **Questions**
- Review documentation trước
- Search existing discussions
- Ask specific questions với context

---

**🎉 Happy Power Monitoring! ⚡**
