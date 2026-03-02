import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".ENV"))

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("Warning: Supabase credentials not found in env.")
    supabase: Client = None
else:
    supabase: Client = create_client(url, key)

def get_locations():
    if not supabase: return []
    response = supabase.table("locations").select("*").execute()
    return response.data

def insert_weather_snapshot(data):
    if not supabase: return None
    response = supabase.table("weather_snapshots").insert(data).execute()
    return response.data
