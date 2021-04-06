FROM seanmorris/subspace-socket
MAINTAINER Sean Morris <sean@seanmorr.is>

COPY infra/php-settings.ini $PHP_INI_DIR/conf.d/

# RUN docker-php-ext-install pdo pdo_mysql
RUN docker-php-ext-install bcmath sockets pcntl

CMD ["idilic", "server"]
