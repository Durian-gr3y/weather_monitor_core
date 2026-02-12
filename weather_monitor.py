
import os
import time
import json
import logging
import hashlib
import requests
from datetime import datetime, timezone
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderUnavailable

# =========================
# CONFIGURATION
# =========================
# API Key from environment variable
API_KEY = os.environ.get("OPENWEATHER_API_KEY")

LOCATIONS = [
    "Umuahia, Abia, Nigeria",
    "Uyo, Akwa Ibom, Nigeria",
    "Yola, Adamawa, Nigeria",
    "Awka, Anambra, Nigeria",
    "Yenagoa, Bayelsa, Nigeria",
    "Makurdi, Benue, Nigeria",
    "Calabar, Cross River, Nigeria",
    "Asaba, Delta, Nigeria",
    "Benin City, Edo, Nigeria",
    "Ado Ekiti, Ekiti, Nigeria",
    "Enugu, Enugu, Nigeria",
    "Dutse, Jigawa, Nigeria",
    "Kaduna, Kaduna, Nigeria",
    "Kano, Kano, Nigeria",
    "Birnin Kebbi, Kebbi, Nigeria",
    "Lokoja, Kogi, Nigeria",
    "Ilorin, Kwara, Nigeria",
    "Ikeja, Lagos, Nigeria",
    "Owerri, Imo, Nigeria",
    "Abeokuta, Ogun, Nigeria",
    "Sagamu, Ogun State, Nigeria",
    "Akure, Ondo, Nigeria",
    "Osogbo, Osun, Nigeria",
    "Jos, Plateau, Nigeria",
    "Port Harcourt, Rivers, Nigeria",
    "Ibadan, Oyo, Nigeria",
    "Jalingo, Taraba, Nigeria"
]

# Cache settings
LOCATION_CACHE_FILE = "location_cache.json"
FORECAST_CACHE_FILE = "forecast_cache.json"
WEATHER_DATA_FILE = "weather_data.json"
FORECAST_REFRESH_INTERVAL = 7200  # 2 hours

# =========================
# LOGGING SETUP
# =========================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)

# =========================
# UTILITIES
# =========================
def hash_locations(locations):
    """Generate a SHA256 hash of the sorted locations list."""
    return hashlib.sha256("|".join(sorted(locations)).encode()).hexdigest()

def load_json(path):
    """Load JSON data from a file, returning an empty dict if it doesn't exist."""
    if os.path.exists(path):
        try:
            with open(path, "r") as f:
                return json.load(f)
        except json.JSONDecodeError:
            logging.error(f"Failed to decode JSON from {path}. Returning empty dict.")
    return {}

def save_json(path, data):
    """Save data to a JSON file."""
    try:
        with open(path, "w") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        logging.error(f"Failed to save JSON to {path}: {e}")

# =========================
# GEOCODING
# =========================
def build_location_cache():
    """Geocode all locations and save to cache."""
    logging.info("Building location cache...")
    geolocator = Nominatim(user_agent="weather_monitor_github_action")
    cache = {"version": hash_locations(LOCATIONS), "locations": {}}

    for place in LOCATIONS:
        try:
            logging.info(f"Geocoding: {place}")
            location = geolocator.geocode(place, timeout=10)
            if location:
                cache["locations"][place] = {"lat": location.latitude, "lon": location.longitude}
            else:
                logging.warning(f"Could not geocode: {place}")
            time.sleep(1)  # Respect Nominatim rate limit
        except (GeocoderTimedOut, GeocoderUnavailable) as e:
            logging.error(f"Geocoding timeout/unavailable for {place}: {e}")
        except Exception as e:
            logging.error(f"Geocoding error for {place}: {e}")

    save_json(LOCATION_CACHE_FILE, cache)
    logging.info("Location cache built.")
    return cache

def get_location_cache():
    """Retrieve location cache, rebuilding if outdated or missing."""
    cache = load_json(LOCATION_CACHE_FILE)
    current_hash = hash_locations(LOCATIONS)
    
    if not cache or cache.get("version") != current_hash:
        logging.info("Location cache missing or outdated (version mismatch). Rebuilding...")
        return build_location_cache()
        
    # Verify all locations are present in cache (integrity check)
    if not all(loc in cache.get("locations", {}) for loc in LOCATIONS):
        logging.info("Location cache incomplete. Rebuilding...")
        return build_location_cache()

    logging.info("Location cache loaded successfully.")
    return cache

