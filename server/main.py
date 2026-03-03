from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timezone
import os

from weather_logic import (
    get_open_meteo_data, 
    get_nasa_power_baseline, 
    compute_heat_index, 
    evaluate_pest_risk,
    detect_dry_spells
)
from database import supabase, get_locations, insert_weather_snapshot

import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Nigeria Weather Monitor API")

# Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with your Vercel URL
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Default locations for the MVP (from weather_monitor.py)
DEFAULT_LOCATIONS = [
    {"name": "Umuahia", "lat": 5.5267, "lon": 7.4898},
    {"name": "Uyo", "lat": 5.0333, "lon": 7.9266},
    {"name": "Yola", "lat": 9.2035, "lon": 12.4868},
    {"name": "Awka", "lat": 6.2106, "lon": 7.0722},
    {"name": "Yenagoa", "lat": 4.9333, "lon": 6.2667},
    {"name": "Makurdi", "lat": 7.7322, "lon": 8.5214},
    {"name": "Calabar", "lat": 4.9517, "lon": 8.322},
    {"name": "Asaba", "lat": 6.1983, "lon": 6.7283},
    {"name": "Benin City", "lat": 6.335, "lon": 5.6033},
    {"name": "Ado Ekiti", "lat": 7.6233, "lon": 5.2217},
    {"name": "Enugu", "lat": 6.4433, "lon": 7.4898},
    {"name": "Dutse", "lat": 11.7592, "lon": 9.3389},
    {"name": "Kaduna", "lat": 10.5222, "lon": 7.4383},
    {"name": "Kano", "lat": 12.0022, "lon": 8.592},
    {"name": "Birnin Kebbi", "lat": 12.4539, "lon": 4.1975},
    {"name": "Lokoja", "lat": 7.8023, "lon": 6.7433},
    {"name": "Ilorin", "lat": 8.4799, "lon": 4.5418},
    {"name": "Ikeja", "lat": 6.5967, "lon": 3.3421},
    {"name": "Lagos", "lat": 6.5244, "lon": 3.3792},
    {"name": "Owerri", "lat": 5.485, "lon": 7.035},
    {"name": "Abeokuta", "lat": 7.1604, "lon": 3.3483},
    {"name": "Sagamu", "lat": 6.8333, "lon": 3.65},
    {"name": "Akure", "lat": 7.2571, "lon": 5.2058},
    {"name": "Osogbo", "lat": 7.7827, "lon": 4.5418},
    {"name": "Jos", "lat": 9.8965, "lon": 8.8583},
    {"name": "Port Harcourt", "lat": 4.8156, "lon": 7.0498},
    {"name": "Ibadan", "lat": 7.3775, "lon": 3.947},
    {"name": "Jalingo", "lat": 8.8917, "lon": 11.36},
    {"name": "Abuja", "lat": 9.0765, "lon": 7.3986}
]

class WeatherResponse(BaseModel):
    location: str
    current_temp: float
    rain_prob: float
    risk_level: str
    heat_index: float
    is_flood_risk: bool
    soil_moisture: float
    pest_risk: str

@app.get("/")
def read_root():
    return {"status": "Nigeria Weather Monitor API Active", "supabase_connected": supabase is not None}

@app.get("/debug")
def get_debug_info():
    return {
        "env_vars": {
            "SUPABASE_URL": "SET" if os.environ.get("SUPABASE_URL") else "MISSING",
            "SUPABASE_KEY": "SET" if os.environ.get("SUPABASE_SERVICE_ROLE_KEY") else "MISSING"
        },
        "locations_count": len(DEFAULT_LOCATIONS),
        "supabase": "Connected" if supabase else "Disconnected"
    }

@app.get("/weather/{city}")
async def get_city_weather(city: str):
    # Find coordinates for the city
    loc = next((l for l in DEFAULT_LOCATIONS if l["name"].lower() == city.lower()), None)
    if not loc:
        raise HTTPException(status_code=404, detail="City not found in Nigeria MVP list")
    
    # Fetch data
    logger.info(f"Fetching weather for {city} at {loc['lat']}, {loc['lon']}")
    forecast = get_open_meteo_data(loc["lat"], loc["lon"])
    baseline = get_nasa_power_baseline(loc["lat"], loc["lon"])
    
    if not forecast or "error" in forecast:
        err_msg = forecast.get("error") if forecast else "Unknown error"
        logger.error(f"Open-Meteo failure for {city}: {err_msg}")
        raise HTTPException(status_code=500, detail=f"Open-Meteo API failed for {city}: {err_msg}")
    
    if not baseline:
        logger.warning(f"NASA POWER baseline unavailable for {city}, using fallback.")
        # We can continue without baseline for now, or use a default
    
    # Extract current (first hour) values
    current_temp = forecast['hourly']['temperature_2m'][0]
    humidity = forecast['hourly']['relative_humidity_2m'][0]
    precip_sum = sum(forecast['hourly']['precipitation'][:24]) # 24h sum
    soil_m = forecast['hourly']['soil_moisture_0_to_7cm'][0]
    
    # Compute metrics
    hi = compute_heat_index(current_temp, humidity)
    pest = evaluate_pest_risk(precip_sum, current_temp)
    flood = precip_sum >= 50
    dry_days = detect_dry_spells(forecast['hourly'])
    
    return {
        "location": loc["name"],
        "temp": current_temp,
        "humidity": humidity,
        "rain_sum_24h": precip_sum,
        "heat_index": hi,
        "pest_risk": pest,
        "flood_risk": flood,
        "dry_spell_days": dry_days,
        "soil_moisture": soil_m,
        "forecast_16d": forecast['daily'],
        "baseline": baseline
    }

@app.get("/overview")
async def get_overview():
    """Summary metrics for the Nigeria dashboard."""
    # For MVP, we'll return a sample summary of a few key cities
    summary = []
    for loc in DEFAULT_LOCATIONS[:5]: # Top 5 cities for overview
        data = get_open_meteo_data(loc["lat"], loc["lon"])
        if data:
            temp = data['hourly']['temperature_2m'][0]
            rain = sum(data['hourly']['precipitation'][:24])
            summary.append({
                "city": loc["name"],
                "temp": temp,
                "rain": rain,
                "risk": "HIGH" if rain > 50 else "LOW"
            })
    return summary

@app.get("/history/{city}")
async def get_city_history(city: str):
    """Fetch historical snapshots from Supabase for a specific city."""
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not connected")
    
    # First find the location ID
    loc_res = supabase.table("locations").select("id").eq("name", city).execute()
    if not loc_res.data:
        raise HTTPException(status_code=404, detail="Location not found in database")
    
    loc_id = loc_res.data[0]['id']
    
    # Fetch snapshots
    history_res = supabase.table("weather_snapshots") \
        .select("*") \
        .eq("location_id", loc_id) \
        .order("timestamp", desc=True) \
        .limit(30) \
        .execute()
    
    return history_res.data
