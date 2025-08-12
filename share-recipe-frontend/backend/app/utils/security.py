from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta, timezone
import os
from dotenv import load_dotenv
from jose import JWTError

load_dotenv()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY: str = os.getenv("SECRET_KEY") or ""
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY environment variable is not set!")
ALGORITHM = "HS256"

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(user_id: int, expires_delta: timedelta = timedelta(minutes=30)):
    to_encode = {"sub": str(user_id), "exp": datetime.now(timezone.utc) + expires_delta}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(user_id: int, expires_delta: timedelta = timedelta(days=7)):
    to_encode = {"sub": str(user_id), "exp": datetime.now(timezone.utc) + expires_delta}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_email_token(email: str, expires_delta: timedelta = timedelta(minutes=15)):
    to_encode = {"sub": email, "type": "email", "exp": datetime.now(timezone.utc) + expires_delta}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
