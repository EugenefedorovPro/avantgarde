FROM python:3.12-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    HOME=/tmp

WORKDIR /app

# LibreOffice (DOCX -> PDF) + fontconfig (so LO can see fonts)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libreoffice-writer \
    fontconfig \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/requirements.txt
COPY entrypoint.sh /app/entrypoint.sh
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy project (includes backend/avantgarde/utils/fonts and mstt/)
COPY . .

# Install ONLY your project fonts (Noto/OpenSans + mstt Times New Roman files you copied)
RUN mkdir -p /usr/local/share/fonts/truetype/custom \
    && if [ -d "/app/backend/avantgarde/utils/fonts" ]; then \
         find "/app/backend/avantgarde/utils/fonts" -type f \( -iname "*.ttf" -o -iname "*.otf" \) -print0 \
         | xargs -0 -I{} cp -v "{}" /usr/local/share/fonts/truetype/custom/ ; \
       else \
         echo "No fonts dir at /app/backend/avantgarde/utils/fonts; skipping." ; \
       fi \
    && fc-cache -f -v

ENTRYPOINT ["/app/entrypoint.sh"]
