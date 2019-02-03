echo "Building seanmorr.is\n";

docker build . -t r.cfcr.io/seanmorris/worker.subspace.seanmorr.is -f ./worker.Dockerfile \
&& docker-compose build