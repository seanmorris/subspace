FROM seanmorris/subspace-socket:latest
MAINTAINER Sean Morris <sean@seanmorr.is>

COPY infra/php-settings.ini $PHP_INI_DIR/conf.d/

RUN apt update && apt install libyaml-dev -y

RUN pecl install yaml

RUN docker-php-ext-install bcmath sockets

CMD ["idilic", "server"]
