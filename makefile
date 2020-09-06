#!make
init:
	cd infra/ \
	&& docker build . -t seanmorris/subspace-terminal-worker -f ./worker.Dockerfile \
	&& docker-compose build \
	&& docker-compose up

run:
	cd infra/ \
	&& docker-compose run ${IMAGE} ${CMD}

build-images:
	cd infra/ \
	&& docker build . -t seanmorris/subspace-terminal-worker -f ./worker.Dockerfile \
	&& docker-compose build ${IMAGE}

start:
	cd infra/ \
	&& docker-compose up -d ${IMAGE}

start-fg:
	cd infra/ \
	&& docker-compose up ${IMAGE}

stop:
	cd infra/ \
	&& docker-compose down ${IMAGE}

stop-all:
	cd infra/ \
	&& docker-compose down --remove-orphans ${IMAGE}

restart:
	cd infra/ \
	&& docker-compose restart ${IMAGE}

restart-fg:
	cd infra/ \
	&& docker-compose down \
	&& docker-compose up

push:
	cd infra/ \
	&& docker-compose push

pull:
	cd infra/ \
	&& docker-compose pull

bounce-socket:
	docker restart $$(docker ps -a -q --filter ancestor=seanmorris/subspace-terminal-socket --format="{{.ID}}")

stop-socket:
	docker stop $$(docker ps -a -q --filter ancestor=seanmorris/subspace-terminal-socket --format="{{.ID}}")

build-js:
	cd infra/ \
	&& docker-compose run --rm is.seanmorr.subspace-terminal.watcher brunch build -p

watch-js:
	cd infra/ \
	&& docker-compose run --rm -p 9485:9485 is.seanmorr.subspace-terminal.watcher brunch watch -s

watch-log:
	cd temporary/ \
	&& less -RSXMNI +F log.txt

composer-install:
	cd infra/ \
	&& docker-compose run --rm is.seanmorr.subspace-terminal.composer composer install

composer-update:
	cd infra/ \
	&& docker-compose run --rm is.seanmorr.subspace-terminal.composer composer update
cert:
	cd infra/ \
	&& docker-compose run --rm -p 80:80 run --rm -p 80:80 \
		is.seanmorr.subspace-terminal.certbot --standalone \
		certonly --email subspace@seanmorr.is --agree-tos \
		--no-eff-email -d subspace2.seanmorr.is --cert-name backend