from pydantic import BaseModel, Field, EmailStr
from typing import Optional, Literal, List
from datetime import datetime
import math

# ---------------------------------------------------
# 🌍 Location Schema
# ---------------------------------------------------
class Location(BaseModel):
    lat: float = Field(..., example=28.6139, description="Latitude in decimal degrees")
    lon: float = Field(..., example=77.2090, description="Longitude in decimal degrees")


# ---------------------------------------------------
# 👤 User Models
# ---------------------------------------------------
class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str]
    role: Literal["public", "organizer", "medical", "police"] = "public"
    location: Optional[Location]

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserResponse(UserBase):
    id: str
    created_at: datetime


# ---------------------------------------------------
# 🎫 Event Models
# ---------------------------------------------------
class Area(BaseModel):
    name: str = Field(..., example="Main Entrance", description="Name of the area")
    location: Location = Field(..., description="Central point of the area")
    radius_m: float = Field(..., gt=0, example=10.0, description="Radius of the area in meters")

class Event(BaseModel):
    name: str
    description: Optional[str]
    start_time: datetime
    end_time: datetime
    organizer_id: Optional[str]
    areas: List[Area] = Field(default_factory=list, description="Predefined areas for this event")


# ---------------------------------------------------
# 👥 Crowd Density Models
# ---------------------------------------------------
class CrowdDensity(BaseModel):
    event_id: str = Field(..., example="EVT123", description="Associated event ID")
    area_name: str = Field(..., example="Main Entrance", description="Area where density is measured")
    location: Location
    radius_m: float = Field(..., gt=0, example=10.0)
    person_count: int = Field(..., ge=0, example=150)

    area_m2: float = Field(None, example=314.0, description="Computed area in square meters (πr²)")
    people_per_m2: float = Field(None, example=0.48, description="Crowd density (people per square meter)")
    density_level: Literal["Safe", "Moderate", "Risky", "Overcrowded"] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    def calculate_density(self):
        self.area_m2 = round(math.pi * (self.radius_m ** 2), 2)
        self.people_per_m2 = round(self.person_count / self.area_m2, 3)
        self.density_level = self.classify_density(self.people_per_m2)

    @staticmethod
    def classify_density(people_per_m2: float) -> str:
        if people_per_m2 <= 0.5:
            return "Safe"
        elif people_per_m2 <= 2:
            return "Moderate"
        elif people_per_m2 <= 4:
            return "Risky"
        else:
            return "Overcrowded"


# ---------------------------------------------------
# 🧒 Lost Person Models
# ---------------------------------------------------
class LostPersonReport(BaseModel):
    reporter_id: str
    person_name: str
    age: int
    gender: Literal["male", "female", "other"]
    last_seen_location: Location
    photo_url: Optional[str]
    status: Literal["missing", "found"] = "missing"
    reported_at: datetime = Field(default_factory=datetime.utcnow)


# ---------------------------------------------------
# 🚑 Medical Emergency Models
# ---------------------------------------------------
class MedicalEmergency(BaseModel):
    user_id: str
    type: str  # e.g., "heat_stroke", "injury"
    location: Location
    status: Literal["active", "resolved"] = "active"
    assigned_team: Optional[str]
    reported_at: datetime = Field(default_factory=datetime.utcnow)


# ---------------------------------------------------
# 🏨 Facility Models
# ---------------------------------------------------
class Facility(BaseModel):
    type: Literal["washroom", "hotel", "medical_center"]
    name: str
    location: Location
    contact: Optional[str]
    available: bool = True


# ---------------------------------------------------
# 🌦️ Weather Alert Models
# ---------------------------------------------------
class WeatherAlert(BaseModel):
    event_id: str
    temperature: float
    humidity: float
    condition: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# ---------------------------------------------------
# 💬 Feedback Models
# ---------------------------------------------------
class Feedback(BaseModel):
    user_id: str
    event_id: str
    rating: int = Field(..., ge=1, le=5)
    comments: Optional[str]
    submitted_at: datetime = Field(default_factory=datetime.utcnow)
    ai_sentiment: Optional[str]  # e.g., "positive" | "neutral" | "negative"


# ---------------------------------------------------
# ✅ Example Usage
# ---------------------------------------------------
# if __name__ == "__main__":
#     main_entrance = Area(
#         name="Main Entrance",
#         location=Location(lat=28.6139, lon=77.2090),
#         radius_m=10
#     )

#     concert_event = Event(
#         name="Music Concert",
#         description="Annual music concert",
#         start_time=datetime(2025, 12, 1, 18, 0),
#         end_time=datetime(2025, 12, 1, 23, 0),
#         organizer_id="USR123",
#         areas=[main_entrance]
#     )

#     crowd = CrowdDensity(
#         event_id="EVT123",
#         area_name=main_entrance.name,
#         location=main_entrance.location,
#         radius_m=main_entrance.radius_m,
#         person_count=150
#     )
#     crowd.calculate_density()
#     print(crowd.json(indent=4))