# =========================
# WEATHER & FORECAST
# =========================
def fetch_weather(lat, lon):
    """Fetch current weather from OpenWeatherMap."""
    if not API_KEY:
        logging.error("API Key not found!")
        return None

    try:
        url = "https://api.openweathermap.org/data/2.5/weather"
        params = {"lat": lat, "lon": lon, "appid": API_KEY, "units": "metric"}
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        main = data["main"]
        weather_desc = data["weather"][0]["description"].capitalize()
        
        return {
            "temp": main["temp"],
            "feels_like": main["feels_like"],
            "temp_min": main["temp_min"],
            "temp_max": main["temp_max"],
            "humidity": main["humidity"],
            "wind_speed": data.get("wind", {}).get("speed", 0),
            "clouds": data.get("clouds", {}).get("all", 0),
            "description": weather_desc
        }
    except requests.exceptions.RequestException as e:
        logging.error(f"Weather API connection error: {e}")
    except KeyError as e:
        logging.error(f"Weather API response parsing error (missing key): {e}")
    except Exception as e:
        logging.error(f"Unexpected error fetching weather: {e}")
    return None

def fetch_rain_probability(lat, lon, place):
    """Fetch 5-day forecast and calculate rain probability for the next 12 hours."""
    if not API_KEY:
        return None

    now = time.time()
    forecast_cache = load_json(FORECAST_CACHE_FILE)
    
    # Check cache validity
    cached_entry = forecast_cache.get(place)
    if cached_entry:
        cached_ts = cached_entry.get("timestamp", 0)
        data = cached_entry.get("data", {})
        
        # Check if cache is fresh (less than 2 hours old per requirement) AND has valid data structure
        if (now - cached_ts < FORECAST_REFRESH_INTERVAL) and "max_rain_prob" in data and "risk_level" in data:
            return data

    # Fetch new data
    try:
        url = "https://api.openweathermap.org/data/2.5/forecast"
        params = {"lat": lat, "lon": lon, "appid": API_KEY, "units": "metric"}
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        forecast_list = data.get("list", [])
        
        # Consider the next 4 intervals (3 hours each = 12 hours approx)
        next_12h = forecast_list[:4]
        if not next_12h:
            logging.warning(f"No forecast data available for {place}")
            return None

        # Calculate max Probability of Precipitation (pop)
        max_pop = max((item.get("pop", 0) for item in next_12h), default=0)
        
        if max_pop >= 0.7:
            risk = "HIGH"
        elif max_pop >= 0.4:
            risk = "MODERATE"
        else:
            risk = "LOW"

        summary = {
            "max_rain_prob": round(max_pop * 100),
            "risk_level": risk
        }
        
        # Update cache
        forecast_cache[place] = {
            "timestamp": now,
            "data": summary
        }
        save_json(FORECAST_CACHE_FILE, forecast_cache)
        
        return summary

    except requests.exceptions.RequestException as e:
        logging.error(f"Forecast API connection error for {place}: {e}")
    except Exception as e:
        logging.error(f"Forecast API error for {place}: {e}")
    
    return None

# =========================
# MAIN EXECUTION
# =========================
def main():
    if not API_KEY:
        logging.critical("OPENWEATHER_API_KEY environment variable not set. Exiting.")
        return

    try:
        location_cache = get_location_cache()
        locations_data = location_cache.get("locations", {})
        
        if not locations_data:
            logging.error("No locations found in cache. Exiting.")
            return

        logging.info(f"Starting weather update for {len(locations_data)} locations...")
        
        weather_results = []
        
        for place, coords in locations_data.items():
            lat, lon = coords["lat"], coords["lon"]
            
            weather = fetch_weather(lat, lon)
            rain = fetch_rain_probability(lat, lon, place)
            
            location_result = {
                "place": place,
                "temp": None,
                "feels_like": None,
                "humidity": None,
                "wind_speed": None,
                "clouds": None,
                "description": None,
                "rain_probability": None,
                "risk": "UNKNOWN"
            }

            if weather:
                location_result.update({
                    "temp": weather['temp'],
                    "feels_like": weather['feels_like'],
                    "humidity": weather['humidity'],
                    "wind_speed": weather['wind_speed'],
                    "clouds": weather['clouds'],
                    "description": weather['description']
                })
                
                log_msg = f"{place}: {weather['temp']}°C, {weather['description']}"
            else:
                log_msg = f"{place}: Weather fetch failed"
                logging.warning(f"Failed to fetch weather for {place}")

            if rain:
                location_result.update({
                    "rain_probability": rain['max_rain_prob'],
                    "risk": rain['risk_level']
                })
                log_msg += f" | Rain Prob: {rain['max_rain_prob']}% ({rain['risk_level']})"
            else:
                log_msg += " | Rain data unavailable"

            logging.info(log_msg)
            weather_results.append(location_result)

        # Build final JSON output
        output_data = {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "locations": weather_results
        }
        
        save_json(WEATHER_DATA_FILE, output_data)
        logging.info(f"Weather data saved to {WEATHER_DATA_FILE}")

    except Exception as e:
        logging.critical(f"Critical error in execution: {e}", exc_info=True)

if __name__ == "__main__":
    main()
