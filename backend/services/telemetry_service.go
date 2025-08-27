package services

import (
	"math"
	"math/rand"
	"sync"
	"time"

	"thingsboard-widget-backend/models"

	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
)

// TelemetryBroadcaster interface for broadcasting telemetry data
type TelemetryBroadcaster interface {
	BroadcastTelemetry(telemetryData models.TelemetryData)
}

// TelemetryService handles telemetry data generation and management
type TelemetryService struct {
	devices        map[string]*models.Device
	keys           map[string]*models.TelemetryKey
	data           map[string][]models.TelemetryData
	keyMappings    map[string]int       // String key -> Integer ID mapping
	entityMappings map[string]uuid.UUID // Device ID -> Entity UUID mapping
	mutex          sync.RWMutex
	stop           chan bool
	broadcaster    TelemetryBroadcaster
}

// NewTelemetryService creates a new telemetry service
func NewTelemetryService() *TelemetryService {
	service := &TelemetryService{
		devices:        make(map[string]*models.Device),
		keys:           make(map[string]*models.TelemetryKey),
		data:           make(map[string][]models.TelemetryData),
		keyMappings:    make(map[string]int),
		entityMappings: make(map[string]uuid.UUID),
		stop:           make(chan bool),
		broadcaster:    nil,
	}

	// Initialize devices and telemetry keys
	service.initializeDevices()
	service.initializeKeyMappings()
	service.initializeEntityMappings()
	return service
}

// initializeKeyMappings sets up mapping from string keys to integer IDs
func (ts *TelemetryService) initializeKeyMappings() {
	// Temperature and humidity keys
	ts.keyMappings["temperature"] = 1
	ts.keyMappings["humidity"] = 2
	ts.keyMappings["pressure"] = 3

	// Power related keys
	ts.keyMappings["voltage"] = 4
	ts.keyMappings["current"] = 5
	ts.keyMappings["power"] = 6
	ts.keyMappings["energy"] = 7
	ts.keyMappings["cost"] = 8

	// Water flow keys
	ts.keyMappings["flow_rate"] = 9
	ts.keyMappings["total_volume"] = 10
	ts.keyMappings["pump_status"] = 11
}

// initializeEntityMappings sets up mapping from device IDs to entity UUIDs
func (ts *TelemetryService) initializeEntityMappings() {
	ts.entityMappings["device_001"] = uuid.MustParse("550e8400-e29b-41d4-a716-446655440001")
	ts.entityMappings["device_002"] = uuid.MustParse("550e8400-e29b-41d4-a716-446655440002")
	ts.entityMappings["device_003"] = uuid.MustParse("550e8400-e29b-41d4-a716-446655440003")
	ts.entityMappings["device_004"] = uuid.MustParse("550e8400-e29b-41d4-a716-446655440004")
	ts.entityMappings["power_meter"] = uuid.MustParse("550e8400-e29b-41d4-a716-446655440005")
}

