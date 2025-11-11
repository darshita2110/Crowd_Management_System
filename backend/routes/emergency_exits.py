from fastapi import APIRouter, HTTPException
from typing import List
from models import EmergencyExit, EmergencyExitCreate
from database import database
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/emergency-exits", tags=["Emergency Exits"])

@router.post("/", response_model=EmergencyExit, status_code=201)
async def create_emergency_exit(exit: EmergencyExitCreate):
    """Create a new emergency exit"""
    exit_dict = exit.model_dump()
    exit_dict["created_at"] = datetime.utcnow()
    exit_dict["last_updated"] = datetime.utcnow()
    
    result = await database["emergency_exits"].insert_one(exit_dict)
    exit_dict["id"] = str(result.inserted_id)
    exit_dict.pop("_id", None)
    
    return EmergencyExit(**exit_dict)


@router.get("/", response_model=List[EmergencyExit])
async def get_all_emergency_exits(event_id: str = None):
    """Get all emergency exits, optionally filtered by event_id"""
    query = {"event_id": event_id} if event_id else {}
    exits = []
    
    async for exit in database["emergency_exits"].find(query):
        exit["id"] = str(exit["_id"])
        exit.pop("_id", None)
        exits.append(EmergencyExit(**exit))
    
    return exits


@router.get("/{exit_id}", response_model=EmergencyExit)
async def get_emergency_exit(exit_id: str):
    """Get a specific emergency exit by ID"""
    try:
        exit = await database["emergency_exits"].find_one({"_id": ObjectId(exit_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid exit ID format")
    
    if not exit:
        raise HTTPException(status_code=404, detail="Emergency exit not found")
    
    exit["id"] = str(exit["_id"])
    exit.pop("_id", None)
    return EmergencyExit(**exit)


@router.put("/{exit_id}", response_model=EmergencyExit)
async def update_emergency_exit(exit_id: str, exit_update: EmergencyExitCreate):
    """Update an emergency exit"""
    try:
        update_data = exit_update.model_dump()
        update_data["last_updated"] = datetime.utcnow()
        
        result = await database["emergency_exits"].find_one_and_update(
            {"_id": ObjectId(exit_id)},
            {"$set": update_data},
            return_document=True
        )
    except:
        raise HTTPException(status_code=400, detail="Invalid exit ID format")
    
    if not result:
        raise HTTPException(status_code=404, detail="Emergency exit not found")
    
    result["id"] = str(result["_id"])
    result.pop("_id", None)
    return EmergencyExit(**result)


@router.patch("/{exit_id}/status")
async def update_exit_status(exit_id: str, status: str):
    """Update the status of an emergency exit"""
    if status not in ["crowded", "moderate", "clear"]:
        raise HTTPException(status_code=400, detail="Invalid status. Must be 'crowded', 'moderate', or 'clear'")
    
    try:
        result = await database["emergency_exits"].find_one_and_update(
            {"_id": ObjectId(exit_id)},
            {"$set": {"status": status, "last_updated": datetime.utcnow()}},
            return_document=True
        )
    except:
        raise HTTPException(status_code=400, detail="Invalid exit ID format")
    
    if not result:
        raise HTTPException(status_code=404, detail="Emergency exit not found")
    
    result["id"] = str(result["_id"])
    result.pop("_id", None)
    return EmergencyExit(**result)


@router.delete("/{exit_id}", status_code=204)
async def delete_emergency_exit(exit_id: str):
    """Delete an emergency exit"""
    try:
        result = await database["emergency_exits"].delete_one({"_id": ObjectId(exit_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid exit ID format")
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Emergency exit not found")
    
    return {"message": "Emergency exit deleted successfully"}
