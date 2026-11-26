ALTER TABLE "profiles" ADD COLUMN "home_latitude" double precision;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "home_longitude" double precision;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_valid_home_coordinates" CHECK (("profiles"."home_latitude" IS NULL AND "profiles"."home_longitude" IS NULL)
          OR ("profiles"."home_latitude" IS NOT NULL AND "profiles"."home_longitude" IS NOT NULL
              AND "profiles"."home_latitude" BETWEEN -90 AND 90 AND "profiles"."home_longitude" BETWEEN -180 AND 180));