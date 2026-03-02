-- Enable PostGIS for location-based queries if needed
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- Table for locations
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for weather data snapshots
CREATE TABLE IF NOT EXISTS weather_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    temperature FLOAT,
    feels_like FLOAT,
    humidity FLOAT,
    wind_speed FLOAT,
    clouds FLOAT,
    rain_probability FLOAT,
    condition TEXT,
    -- Custom metrics
    heat_index FLOAT,
    pest_risk_level TEXT,
    soil_moisture FLOAT,
    is_flood_alert BOOLEAN DEFAULT FALSE,
    is_dry_spell BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster time-series queries
CREATE INDEX IF NOT EXISTS idx_weather_snapshots_timestamp ON weather_snapshots(timestamp);
CREATE INDEX IF NOT EXISTS idx_weather_snapshots_location ON weather_snapshots(location_id);
