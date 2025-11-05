#!/bin/bash
cd "$(dirname "$0")"
echo "Starting server from: $(pwd)"
uvicorn main:app --reload --host 127.0.0.1 --port 8000
