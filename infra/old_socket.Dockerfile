FROM r.cfcr.io/seanmorris/worker.subspace.seanmorr.is:latest
MAINTAINER Sean Morris <sean@seanmorr.is>

COPY infra/php-settings.ini $PHP_INI_DIR/conf.d/

CMD ["idilic", "server"]
