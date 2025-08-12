from fastapi import FastAPI
from app.api import user
from fastapi.middleware.cors import CORSMiddleware
from app.api import token 
from app.api.user import router as user_router
from fastapi.staticfiles import StaticFiles
from app.api import recipe as recipe_router
import os
import redis.asyncio as redis
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from app.config.config import settings 
app = FastAPI()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MEDIA_DIR = "/Users/daniarboranov/Documents/code_materials/python/project_fastapi/project1/share-recipe-frontend/media"
app.mount("/media", StaticFiles(directory=MEDIA_DIR), name="media")

app.include_router(user.router)
app.include_router(token.router)
app.include_router(recipe_router.router)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # или ["*"] на время разработки
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    redis_client = redis.Redis(
        host=settings.REDIS_HOST,
        port=settings.REDIS_PORT,
        db=0,
        decode_responses=False
    )
    FastAPICache.init(RedisBackend(redis_client), prefix="cache")