// initializeDevices sets up default devices and telemetry keys
func (ts *TelemetryService) initializeDevices() {
	// Temperature Sensor
	tempDevice := &models.Device{
		ID:       "device_001",
		Name:     "Temperature Sensor 1",
		Type:     "sensor",
		Location: "Room A",
	}
	ts.devices[tempDevice.ID] = tempDevice
	ts.keys["temperature"] = &models.TelemetryKey{
		Name: "temperature", Type: "numeric", Unit: "°C", MinValue: -10, MaxValue: 50,
	}
	ts.keys["humidity"] = &models.TelemetryKey{
		Name: "humidity", Type: "numeric", Unit: "%", MinValue: 0, MaxValue: 100,
	}

	// Humidity Sensor
	humidityDevice := &models.Device{
		ID:       "device_002",
		Name:     "Humidity Sensor 1",
		Type:     "sensor",
		Location: "Room A",
	}
	ts.devices[humidityDevice.ID] = humidityDevice
	ts.keys["humidity"] = &models.TelemetryKey{
		Name: "humidity", Type: "numeric", Unit: "%", MinValue: 0, MaxValue: 100,
	}
	ts.keys["pressure"] = &models.TelemetryKey{
		Name: "pressure", Type: "numeric", Unit: "hPa", MinValue: 900, MaxValue: 1100,
	}

	// Power Meter
	powerDevice := &models.Device{
		ID:       "device_003",
		Name:     "Power Meter 1",
		Type:     "meter",
		Location: "Electrical Room",
	}
	ts.devices[powerDevice.ID] = powerDevice
	ts.keys["voltage"] = &models.TelemetryKey{
		Name: "voltage", Type: "numeric", Unit: "V", MinValue: 200, MaxValue: 250,
	}
	ts.keys["current"] = &models.TelemetryKey{
		Name: "current", Type: "numeric", Unit: "A", MinValue: 0, MaxValue: 100,
	}
	ts.keys["power"] = &models.TelemetryKey{
		Name: "power", Type: "numeric", Unit: "kW", MinValue: 0, MaxValue: 25,
	}
	ts.keys["energy"] = &models.TelemetryKey{
		Name: "energy", Type: "numeric", Unit: "kWh", MinValue: 0, MaxValue: 1000000,
	}

	// Water Flow Sensor
	waterDevice := &models.Device{
		ID:       "device_004",
		Name:     "Water Flow Sensor 1",
		Type:     "sensor",
		Location: "Pump Station",
	}
	ts.devices[waterDevice.ID] = waterDevice
	ts.keys["flow_rate"] = &models.TelemetryKey{
		Name: "flow_rate", Type: "numeric", Unit: "L/min", MinValue: 0, MaxValue: 1000,
	}
	ts.keys["total_volume"] = &models.TelemetryKey{
		Name: "total_volume", Type: "numeric", Unit: "L", MinValue: 0, MaxValue: 1000000,
	}
	ts.keys["pump_status"] = &models.TelemetryKey{
		Name: "pump_status", Type: "boolean", Default: false,
	}

	// Smart Power Meter for Power Consumption Widget
	smartPowerDevice := &models.Device{
		ID:       "power_meter",
		Name:     "Smart Power Meter",
		Type:     "meter",
		Location: "Main Panel",
	}
	ts.devices[smartPowerDevice.ID] = smartPowerDevice
	ts.keys["voltage"] = &models.TelemetryKey{
		Name: "voltage", Type: "numeric", Unit: "V", MinValue: 220, MaxValue: 240,
	}
	ts.keys["current"] = &models.TelemetryKey{
		Name: "current", Type: "numeric", Unit: "A", MinValue: 0, MaxValue: 50,
	}
	ts.keys["power"] = &models.TelemetryKey{
		Name: "power", Type: "numeric", Unit: "kW", MinValue: 0, MaxValue: 5,
	}
	ts.keys["energy"] = &models.TelemetryKey{
		Name: "energy", Type: "numeric", Unit: "kWh", MinValue: 0, MaxValue: 1000000,
	}
	ts.keys["cost"] = &models.TelemetryKey{
		Name: "cost", Type: "numeric", Unit: "VND", MinValue: 0, MaxValue: 1000000,
	}
}

// StartSimulation starts the telemetry data simulation
func (ts *TelemetryService) StartSimulation() {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	logrus.Info("Starting telemetry simulation (5 second interval)")

	for {
		select {
		case <-ticker.C:
			ts.generateTelemetryData()
		case <-ts.stop:
			logrus.Info("Stopping telemetry simulation")
			return
		}
	}
}

