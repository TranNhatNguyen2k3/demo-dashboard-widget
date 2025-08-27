package services

import (
	"encoding/json"
	"net/http"
	"sync"

	"thingsboard-widget-backend/models"

	"github.com/gorilla/websocket"
)

// WebSocketManager handles WebSocket connections for real-time telemetry
type WebSocketManager struct {
	telemetryService *TelemetryService
	clients          map[*websocket.Conn]bool
	broadcast        chan models.TelemetryData
	register         chan *websocket.Conn
	unregister       chan *websocket.Conn
	mutex            sync.RWMutex
	upgrader         websocket.Upgrader
}

// NewWebSocketManager creates a new WebSocket manager
func NewWebSocketManager(telemetryService *TelemetryService) *WebSocketManager {
	return &WebSocketManager{
		telemetryService: telemetryService,
		clients:          make(map[*websocket.Conn]bool),
		broadcast:        make(chan models.TelemetryData, 100),
		register:         make(chan *websocket.Conn),
		unregister:       make(chan *websocket.Conn),
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true // Allow all origins for demo
			},
		},
	}
}

// Start starts the WebSocket manager
func (wm *WebSocketManager) Start() {
	for {
		select {
		case client := <-wm.register:
			wm.mutex.Lock()
			wm.clients[client] = true
			wm.mutex.Unlock()

		case client := <-wm.unregister:
			wm.mutex.Lock()
			delete(wm.clients, client)
			wm.mutex.Unlock()

		case telemetryData := <-wm.broadcast:
			wm.mutex.RLock()
			clients := make([]*websocket.Conn, 0, len(wm.clients))
			for client := range wm.clients {
				clients = append(clients, client)
			}
			wm.mutex.RUnlock()

			message := models.WebSocketMessage{
				Type:    "telemetry_update",
				Payload: telemetryData,
			}

			for _, client := range clients {
				err := client.WriteJSON(message)
				if err != nil {
					client.Close()
					wm.unregister <- client
				}
			}
		}
	}
}

// HandleWebSocket handles incoming WebSocket connections
func (wm *WebSocketManager) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := wm.upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}

	wm.register <- conn

	// Start goroutine to handle client messages
	go wm.handleClient(conn)
}

// handleClient handles individual client connections
func (wm *WebSocketManager) handleClient(conn *websocket.Conn) {
	defer func() {
		wm.unregister <- conn
		conn.Close()
	}()

	for {
		// Read message from client
		_, message, err := conn.ReadMessage()
		if err != nil {
			break
		}

		// Parse message
		var wsMessage models.WebSocketMessage
		if err := json.Unmarshal(message, &wsMessage); err != nil {
			continue
		}

		// Handle different message types
		switch wsMessage.Type {
		case "subscribe":
			// Handle subscription to specific device
			if payload, ok := wsMessage.Payload.(map[string]interface{}); ok {
				if deviceID, exists := payload["deviceId"]; exists {
					// Send latest data immediately
					if telemetryData, exists := wm.telemetryService.GetLatestTelemetry(deviceID.(string)); exists {
						response := models.WebSocketMessage{
							Type:    "telemetry_data",
							Payload: telemetryData,
						}
						conn.WriteJSON(response)
					}
				}
			}

		case "ping":
			// Respond to ping with pong
			response := models.WebSocketMessage{
				Type:    "pong",
				Payload: "pong",
			}
			conn.WriteJSON(response)
		}
	}
}

// BroadcastTelemetry broadcasts telemetry data to all connected clients
func (wm *WebSocketManager) BroadcastTelemetry(telemetryData models.TelemetryData) {
	wm.broadcast <- telemetryData
}

// GetConnectedClientsCount returns the number of connected clients
func (wm *WebSocketManager) GetConnectedClientsCount() int {
	wm.mutex.RLock()
	defer wm.mutex.RUnlock()
	return len(wm.clients)
}
