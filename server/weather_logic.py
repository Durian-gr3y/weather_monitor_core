import requests
from datetime import datetime, timedelta
import math

def get_nasa_power_baseline(lat, lon):
    """
    Fetch 10-year historical average for rainfall and temperature from NASA POWER.
    Returns a dictionary with monthly averages.
    """
    # NASA POWER API for climatology (30-year or user-defined range)
    # Using a simplified approach for the MVP: fetching monthly averages
    url = "https://power.larc.nasa.gov/api/temporal/climatology/point"
    params = {
        "parameters": "PRECTOTCORR,T2M",
        "community": "AG",
        "longitude": lon,
        "latitude": lat,
        "format": "JSON"
    }
    try:
        response = requests.get(url, params=params, timeout=15)
        response.raise_for_status()
        data = response.json()
        
        # PRECTOTCORR: Precipitation (mm/day)
        # T2M: Temperature at 2 Meters (C)
        base_data = data['properties']['parameter']
        return {
            "monthly_rain": base_data['PRECTOTCORR'],
            "monthly_temp": base_data['T2M']
        }
    except Exception as e:
        print(f"Error fetching NASA POWER data: {e}")
        return None

def compute_heat_index(temp, humidity):
    """Compute Heat Index based on Steadman's equation."""
    # Simplified version for MVP
    if temp < 27:
        return temp
    
    hi = 0.5 * (temp + 61.0 + ((temp - 68.0) * 1.2) + (humidity * 0.094))
    if hi > 27:
        # Full Regression Equation
        hi = -42.379 + 2.04901523*temp + 10.14333127*humidity - 0.22475541*temp*humidity - 0.00683783*temp*temp - 0.05481717*humidity*humidity + 0.00122874*temp*temp*humidity + 0.00085282*temp*humidity*humidity - 0.00000199*temp*temp*humidity*humidity
    return round(hi, 2)

def evaluate_pest_risk(recent_rain_sum, avg_temp):
    """
    Evaluate Fall Armyworm risk based on rules:
    Rainfall last 7 days > 20mm AND temp 25-32°C.
    """
    if recent_rain_sum > 20 and 25 <= avg_temp <= 32:
        return "HIGH"
    elif recent_rain_sum > 10 or 25 <= avg_temp <= 32:
        return "MODERATE"
    return "LOW"

def detect_dry_spells(hourly_data):
    """
    Detect dry spells: sequence of days with < 1mm rain.
    Returns count of consecutive dry days.
    """
    # hourly_data has 'time' and 'precipitation' keys
    times = hourly_data.get('time', [])
    precip = hourly_data.get('precipitation', [])
    
    # Process hourly into daily sums
    daily_totals = {}
    for t, p in zip(times, precip):
        date_str = t.split('T')[0]
        daily_totals[date_str] = daily_totals.get(date_str, 0) + p
    
    # Sort dates to ensure sequence
    sorted_dates = sorted(daily_totals.keys())
    
    consecutive_dry = 0
    max_dry = 0
    for date in sorted_dates:
        if daily_totals[date] < 1.0:
            consecutive_dry += 1
            max_dry = max(max_dry, consecutive_dry)
        else:
            consecutive_dry = 0
    return max_dry

def get_open_meteo_data(lat, lon):
    """Fetch 16-day forecast and hourly metrics from Open-Meteo."""
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "hourly": "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,soil_moisture_0_to_7cm",
        "daily": "sunrise,sunset,precipitation_sum,temperature_2m_max,temperature_2m_min",
        "timezone": "auto",
        "forecast_days": 16
    }
    try:
        response = requests.get(url, params=params, timeout=15)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error fetching Open-Meteo data: {e}")
        return None
