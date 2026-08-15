FROM python:3.11-slim

WORKDIR /app

# Install system dependencies needed by psycopg2 and GeoAlchemy2
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    libgdal-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

EXPOSE 8000

# APScheduler is started inside app.main on FastAPI startup event
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