// generateTelemetryData generates new telemetry data for all devices
func (ts *TelemetryService) generateTelemetryData() {
	ts.mutex.Lock()
	defer ts.mutex.Unlock()

	now := time.Now()

	for deviceID, device := range ts.devices {
		values := make(map[string]interface{})

		// Generate values based on device type
		switch device.Type {
		case "sensor":
			if deviceID == "device_001" {
				// Temperature and humidity sensor
				values["temperature"] = ts.generateTemperature(now)
				values["humidity"] = ts.generateHumidity(values["temperature"].(float64))
			} else if deviceID == "device_002" {
				// Humidity and pressure sensor
				values["humidity"] = 50.0 + rand.Float64()*20.0
				values["pressure"] = ts.generatePressure()
			} else if deviceID == "device_004" {
				// Water flow sensor
				values["flow_rate"] = ts.generateFlowRate(now)
				values["total_volume"] = ts.generateTotalVolume(deviceID, values["flow_rate"].(float64))
				values["pump_status"] = ts.generatePumpStatus(now)
			}
		case "meter":
			if deviceID == "device_003" || deviceID == "power_meter" {
				// Power meters
				values["voltage"] = ts.generateVoltage()
				values["current"] = ts.generateCurrent(now)
				values["power"] = values["voltage"].(float64) * values["current"].(float64) / 1000.0
				values["energy"] = ts.generateEnergy(deviceID, values["power"].(float64))

				if deviceID == "power_meter" {
					values["cost"] = values["energy"].(float64) * 2500.0
				}
			}
		}

		telemetryData := models.TelemetryData{
			DeviceID:   deviceID,
			Timestamp:  now,
			Values:     values,
			DeviceName: device.Name,
			DeviceType: device.Type,
			Location:   device.Location,
		}

		ts.data[deviceID] = append(ts.data[deviceID], telemetryData)

		// Keep only last 1000 data points per device
		if len(ts.data[deviceID]) > 1000 {
			ts.data[deviceID] = ts.data[deviceID][len(ts.data[deviceID])-1000:]
		}

		// Broadcast telemetry data to WebSocket clients if broadcaster is available
		if ts.broadcaster != nil {
			ts.broadcaster.BroadcastTelemetry(telemetryData)
		}
	}
}

// Helper methods for generating specific telemetry values
func (ts *TelemetryService) generateTemperature(now time.Time) float64 {
	hour := float64(now.Hour())
	baseTemp := 20.0 + 10.0*math.Sin(2*math.Pi*(hour-6)/24)
	noise := (rand.Float64() - 0.5) * 2.0
	return math.Max(-10, math.Min(50, baseTemp+noise))
}

func (ts *TelemetryService) generateHumidity(temperature float64) float64 {
	baseHumidity := 60.0 - (temperature-20.0)*1.5
	noise := (rand.Float64() - 0.5) * 10.0
	return math.Max(0, math.Min(100, baseHumidity+noise))
}

func (ts *TelemetryService) generatePressure() float64 {
	basePressure := 1013.25
	variation := (rand.Float64() - 0.5) * 20.0
	return math.Max(900, math.Min(1100, basePressure+variation))
}

func (ts *TelemetryService) generateVoltage() float64 {
	baseVoltage := 230.0
	variation := (rand.Float64() - 0.5) * 10.0
	return math.Max(200, math.Min(250, baseVoltage+variation))
}

func (ts *TelemetryService) generateCurrent(now time.Time) float64 {
	hour := float64(now.Hour())
	baseCurrent := 20.0 + 30.0*math.Sin(2*math.Pi*(hour-8)/24)
	noise := (rand.Float64() - 0.5) * 5.0
	return math.Max(0, math.Min(100, baseCurrent+noise))
}

func (ts *TelemetryService) generateFlowRate(now time.Time) float64 {
	hour := float64(now.Hour())
	baseFlow := 200.0 + 300.0*math.Sin(2*math.Pi*(hour-6)/24)
	noise := (rand.Float64() - 0.5) * 50.0
	return math.Max(0, math.Min(1000, baseFlow+noise))
}

func (ts *TelemetryService) generateTotalVolume(deviceID string, flowRate float64) float64 {
	lastVolume := 0.0
	if len(ts.data[deviceID]) > 0 {
		if lastVal, ok := ts.data[deviceID][len(ts.data[deviceID])-1].Values["total_volume"]; ok {
			lastVolume = lastVal.(float64)
		}
	}
	newVolume := lastVolume + flowRate/60.0 // Convert L/min to L/s
	return math.Max(0, math.Min(1000000, newVolume))
}

