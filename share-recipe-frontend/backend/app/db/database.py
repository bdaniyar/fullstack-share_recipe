from sqlalchemy import Boolean, Column, DateTime, Integer, String
from datetime import datetime
from app.db.base import Base  
from sqlalchemy.orm import relationship
# таблица базы данных для пользователей
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    username = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    joined = Column(DateTime, default=datetime.utcnow, nullable=False)
    photo_url = Column(String, nullable=True)
    username_changed_at = Column(DateTime, nullable=True)
    recipes = relationship("Recipe", back_populates="user")



