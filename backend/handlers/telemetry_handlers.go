package handlers

import (
	"net/http"
	"time"

	"thingsboard-widget-backend/models"
	"thingsboard-widget-backend/services"

	"github.com/gin-gonic/gin"
)

// TelemetryHandlers handles HTTP requests for telemetry data
type TelemetryHandlers struct {
	telemetryService *services.TelemetryService
}

// NewTelemetryHandlers creates new telemetry handlers
func NewTelemetryHandlers(telemetryService *services.TelemetryService) *TelemetryHandlers {
	return &TelemetryHandlers{
		telemetryService: telemetryService,
	}
}

// GetDevices returns all available devices
func (th *TelemetryHandlers) GetDevices(c *gin.Context) {
	devices := th.telemetryService.GetDevices()
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    devices,
	})
}

// GetDevice returns a specific device
func (th *TelemetryHandlers) GetDevice(c *gin.Context) {
	deviceID := c.Param("id")
	device, exists := th.telemetryService.GetDevice(deviceID)

	if !exists {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "Device not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    device,
	})
}

// GetLatestTelemetry returns the latest telemetry data for a device
func (th *TelemetryHandlers) GetLatestTelemetry(c *gin.Context) {
	deviceID := c.Param("id")
	telemetryData, exists := th.telemetryService.GetLatestTelemetry(deviceID)

	if !exists {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "Telemetry data not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    telemetryData,
	})
}

// GetTimeSeriesData returns historical telemetry data
func (th *TelemetryHandlers) GetTimeSeriesData(c *gin.Context) {
	var request models.TimeSeriesRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request format: " + err.Error(),
		})
		return
	}

	// Set default values if not provided
	if request.StartTs == 0 {
		request.StartTs = time.Now().Add(-1 * time.Hour).UnixMilli()
	}
	if request.EndTs == 0 {
		request.EndTs = time.Now().UnixMilli()
	}
	if request.Interval == 0 {
		request.Interval = 60000 // 1 minute default
	}

	response := th.telemetryService.GetTimeSeriesData(request)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    response,
	})
}

// GetDeviceTelemetryKeys returns available telemetry keys for a device
func (th *TelemetryHandlers) GetDeviceTelemetryKeys(c *gin.Context) {
	deviceID := c.Param("id")
	device, exists := th.telemetryService.GetDevice(deviceID)

	if !exists {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "Device not found",
		})
		return
	}

	// This would typically come from the telemetry service
	// For now, return a mock response
	keys := []models.TelemetryKey{
		{Name: "temperature", Type: "numeric", Unit: "°C"},
		{Name: "humidity", Type: "numeric", Unit: "%"},
		{Name: "pressure", Type: "numeric", Unit: "hPa"},
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"device": device,
			"keys":   keys,
		},
	})
}

// GetSystemStatus returns system status information
func (th *TelemetryHandlers) GetSystemStatus(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"status":    "running",
			"timestamp": time.Now().Unix(),
			"version":   "1.0.0",
		},
	})
}

// GetTelemetryKeyMappings returns the mapping of telemetry keys to integer IDs
func (th *TelemetryHandlers) GetTelemetryKeyMappings(c *gin.Context) {
	keyMappings := th.telemetryService.GetKeyMappings()

	// Convert to array format for easier frontend consumption
	var mappings []models.TelemetryKeyMapping
	for name, id := range keyMappings {
		mappings = append(mappings, models.TelemetryKeyMapping{
			ID:   id,
			Name: name,
			Type: "numeric", // Default type, could be enhanced
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    mappings,
	})
}

// GetEntityMappings returns the mapping of device IDs to entity UUIDs
func (th *TelemetryHandlers) GetEntityMappings(c *gin.Context) {
	entityMappings := th.telemetryService.GetEntityMappings()

	// Convert to array format for easier frontend consumption
	var mappings []models.DeviceEntityMapping
	for deviceID, entityID := range entityMappings {
		mappings = append(mappings, models.DeviceEntityMapping{
			DeviceID: deviceID,
			EntityID: entityID,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    mappings,
	})
}

// GetTelemetryEntityData returns telemetry data in the new entity format
func (th *TelemetryHandlers) GetTelemetryEntityData(c *gin.Context) {
	deviceID := c.Param("id")
	entityID, exists := th.telemetryService.GetEntityMappings()[deviceID]

	if !exists {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "Entity mapping not found for device",
		})
		return
	}

	telemetryData, exists := th.telemetryService.GetLatestTelemetry(deviceID)
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "Telemetry data not found",
		})
		return
	}

	// Convert to entity format
	var entityTelemetry []models.Telemetry
	keyMappings := th.telemetryService.GetKeyMappings()

	for keyName, value := range telemetryData.Values {
		if keyID, exists := keyMappings[keyName]; exists {
			entity := models.Telemetry{
				EntityID:  entityID,
				Timestamp: telemetryData.Timestamp,
				Key:       keyID,
			}

			// Set appropriate value field based on type
			switch v := value.(type) {
			case bool:
				entity.BoolVal = &v
			case int:
				entity.IntVal = &v
			case float64:
				entity.DoubleVal = &v
			case string:
				entity.StringVal = &v
			default:
				// For complex types, use JSON
				jsonStr := "{}" // Could be enhanced to serialize actual value
				entity.JSONVal = &jsonStr
			}

			entityTelemetry = append(entityTelemetry, entity)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"entityId":  entityID,
			"deviceId":  deviceID,
			"telemetry": entityTelemetry,
		},
	})
}
