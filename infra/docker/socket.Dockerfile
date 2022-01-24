FROM seanmorris/subspace-socket:latest
MAINTAINER Sean Morris <sean@seanmorr.is>

COPY infra/php-settings.ini $PHP_INI_DIR/conf.d/

CMD ["idilic", "server"]
