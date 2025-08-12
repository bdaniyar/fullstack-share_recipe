# routers/recipes.py
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.recipe import RecipeCreate, RecipeResponse, RecipeUpdate, CommentResponse
from app.db.dao.recipe import (
  create_recipe, get_recipes_by_user, list_recipes, get_recipe_by_id, update_recipe, delete_recipe,
  set_recipe_image, add_like, remove_like, add_save, remove_save, list_comments, add_comment, list_saved
)
from app.db.session import get_async_session
from app.services.auth import get_current_user, get_optional_user
from app.db.database import User
import os, uuid

router = APIRouter(prefix="/api/recipes", tags=["Recipes"])

@router.post("/create/", response_model=RecipeResponse)
async def create_new_recipe(
    recipe: RecipeCreate,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(get_current_user),
):
    return await create_recipe(recipe, user, session)

@router.get("/list/", response_model=list[RecipeResponse])
async def list_public_recipes(
    search: str | None = None,
    include_self: bool = False,
    session: AsyncSession = Depends(get_async_session),
    user: User | None = Depends(get_optional_user),
):
    # user is optional; if present (authenticated), liked/saved flags will be included
    # DAO will exclude current user's own posts when user is provided unless include_self=True
    return await list_recipes(session, search, user, include_self)

@router.get("/my-recipes/", response_model=list[RecipeResponse])
async def list_my_recipes(
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(get_current_user),
):
    return await get_recipes_by_user(user, session)

@router.get("/saved/", response_model=list[RecipeResponse])
async def list_saved_recipes(
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(get_current_user),
):
    return await list_saved(user, session)

@router.get("/recipe/{recipe_id}/", response_model=RecipeResponse)
async def get_recipe(recipe_id: int, session: AsyncSession = Depends(get_async_session), user: User | None = Depends(get_optional_user)):
    recipe = await get_recipe_by_id(recipe_id, session, user)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe

@router.patch("/recipe/{recipe_id}/", response_model=RecipeResponse)
async def patch_recipe(
    recipe_id: int,
    data: RecipeUpdate,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(get_current_user),
):
    recipe = await update_recipe(recipe_id, data, user, session)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found or forbidden")
    return recipe

@router.delete("/recipe/{recipe_id}/")
async def remove_recipe(
    recipe_id: int,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(get_current_user),
):
    ok = await delete_recipe(recipe_id, user, session)
    if not ok:
        raise HTTPException(status_code=404, detail="Recipe not found or forbidden")
    return {"status": "ok"}

@router.post("/recipe/{recipe_id}/image/")
async def upload_recipe_image(
    request: Request,
    recipe_id: int,
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(get_current_user),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed.")
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size must be less than 10MB.")

    upload_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "..", "media", "recipe_photos")
    os.makedirs(upload_dir, exist_ok=True)
    filename = f"recipe_{recipe_id}_{uuid.uuid4().hex}_{file.filename}"
    file_path = os.path.join(upload_dir, filename)
    with open(file_path, "wb") as f:
        f.write(contents)

    image_url = f"/media/recipe_photos/{filename}"
    recipe = await set_recipe_image(recipe_id, image_url, user, session)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found or forbidden")

    base_url = str(request.base_url).rstrip("/")
    return {"image_url": f"{base_url}{image_url}"}

@router.post("/recipe/{recipe_id}/like/")
async def like_recipe(recipe_id: int, session: AsyncSession = Depends(get_async_session), user: User = Depends(get_current_user)):
    count = await add_like(recipe_id, user, session)
    return {"likes": count}

@router.delete("/recipe/{recipe_id}/like/")
async def unlike_recipe(recipe_id: int, session: AsyncSession = Depends(get_async_session), user: User = Depends(get_current_user)):
    count = await remove_like(recipe_id, user, session)
    return {"likes": count}

@router.post("/recipe/{recipe_id}/save/")
async def save_recipe(recipe_id: int, session: AsyncSession = Depends(get_async_session), user: User = Depends(get_current_user)):
    await add_save(recipe_id, user, session)
    return {"saved": True}

@router.delete("/recipe/{recipe_id}/save/")
async def unsave_recipe(recipe_id: int, session: AsyncSession = Depends(get_async_session), user: User = Depends(get_current_user)):
    await remove_save(recipe_id, user, session)
    return {"saved": False}

@router.get("/recipe/{recipe_id}/comments/")
async def get_comments(recipe_id: int, session: AsyncSession = Depends(get_async_session)):
    items = await list_comments(recipe_id, session)
    return [CommentResponse.model_validate(i) for i in items]

@router.post("/recipe/{recipe_id}/comments/")
async def post_comment(recipe_id: int, data: dict, session: AsyncSession = Depends(get_async_session), user: User = Depends(get_current_user)):
    content = (data or {}).get("content")
    parent_id = (data or {}).get("parent_id")  # allow reply
    if not content or not content.strip():
        raise HTTPException(status_code=400, detail="Content is required")
    c = await add_comment(recipe_id, content.strip(), user, session, parent_id=parent_id)
    return CommentResponse.model_validate(c)

@router.get("/options/")
async def get_options():
    # Placeholder taxonomy until implemented
    return {
        "regions": [],
        "sessions": [],
        "types": [],
        "ingredients": [],
        "categories": [],
    }