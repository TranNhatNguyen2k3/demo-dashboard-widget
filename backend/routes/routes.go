package routes

import (
	"thingsboard-widget-backend/handlers"
	"thingsboard-widget-backend/services"

	"github.com/gin-gonic/gin"
)

// SetupRoutes configures all API routes
func SetupRoutes(router *gin.Engine, telemetryService *services.TelemetryService, websocketManager *services.WebSocketManager) {
	// Create handlers
	telemetryHandlers := handlers.NewTelemetryHandlers(telemetryService)

	// API v1 group
	v1 := router.Group("/api/v1")
	{
		// Telemetry endpoints
		telemetry := v1.Group("/telemetry")
		{
			telemetry.GET("/devices", telemetryHandlers.GetDevices)
			telemetry.GET("/devices/:id", telemetryHandlers.GetDevice)
			telemetry.GET("/latest/:deviceId", telemetryHandlers.GetLatestTelemetry)
			telemetry.GET("/devices/:id/keys", telemetryHandlers.GetDeviceTelemetryKeys)
			telemetry.POST("/timeseries", telemetryHandlers.GetTimeSeriesData)

			// New entity-based endpoints
			telemetry.GET("/keys/mappings", telemetryHandlers.GetTelemetryKeyMappings)
			telemetry.GET("/entities/mappings", telemetryHandlers.GetEntityMappings)
			telemetry.GET("/entities/:id/data", telemetryHandlers.GetTelemetryEntityData)
		}

		// System endpoints
		system := v1.Group("/system")
		{
			system.GET("/status", telemetryHandlers.GetSystemStatus)
		}
	}

	// WebSocket endpoint
	router.GET("/ws", func(c *gin.Context) {
		websocketManager.HandleWebSocket(c.Writer, c.Request)
	})

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "healthy",
			"service": "thingsboard-widget-backend",
		})
	})

	// Root endpoint
	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "ThingsBoard Widget Backend API",
			"version": "1.0.0",
			"endpoints": gin.H{
				"api":       "/api/v1",
				"websocket": "/ws",
				"health":    "/health",
			},
		})
	})
}
