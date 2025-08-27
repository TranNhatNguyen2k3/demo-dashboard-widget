#!/usr/bin/env python3
"""
Test script for ThingsBoard Widget Backend API
Run this script to test all API endpoints
"""

import requests
import json
import time
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8080"

def test_health_check():
    """Test health check endpoint"""
    print("🔍 Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"✅ Health check: {response.status_code}")
        print(f"   Response: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_root_endpoint():
    """Test root endpoint"""
    print("\n🔍 Testing root endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"✅ Root endpoint: {response.status_code}")
        print(f"   Response: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Root endpoint failed: {e}")
        return False

def test_get_devices():
    """Test getting all devices"""
    print("\n🔍 Testing get devices...")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/telemetry/devices")
        print(f"✅ Get devices: {response.status_code}")
        devices = response.json()
        print(f"   Found {len(devices['data'])} devices:")
        for device in devices['data']:
            print(f"     - {device['name']} ({device['id']}) at {device['location']}")
        return devices['data']
    except Exception as e:
        print(f"❌ Get devices failed: {e}")
        return []

def test_get_device(device_id):
    """Test getting specific device"""
    print(f"\n🔍 Testing get device {device_id}...")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/telemetry/devices/{device_id}")
        print(f"✅ Get device {device_id}: {response.status_code}")
        device = response.json()
        print(f"   Device: {device['data']['name']}")
        return device['data']
    except Exception as e:
        print(f"❌ Get device {device_id} failed: {e}")
        return None

def test_get_latest_telemetry(device_id):
    """Test getting latest telemetry for device"""
    print(f"\n🔍 Testing latest telemetry for {device_id}...")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/telemetry/devices/{device_id}/latest")
        print(f"✅ Latest telemetry for {device_id}: {response.status_code}")
        telemetry = response.json()
        print(f"   Latest data: {telemetry['data']['values']}")
        return telemetry['data']
    except Exception as e:
        print(f"❌ Latest telemetry for {device_id} failed: {e}")
        return None

def test_get_timeseries_data(device_id):
    """Test getting timeseries data"""
    print(f"\n🔍 Testing timeseries data for {device_id}...")
    try:
        end_time = int(time.time() * 1000)
        start_time = end_time - (60 * 60 * 1000)  # 1 hour ago
        
        payload = {
            "deviceId": device_id,
            "keys": ["temperature", "humidity"],
            "startTs": start_time,
            "endTs": end_time,
            "interval": 60000
        }
        
        response = requests.post(f"{BASE_URL}/api/v1/telemetry/timeseries", json=payload)
        print(f"✅ Timeseries data for {device_id}: {response.status_code}")
        data = response.json()
        
        if data['success']:
            for key, values in data['data']['data'].items():
                print(f"   {key}: {len(values)} data points")
        return data['data']
    except Exception as e:
        print(f"❌ Timeseries data for {device_id} failed: {e}")
        return None

def test_system_status():
    """Test system status endpoint"""
    print("\n🔍 Testing system status...")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/system/status")
        print(f"✅ System status: {response.status_code}")
        status = response.json()
        print(f"   Status: {status['data']['status']}")
        print(f"   Version: {status['data']['version']}")
        return True
    except Exception as e:
        print(f"❌ System status failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting ThingsBoard Widget Backend API Tests")
    print("=" * 50)
    
    # Test basic endpoints
    if not test_health_check():
        print("❌ Backend is not running. Please start the backend first.")
        return
    
    test_root_endpoint()
    
    # Test telemetry endpoints
    devices = test_get_devices()
    if not devices:
        print("❌ No devices found. Backend may not be running properly.")
        return
    
    # Test with first device
    first_device = devices[0]
    device_id = first_device['id']
    
    test_get_device(device_id)
    test_get_latest_telemetry(device_id)
    test_get_timeseries_data(device_id)
    
    # Test system endpoints
    test_system_status()
    
    print("\n" + "=" * 50)
    print("✅ All tests completed!")
    print("\n💡 To test WebSocket real-time updates:")
    print("   1. Open your browser console")
    print("   2. Connect to: ws://localhost:8080/ws")
    print("   3. Send: {\"type\": \"subscribe\", \"payload\": {\"deviceId\": \"" + device_id + "\"}}")
    print("   4. Watch for real-time telemetry updates!")

if __name__ == "__main__":
    main()
