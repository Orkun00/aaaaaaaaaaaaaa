# Use Python 3.11 slim image as the base
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set the working directory inside the container
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc && \
    pip install --no-cache-dir --upgrade pip && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy only requirements to leverage Docker cache
COPY src/requirements.txt /app/src/

# Install Python dependencies
RUN pip install --no-cache-dir -r /app/src/requirements.txt

# Copy application source files
COPY src /app/src

# Copy frontend files
COPY frontend /app/frontend

# Copy SSL certificates
COPY cert /app/cert

# Expose the application's port 
EXPOSE 8765

# Command to start the application
CMD ["python3", "/app/src/server.py"]

