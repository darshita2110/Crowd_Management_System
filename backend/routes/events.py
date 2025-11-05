from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from datetime import datetime
import secrets

from models import Event, EventCreate, Area
from database import database

router = APIRouter(prefix="/events", tags=["Events"])

# Note: access collections from `database[...]` at runtime to avoid import-time
# Mongo client creation before the application startup initializes the DB.

def generate_event_id() -> str:
    """Generate unique event ID"""
    return f"EVT{secrets.token_hex(6).upper()}"

@router.post("/", response_model=Event, status_code=status.HTTP_201_CREATED)
async def create_event(event: EventCreate):
    """Create a new event"""
    event_dict = event.model_dump()
    event_dict["id"] = generate_event_id()
    event_dict["status"] = "upcoming"
    event_dict["created_at"] = datetime.utcnow()
    
    # Convert Areas to dict
    if event_dict.get("areas"):
        event_dict["areas"] = [
            {
                "name": area.name,
                "location": dict(area.location),
                "radius_m": area.radius_m
            } if isinstance(area, Area) else area
            for area in event_dict["areas"]
        ]
    
    await database["events"].insert_one(event_dict)
    
    return Event(**{k: v for k, v in event_dict.items() if k != "_id"})

@router.get("/", response_model=List[Event])
async def get_events(
    status: Optional[str] = None,
    organizer_id: Optional[str] = None
):
    """Get all events with optional filters"""
    query = {}
    if status:
        query["status"] = status
    if organizer_id:
        query["organizer_id"] = organizer_id
    
    events = await database["events"].find(query).to_list(1000)
    return [Event(**{k: v for k, v in event.items() if k != "_id"}) for event in events]

@router.get("/{event_id}", response_model=Event)
async def get_event(event_id: str):
    """Get event by ID"""
    event = await database["events"].find_one({"id": event_id})
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    return Event(**{k: v for k, v in event.items() if k != "_id"})

@router.put("/{event_id}", response_model=Event)
async def update_event(event_id: str, event_update: EventCreate):
    """Update an event"""
    event = await database["events"].find_one({"id": event_id})
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    update_dict = event_update.model_dump(exclude_unset=True)
    
    # Convert Areas to dict
    if update_dict.get("areas"):
        update_dict["areas"] = [
            {
                "name": area.name,
                "location": dict(area.location),
                "radius_m": area.radius_m
            } if isinstance(area, Area) else area
            for area in update_dict["areas"]
        ]
    
    await database["events"].update_one(
        {"id": event_id},
        {"$set": update_dict}
    )
    
    updated_event = await database["events"].find_one({"id": event_id})
    return Event(**{k: v for k, v in updated_event.items() if k != "_id"})

@router.patch("/{event_id}/status")
async def update_event_status(event_id: str, status: str):
    """Update event status"""
    if status not in ["upcoming", "live", "completed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status. Must be: upcoming, live, or completed"
        )
    
    event = await database["events"].find_one({"id": event_id})
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    await database["events"].update_one(
        {"id": event_id},
        {"$set": {"status": status}}
    )
    
    return {"message": "Event status updated", "event_id": event_id, "status": status}

@router.delete("/{event_id}")
async def delete_event(event_id: str):
    """Delete an event"""
    result = await database["events"].delete_one({"id": event_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    return {"message": "Event deleted successfully", "event_id": event_id}


@router.get("/{event_id}/zones")
async def get_event_zones(event_id: str):
    """Return zones for an event with latest counts and density level formatted for frontend.

    Response: list of {id, name, count, capacity, level}
    - capacity: if area.definition includes capacity use it; otherwise split event.capacity evenly.
    - count: from latest crowd_density record for that event and area_name, 0 if none.
    - level: normalized to frontend values: Safe->safe, Moderate->moderate, Risky->risky, Overcrowded->critical
    """
    event = await database["events"].find_one({"id": event_id})
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    areas = event.get('areas', []) or []
    # normalize event-level capacity fallback
    total_capacity = int(event.get('capacity') or 0)
    n_areas = len(areas) if areas else 1

    zones = []
    for idx, area in enumerate(areas):
        name = area.get('name') if isinstance(area, dict) else getattr(area, 'name', str(area))
        # capacity fallback: if area has 'capacity' use it, else equal split
        cap = int(area.get('capacity')) if isinstance(area, dict) and area.get('capacity') else (total_capacity // n_areas if n_areas else total_capacity)

        # find latest density record for this event+area
        record = await database['crowd_density'].find_one({"event_id": event_id, "area_name": name}, sort=[("timestamp", -1)])
        person_count = int(record.get('person_count')) if record and record.get('person_count') is not None else 0
        density_level_raw = record.get('density_level') if record else None

        # map density level to frontend-friendly lowercase levels
        level_map = {
            'Safe': 'safe',
            'Moderate': 'moderate',
            'Risky': 'risky',
            'Overcrowded': 'critical'
        }
        level = level_map.get(density_level_raw, 'safe')

        zones.append({
            'id': f"{event_id}_{idx+1}",
            'name': name,
            'count': person_count,
            'capacity': cap,
            'level': level
        })

    # If no areas defined, return a single summary zone using event capacity and aggregated latest densities
    if not zones:
        # aggregated latest records for the event
        recs = await database['crowd_density'].find({'event_id': event_id}).sort('timestamp', -1).to_list(100)
        total_count = sum(int(r.get('person_count', 0)) for r in recs) if recs else 0
        # classify summary level using same thresholds
        people_per_m2 = None
        summary_level = 'safe'
        zones = [{
            'id': f"{event_id}_1",
            'name': event.get('name', 'Event'),
            'count': total_count,
            'capacity': total_capacity,
            'level': summary_level
        }]

    return zones
