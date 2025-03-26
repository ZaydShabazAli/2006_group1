from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import mysql.connector
from datetime import datetime
import json
import os

app = FastAPI()

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database configuration
db_config = {
    "host": "localhost",
    "user": "root",
    "password": "your_password",
    "database": "crimewatch"
}

# Load GeoJSON data
with open("data/police_stations.geojson") as f:
    police_stations = json.load(f)

class User(BaseModel):
    email: str
    password: str

class Report(BaseModel):
    user_id: int
    crime_type: str
    latitude: float
    longitude: float
    description: str
    audio_url: Optional[str]

@app.post("/login")
async def login(user: User):
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute(
            "SELECT * FROM users WHERE email = %s AND password = %s",
            (user.email, user.password)
        )
        
        result = cursor.fetchone()
        if not result:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        return {"user_id": result["id"], "email": result["email"]}
    
    finally:
        cursor.close()
        conn.close()

@app.get("/crimes")
async def get_crimes(latitude: float, longitude: float, radius: float = 5.0):
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        
        # Get crimes within radius (using simple distance calculation)
        cursor.execute("""
            SELECT * FROM crimes 
            WHERE (
                6371 * acos(
                    cos(radians(%s)) * cos(radians(latitude)) *
                    cos(radians(longitude) - radians(%s)) +
                    sin(radians(%s)) * sin(radians(latitude))
                )
            ) <= %s
        """, (latitude, longitude, latitude, radius))
        
        crimes = cursor.fetchall()
        return crimes
    
    finally:
        cursor.close()
        conn.close()

@app.post("/reports")
async def create_report(report: Report):
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO reports (user_id, crime_type, latitude, longitude, description, audio_url, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            report.user_id,
            report.crime_type,
            report.latitude,
            report.longitude,
            report.description,
            report.audio_url,
            datetime.now()
        ))
        
        conn.commit()
        return {"message": "Report created successfully"}
    
    finally:
        cursor.close()
        conn.close()

@app.get("/nearest_police_station")
async def get_nearest_police_station(latitude: float, longitude: float):
    # Simple implementation to find nearest police station
    nearest = None
    min_distance = float('inf')
    
    for feature in police_stations['features']:
        station_coords = feature['geometry']['coordinates']
        station_lat = station_coords[1]
        station_lon = station_coords[0]
        
        # Calculate distance (simplified)
        distance = ((station_lat - latitude) ** 2 + (station_lon - longitude) ** 2) ** 0.5
        
        if distance < min_distance:
            min_distance = distance
            nearest = feature
    
    if nearest:
        return {
            "name": nearest['properties']['Name'],
            "latitude": nearest['geometry']['coordinates'][1],
            "longitude": nearest['geometry']['coordinates'][0]
        }
    
    raise HTTPException(status_code=404, detail="No police station found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)