#!/usr/bin/env python3
"""
Merge Postman collections and add new endpoints
"""
import json
from datetime import datetime

# Read both collections
with open('Crowd_Management_System.postman_collection.json', 'r') as f:
    original = json.load(f)

with open('New_Endpoints.postman_collection.json', 'r') as f:
    new_endpoints = json.load(f)

# Update collection info
original['info']['name'] = 'Crowd Management System - Complete API'
original['info']['description'] = f"Complete unified API collection for Crowd Management System Backend\nIncludes all original and new endpoints\nLast updated: {datetime.now().strftime('%Y-%m-%d')}"
original['info']['_postman_id'] = 'crowd-mgmt-complete-api'

# Add new folders to original collection
for new_folder in new_endpoints['item']:
    original['item'].append(new_folder)

# Add photo upload endpoints to Lost Persons folder
lost_persons_folder = None
for item in original['item']:
    if item['name'] == 'Lost Persons':
        lost_persons_folder = item
        break

if lost_persons_folder:
    # Add Upload Photo endpoint
    upload_photo_request = {
        "name": "Upload Lost Person Photo",
        "request": {
            "method": "POST",
            "header": [],
            "body": {
                "mode": "formdata",
                "formdata": [
                    {
                        "key": "file",
                        "type": "file",
                        "src": []
                    }
                ]
            },
            "url": {
                "raw": "{{base_url}}/lost-persons/{{report_id}}/photo",
                "host": ["{{base_url}}"],
                "path": ["lost-persons", "{{report_id}}", "photo"]
            },
            "description": "Upload a photo for a lost person report. Accepts image files (jpg, jpeg, png, gif, webp)."
        },
        "response": []
    }
    
    # Add Delete Photo endpoint
    delete_photo_request = {
        "name": "Delete Lost Person Photo",
        "request": {
            "method": "DELETE",
            "header": [],
            "url": {
                "raw": "{{base_url}}/lost-persons/{{report_id}}/photo",
                "host": ["{{base_url}}"],
                "path": ["lost-persons", "{{report_id}}", "photo"]
            },
            "description": "Delete the photo associated with a lost person report."
        },
        "response": []
    }
    
    # Insert after the existing endpoints
    lost_persons_folder['item'].append(upload_photo_request)
    lost_persons_folder['item'].append(delete_photo_request)
    
    print(f"✅ Added 2 photo endpoints to Lost Persons folder")

# Save merged collection
with open('Complete_API.postman_collection.json', 'w') as f:
    json.dump(original, f, indent=2)

print(f"\n✅ Merged collection created: Complete_API.postman_collection.json")
print(f"   Total folders: {len(original['item'])}")
print(f"   Total requests in Lost Persons: {len(lost_persons_folder['item']) if lost_persons_folder else 0}")
