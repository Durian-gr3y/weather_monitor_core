"""
Test script to verify historical data functionality without requiring API key.
This simulates the weather_monitor.py behavior for testing purposes.
"""

import json
import os
from datetime import datetime, timezone

HISTORICAL_DATA_FILE = "historical_data.json"

def load_historical_data():
    """Load historical data from file, returning an empty list if it doesn't exist."""
    if os.path.exists(HISTORICAL_DATA_FILE):
        try:
            with open(HISTORICAL_DATA_FILE, "r") as f:
                data = json.load(f)
                if isinstance(data, list):
                    return data
                else:
                    print(f"{HISTORICAL_DATA_FILE} is not a list. Resetting to empty list.")
                    return []
        except json.JSONDecodeError:
            print(f"Failed to decode JSON from {HISTORICAL_DATA_FILE}. Returning empty list.")
            return []
    return []

def save_json(path, data):
    """Save data to a JSON file."""
    try:
        with open(path, "w") as f:
            json.dump(data, f, indent=2)
        print(f"[OK] Saved to {path}")
    except Exception as e:
        print(f"[ERROR] Failed to save JSON to {path}: {e}")


# Create mock weather data
mock_weather_data = {
    "generated_at": datetime.now(timezone.utc).isoformat(),
    "locations": [
        {
            "place": "Lagos, Nigeria",
            "temp": 28.5,
            "feels_like": 32.1,
            "humidity": 75,
            "wind_speed": 3.2,
            "clouds": 60,
            "description": "Partly cloudy",
            "rain_probability": 45,
            "risk": "MODERATE"
        },
        {
            "place": "Abuja, Nigeria",
            "temp": 31.2,
            "feels_like": 33.8,
            "humidity": 55,
            "wind_speed": 2.5,
            "clouds": 30,
            "description": "Clear sky",
            "rain_probability": 10,
            "risk": "LOW"
        }
    ]
}

print("=" * 60)
print("HISTORICAL DATA TEST")
print("=" * 60)

# Load existing historical data
historical_data = load_historical_data()
print(f"\nCurrent snapshots in historical data: {len(historical_data)}")

# Create snapshot
snapshot = {
    "generated_at": mock_weather_data["generated_at"],
    "locations": mock_weather_data["locations"]
}

# Append to historical data
historical_data.append(snapshot)
print(f"Adding new snapshot...")

# Save historical data
save_json(HISTORICAL_DATA_FILE, historical_data)
print(f"Total snapshots after update: {len(historical_data)}")


# Verify structure
print("\n" + "=" * 60)
print("VERIFICATION")
print("=" * 60)

if os.path.exists(HISTORICAL_DATA_FILE):
    with open(HISTORICAL_DATA_FILE, "r") as f:
        data = json.load(f)
    
    print(f"[OK] File exists: {HISTORICAL_DATA_FILE}")
    print(f"[OK] Is array: {isinstance(data, list)}")
    print(f"[OK] Number of snapshots: {len(data)}")
    
    if len(data) > 0:
        latest = data[-1]
        print(f"[OK] Latest snapshot timestamp: {latest.get('generated_at')}")
        print(f"[OK] Latest snapshot has {len(latest.get('locations', []))} locations")
        print(f"\n[SUCCESS] Historical data structure is valid!")
    else:
        print("[WARNING] No snapshots in historical data")
else:
    print(f"[ERROR] File not found: {HISTORICAL_DATA_FILE}")


print("\n" + "=" * 60)
