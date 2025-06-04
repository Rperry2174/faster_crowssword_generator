FROM python:3.11-slim

# Security: Non-root user
RUN useradd -m -u 1000 appuser

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install pipenv and dependencies
RUN pip install pipenv
COPY Pipfile Pipfile.lock* ./
RUN pipenv install --system --deploy

COPY src/ ./src/
COPY start_server.py .

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

USER appuser
EXPOSE 8000
CMD ["python", "start_server.py"]