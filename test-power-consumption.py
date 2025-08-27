#!/usr/bin/env python3
"""
Test script for Power Consumption Widget and Backend Telemetry
Tests real-time data streaming and widget functionality
"""

import requests
import json
import time
import websocket
import threading
from datetime import datetime

# Configuration
BACKEND_URL = "http://localhost:8080"
WEBSOCKET_URL = "ws://localhost:8080/ws"
TEST_DURATION = 30  # seconds

def test_backend_health():
    """Test if backend is running and healthy"""
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend is running and healthy")
            return True
        else:
            print(f"❌ Backend health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to backend: {e}")
        return False

def test_power_meter_device():
    """Test if power_meter device exists and has correct telemetry keys"""
    try:
        # Get devices
        response = requests.get(f"{BACKEND_URL}/api/v1/telemetry/devices", timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                devices = data.get('data', [])
                power_meter = next((d for d in devices if d['id'] == 'power_meter'), None)
                
                if power_meter:
                    print(f"✅ Power meter device found: {power_meter['name']}")
                    print(f"   Location: {power_meter['location']}")
                    print(f"   Type: {power_meter['type']}")
                    return True
                else:
                    print("❌ Power meter device not found")
                    return False
            else:
                print(f"❌ Failed to get devices: {data.get('message')}")
                return False
        else:
            print(f"❌ Failed to get devices: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Error testing power meter device: {e}")
        return False

def test_power_meter_telemetry():
    """Test power meter telemetry data generation"""
    try:
        # Get latest telemetry for power_meter
        response = requests.get(f"{BACKEND_URL}/api/v1/telemetry/latest/power_meter", timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                telemetry = data.get('data', {})
                values = telemetry.get('values', {})
                
                print("✅ Power meter telemetry data:")
                for key, value in values.items():
                    print(f"   {key}: {value}")
                
                # Check if all required keys exist
                required_keys = ['voltage', 'current', 'power', 'energy', 'cost']
                missing_keys = [key for key in required_keys if key not in values]
                
                if missing_keys:
                    print(f"❌ Missing telemetry keys: {missing_keys}")
                    return False
                else:
                    print("✅ All required telemetry keys present")
                    return True
            else:
                print(f"❌ Failed to get telemetry: {data.get('message')}")
                return False
        else:
            print(f"❌ Failed to get telemetry: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Error testing telemetry: {e}")
        return False

def test_websocket_connection():
    """Test WebSocket connection for real-time data"""
    try:
        ws = websocket.create_connection(WEBSOCKET_URL, timeout=5)
        print("✅ WebSocket connection established")
        
        # Send subscription message
        subscribe_msg = {
            "type": "subscribe",
            "deviceId": "power_meter"
        }
        ws.send(json.dumps(subscribe_msg))
        print("✅ Subscription message sent")
        
        # Wait for a few messages
        message_count = 0
        start_time = time.time()
        
        while message_count < 5 and (time.time() - start_time) < 10:
            try:
                ws.settimeout(2)
                message = ws.recv()
                data = json.loads(message)
                
                if data.get('type') == 'telemetry' and data.get('deviceId') == 'power_meter':
                    message_count += 1
                    values = data.get('values', {})
                    timestamp = data.get('timestamp', 'unknown')
                    
                    print(f"📊 Real-time data #{message_count}:")
                    print(f"   Timestamp: {timestamp}")
                    for key, value in values.items():
                        print(f"   {key}: {value}")
                    print()
                
            except websocket.WebSocketTimeoutException:
                continue
            except Exception as e:
                print(f"⚠️  Error receiving message: {e}")
                break
        
        ws.close()
        
        if message_count > 0:
            print(f"✅ Received {message_count} real-time messages")
            return True
        else:
            print("❌ No real-time messages received")
            return False
            
    except Exception as e:
        print(f"❌ WebSocket connection failed: {e}")
        return False

def test_timeseries_data():
    """Test historical time series data for power meter"""
    try:
        end_time = int(time.time() * 1000)
        start_time = end_time - (60 * 60 * 1000)  # 1 hour ago
        
        payload = {
            "deviceId": "power_meter",
            "keys": ["voltage", "current", "power", "energy", "cost"],
            "startTs": start_time,
            "endTs": end_time,
            "interval": 60000  # 1 minute intervals
        }
        
        response = requests.post(
            f"{BACKEND_URL}/api/v1/telemetry/timeseries",
            json=payload,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                timeseries = data.get('data', {})
                print("✅ Time series data retrieved:")
                
                for key, data_points in timeseries.items():
                    print(f"   {key}: {len(data_points)} data points")
                    if data_points:
                        latest = data_points[-1]
                        print(f"     Latest: {latest}")
                
                return True
            else:
                print(f"❌ Failed to get time series: {data.get('message')}")
                return False
        else:
            print(f"❌ Failed to get time series: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error testing time series: {e}")
        return False

def run_continuous_test():
    """Run continuous test to monitor real-time data"""
    print(f"\n🔄 Running continuous test for {TEST_DURATION} seconds...")
    print("   This will show real-time power consumption data updates")
    print("   Press Ctrl+C to stop early\n")
    
    try:
        ws = websocket.create_connection(WEBSOCKET_URL, timeout=5)
        
        # Subscribe to power meter
        subscribe_msg = {
            "type": "subscribe",
            "deviceId": "power_meter"
        }
        ws.send(json.dumps(subscribe_msg))
        
        start_time = time.time()
        message_count = 0
        
        while (time.time() - start_time) < TEST_DURATION:
            try:
                ws.settimeout(1)
                message = ws.recv()
                data = json.loads(message)
                
                if data.get('type') == 'telemetry' and data.get('deviceId') == 'power_meter':
                    message_count += 1
                    values = data.get('values', {})
                    timestamp = datetime.fromtimestamp(data.get('timestamp', 0)/1000).strftime('%H:%M:%S')
                    
                    # Display formatted power consumption data
                    power = values.get('power', 0)
                    voltage = values.get('voltage', 0)
                    current = values.get('current', 0)
                    energy = values.get('energy', 0)
                    cost = values.get('cost', 0)
                    
                    print(f"⚡ [{timestamp}] Power: {power:.2f} kW | "
                          f"Voltage: {voltage:.1f} V | "
                          f"Current: {current:.2f} A | "
                          f"Energy: {energy:.2f} kWh | "
                          f"Cost: {cost:.0f} VND")
                
            except websocket.WebSocketTimeoutException:
                continue
            except Exception as e:
                print(f"⚠️  Error: {e}")
                break
        
        ws.close()
        print(f"\n✅ Continuous test completed. Received {message_count} messages.")
        
    except KeyboardInterrupt:
        print("\n⏹️  Test stopped by user")
    except Exception as e:
        print(f"❌ Continuous test failed: {e}")

def main():
    """Main test function"""
    print("🔌 Power Consumption Widget & Backend Test")
    print("=" * 50)
    
    # Test backend health
    if not test_backend_health():
        print("\n❌ Backend is not running. Please start the backend first:")
        print("   cd backend && go run main.go")
        return
    
    print()
    
    # Test power meter device
    if not test_power_meter_device():
        print("\n❌ Power meter device not configured properly")
        return
    
    print()
    
    # Test telemetry data
    if not test_power_meter_telemetry():
        print("\n❌ Power meter telemetry not working")
        return
    
    print()
    
    # Test WebSocket connection
    if not test_websocket_connection():
        print("\n❌ WebSocket real-time data not working")
        return
    
    print()
    
    # Test time series data
    if not test_timeseries_data():
        print("\n❌ Time series data not working")
        return
    
    print()
    
    # All basic tests passed
    print("🎉 All basic tests passed! Power consumption system is working.")
    print("\n" + "=" * 50)
    
    # Ask user if they want to run continuous test
    try:
        response = input("\n🔄 Run continuous real-time test? (y/n): ").lower().strip()
        if response in ['y', 'yes']:
            run_continuous_test()
    except KeyboardInterrupt:
        print("\n👋 Test completed!")

if __name__ == "__main__":
    main()
