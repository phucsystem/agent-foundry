FROM python:3.11-slim

WORKDIR /app

RUN pip install --no-cache-dir pip --upgrade

COPY pyproject.toml .
COPY api/__init__.py api/__init__.py
COPY agents/__init__.py agents/__init__.py
COPY memory/__init__.py memory/__init__.py
COPY workers/__init__.py workers/__init__.py
RUN pip install --no-cache-dir .

COPY . .

EXPOSE 8000

CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
