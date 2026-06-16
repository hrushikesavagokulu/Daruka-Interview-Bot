# ─── Backend Dockerfile ──────────────────────
# Python 3.11 slim + system packages for AI/ML
# ─────────────────────────────────────────────
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies:
#   docker.io      → Docker CLI for sandbox container control
#   gcc            → compile C extensions (aiomysql / bcrypt)
#   libmysqlclient-dev → MySQL client headers
#   ffmpeg         → audio processing (Whisper pre-processing)
RUN apt-get update && apt-get install -y \
    docker.io \
    gcc \
    default-libmysqlclient-dev \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies (cached layer)
COPY requirements.txt .
RUN pip install --no-cache-dir setuptools wheel numpy && \
    pip install --no-cache-dir --no-build-isolation openai-whisper==20231117 && \
    pip install --no-cache-dir -r requirements.txt

# Copy application source (overridden by volume mount in dev)
COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
