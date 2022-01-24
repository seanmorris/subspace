FROM seanmorris/subspace-terminal-worker:latest
MAINTAINER Sean Morris <sean@seanmorr.is>
RUN apt update \
	&& apt-get install -y gnupg apt-transport-https \
	&& curl -sL https://deb.nodesource.com/setup_14.x | bash - \
	&& apt update \
	&& apt install -y nodejs \
	&& npm i -g brunch

RUN npm install

WORKDIR "/app/frontend"
CMD ["brunch", "watch", "-s"]
