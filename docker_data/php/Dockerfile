FROM php:7.1-fpm
RUN apt-get update && apt-get install -y \
        libfreetype6-dev \
        libjpeg62-turbo-dev \
        libmcrypt-dev \
        libpng12-dev \
    && docker-php-ext-install -j$(nproc) iconv mcrypt \
    && docker-php-ext-configure gd --with-freetype-dir=/usr/include/ --with-jpeg-dir=/usr/include/ \
    && docker-php-ext-install -j$(nproc) gd
	
RUN docker-php-ext-install pdo pdo_mysql

RUN docker-php-ext-install pcntl

RUN pecl install redis-3.1.1 \
    && pecl install xdebug-2.5.0 \
    && docker-php-ext-enable redis xdebug

EXPOSE 9000 9001

#CMD ls /etc
#RUN sed -i -e "s/;daemonize\s*=\s*yes/daemonize = no/g" /etc/php/7.0/fpm/pool.d/www.conf

#VOLUME /var/www/html

#CMD php-fpm --nodaemonize