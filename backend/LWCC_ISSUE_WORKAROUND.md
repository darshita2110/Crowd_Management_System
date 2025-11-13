# LWCC Crowd Counting - Known Issue & Workaround

## Problem
The LWCC (Lightweight Crowd Counting) library has a hardcoded path issue where it attempts to download model weights to `/.lwcc/weights/` (root directory), which is:
- **Read-only on macOS** (System Integrity Protection)
- **Requires root permissions on Linux**
- **Not writable in most production environments**

This causes the `/inference/count` endpoint to fail on first use with errors like:
```
[Errno 30] Read-only file system: '/.lwcc'
[Errno 13] Permission denied: '/.lwcc'
```

## Workarounds

### Option 1: Manual Model Download (RECOMMENDED for Postman testing)
Download the model weights manually and place them in your home directory:

```bash
# Create the directory
mkdir -p ~/.lwcc/weights

# Download the model (86MB)
curl -L "https://github.com/tersekmatija/lwcc_weights/releases/download/v0.1/DM-Count_SHA.pth" \
  -o ~/.lwcc/weights/DM-Count_SHA.pth
```

After this, the inference endpoint will work immediately without the 30-60 second download delay.

### Option 2: Use Docker (for production)
Mount a volume for LWCC weights:
```bash
docker run -v ./lwcc_weights:/.lwcc/weights your-image
```

### Option 3: Patch LWCC Library
Modify the LWCC source code to use a different path (not recommended for production).

## Testing in Postman

**⚠️ IMPORTANT:**
1. **Remove the `Content-Type` header** - Postman must set this automatically with the boundary parameter
2. **First request takes 30-60 seconds** if model isn't pre-downloaded
3. **Increase Postman timeout** to at least 120 seconds for first request
4. **Select an image file** in the `file` form field

**Postman Settings:**
- Request timeout: Settings → General → Request timeout in ms: 120000
- Do NOT manually set `Content-Type: multipart/form-data`

## Testing with cURL

```bash
curl -X POST http://127.0.0.1:8000/inference/count \
  -F "file=@/path/to/crowd/image.jpg" \
  -F "save_record=false"
```

## Status

This is a known limitation of the LWCC library itself, not our backend code. The library maintainers would need to fix the hardcoded path to properly respect HOME or XDG environment variables.

**Alternative:** Consider using a different crowd counting model/library that doesn't have this path issue.
