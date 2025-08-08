# app/routes/user.py

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import UserProfile, UserSignIn, UserSignup, UserUpdate
from app.db.dao.dao import UserDAO
from app.db.database import User
from app.utils.security import create_access_token, create_refresh_token, hash_password, verify_password
from app.db.session import get_async_session
from app.services.auth import get_current_user
from app.db.session import async_session_maker
import os
import uuid
from fastapi.responses import JSONResponse
import re
from datetime import datetime, timedelta

# Cooldown for username changes (e.g., 14 days)
USERNAME_CHANGE_COOLDOWN_DAYS = 14

router = APIRouter(prefix="/api/user", tags=["User"])


@router.post("/signup/")
async def signup(user_data: UserSignup, session: AsyncSession = Depends(get_async_session)):
    # Email uniqueness
    existing_user = await UserDAO.get_user_by_email(session, user_data.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Username policy and uniqueness
    if not re.fullmatch(r"^[A-Za-z0-9._]{3,20}$", user_data.username):
        raise HTTPException(status_code=400, detail="Username must be 3-20 chars: letters, digits, dots, underscores.")
    existing_user = await UserDAO.get_user_by_username(session, user_data.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")

    # Password match and strength
    if user_data.password != user_data.password2:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    if not re.search(r"[A-Z]", user_data.password) or not re.search(r"[0-9]", user_data.password) or not re.search(r"[^A-Za-z0-9]", user_data.password) or len(user_data.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 chars and include an uppercase letter, a digit, and a special character.")

    # Create user
    user = await UserDAO.create_user(
        session,
        username=user_data.username,
        email=user_data.email,
        password=user_data.password
    )
    return {"id": user.id, "email": user.email, "username": user.username}

@router.post("/signin/")
async def signin(user_data: UserSignIn, session: AsyncSession = Depends(get_async_session)):
    user = await UserDAO.get_user_by_email(session, user_data.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    # Получаем строковое значение хеша пароля
    hashed_password = user.hashed_password
    if hasattr(hashed_password, 'default') or str(type(hashed_password)).endswith("Column"):
        hashed_password = user.__dict__.get("hashed_password")
    if not isinstance(hashed_password, str):
        raise HTTPException(status_code=500, detail="User hashed_password is not a string.")
    if not verify_password(user_data.password, hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user_id = getattr(user, 'id', None)
    if user_id is None or not isinstance(user_id, int):
        raise HTTPException(status_code=500, detail="User id is not available or invalid.")

    access_token = create_access_token(user_id)
    refresh_token = create_refresh_token(user_id)

    return {"access": access_token, "refresh": refresh_token}

@router.get("/profile/", response_model=UserProfile)
async def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.patch("/profile/", response_model=UserProfile)
async def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    # Validate first and last names: 2-20 letters (spaces/hyphens allowed), capitalized
    def _valid_name(name: str) -> bool:
        return bool(re.fullmatch(r"[A-Za-zА-Яа-яЁё\-\s]{2,20}", name))

    updates = user_update.model_dump(exclude_unset=True)

    if "first_name" in updates and updates["first_name"] is not None:
        if not _valid_name(updates["first_name"]):
            raise HTTPException(status_code=400, detail="First name must be 2-20 letters and may include spaces or hyphens.")
        if not updates["first_name"][0].isupper():
            raise HTTPException(status_code=400, detail="First name must start with a capital letter.")

    if "last_name" in updates and updates["last_name"] is not None:
        if not _valid_name(updates["last_name"]):
            raise HTTPException(status_code=400, detail="Last name must be 2-20 letters and may include spaces or hyphens.")
        if not updates["last_name"][0].isupper():
            raise HTTPException(status_code=400, detail="Last name must start with a capital letter.")

    # Username changes: regex, uniqueness, cooldown
    if "username" in updates and updates["username"] and updates["username"] != current_user.username:
        new_username = updates["username"]
        if not re.fullmatch(r"^[A-Za-z0-9._]{3,20}$", new_username):
            raise HTTPException(status_code=400, detail="Username must be 3-20 chars: letters, digits, dots, underscores.")
        # Cooldown check (assumes we store last change date; if not present, allow and set now)
        last_changed = getattr(current_user, "username_changed_at", None)
        if last_changed and isinstance(last_changed, datetime):
            if datetime.utcnow() - last_changed < timedelta(days=USERNAME_CHANGE_COOLDOWN_DAYS):
                raise HTTPException(status_code=400, detail=f"Username can be changed once every {USERNAME_CHANGE_COOLDOWN_DAYS} days.")
        # Uniqueness
        existing_user = await UserDAO.get_user_by_username(session, new_username)
        # Ensure we compare ids only when an existing user is found and it's not the current user
        if existing_user is not None and getattr(existing_user, 'id', None) != getattr(current_user, 'id', None):
            raise HTTPException(status_code=400, detail="Username already taken")
        # Apply and stamp change time
        setattr(current_user, "username", new_username)
        setattr(current_user, "username_changed_at", datetime.utcnow())
        updates.pop("username", None)

    for field, value in updates.items():
        setattr(current_user, field, value)

    session.add(current_user)
    await session.commit()
    await session.refresh(current_user)
    return current_user

@router.post("/profile/photo/")
async def upload_profile_photo(
    request: Request,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
):
    # Валидация типа файла (только изображения)
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed.")
    # Валидация размера файла (до 5 МБ)
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size must be less than 5MB.")
    # Сохраняем файл в папку media/profile_photos
    upload_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "..", "media", "profile_photos")
    os.makedirs(upload_dir, exist_ok=True)
    filename = f"user_{current_user.id}_{uuid.uuid4().hex}_{file.filename}"
    file_path = os.path.join(upload_dir, filename)
    with open(file_path, "wb") as f:
        f.write(contents)
    # Сохраняем ссылку в базе
    setattr(current_user, "photo_url", f"/media/profile_photos/{filename}")
    session.add(current_user)
    await session.commit()
    await session.refresh(current_user)
    # Build absolute URL from request
    base_url = str(request.base_url).rstrip("/")
    absolute_url = f"{base_url}{current_user.photo_url}"
    return {"photo_url": absolute_url}

@router.delete("/profile/photo/")
async def delete_profile_photo(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    # Удаляем файл если есть
    if getattr(current_user, 'photo_url', None):
        file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "..", str(current_user.photo_url).lstrip("/"))
        if os.path.exists(file_path):
            os.remove(file_path)
        # Присваиваем None через setattr для Column[str | None]
        setattr(current_user, 'photo_url', None)
        session.add(current_user)
        await session.commit()
        await session.refresh(current_user)
    return JSONResponse(content={"photo_url": None, "message": "Profile photo removed"})