#!/bin/sh
# KrishiSetu entrypoint
#
# Platform volumes (Railway / Render / `docker -v`) are mounted root-owned
# while the app user is 'node' (UID 1000). When the container starts as root
# we fix the ownership of the writable data dir, then drop privileges and run
# the app as 'node' — so the embedded PostgreSQL can start too (Postgres
# refuses to run as root; as 'node' everything works, incl. volume writes).
set -e

DATA_DIR="${DATA_DIR:-/var/lib/krishisetu}"

if [ "$(id -u)" = "0" ]; then
  mkdir -p "$DATA_DIR"
  chown -R node:node "$DATA_DIR"
  exec gosu node "$@"
fi

# Not running as root (e.g. someone ran `docker run --user`): just run.
exec "$@"