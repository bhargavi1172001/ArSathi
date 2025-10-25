import requests
import json

BASE_URL = "http://localhost:5000"

def test_health_check():
    """Test if the API is running"""
    print("Testing health check...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}\n")

def test_symptom_analysis():
    """Test symptom analysis endpoint"""
    print("Testing symptom analysis...")
    data = {
        "message": "I have a headache and fever since yesterday",
        "language": "en"
    }
    response = requests.post(f"{BASE_URL}/api/analyze-symptoms", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}\n")

def test_find_phc():
    """Test PHC finder endpoint"""
    print("Testing PHC finder...")
    data = {
        "latitude": 12.9716,
        "longitude": 77.5946
    }
    response = requests.post(f"{BASE_URL}/api/find-nearby-phc", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}\n")

if __name__ == "__main__":
    print("=" * 50)
    print("Arogya Sathi API Tests")
    print("=" * 50 + "\n")
    
    try:
        test_health_check()
        test_symptom_analysis()
        test_find_phc()
        print("✅ All tests completed!")
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to API. Is the server running?")
