# Hortalytic backend

## Stack
- NestJS, TypeScript, ESM
- Vitest (via unplugin-swc, så decorator metadata virker)
- MQTT som transport fra enheder (Mosquitto lokalt)
- PostgreSQL + TimescaleDB til målinger
- Deployes som Docker container på NAS

## Arkitektur
- Modulær monolit, feature-baserede moduler under src/modules/
- Moduler: ingestion, devices, telemetry, greenhouses, users, auth
- ingestion må kun afhænge af devices og telemetry, ingen forretningslogik
- Skal kunne løftes ud som separat app i Nest monorepo senere

## Kontrakter
- Topics: hortalytic/{deviceId}/telemetry | status | cmd
- Payload er versioneret (felt "v") og indeholder enhedens timestamp
- Datamodel: User -> Greenhouse -> Device -> Reading
- En Device kan eksistere uden ejer (claiming senere)
- Credentials per enhed, aldrig delt nøgle
- "hortalytic-api" er et reserveret MQTT-brugernavn og må aldrig bruges som deviceId
- MQTT kører nu på 1883 uden TLS (kun LAN). Senere skal enheder forbinde via 8883 med TLS, så broker-URL, port og CA-certifikat skal være konfigurerbare i firmwaren

## Konventioner
- Tynde controllers, logik i services
- Config valideres ved opstart
- Global ValidationPipe med whitelist, forbidNonWhitelisted, transform

## Git
- Commit messages følger Conventional Commits (feat:, fix:, chore:, docs:, test:, refactor:)
- Skrives på engelsk, kort emnelinje under 72 tegn, evt. uddybning i body
- Commit aldrig .env eller docker/mosquitto/passwd