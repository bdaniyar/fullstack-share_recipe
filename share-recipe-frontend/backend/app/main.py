from fastapi import FastAPI
from app.api import user
from fastapi.middleware.cors import CORSMiddleware
from app.api import token 
from app.api.user import router as user_router
from fastapi.staticfiles import StaticFiles
import os
app = FastAPI()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MEDIA_DIR = "/Users/daniarboranov/Documents/code_materials/python/project_fastapi/project1/share-recipe-frontend/media"
app.mount("/media", StaticFiles(directory=MEDIA_DIR), name="media")

app.include_router(user.router)
app.include_router(token.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174"],  # или ["*"] на время разработки
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
