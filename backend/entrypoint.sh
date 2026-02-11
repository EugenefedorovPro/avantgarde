#!/bin/sh
set -e

python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --noinput
#
# commands
python manage.py populate_content_order


## for development only
exec python manage.py runserver 0.0.0.0:8000 --nothreading

## alternative for development
# gunicorn avantgarde.wsgi:application --bind 0.0.0.0:8000 --workers=1 --timeout=300 --reload


