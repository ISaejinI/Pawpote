ALTER TABLE "profiles" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "postal_code" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "latitude" double precision;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "longitude" double precision;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_valid_latitude" CHECK ("profiles"."latitude" BETWEEN -90 AND 90);--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_valid_longitude" CHECK ("profiles"."longitude" BETWEEN -180 AND 180);--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_coordinates_together" CHECK (("profiles"."latitude" IS NULL AND "profiles"."longitude" IS NULL)
          OR ("profiles"."latitude" IS NOT NULL AND "profiles"."longitude" IS NOT NULL));