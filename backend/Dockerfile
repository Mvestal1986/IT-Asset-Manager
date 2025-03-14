FROM python:3.9-slim

WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies - added netcat-openbsd
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev curl netcat-openbsd \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Make wait script to ensure database is ready
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
host="$1"\n\
shift\n\
port="$1"\n\
shift\n\
\n\
until nc -z "$host" "$port"; do\n\
  >&2 echo "Waiting for $host:$port..."\n\
  sleep 1\n\
done\n\
\n\
>&2 echo "$host:$port is available"\n\
\n\
exec "$@"' > /usr/local/bin/wait-for && chmod +x /usr/local/bin/wait-for

# Set script to run when container starts
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
# Wait for database to be ready\n\
/usr/local/bin/wait-for db 5432\n\
\n\
# Create initial tables if they don't exist\n\
python -c "from app.database import Base, engine; Base.metadata.create_all(engine)"\n\
\n\
# Start the application\n\
exec uvicorn app.main:app --host 0.0.0.0 --port 8000\n\
' > /app/start.sh && chmod +x /app/start.sh

# Run the application
CMD ["/app/start.sh"]
CMD ["/app/start.sh"]