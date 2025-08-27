package models

import (
	"time"

	"github.com/google/uuid"
)

// Telemetry represents the new telemetry entity structure
type Telemetry struct {
	EntityID  uuid.UUID `gorm:"type:uuid;not null;primary_key" json:"entityId"`
	Timestamp time.Time `gorm:"not null;primary_key;autoCreateTime" json:"ts"`
	Key       int       `gorm:"not null;primary_key" json:"key"`
	BoolVal   *bool     `gorm:"type:boolean" json:"boolVal,omitempty"`
	IntVal    *int      `gorm:"type:integer" json:"intVal,omitempty"`
	DoubleVal *float64  `gorm:"type:double precision" json:"doubleVal,omitempty"`
	StringVal *string   `gorm:"type:text" json:"stringVal,omitempty"`
	JSONVal   *string   `gorm:"type:jsonb" json:"jsonVal,omitempty"` // Using string for JSON
}

// TelemetryData represents a single telemetry reading for WebSocket
type TelemetryData struct {
	DeviceID   string                 `json:"deviceId"`
	Timestamp  time.Time              `json:"timestamp"`
	Values     map[string]interface{} `json:"values"`
	DeviceName string                 `json:"deviceName"`
	DeviceType string                 `json:"deviceType"`
	Location   string                 `json:"location"`
}

// TimeSeriesRequest represents a request for historical telemetry data
type TimeSeriesRequest struct {
	DeviceID string   `json:"deviceId" binding:"required"`
	Keys     []string `json:"keys" binding:"required"`
	StartTs  int64    `json:"startTs"`
	EndTs    int64    `json:"endTs"`
	Interval int64    `json:"interval"` // in milliseconds
}

// TimeSeriesResponse represents historical telemetry data response
type TimeSeriesResponse struct {
	DeviceID string                 `json:"deviceId"`
	Data     map[string][][]float64 `json:"data"` // key -> [timestamp, value] pairs
}

// WebSocketMessage represents a WebSocket message
type WebSocketMessage struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}

// Device represents a device configuration
type Device struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Type     string `json:"type"`
	Location string `json:"location"`
}

// TelemetryKey represents a telemetry key configuration
type TelemetryKey struct {
	Name     string      `json:"name"`
	Type     string      `json:"type"` // numeric, boolean, string
	Unit     string      `json:"unit,omitempty"`
	MinValue float64     `json:"minValue,omitempty"`
	MaxValue float64     `json:"maxValue,omitempty"`
	Default  interface{} `json:"default,omitempty"`
}

// TelemetryKeyMapping maps string keys to integer IDs
type TelemetryKeyMapping struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
	Type string `json:"type"`
}

// DeviceEntityMapping maps device IDs to entity UUIDs
type DeviceEntityMapping struct {
	DeviceID string    `json:"deviceId"`
	EntityID uuid.UUID `json:"entityId"`
}
