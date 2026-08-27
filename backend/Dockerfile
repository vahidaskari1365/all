# بک‌اند کسب‌یاب — Laravel روی PHP 8.3 (مطابق معماری مصوب)
FROM php:8.3-cli-alpine

RUN apk add --no-cache postgresql-dev icu-dev libzip-dev oniguruma-dev \
    && docker-php-ext-install pdo_pgsql pgsql bcmath pcntl sockets intl opcache zip mbstring \
    && apk add --no-cache --virtual .pecl $PHPIZE_DEPS \
    && pecl install redis && docker-php-ext-enable redis \
    && apk del .pecl

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction

COPY . .
RUN composer dump-autoload --optimize \
    && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 8000
CMD ["sh", "-c", "php artisan migrate --force && php artisan schedule:work & exec php artisan serve --host=0.0.0.0 --port=8000"]