func (ts *TelemetryService) generatePumpStatus(now time.Time) bool {
	hour := float64(now.Hour())
	return hour >= 6 && hour <= 22 // Pump runs from 6 AM to 10 PM
}

func (ts *TelemetryService) generateEnergy(deviceID string, power float64) float64 {
	lastEnergy := 0.0
	if len(ts.data[deviceID]) > 0 {
		if lastVal, ok := ts.data[deviceID][len(ts.data[deviceID])-1].Values["energy"]; ok {
			lastEnergy = lastVal.(float64)
		}
	}
	newEnergy := lastEnergy + power/3600.0 // Convert kW to kWh (5 second interval)
	return math.Max(0, math.Min(1000000, newEnergy))
}

// GetLatestTelemetry returns the latest telemetry data for a device
func (ts *TelemetryService) GetLatestTelemetry(deviceID string) (*models.TelemetryData, bool) {
	ts.mutex.RLock()
	defer ts.mutex.RUnlock()

	if data, exists := ts.data[deviceID]; exists && len(data) > 0 {
		return &data[len(data)-1], true
	}
	return nil, false
}

// GetTimeSeriesData returns historical telemetry data
func (ts *TelemetryService) GetTimeSeriesData(request models.TimeSeriesRequest) *models.TimeSeriesResponse {
	ts.mutex.RLock()
	defer ts.mutex.RUnlock()

	response := &models.TimeSeriesResponse{
		DeviceID: request.DeviceID,
		Data:     make(map[string][][]float64),
	}

	if data, exists := ts.data[request.DeviceID]; exists {
		startTime := time.Unix(request.StartTs/1000, 0)
		endTime := time.Unix(request.EndTs/1000, 0)

		for _, key := range request.Keys {
			var keyData [][]float64
			for _, record := range data {
				if record.Timestamp.After(startTime) && record.Timestamp.Before(endTime) {
					if value, exists := record.Values[key]; exists {
						switch v := value.(type) {
						case float64:
							keyData = append(keyData, []float64{float64(record.Timestamp.UnixMilli()), v})
						case bool:
							if v {
								keyData = append(keyData, []float64{float64(record.Timestamp.UnixMilli()), 1.0})
							} else {
								keyData = append(keyData, []float64{float64(record.Timestamp.UnixMilli()), 0.0})
							}
						}
					}
				}
			}
			response.Data[key] = keyData
		}
	}

	return response
}

// GetDevices returns all available devices
func (ts *TelemetryService) GetDevices() []*models.Device {
	ts.mutex.RLock()
	defer ts.mutex.RUnlock()

	devices := make([]*models.Device, 0, len(ts.devices))
	for _, device := range ts.devices {
		devices = append(devices, device)
	}
	return devices
}

// GetDevice returns a specific device
func (ts *TelemetryService) GetDevice(deviceID string) (*models.Device, bool) {
	ts.mutex.RLock()
	defer ts.mutex.RUnlock()

	device, exists := ts.devices[deviceID]
	return device, exists
}

// GetKeyMappings returns the telemetry key mappings
func (ts *TelemetryService) GetKeyMappings() map[string]int {
	ts.mutex.RLock()
	defer ts.mutex.RUnlock()

	mappings := make(map[string]int)
	for k, v := range ts.keyMappings {
		mappings[k] = v
	}
	return mappings
}

// GetEntityMappings returns the device to entity mappings
func (ts *TelemetryService) GetEntityMappings() map[string]uuid.UUID {
	ts.mutex.RLock()
	defer ts.mutex.RUnlock()

	mappings := make(map[string]uuid.UUID)
	for k, v := range ts.entityMappings {
		mappings[k] = v
	}
	return mappings
}

// SetBroadcaster sets the telemetry broadcaster for broadcasting telemetry data
func (ts *TelemetryService) SetBroadcaster(broadcaster TelemetryBroadcaster) {
	ts.broadcaster = broadcaster
}

// Stop stops the telemetry service
func (ts *TelemetryService) Stop() {
	close(ts.stop)
}
