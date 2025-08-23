# Backend Dockerfile for FastAPI app (production optimized)
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y build-essential libpq-dev && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt requirements.txt
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy app code
COPY app app
COPY alembic alembic
COPY alembic.ini alembic.ini

# Expose port
EXPOSE 8000

# Set environment variables (override in docker-compose)
ENV PYTHONUNBUFFERED=1

# Entrypoint
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

# --- Optional for development ---
# To include development dependencies, uncomment the following:
# COPY requirements-dev.txt requirements-dev.txt
# RUN pip install -r requirements-dev.txt
