docker-compose stop
docker-compose build
docker-compose up -d

sed -ri "s/localhost:6379/redis:6379/g" app/config/parameters.yml
sed -ri "s/localhost:6379/redis:6379/g" app/config/parameters.yml
sed -ri "s/php7/php/g" app/config/parameters.yml
sed -ri "s/mysql.app.dev/192.168.9.11/g" app/config/parameters.yml

docker exec -it php_c bash