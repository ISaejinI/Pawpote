CREATE TABLE "sign_in_attempts" (
	"email" text PRIMARY KEY NOT NULL,
	"count" integer NOT NULL,
	"window_start" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limit" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"count" integer NOT NULL,
	"last_request" bigint NOT NULL,
	CONSTRAINT "rate_limit_key_unique" UNIQUE("key")
);
--> statement-breakpoint
-- Les positions GPS déjà enregistrées passent sur la grille d'environ 500 m (voir approximateLocation)
UPDATE "profiles" SET
	"latitude" = round("latitude"::numeric * 200) / 200,
	"longitude" = round("longitude"::numeric * 200) / 200
WHERE "latitude" IS NOT NULL;
