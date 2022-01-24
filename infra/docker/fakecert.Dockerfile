FROM debian:bullseye-20211220-slim

RUN set -euxo; \
	apt update; \
	apt install openssl -y;

CMD bash -c 'openssl req -x509 -out /out/backend.crt -keyout /out/backend.key \
	-newkey rsa:2048 -nodes -sha256 \
	-subj "/CN=localhost" -extensions EXT -config <(printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth"); \
	chown 1000 /out/*'
