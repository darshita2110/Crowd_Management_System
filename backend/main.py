from fastapi import FastAPI
from routes import items

app = FastAPI(title="FastAPI + MongoDB Example")

app.include_router(items.router)

@app.get("/")
def home():
    return {"message": "Welcome to the FastAPI MongoDB API!"}