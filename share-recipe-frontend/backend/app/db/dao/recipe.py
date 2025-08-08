# services/recipe.py
from typing import Optional, Sequence
from sqlalchemy import select
from app.models.recipe import RecipeCreate, RecipeUpdate
from app.db.recipes import Recipe
from app.db.database import User
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.social import RecipeLike, SavedRecipe, Comment
from sqlalchemy import and_, func, delete

# Helper to attach social fields
async def _attach_social_fields(db: AsyncSession, recipe: Recipe, user: Optional[User] = None):
    # likes count
    cnt_res = await db.execute(
        select(func.count()).select_from(RecipeLike).where(RecipeLike.recipe_id == recipe.id)
    )
    likes = int(cnt_res.scalar_one() or 0)
    liked = None
    saved = None
    can_delete = None
    if user is not None:
        liked_res = await db.execute(
            select(func.count()).select_from(RecipeLike).where(and_(RecipeLike.recipe_id == recipe.id, RecipeLike.user_id == user.id))
        )
        saved_res = await db.execute(
            select(func.count()).select_from(SavedRecipe).where(and_(SavedRecipe.recipe_id == recipe.id, SavedRecipe.user_id == user.id))
        )
        liked = int(liked_res.scalar_one() or 0) > 0
        saved = int(saved_res.scalar_one() or 0) > 0
        can_delete = (getattr(recipe, "user_id", None) == user.id)
    # attach
    setattr(recipe, "likes", likes)
    setattr(recipe, "liked", liked)
    setattr(recipe, "saved", saved)
    setattr(recipe, "can_delete", can_delete)
    return recipe

# Create
async def create_recipe(recipe_data: RecipeCreate, user: User, db: AsyncSession):
    new_recipe = Recipe(**recipe_data.model_dump(exclude_unset=True), user_id=user.id)
    db.add(new_recipe)
    await db.commit()
    await db.refresh(new_recipe)
    return await _attach_social_fields(db, new_recipe, user)

# Retrieve by id
async def get_recipe_by_id(recipe_id: int, db: AsyncSession, user: Optional[User] = None) -> Optional[Recipe]:
    res = await db.execute(select(Recipe).where(Recipe.id == recipe_id))
    recipe = res.scalar_one_or_none()
    if recipe:
        await _attach_social_fields(db, recipe, user)
    return recipe

# List recipes (public)
async def list_recipes(db: AsyncSession, search: Optional[str] = None, user: Optional[User] = None) -> Sequence[Recipe]:
    stmt = select(Recipe).order_by(Recipe.created_at.desc())
    if search:
        # basic title search
        from sqlalchemy import or_, func
        stmt = stmt.where(func.lower(Recipe.title).like(f"%{search.lower()}%"))
    res = await db.execute(stmt)
    recipes = res.scalars().all()
    # attach social counts for each; omit liked/saved unless user provided
    out = []
    for r in recipes:
        await _attach_social_fields(db, r, user)
        out.append(r)
    return out

# List by user
async def get_recipes_by_user(user: User, db: AsyncSession):
    result = await db.execute(
        select(Recipe).where(Recipe.user_id == user.id).order_by(Recipe.created_at.desc())
    )
    recipes = result.scalars().all()
    out = []
    for r in recipes:
        await _attach_social_fields(db, r, user)
        out.append(r)
    return out

# Update
async def update_recipe(recipe_id: int, data: RecipeUpdate, user: User, db: AsyncSession) -> Optional[Recipe]:
    recipe = await get_recipe_by_id(recipe_id, db, user)
    if recipe is None or getattr(recipe, "user_id") != user.id:
        return None
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(recipe, k, v)
    db.add(recipe)
    await db.commit()
    await db.refresh(recipe)
    return await _attach_social_fields(db, recipe, user)

# Delete
async def delete_recipe(recipe_id: int, user: User, db: AsyncSession) -> bool:
    recipe = await get_recipe_by_id(recipe_id, db, user)
    if recipe is None or getattr(recipe, "user_id") != user.id:
        return False
    await db.delete(recipe)
    await db.commit()
    return True

# Image setter
async def set_recipe_image(recipe_id: int, image_url: str, user: User, db: AsyncSession) -> Optional[Recipe]:
    recipe = await get_recipe_by_id(recipe_id, db, user)
    if recipe is None or getattr(recipe, "user_id") != user.id:
        return None
    setattr(recipe, "image_url", image_url)
    db.add(recipe)
    await db.commit()
    await db.refresh(recipe)
    return await _attach_social_fields(db, recipe, user)

# Likes
async def add_like(recipe_id: int, user: User, db: AsyncSession) -> int:
    exists = await db.execute(
        select(RecipeLike).where(and_(RecipeLike.recipe_id == recipe_id, RecipeLike.user_id == user.id))
    )
    if exists.scalar_one_or_none() is None:
        db.add(RecipeLike(recipe_id=recipe_id, user_id=user.id))
        await db.commit()
    cnt = await db.execute(
        select(func.count()).select_from(RecipeLike).where(RecipeLike.recipe_id == recipe_id)
    )
    return int(cnt.scalar_one())

async def remove_like(recipe_id: int, user: User, db: AsyncSession) -> int:
    await db.execute(
        delete(RecipeLike).where(and_(RecipeLike.recipe_id == recipe_id, RecipeLike.user_id == user.id))
    )
    await db.commit()
    cnt = await db.execute(
        select(func.count()).select_from(RecipeLike).where(RecipeLike.recipe_id == recipe_id)
    )
    return int(cnt.scalar_one())

# Saves
async def add_save(recipe_id: int, user: User, db: AsyncSession) -> None:
    exists = await db.execute(
        select(SavedRecipe).where(and_(SavedRecipe.recipe_id == recipe_id, SavedRecipe.user_id == user.id))
    )
    if exists.scalar_one_or_none() is None:
        db.add(SavedRecipe(recipe_id=recipe_id, user_id=user.id))
        await db.commit()

async def remove_save(recipe_id: int, user: User, db: AsyncSession) -> None:
    await db.execute(
        delete(SavedRecipe).where(and_(SavedRecipe.recipe_id == recipe_id, SavedRecipe.user_id == user.id))
    )
    await db.commit()

async def list_saved(user: User, db: AsyncSession):
    res = await db.execute(
        select(Recipe).join(SavedRecipe, SavedRecipe.recipe_id == Recipe.id).where(SavedRecipe.user_id == user.id)
    )
    recipes = res.scalars().all()
    out = []
    for r in recipes:
        await _attach_social_fields(db, r, user)
        out.append(r)
    return out

# Comments
async def list_comments(recipe_id: int, db: AsyncSession):
    res = await db.execute(
        select(Comment).where(Comment.recipe_id == recipe_id).order_by(Comment.created_at.asc())
    )
    return res.scalars().all()

async def add_comment(recipe_id: int, content: str, user: User, db: AsyncSession):
    comment = Comment(recipe_id=recipe_id, user_id=user.id, content=content)
    db.add(comment)
    await db.commit()
    await db.refresh(comment)
    return comment