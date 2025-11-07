from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from datetime import datetime
import secrets

from models import LostPersonReport, LostPersonCreate
from database import database

router = APIRouter(prefix="/lost-persons", tags=["Lost Persons"])

def generate_report_id() -> str:
    """Generate unique report ID"""
    return f"LP{secrets.token_hex(6).upper()}"

def calculate_priority(age: int, time_missing_hours: float = 0) -> str:
    """Calculate priority based on age and time missing"""
    # Children and elderly get higher priority
    if age <= 12 or age >= 65:
        return "critical"
    elif time_missing_hours > 2:
        return "high"
    elif time_missing_hours > 1:
        return "medium"
    else:
        return "medium"

@router.post("/", response_model=LostPersonReport, status_code=status.HTTP_201_CREATED)
async def create_lost_person_report(report: LostPersonCreate):
    """Report a lost person"""
    report_dict = report.model_dump()
    report_dict["id"] = generate_report_id()
    report_dict["status"] = "missing"  # Frontend uses 'missing' as initial status
    report_dict["reported_at"] = datetime.utcnow()
    report_dict["created_at"] = datetime.utcnow()
    
    # Backward compatibility: also set reporter_contact if reporter_phone is provided
    if "reporter_phone" in report_dict:
        report_dict["reporter_contact"] = report_dict["reporter_phone"]
    
    # Calculate priority
    report_dict["priority"] = calculate_priority(report_dict["age"])
    
    await database["lost_persons"].insert_one(report_dict)
    
    return LostPersonReport(**{k: v for k, v in report_dict.items() if k != "_id"})

@router.get("/", response_model=List[LostPersonReport])
async def get_lost_person_reports(
    event_id: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None
):
    """Get all lost person reports with optional filters"""
    query = {}
    if event_id:
        query["event_id"] = event_id
    if status:
        query["status"] = status
    if priority:
        query["priority"] = priority
    
    reports = await database["lost_persons"].find(query).sort("reported_at", -1).to_list(1000)
    
    # Convert old field names to new for backward compatibility
    result = []
    for report in reports:
        if "person_name" in report and "name" not in report:
            report["name"] = report["person_name"]
        if "reporter_contact" in report and "reporter_phone" not in report:
            report["reporter_phone"] = report["reporter_contact"]
        if "reported_at" in report and "created_at" not in report:
            report["created_at"] = report["reported_at"]
        result.append(LostPersonReport(**{k: v for k, v in report.items() if k != "_id"}))
    
    return result

@router.get("/{report_id}", response_model=LostPersonReport)
async def get_lost_person_report(report_id: str):
    """Get lost person report by ID"""
    report = await database["lost_persons"].find_one({"id": report_id})
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lost person report not found"
        )
    
    # Convert old field names to new for backward compatibility
    if "person_name" in report and "name" not in report:
        report["name"] = report["person_name"]
    if "reporter_contact" in report and "reporter_phone" not in report:
        report["reporter_phone"] = report["reporter_contact"]
    if "reported_at" in report and "created_at" not in report:
        report["created_at"] = report["reported_at"]
    
    return LostPersonReport(**{k: v for k, v in report.items() if k != "_id"})

@router.patch("/{report_id}/status")
async def update_report_status(report_id: str, status: str):  # Changed parameter name
    """Update lost person report status"""
    valid_statuses = ["reported", "searching", "found", "resolved", "missing"]  # Added "missing"
    if status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    report = await database["lost_persons"].find_one({"id": report_id})
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lost person report not found"
        )
    
    await database["lost_persons"].update_one(
        {"id": report_id},
        {"$set": {"status": status}}  # Changed from new_status
    )
    
    updated_report = await database["lost_persons"].find_one({"id": report_id})
    
    # Convert old field names to new for backward compatibility
    if "person_name" in updated_report and "name" not in updated_report:
        updated_report["name"] = updated_report["person_name"]
    if "reporter_contact" in updated_report and "reporter_phone" not in updated_report:
        updated_report["reporter_phone"] = updated_report["reporter_contact"]
    if "reported_at" in updated_report and "created_at" not in updated_report:
        updated_report["created_at"] = updated_report["reported_at"]
    
    return LostPersonReport(**{k: v for k, v in updated_report.items() if k != "_id"})

@router.get("/search/active")
async def get_active_reports(event_id: Optional[str] = None):
    """Get all active (not found/resolved) lost person reports"""
    query = {"status": {"$in": ["reported", "searching"]}}
    if event_id:
        query["event_id"] = event_id
    
    reports = await database["lost_persons"].find(query).sort("priority", -1).to_list(1000)
    return [LostPersonReport(**{k: v for k, v in report.items() if k != "_id"}) for report in reports]

@router.get("/stats/event/{event_id}")
async def get_lost_person_stats(event_id: str):
    """Get statistics for lost person reports for an event"""
    pipeline = [
        {"$match": {"event_id": event_id}},
        {
            "$group": {
                "_id": None,
                "total": {"$sum": 1},
                "statuses": {"$push": "$status"},
                "priorities": {"$push": "$priority"}
            }
        }
    ]
    
    result = await database["lost_persons"].aggregate(pipeline).to_list(1)
    
    if not result:
        return {
            "total": 0,
            "by_status": {},
            "by_priority": {}
        }
    
    data = result[0]
    
    return {
        "total": data["total"],
        "by_status": {
            "reported": data["statuses"].count("reported"),
            "searching": data["statuses"].count("searching"),
            "found": data["statuses"].count("found"),
            "resolved": data["statuses"].count("resolved")
        },
        "by_priority": {
            "critical": data["priorities"].count("critical"),
            "high": data["priorities"].count("high"),
            "medium": data["priorities"].count("medium"),
            "low": data["priorities"].count("low")
        }
    }
