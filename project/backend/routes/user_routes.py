from fastapi import FastAPI, HTTPException, Body, Header
from pydantic import BaseModel
import bcrypt
import jwt
import os
from config.db import get_db_connection
from dotenv import load_dotenv
from fastapi import APIRouter
from datetime import datetime, timedelta

router = APIRouter()
# Load environment variables
load_dotenv()

app = FastAPI()

# Pydantic model for request validation
class UserSignup(BaseModel):
    name: str
    email: str
    phone: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserCheck(BaseModel):
    email: str
    phone: str

class UserCheck2(BaseModel):
    email: str

@router.post("/api/users/signup")
async def signup(user: UserSignup):
    """Route to sign up a new user"""
    name, email, phone, password = user.name, user.email, user.phone, user.password

    if not name or not email or not phone or not password:
        raise HTTPException(status_code=400, detail="All fields are required.")

    # Hash the password using bcrypt
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    connection = get_db_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")

    cursor = connection.cursor()
    try:
        cursor.execute("SELECT * FROM users WHERE email = %s OR phone = %s", (email, phone))
        existing_user = cursor.fetchone()
        if existing_user:
            # If user exists, raise an error
            raise HTTPException(status_code=400, detail="User already exists with this email or phone number.")
        # SQL query to insert user data
        cursor.execute(
            "INSERT INTO users (name, email, phone, password) VALUES (%s, %s, %s, %s)",
            (name, email, phone, hashed_password)
        )
        connection.commit()
        # Generate a JWT token with user information
        token = jwt.encode(
            {"userId": cursor.lastrowid, "name": name, "email": email, "phone": phone},
            os.getenv("JWT_SECRET", "your_jwt_secret"),
            algorithm="HS256"
        )
        return {"msg": "User registered successfully!", "token": token}
    except Exception as e:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        cursor.close()
        connection.close()

@router.post("/api/users/check")
async def check_user_existence(user: UserCheck):
    """Check if user with the given email or phone already exists"""
    email, phone = user.email, user.phone

    connection = get_db_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")

    cursor = connection.cursor()
    try:
        cursor.execute("SELECT * FROM users WHERE email = %s OR phone = %s", (email, phone))
        existing_user = cursor.fetchone()
        if existing_user:
            return {"exists": True}
        return {"exists": False}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        cursor.close()
        connection.close()

@router.post("/api/users/check2")
async def check_user_existence(user: UserCheck2):
    """Check if user with the given email or phone already exists"""
    email = user.email

    connection = get_db_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")

    cursor = connection.cursor()
    try:
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        existing_user = cursor.fetchone()
        if existing_user:
            return {"exists": True}
        return {"exists": False}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        cursor.close()
        connection.close()

@router.get("/api/users")
async def get_user_info(authorization: str = Header(...)):
    """Fetch user information based on the provided Authorization header"""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=400, detail="Invalid Authorization header format")

    token = authorization.split("Bearer ")[1]
    """Fetch user information based on the provided token"""
    connection = get_db_connection()
    if not connection:
        raise HTTPException(status_code=500, detail="Database connection failed")

    cursor = connection.cursor(dictionary=True)
    try:
        # Decode the JWT token to extract user ID
        decoded_token = jwt.decode(token, os.getenv("JWT_SECRET", "your_jwt_secret"), algorithms=["HS256"])
        user_id = decoded_token.get("userId")

        if not user_id:
            raise HTTPException(status_code=400, detail="Invalid token")

        # Fetch user details from the database
        cursor.execute("SELECT id, name, email, phone FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {e}")
    finally:
        cursor.close()
        connection.close()

@router.get("/api/users/email")
async def get_user_info(authorization: str = Header(...)):
    """Fetch user information based on the provided Authorization header"""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=400, detail="Invalid Authorization header format")

    token = authorization.split("Bearer ")[1]
    """Fetch user information based on the provided token"""
    connection = get_db_connection()
    if not connection:
        raise HTTPException(status_code=500, detail="Database connection failed")

    cursor = connection.cursor(dictionary=True)
    try:
        # Decode the JWT token to extract user ID
        decoded_token = jwt.decode(token, os.getenv("JWT_SECRET", "your_jwt_secret"), algorithms=["HS256"])
        user_id = decoded_token.get("userId")

        if not user_id:
            raise HTTPException(status_code=400, detail="Invalid token")

        # Fetch user details from the database
        cursor.execute("SELECT id, name, email, phone FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return {"email": user["email"]}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {e}")
    finally:
        cursor.close()
        connection.close()

@router.post("/api/users/login")
async def login(user: UserLogin):
    """Route to log in a user"""
    email, password = user.email, user.password

    connection = get_db_connection()
    if not connection:
        raise HTTPException(status_code=500, detail="Database connection failed")

    cursor = connection.cursor(dictionary=True)
    try:
        # SQL query to fetch user based on email
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        result = cursor.fetchone()

        if result is None:
            raise HTTPException(status_code=400, detail="User not found")

        # Compare the hashed password using bcrypt
        if not bcrypt.checkpw(password.encode('utf-8'), result['password'].encode('utf-8')):
            raise HTTPException(status_code=400, detail="Invalid credentials")

        # Create a JWT token with expiration
        token = jwt.encode(
            {"userId": result['id'], "exp": datetime.utcnow() + timedelta(seconds=3600)}, 
            os.getenv("JWT_SECRET", "your_jwt_secret"), 
            algorithm="HS256"
        )

        print("Generated token:", token)  # Debug log for the generated token
        return {"token": token, "msg": "Login successful"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {e}")
    finally:
        connection.close()
