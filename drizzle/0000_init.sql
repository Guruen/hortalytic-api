CREATE TABLE "devices" (
	"id" text PRIMARY KEY NOT NULL,
	"greenhouse_id" uuid,
	"firmware_version" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone,
	CONSTRAINT "devices_id_not_reserved" CHECK ("devices"."id" <> 'hortalytic-api')
);
--> statement-breakpoint
CREATE TABLE "readings" (
	"time" timestamp with time zone NOT NULL,
	"device_id" text NOT NULL,
	"sensor" text NOT NULL,
	"metric" text NOT NULL,
	"value" double precision NOT NULL,
	CONSTRAINT "readings_device_id_sensor_metric_time_pk" PRIMARY KEY("device_id","sensor","metric","time")
);
--> statement-breakpoint
ALTER TABLE "readings" ADD CONSTRAINT "readings_device_id_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."devices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "readings_device_id_time_idx" ON "readings" USING btree ("device_id","time" DESC NULLS FIRST);