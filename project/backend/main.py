# main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import user_routes
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# Allow all origins for now (you can restrict to frontend URL)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this later to your frontend address
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include your route files
app.include_router(user_routes.router)

# Root route
@app.get("/")
def read_root():
    return {"message": "Backend is up and running!"}
