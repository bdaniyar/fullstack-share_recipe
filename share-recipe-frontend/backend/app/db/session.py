from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from app.config.config import settings # если у тебя есть файл настроек с DATABASE_URL
from collections.abc import AsyncGenerator


engine = create_async_engine(settings.DATABASE_URL ,echo=True)
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session