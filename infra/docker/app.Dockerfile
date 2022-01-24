FROM seanmorris/subspace-web:latest
MAINTAINER Sean Morris <sean@seanmorr.is>

RUN docker-php-ext-install pdo pdo_mysql bcmath

CMD ["apache2-foreground"]
