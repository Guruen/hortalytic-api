#!/bin/sh
# Mosquitto 2 kræver, at passwd og acl ejes af mosquitto (uid 1883) med 0700.
# På bind-mounts fra Windows eller NAS'en kan man ikke stole på chown/chmod, så
# filerne kopieres ind i containerens eget filsystem med de rigtige rettigheder.
set -eu

SRC=/mosquitto/config-src
DST=/mosquitto/config

if [ ! -f "$SRC/passwd" ]; then
  echo "FEJL: $SRC/passwd mangler. Opret den FØR 'docker compose up' – se README." >&2
  exit 1
fi

mkdir -p "$DST"
install -o 1883 -g 1883 -m 0700 "$SRC/passwd" "$DST/passwd"
install -o 1883 -g 1883 -m 0700 "$SRC/acl" "$DST/acl"
install -o 1883 -g 1883 -m 0644 "$SRC/mosquitto.conf" "$DST/mosquitto.conf"

exec /docker-entrypoint.sh mosquitto -c "$DST/mosquitto.conf"
