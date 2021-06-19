#!make
MAKEFLAGS += --no-builtin-rules --always-make

SHELL   = /bin/bash
PROJECT =subspace-playground
REPO    =seanmorris/subspace-playground

-include vendor/seanmorris/ids/Makefile

BASE_FILE?=infra/compose/base.yml
COMPOSE_TARGET=infra/compose/${TARGET}.yml


# #!make
# init:
# 	cd infra/ \
# 	&& docker build . -t seanmorris/subspace-terminal-worker -f ./worker.Dockerfile \
# 	&& docker-compose build \
# 	&& docker-compose up

# run:
# 	cd infra/ \
# 	&& docker-compose run ${IMAGE} ${CMD}

# build-images:
# 	cd infra/ \
# 	&& docker build . -t seanmorris/subspace-terminal-worker -f ./worker.Dockerfile \
# 	&& docker-compose build ${IMAGE}

# start:
# 	cd infra/ \
# 	&& docker-compose up -d ${IMAGE}

# start-fg:
# 	cd infra/ \
# 	&& docker-compose up ${IMAGE}

# stop:
# 	cd infra/ \
# 	&& docker-compose down ${IMAGE}

# stop-all:
# 	cd infra/ \
# 	&& docker-compose down --remove-orphans ${IMAGE}

# restart:
# 	cd infra/ \
# 	&& docker-compose restart ${IMAGE}

# restart-fg:
# 	cd infra/ \
# 	&& docker-compose down \
# 	&& docker-compose up

# push:
# 	cd infra/ \
# 	&& docker-compose push

# pull:
# 	cd infra/ \
# 	&& docker-compose pull

# bounce-socket:
# 	docker restart $$(docker ps -a -q --filter ancestor=seanmorris/subspace-terminal-socket --format="{{.ID}}")

# stop-socket:
# 	docker stop $$(docker ps -a -q --filter ancestor=seanmorris/subspace-terminal-socket --format="{{.ID}}")

# build-js:
# 	cd infra/ \
# 	&& docker-compose run --rm watcher brunch build -p

# watch-js:
# 	cd infra/ \
# 	&& docker-compose run --rm -p 9485:9485 watcher brunch watch -s

# watch-log:
# 	cd temporary/ \
# 	&& less -RSXMNI +F log.txt

# composer-install:
# 	cd infra/ \
# 	&& docker-compose run --rm composer composer install

# composer-update:
# 	cd infra/ \
# 	&& docker-compose run --rm composer composer update
# cert:
# 	cd infra/ \
# 	&& docker-compose run --rm -p 80:80 run --rm -p 80:80 \
# 		certbot --standalone \
# 		certonly --email subspace@seanmorr.is --agree-tos \
# 		--no-eff-email -d subspace2.seanmorr.is --cert-name backend

