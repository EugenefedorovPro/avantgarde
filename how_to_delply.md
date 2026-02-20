docker compose build django_avant
docker tag django_avant eugene8pro/django_avant:2.0
docker push eugene8pro/django_avant:1.0

docker build nginx
docker tag avantgarde-nginx:latest eugene8pro/nginx_avant:2.0
docker push eugene8pro/nginx_avant:1.0

