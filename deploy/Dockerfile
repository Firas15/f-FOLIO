# PHP 8.2 + Apache для портфолио: GD нужен админке (загрузка фото → WebP)
FROM php:8.2-apache
RUN apt-get update \
 && apt-get install -y --no-install-recommends libpng-dev libjpeg-dev libwebp-dev \
 && docker-php-ext-configure gd --with-jpeg --with-webp \
 && docker-php-ext-install gd \
 && a2enmod rewrite headers \
 && rm -rf /var/lib/apt/lists/*
# админка грузит до 15 МБ
RUN { echo "upload_max_filesize=20M"; echo "post_max_size=24M"; echo "memory_limit=512M"; } > /usr/local/etc/php/conf.d/portfolio.ini
# за nginx: порт наружу не публикуем
