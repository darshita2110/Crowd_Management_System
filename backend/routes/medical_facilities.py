from fastapi import APIRouter, HTTPException
from typing import List
from models import MedicalFacility, MedicalFacilityCreate
from database import database
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/medical-facilities", tags=["Medical Facilities"])

@router.post("/", response_model=MedicalFacility, status_code=201)
async def create_medical_facility(facility: MedicalFacilityCreate):
    """Create a new medical facility"""
    facility_dict = facility.model_dump()
    facility_dict["created_at"] = datetime.utcnow()
    
    result = await database["medical_facilities"].insert_one(facility_dict)
    facility_dict["id"] = str(result.inserted_id)
    facility_dict.pop("_id", None)
    
    return MedicalFacility(**facility_dict)


@router.get("/", response_model=List[MedicalFacility])
async def get_all_medical_facilities(event_id: str = None):
    """Get all medical facilities, optionally filtered by event_id"""
    query = {"event_id": event_id} if event_id else {}
    facilities = []
    
    async for facility in database["medical_facilities"].find(query):
        facility["id"] = str(facility["_id"])
        facility.pop("_id", None)
        facilities.append(MedicalFacility(**facility))
    
    return facilities


@router.get("/{facility_id}", response_model=MedicalFacility)
async def get_medical_facility(facility_id: str):
    """Get a specific medical facility by ID"""
    try:
        facility = await database["medical_facilities"].find_one({"_id": ObjectId(facility_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid facility ID format")
    
    if not facility:
        raise HTTPException(status_code=404, detail="Medical facility not found")
    
    facility["id"] = str(facility["_id"])
    facility.pop("_id", None)
    return MedicalFacility(**facility)


@router.put("/{facility_id}", response_model=MedicalFacility)
async def update_medical_facility(facility_id: str, facility_update: MedicalFacilityCreate):
    """Update a medical facility"""
    try:
        update_data = facility_update.model_dump()
        
        result = await database["medical_facilities"].find_one_and_update(
            {"_id": ObjectId(facility_id)},
            {"$set": update_data},
            return_document=True
        )
    except:
        raise HTTPException(status_code=400, detail="Invalid facility ID format")
    
    if not result:
        raise HTTPException(status_code=404, detail="Medical facility not found")
    
    result["id"] = str(result["_id"])
    result.pop("_id", None)
    return MedicalFacility(**result)


@router.delete("/{facility_id}", status_code=204)
async def delete_medical_facility(facility_id: str):
    """Delete a medical facility"""
    try:
        result = await database["medical_facilities"].delete_one({"_id": ObjectId(facility_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid facility ID format")
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Medical facility not found")
    
    return {"message": "Medical facility deleted successfully"}
