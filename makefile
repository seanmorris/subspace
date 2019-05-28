#!make
init:
	cd infra/ \
	&& docker build . -t seanmorris/subspace-terminal-worker -f ./worker.Dockerfile \
	&& docker-compose build
	&& docker-compose up

build-docker:
	cd infra/ \
	&& docker build . -t seanmorris/subspace-terminal-worker -f ./worker.Dockerfile \
	&& docker-compose build

start:
	cd infra/ \
	&& docker-compose up -d

start-fg:
	cd infra/ \
	&& docker-compose up

stop:
	cd infra/ \
	&& docker-compose down

restart:
	cd infra/ \
	&& docker-compose down \
	&& docker-compose up -d

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

bounce:
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
