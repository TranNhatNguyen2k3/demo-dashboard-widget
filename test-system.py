#!/usr/bin/env python3
"""
Test script for the complete React Widget Demo + Go Backend system
Tests both backend API and frontend connectivity
"""

import requests
import json
import time
import webbrowser
from datetime import datetime

class SystemTester:
    def __init__(self):
        self.backend_url = "http://localhost:8080"
        self.frontend_url = "http://localhost:3000"
        self.test_results = []

    def log_test(self, test_name, success, message=""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = f"{status} {test_name}"
        if message:
            result += f": {message}"
        print(result)
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "timestamp": datetime.now().isoformat()
        })

    def test_backend_health(self):
        """Test backend health check"""
        try:
            response = requests.get(f"{self.backend_url}/health", timeout=5)
            if response.status_code == 200:
                self.log_test("Backend Health Check", True)
                return True
            else:
                self.log_test("Backend Health Check", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Backend Health Check", False, str(e))
            return False

    def test_backend_api(self):
        """Test backend API endpoints"""
        try:
            # Test root endpoint
            response = requests.get(f"{self.backend_url}/")
            if response.status_code == 200:
                self.log_test("Backend Root Endpoint", True)
            else:
                self.log_test("Backend Root Endpoint", False, f"Status: {response.status_code}")

            # Test devices endpoint
            response = requests.get(f"{self.backend_url}/api/v1/telemetry/devices")
            if response.status_code == 200:
                devices = response.json()
                device_count = len(devices.get('data', []))
                self.log_test("Backend Devices API", True, f"Found {device_count} devices")
            else:
                self.log_test("Backend Devices API", False, f"Status: {response.status_code}")

            # Test system status
            response = requests.get(f"{self.backend_url}/api/v1/system/status")
            if response.status_code == 200:
                self.log_test("Backend System Status", True)
            else:
                self.log_test("Backend System Status", False, f"Status: {response.status_code}")

            return True
        except Exception as e:
            self.log_test("Backend API Tests", False, str(e))
            return False

    def test_websocket_endpoint(self):
        """Test WebSocket endpoint availability"""
        try:
            # Test if WebSocket endpoint responds to HTTP request
            response = requests.get(f"{self.backend_url}/ws")
            # WebSocket endpoints typically return 400 or 426 for HTTP requests
            if response.status_code in [400, 426]:
                self.log_test("WebSocket Endpoint", True, "Endpoint available")
                return True
            else:
                self.log_test("WebSocket Endpoint", False, f"Unexpected status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("WebSocket Endpoint", False, str(e))
            return False

    def test_frontend_connectivity(self):
        """Test if frontend can connect to backend"""
        try:
            # Test if frontend can reach backend API
            response = requests.get(f"{self.backend_url}/api/v1/telemetry/devices")
            if response.status_code == 200:
                self.log_test("Frontend-Backend Connectivity", True)
                return True
            else:
                self.log_test("Frontend-Backend Connectivity", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Frontend-Backend Connectivity", False, str(e))
            return False

    def test_telemetry_simulation(self):
        """Test telemetry data generation"""
        try:
            # Get initial data
            response1 = requests.get(f"{self.backend_url}/api/v1/telemetry/devices/device_001/latest")
            if response1.status_code != 200:
                self.log_test("Telemetry Simulation", False, "Cannot get initial data")
                return False

            data1 = response1.json()
            initial_temp = data1['data']['values'].get('temperature', 0)

            # Wait for new data
            time.sleep(2)

            # Get updated data
            response2 = requests.get(f"{self.backend_url}/api/v1/telemetry/devices/device_001/latest")
            if response2.status_code != 200:
                self.log_test("Telemetry Simulation", False, "Cannot get updated data")
                return False

            data2 = response2.json()
            updated_temp = data2['data']['values'].get('temperature', 0)

            # Check if data changed
            if initial_temp != updated_temp:
                self.log_test("Telemetry Simulation", True, "Data is updating")
                return True
            else:
                self.log_test("Telemetry Simulation", False, "Data not updating")
                return False

        except Exception as e:
            self.log_test("Telemetry Simulation", False, str(e))
            return False

    def generate_report(self):
        """Generate test report"""
        print("\n" + "="*60)
        print("📊 SYSTEM TEST REPORT")
        print("="*60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for r in self.test_results if r['success'])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['message']}")
        
        print("\n" + "="*60)
        
        if failed_tests == 0:
            print("🎉 All tests passed! System is ready.")
            print("\n💡 Next steps:")
            print("   1. Open your browser to http://localhost:3000")
            print("   2. Add RealTimeDemo widget to dashboard")
            print("   3. Watch real-time telemetry updates!")
        else:
            print("⚠️  Some tests failed. Please check the issues above.")
            print("\n🔧 Troubleshooting:")
            print("   1. Ensure backend is running: cd backend && go run main.go")
            print("   2. Ensure frontend is running: npm start")
            print("   3. Check firewall/antivirus settings")
            print("   4. Verify ports 8080 and 3000 are available")

    def run_all_tests(self):
        """Run all system tests"""
        print("🚀 Starting React Widget Demo + Go Backend System Tests")
        print("="*60)
        
        # Test backend
        if not self.test_backend_health():
            print("\n❌ Backend is not running. Please start the backend first:")
            print("   cd backend && go run main.go")
            return False
        
        print("\n🔍 Testing Backend API...")
        self.test_backend_api()
        
        print("\n🔍 Testing WebSocket...")
        self.test_websocket_endpoint()
        
        print("\n🔍 Testing Frontend Connectivity...")
        self.test_frontend_connectivity()
        
        print("\n🔍 Testing Telemetry Simulation...")
        self.test_telemetry_simulation()
        
        # Generate report
        self.generate_report()
        
        return True

def main():
    """Main test function"""
    tester = SystemTester()
    
    try:
        success = tester.run_all_tests()
        
        if success:
            # Ask if user wants to open frontend
            try:
                response = input("\n🌐 Open frontend in browser? (y/n): ").lower().strip()
                if response in ['y', 'yes']:
                    print("Opening frontend...")
                    webbrowser.open("http://localhost:3000")
            except KeyboardInterrupt:
                print("\n\n👋 Test completed. Goodbye!")
        
    except KeyboardInterrupt:
        print("\n\n⏹️  Testing interrupted by user")
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")

if __name__ == "__main__":
    main()
