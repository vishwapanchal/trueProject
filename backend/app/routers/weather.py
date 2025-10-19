from fastapi import APIRouter, HTTPException
import httpx
import os

router = APIRouter(
    prefix="/weather",
    tags=["Weather"]
)

@router.get("/")
async def get_weather():
    api_key = os.getenv("OPENWEATHER_API_KEY")
    if not api_key:
        print("ERROR: OPENWEATHER_API_KEY is not set in the .env file.")
        raise HTTPException(status_code=500, detail="Weather service is not configured.")

    lat = 12.9716  # Bangalore latitude
    lon = 77.5946  # Bangalore longitude
    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url)
            response.raise_for_status() # Raises an exception for 4xx/5xx errors
            data = response.json()
            
            # Return a simplified weather object
            return {
                "temp": round(data["main"]["temp"]),
                "description": data["weather"][0]["description"],
                "icon": data["weather"][0]["icon"],
                "city": data["name"],
            }
        except httpx.HTTPStatusError as e:
            # This will catch errors from OpenWeatherMap (e.g., invalid key)
            print(f"ERROR: Weather API request failed with status {e.response.status_code}")
            raise HTTPException(status_code=e.response.status_code, detail="Failed to fetch weather data from provider.")
        except Exception as e:
            print(f"ERROR: An unexpected error occurred while fetching weather: {e}")
            raise HTTPException(status_code=500, detail="An internal error occurred while fetching weather.")
