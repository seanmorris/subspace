FROM seanmorris/subspace-web

RUN apt update && apt install libyaml-dev -y

RUN pecl install yaml

RUN docker-php-ext-install bcmath sockets

CMD ["apache2-foreground"]
