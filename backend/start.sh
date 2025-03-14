#!/bin/bash
set -e

# Function to check if postgres is ready
postgres_ready() {
python << END
import sys
import psycopg2
try:
    conn = psycopg2.connect(
        dbname="itassetmanagement",
        user="postgres",
        password="postgres",
        host="db"
    )
except psycopg2.OperationalError:
    sys.exit(-1)
sys.exit(0)
END
}

# Wait for PostgreSQL to become available
until postgres_ready; do
  >&2 echo "Waiting for PostgreSQL to become available..."
  sleep 1
done
>&2 echo "PostgreSQL is available"

# Initialize the database
python -c "from app.database import Base, engine; Base.metadata.create_all(engine)"

# Run any additional startup commands here
# For example, loading initial data or running migrations

# Start the application
exec uvicorn app.main:app --host 0.0.0.0 --port 8000