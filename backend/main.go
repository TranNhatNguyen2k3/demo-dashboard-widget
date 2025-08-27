package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"thingsboard-widget-backend/routes"
	"thingsboard-widget-backend/services"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"github.com/spf13/viper"
)

func main() {
	// Load configuration
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath(".")
	viper.AutomaticEnv()

	// Set default values
	viper.SetDefault("server.port", 8080)
	viper.SetDefault("server.host", "localhost")
	viper.SetDefault("cors.enabled", true)
	viper.SetDefault("websocket.enabled", true)

	// Read config file
	if err := viper.ReadInConfig(); err != nil {
		logrus.Warn("No config file found, using defaults")
	}

	// Initialize logger
	logrus.SetFormatter(&logrus.JSONFormatter{})
	logrus.SetLevel(logrus.InfoLevel)

	// Create router
	router := gin.Default()

	// CORS middleware
	if viper.GetBool("cors.enabled") {
		router.Use(func(c *gin.Context) {
			c.Header("Access-Control-Allow-Origin", "*")
			c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

			if c.Request.Method == "OPTIONS" {
				c.AbortWithStatus(204)
				return
			}

			c.Next()
		})
	}

	// Initialize services
	telemetryService := services.NewTelemetryService()
	websocketManager := services.NewWebSocketManager(telemetryService)

	// Set WebSocket manager in telemetry service for broadcasting
	telemetryService.SetBroadcaster(websocketManager)

	// Setup routes
	routes.SetupRoutes(router, telemetryService, websocketManager)

	// Start WebSocket manager
	if viper.GetBool("websocket.enabled") {
		go websocketManager.Start()
	}

	// Start telemetry simulation
	go telemetryService.StartSimulation()

	// Create server
	port := viper.GetString("server.port")
	server := &http.Server{
		Addr:    ":" + port,
		Handler: router,
	}

	// Start server in goroutine
	go func() {
		logrus.Infof("Starting server on port %s", port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logrus.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	logrus.Info("Shutting down server...")

	// Graceful shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		logrus.Fatal("Server forced to shutdown:", err)
	}

	logrus.Info("Server exited")
}
