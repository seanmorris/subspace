FROM php:7.4-apache
MAINTAINER Sean Morris <sean@seanmorr.is>

RUN rm -rfv /var/www/html && ln -s /app/public /var/www/html \
	&& docker-php-ext-install pdo pdo_mysql bcmath sockets pcntl

RUN a2enmod rewrite

RUN ln -s /app/vendor/seanmorris/ids/source/Idilic/idilic /usr/local/bin/idilic

CMD ["idilic", "info"]
