from fastapi import APIRouter, HTTPException
from typing import List
from models import WashroomFacility, WashroomFacilityCreate
from database import database
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/washroom-facilities", tags=["Washroom Facilities"])

@router.post("/", response_model=WashroomFacility, status_code=201)
async def create_washroom_facility(facility: WashroomFacilityCreate):
    """Create a new washroom facility"""
    facility_dict = facility.dict()
    facility_dict["created_at"] = datetime.utcnow()
    facility_dict["updated_at"] = datetime.utcnow()
    
    result = await database["washroom_facilities"].insert_one(facility_dict)
    facility_dict["id"] = str(result.inserted_id)
    facility_dict.pop("_id", None)
    
    return WashroomFacility(**facility_dict)


@router.get("/", response_model=List[WashroomFacility])
async def get_all_washroom_facilities(event_id: str = None):
    """Get all washroom facilities, optionally filtered by event_id"""
    query = {"event_id": event_id} if event_id else {}
    facilities = []
    
    async for facility in database["washroom_facilities"].find(query):
        facility["id"] = str(facility["_id"])
        facility.pop("_id", None)
        facilities.append(WashroomFacility(**facility))
    
    return facilities


@router.get("/{facility_id}", response_model=WashroomFacility)
async def get_washroom_facility(facility_id: str):
    """Get a specific washroom facility by ID"""
    try:
        facility = await database["washroom_facilities"].find_one({"_id": ObjectId(facility_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid facility ID format")
    
    if not facility:
        raise HTTPException(status_code=404, detail="Washroom facility not found")
    
    facility["id"] = str(facility["_id"])
    facility.pop("_id", None)
    return WashroomFacility(**facility)


@router.put("/{facility_id}", response_model=WashroomFacility)
async def update_washroom_facility(facility_id: str, facility_update: WashroomFacilityCreate):
    """Update a washroom facility"""
    try:
        update_data = facility_update.dict()
        update_data["updated_at"] = datetime.utcnow()
        
        result = await database["washroom_facilities"].find_one_and_update(
            {"_id": ObjectId(facility_id)},
            {"$set": update_data},
            return_document=True
        )
    except:
        raise HTTPException(status_code=400, detail="Invalid facility ID format")
    
    if not result:
        raise HTTPException(status_code=404, detail="Washroom facility not found")
    
    result["id"] = str(result["_id"])
    result.pop("_id", None)
    return WashroomFacility(**result)


@router.patch("/{facility_id}/status")
async def update_washroom_status(facility_id: str, status: str):
    """Update the availability status of a washroom facility"""
    if status not in ["available", "occupied", "maintenance"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    try:
        result = await database["washroom_facilities"].find_one_and_update(
            {"_id": ObjectId(facility_id)},
            {"$set": {"availability_status": status, "updated_at": datetime.utcnow()}},
            return_document=True
        )
    except:
        raise HTTPException(status_code=400, detail="Invalid facility ID format")
    
    if not result:
        raise HTTPException(status_code=404, detail="Washroom facility not found")
    
    result["id"] = str(result["_id"])
    result.pop("_id", None)
    return WashroomFacility(**result)


@router.delete("/{facility_id}", status_code=204)
async def delete_washroom_facility(facility_id: str):
    """Delete a washroom facility"""
    try:
        result = await database["washroom_facilities"].delete_one({"_id": ObjectId(facility_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid facility ID format")
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Washroom facility not found")
    
    return {"message": "Washroom facility deleted successfully"}
