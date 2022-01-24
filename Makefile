#!make
MAKEFLAGS += --no-builtin-rules --always-make

SHELL   = /bin/bash
PROJECT =subspace-playground
REPO    =seanmorris

-include vendor/seanmorris/subspace/keys.make
-include vendor/seanmorris/ids/Makefile

BASE_FILE?=infra/compose/base.yml
COMPOSE_TARGET=infra/compose/${TARGET}.yml

build-js:
	@ ${DCOMPOSE} ${DCOMPOSE_TARGET_STACK} run --rm watcher brunch build -p

cert:
	${DCOMPOSE} ${DCOMPOSE_TARGET_STACK} run --rm -p 80:80 \
		certbot --standalone \
		certonly --email ${EMAIL} --agree-tos \
		--no-eff-email -d ${HOSTNAME} --cert-name backend
	openssl rsa -in data/local/certbot/live/backend/privkey.pem > data/local/certbot/live/backend/key.pem

cert-test:
	${DCOMPOSE} ${DCOMPOSE_TARGET_STACK} run --rm -p 80:80 \
		certbot --standalone --staging --test-cert \
		certonly --email ${EMAIL} --agree-tos \
		--no-eff-email -d ${HOSTNAME} --cert-name backend \
		--server https://acme-staging-v02.api.letsencrypt.org/directory
	openssl rsa -in data/local/certbot/live/backend/privkey.pem > data/local/certbot/live/backend/key.pem


