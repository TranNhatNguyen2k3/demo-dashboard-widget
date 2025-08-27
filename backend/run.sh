#!/bin/bash

echo "Starting ThingsBoard Widget Backend..."
echo

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo "Error: Go is not installed or not in PATH"
    echo "Please install Go from https://golang.org/"
    exit 1
fi

echo "Go version:"
go version
echo

# Install dependencies
echo "Installing dependencies..."
go mod tidy
if [ $? -ne 0 ]; then
    echo "Error: Failed to install dependencies"
    exit 1
fi

echo
echo "Starting server on http://localhost:8080"
echo "Press Ctrl+C to stop"
echo

# Run the backend
go run main.go
