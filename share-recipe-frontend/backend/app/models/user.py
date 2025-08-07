from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserSignup(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=30)
    password: str = Field(..., min_length=6)
    password2: str = Field(..., min_length=6)


class UserSignIn(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    username: Optional[str] = None
    photo_url: Optional[str] = None


class UserProfile(BaseModel):
    username: str
    first_name: str | None = None
    last_name: str | None = None
    joined: datetime | None = None
    is_active: bool | None = None
    photo_url: str | None = None

    class Config:
        orm_mode = True