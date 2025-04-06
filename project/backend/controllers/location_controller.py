import json
import os
import requests
from utils.haversine import haversine
from dotenv import load_dotenv

load_dotenv();

#Load environment variables from .env file
API_KEY = os.getenv('GOOGLE_MAPS_API_KEY')

def load_location_data():
    # Load location data from JSON file
    with open('backend/data/locations.geojson', 'r') as file:
        return json.load(file)
    
def get_nearest_25(user_lat, user_lon):
    # Load location data
    locations = load_location_data()
    
    results = []

    for location in locations:
        lon, lat = location['geometry']['coordinates']
        distance = haversine(user_lat, user_lon, lat, lon)

        results.append({
            "name": location['properties'].get('name'),
            "latitude": lat,
            "longitude": lon,
            "distance": distance,
            "raw": location
        })

    return results

def get_nearest_location(user_lat, user_lon):
    nearest_locations = get_nearest_25(user_lat, user_lon)
    
    destinations = [f"{loc['latitude']},{loc['longitude']}" for loc in nearest_locations]
    origins = f"{user_lat},{user_lon}"

    endpoint = "https://maps.googleapis.com/maps/api/distancematrix/json"
    params = {
        "origins": origins,
        "destinations": "|".join(destinations),
        "key": API_KEY,
        "mode": "driving",
        "units": "metric"
    }

    response = requests.get(endpoint, params=params)
    data = response.json()

    if data["status"] != "OK":
        raise Exception(f"Distance Matrix API Error: {data['status']}")

    durations = data["rows"][0]["elements"]

    for i, elem in enumerate(durations):
        if elem["status"] == "OK":
            nearest_locations[i]["travel_distance_km"] = elem["distance"]["value"] / 1000
            nearest_locations[i]["travel_time_min"] = elem["duration"]["value"] / 60
        else:
            nearest_locations[i]["travel_distance_km"] = float("inf")
            nearest_locations[i]["travel_time_min"] = float("inf")

    sorted_by_time = sorted(nearest_locations, key=lambda x: x["travel_time_min"])
    return sorted_by_time[0]



    
