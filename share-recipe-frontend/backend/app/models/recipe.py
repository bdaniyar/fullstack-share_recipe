from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class RecipeCreate(BaseModel):
    title: str
    description: Optional[str] = None
    instructions: Optional[str] = None
    image_url: Optional[str] = None
    is_published: Optional[bool] = True

class RecipeUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    instructions: Optional[str] = None
    is_published: Optional[bool] = None

class RecipeResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    instructions: Optional[str]
    image_url: Optional[str] = None
    is_published: bool = True
    created_at: datetime
    # Social fields
    likes: int = 0
    liked: Optional[bool] = None
    saved: Optional[bool] = None
    # Permissions
    can_delete: Optional[bool] = None
    # Author info
    author_username: Optional[str] = None

    class Config:
        from_attributes = True

class CommentCreate(BaseModel):
    content: str

class CommentResponse(BaseModel):
    id: int
    content: str
    created_at: datetime
    user_id: int
    recipe_id: int
    parent_id: Optional[int] = None  # added for replies
    # Enriched author field
    username: Optional[str] = None

    class Config:
        from_attributes = True