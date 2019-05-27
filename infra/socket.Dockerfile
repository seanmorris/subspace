FROM seanmorris/subspace-socket
MAINTAINER Sean Morris <sean@seanmorr.is>

COPY infra/php-settings.ini $PHP_INI_DIR/conf.d/

# RUN docker-php-ext-install pdo pdo_mysql

CMD ["idilic", "server"]