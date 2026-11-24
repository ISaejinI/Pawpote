ALTER TABLE "dogs" ADD COLUMN "favorite_toy" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "last_name" text;--> statement-breakpoint
ALTER TABLE "dogs" ADD CONSTRAINT "dogs_favorite_toy_max_length" CHECK (char_length("dogs"."favorite_toy") <= 32);