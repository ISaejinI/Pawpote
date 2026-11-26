ALTER TABLE "swipes" ALTER COLUMN "swiper_dog_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "swipes" ADD COLUMN "swiper_user_id" text;--> statement-breakpoint
ALTER TABLE "swipes" ADD COLUMN "reviewed" boolean DEFAULT true NOT NULL;--> statement-breakpoint
UPDATE "swipes" AS "swipe" SET "swiper_user_id" = "dog"."owner_id"
FROM "dogs" AS "dog" WHERE "swipe"."swiper_dog_id" = "dog"."id";--> statement-breakpoint
ALTER TABLE "swipes" ALTER COLUMN "swiper_user_id" SET NOT NULL;--> statement-breakpoint
WITH "ranked" AS (
	SELECT "id", row_number() OVER (
		PARTITION BY "swiper_user_id", "target_dog_id" ORDER BY "created_at" DESC, "id" DESC
	) AS "rank" FROM "swipes"
)
UPDATE "swipes" SET "reviewed" = false FROM "ranked"
WHERE "swipes"."id" = "ranked"."id" AND "ranked"."rank" > 1;--> statement-breakpoint
ALTER TABLE "swipes" ADD CONSTRAINT "swipes_swiper_user_id_user_id_fk" FOREIGN KEY ("swiper_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "swipes_user_target_reviewed_idx" ON "swipes" USING btree ("swiper_user_id","target_dog_id") WHERE "swipes"."reviewed";
