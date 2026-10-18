FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends python3 git curl build-essential ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json ./
COPY solver/server.py solver/worker.py solver/setup.py solver/tables.json ./solver/
COPY solver/bin ./solver/bin
COPY src/vendor/cubejs ./src/vendor/cubejs
# Download tables at startup to a persistent volume, never into the image or Git.
CMD ["sh", "-c", "python3 solver/setup.py && exec python3 solver/server.py"]
