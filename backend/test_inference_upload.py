#!/usr/bin/env python3
"""
Test script to verify the inference/count endpoint works with file uploads.
"""
import requests
import sys
from pathlib import Path

def test_inference_upload():
    """Test uploading an image to the inference endpoint"""
    
    base_url = "http://127.0.0.1:8000"
    endpoint = f"{base_url}/inference/count"
    
    # Check if sample image exists
    sample_dir = Path(__file__).parent.parent / "samplecrowd"
    
    if not sample_dir.exists():
        print(f"❌ Sample directory not found: {sample_dir}")
        return False
    
    # Find any image file
    image_files = list(sample_dir.glob("*.jpg")) + list(sample_dir.glob("*.jpeg")) + list(sample_dir.glob("*.png"))
    
    if not image_files:
        print(f"❌ No image files found in {sample_dir}")
        return False
    
    test_image = image_files[0]
    print(f"📸 Using test image: {test_image.name}")
    
    try:
        # Test 1: Simple file upload (mimicking Postman)
        print("\n🧪 Test 1: Simple file upload")
        with open(test_image, 'rb') as f:
            files = {'file': (test_image.name, f, 'image/jpeg')}
            data = {
                'save_record': 'false',
                'radius_m': '',
                'event_id': '',
                'area_name': ''
            }
            
            response = requests.post(endpoint, files=files, data=data, timeout=120)
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ SUCCESS! Response:")
                print(f"   - Image: {result.get('image_filename')}")
                print(f"   - Count: {result.get('person_count')}")
                return True
            else:
                print(f"❌ FAILED with status {response.status_code}")
                print(f"   Response: {response.text}")
                return False
                
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend. Is the server running?")
        print(f"   Expected server at: {base_url}")
        return False
    except Exception as e:
        print(f"❌ Error: {type(e).__name__}: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("Testing Inference/Count Endpoint")
    print("=" * 60)
    
    success = test_inference_upload()
    
    if success:
        print("\n" + "=" * 60)
        print("✅ All tests passed!")
        print("=" * 60)
        sys.exit(0)
    else:
        print("\n" + "=" * 60)
        print("❌ Tests failed!")
        print("=" * 60)
        print("\n💡 Troubleshooting tips:")
        print("   1. Make sure backend server is running: python3 -m uvicorn main:app --reload")
        print("   2. Check if sample images exist in samplecrowd/ directory")
        print("   3. Check backend logs for detailed error messages")
        sys.exit(1)
