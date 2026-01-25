FROM python:3.12-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt /app/requirements.txt
COPY entrypoint.sh /app/entrypoint.sh

RUN pip install --no-cache-dir -r /app/requirements.txt

COPY . .

ENTRYPOINT ["/app/entrypoint.sh"]


