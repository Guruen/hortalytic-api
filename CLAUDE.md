# Hortalytic backend

## Stack
- NestJS, TypeScript, ESM
- Vitest (via unplugin-swc, så decorator metadata virker)
- MQTT som transport fra enheder (Mosquitto lokalt)
- PostgreSQL + TimescaleDB til målinger
- Drizzle ORM (drizzle-orm + postgres.js driver), migrationer med drizzle-kit
- Deployes som Docker container på NAS

## Arkitektur
- Modulær monolit, feature-baserede moduler under src/modules/
- Moduler: ingestion, devices, telemetry, greenhouses, users, auth
- ingestion må kun afhænge af devices og telemetry, ingen forretningslogik
- Skal kunne løftes ud som separat app i Nest monorepo senere
- Drizzle-schema ligger i modulet, der ejer tabellen (src/modules/<modul>/<navn>.schema.ts), og eksporteres samlet fra src/database/schema.ts
- Drizzle-klienten injiceres med @Inject(DRIZZLE) fra DatabaseModule (global)

## Kontrakter
- Topics: hortalytic/{deviceId}/telemetry | status | cmd
- Payload er versioneret (felt "v") og indeholder enhedens timestamp
- Datamodel: User -> Greenhouse -> Device -> Reading
- Readings gemmes i long format (time, device_id, sensor, metric, value), en række pr. måling. Nye sensortyper (fx lux, jordfugt) kræver ingen schemaændring
- readings er en TimescaleDB hypertable på time. Primærnøgle og unikke constraints skal derfor inkludere time
- En Device kan eksistere uden ejer (claiming senere)
- Credentials per enhed, aldrig delt nøgle
- "hortalytic-api" er et reserveret MQTT-brugernavn og må aldrig bruges som deviceId
- MQTT kører nu på 1883 uden TLS (kun LAN). Senere skal enheder forbinde via 8883 med TLS, så broker-URL, port og CA-certifikat skal være konfigurerbare i firmwaren

## Konventioner
- Tynde controllers, logik i services
- Config valideres ved opstart
- Global ValidationPipe med whitelist, forbidNonWhitelisted, transform

## Database
- Migrationer genereres med npm run db:generate og committes i drizzle/
- TimescaleDB-ting (hypertables, policies) laves som custom SQL migration: drizzle-kit generate --custom --name=<navn>
- Brug aldrig drizzle-kit push, den kender ikke til hypertables
- I prod kører migrationer som separat one-shot migrate-service i compose.prod.yaml, før api starter (ikke ved app-opstart)
- Integrationstests (*.int-spec.ts, npm run test:int) kører mod rigtig TimescaleDB i Testcontainers med samme pinnede image som compose. Kræver Docker

## Git
- Commit messages følger Conventional Commits (feat:, fix:, chore:, docs:, test:, refactor:)
- Skrives på engelsk, kort emnelinje under 72 tegn, evt. uddybning i body
- Commit aldrig .env eller docker/mosquitto/passwd