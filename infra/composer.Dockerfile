FROM seanmorris/subspace-terminal-worker:latest
MAINTAINER Sean Morris <sean@seanmorr.is>
RUN php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" \
	&& php -r "if (hash_file('SHA384', 'composer-setup.php') === '8a6138e2a05a8c28539c9f0fb361159823655d7ad2deecb371b04a83966c61223adc522b0189079e3e9e277cd72b8897') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;" \
	&& php composer-setup.php \
	&& php -r "unlink('composer-setup.php');" \
	&& apt update \
	&& apt install ssh git -y \
	&& mv composer.phar /usr/local/bin/composer

WORKDIR "/app"

CMD ["composer", "update", "-vvv"]
