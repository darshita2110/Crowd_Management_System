from fastapi import APIRouter, HTTPException
from typing import List
from models import Zone, ZoneCreate
from database import database
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/zones", tags=["Zones"])

@router.post("/", response_model=Zone, status_code=201)
async def create_zone(zone: ZoneCreate):
    """Create a new zone for crowd density tracking"""
    zone_dict = zone.dict()
    zone_dict["created_at"] = datetime.utcnow()
    zone_dict["last_updated"] = datetime.utcnow()
    
    result = await database["zones"].insert_one(zone_dict)
    zone_dict["id"] = str(result.inserted_id)
    zone_dict.pop("_id", None)
    
    return Zone(**zone_dict)


@router.get("/", response_model=List[Zone])
async def get_all_zones(event_id: str = None):
    """Get all zones, optionally filtered by event_id"""
    query = {"event_id": event_id} if event_id else {}
    zones = []
    
    async for zone in database["zones"].find(query):
        zone["id"] = str(zone["_id"])
        zone.pop("_id", None)
        zones.append(Zone(**zone))
    
    return zones


@router.get("/{zone_id}", response_model=Zone)
async def get_zone(zone_id: str):
    """Get a specific zone by ID"""
    try:
        zone = await database["zones"].find_one({"_id": ObjectId(zone_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid zone ID format")
    
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    
    zone["id"] = str(zone["_id"])
    zone.pop("_id", None)
    return Zone(**zone)


@router.put("/{zone_id}", response_model=Zone)
async def update_zone(zone_id: str, zone_update: ZoneCreate):
    """Update a zone"""
    try:
        update_data = zone_update.dict()
        update_data["last_updated"] = datetime.utcnow()
        
        result = await database["zones"].find_one_and_update(
            {"_id": ObjectId(zone_id)},
            {"$set": update_data},
            return_document=True
        )
    except:
        raise HTTPException(status_code=400, detail="Invalid zone ID format")
    
    if not result:
        raise HTTPException(status_code=404, detail="Zone not found")
    
    result["id"] = str(result["_id"])
    result.pop("_id", None)
    return Zone(**result)


@router.patch("/{zone_id}/density")
async def update_zone_density(zone_id: str, current_density: int, density_status: str = None):
    """Update the crowd density of a zone"""
    if density_status and density_status not in ["crowded", "moderate", "low"]:
        raise HTTPException(status_code=400, detail="Invalid density_status. Must be 'crowded', 'moderate', or 'low'")
    
    update_fields = {
        "current_density": current_density,
        "last_updated": datetime.utcnow()
    }
    
    # Auto-calculate density_status if not provided
    if not density_status:
        zone = await database["zones"].find_one({"_id": ObjectId(zone_id)})
        if zone and zone.get("capacity"):
            ratio = current_density / zone["capacity"]
            if ratio >= 0.8:
                density_status = "crowded"
            elif ratio >= 0.5:
                density_status = "moderate"
            else:
                density_status = "low"
            update_fields["density_status"] = density_status
    else:
        update_fields["density_status"] = density_status
    
    try:
        result = await database["zones"].find_one_and_update(
            {"_id": ObjectId(zone_id)},
            {"$set": update_fields},
            return_document=True
        )
    except:
        raise HTTPException(status_code=400, detail="Invalid zone ID format")
    
    if not result:
        raise HTTPException(status_code=404, detail="Zone not found")
    
    result["id"] = str(result["_id"])
    result.pop("_id", None)
    return Zone(**result)


@router.delete("/{zone_id}", status_code=204)
async def delete_zone(zone_id: str):
    """Delete a zone"""
    try:
        result = await database["zones"].delete_one({"_id": ObjectId(zone_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid zone ID format")
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Zone not found")
    
    return {"message": "Zone deleted successfully"}
