import json
import csv
import os

# Load the historical JSON data from Downloads folder
json_file = r"C:\Users\aaoko\Downloads\historical_weather_data.json"
csv_file = r"C:\Users\aaoko\Downloads\historical_weather_data.csv"

print("=" * 60)
print("CSV CONVERSION TEST")
print("=" * 60)

try:
    with open(json_file, "r") as f:
        historical_data = json.load(f)
    
    print(f"\n✓ Loaded JSON file: {len(historical_data)} snapshots")
    
    # Convert to CSV
    with open(csv_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        
        # Write header
        writer.writerow([
            "timestamp", "place", "temp", "feels_like", "humidity", 
            "wind_speed", "clouds", "description", "rain_probability", "risk"
        ])
        
        row_count = 0
        # Flatten nested structure
        for snapshot in historical_data:
            timestamp = snapshot.get("generated_at", "")
            locations = snapshot.get("locations", [])
            
            for location in locations:
                writer.writerow([
                    timestamp,
                    location.get("place", ""),
                    location.get("temp", ""),
                    location.get("feels_like", ""),
                    location.get("humidity", ""),
                    location.get("wind_speed", ""),
                    location.get("clouds", ""),
                    location.get("description", ""),
                    location.get("rain_probability", ""),
                    location.get("risk", "")
                ])
                row_count += 1
    
    print(f"✓ Created CSV file: {row_count} rows (excluding header)")
    print(f"✓ CSV saved to: {csv_file}")
    
    # Verify CSV structure
    print("\n" + "=" * 60)
    print("CSV VERIFICATION")
    print("=" * 60)
    
    with open(csv_file, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        header = next(reader)
        print(f"\n✓ Header columns: {len(header)}")
        print(f"  {', '.join(header)}")
        
        # Show first 3 data rows
        print(f"\n✓ Sample rows (first 3):")
        for i, row in enumerate(reader):
            if i >= 3:
                break
            print(f"  Row {i+1}: {row[0][:19]} | {row[1]} | {row[2]}°C | {row[8]}% rain | {row[9]}")
    
    print("\n" + "=" * 60)
    print("✅ CSV CONVERSION SUCCESSFUL!")
    print("=" * 60)
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
