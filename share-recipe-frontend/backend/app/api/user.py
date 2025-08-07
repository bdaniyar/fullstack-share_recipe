# app/routes/user.py

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
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

router = APIRouter(prefix="/api/user", tags=["User"])


@router.post("/signup/")
async def signup(user_data: UserSignup, session: AsyncSession = Depends(get_async_session)):
    # Проверка по email
    existing_user = await UserDAO.get_user_by_email(session, user_data.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Проверка по username
    existing_user = await UserDAO.get_user_by_username(session, user_data.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")

    # Проверка совпадения паролей
    if user_data.password != user_data.password2:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    # Создание пользователя через DAO (теперь передаём данные, а не объект User)
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
    for field, value in user_update.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)

    session.add(current_user)
    await session.commit()
    await session.refresh(current_user)
    return current_user

@router.post("/profile/photo/")
async def upload_profile_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
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
    base_url = "http://localhost:8000"  # или можно вынести в настройки
    return {"photo_url": f"{base_url}{current_user.photo_url}"}

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