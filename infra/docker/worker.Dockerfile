FROM php:8.1.1-apache
MAINTAINER Sean Morris <sean@seanmorr.is>
SHELL ["bash", "-euxo", "pipefail", "-c"]

RUN docker-php-ext-install pdo pdo_mysql bcmath

RUN rm -rfv /var/www/html && ln -s /app/public /var/www/html; \
	docker-php-ext-install pdo pdo_mysql bcmath sockets pcntl;

RUN ln -s /app/vendor/seanmorris/ids/source/Idilic/idilic /usr/local/bin/idilic

CMD ["idilic", "info"]
