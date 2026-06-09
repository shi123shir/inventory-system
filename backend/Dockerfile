# Use slim image to reduce size (interview point: security + speed)
FROM python:3.11-slim

# Set working directory inside container
WORKDIR /app

# Install dependencies FIRST (before copying app code)
# Docker caches this layer — only re-runs if requirements.txt changes
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port (documentation — doesn't actually open the port)
EXPOSE 8000

# Run the app with uvicorn (ASGI server for FastAPI)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
