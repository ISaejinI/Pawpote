CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"match_id" uuid NOT NULL,
	"author_id" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"walk_starts_at" timestamp with time zone,
	"walk_minutes" integer,
	"walk_status" text,
	CONSTRAINT "messages_body_length" CHECK (char_length("messages"."body") between 1 and 1000),
	CONSTRAINT "messages_valid_walk" CHECK (
      ("messages"."walk_starts_at" is null and "messages"."walk_minutes" is null and "messages"."walk_status" is null)
      or ("messages"."walk_starts_at" is not null and "messages"."walk_minutes" is not null
        and "messages"."walk_minutes" between 15 and 480 and "messages"."walk_status" is not null
        and "messages"."walk_status" in ('pending', 'accepted', 'superseded'))
    )
);
--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "chat_revision" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "messages_history_idx" ON "messages" USING btree ("match_id","created_at","id");