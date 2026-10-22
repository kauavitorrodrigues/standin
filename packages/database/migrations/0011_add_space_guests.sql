CREATE TYPE "public"."space_guest_access" AS ENUM('ALLOWED', 'DISABLED');--> statement-breakpoint
CREATE TYPE "public"."space_guest_status" AS ENUM('PENDING', 'ADMITTED', 'DENIED');--> statement-breakpoint
CREATE TYPE "public"."space_guest_status_reason" AS ENUM('AWAITING_RESPONSE', 'HOST_ADMITTED', 'HOST_DENIED', 'KICKED', 'GUEST_ACCESS_DISABLED', 'TIMEOUT');--> statement-breakpoint
CREATE TABLE "space_invite_links" (
	"id" text PRIMARY KEY NOT NULL,
	"space_id" text NOT NULL,
	"created_by" text,
	"token_hash" text NOT NULL,
	"email" varchar(255),
	"expires_at" timestamp NOT NULL,
	"max_uses" integer,
	"uses_count" integer DEFAULT 0 NOT NULL,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "space_guests" (
	"id" text PRIMARY KEY NOT NULL,
	"space_id" text NOT NULL,
	"user_id" text NOT NULL,
	"invite_link_id" text,
	"responded_by" text,
	"email" varchar(255),
	"status" "space_guest_status" DEFAULT 'PENDING' NOT NULL,
	"status_reason" "space_guest_status_reason" DEFAULT 'AWAITING_RESPONSE' NOT NULL,
	"responded_at" timestamp,
	"requested_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "spaces" ADD COLUMN "guest_access" "space_guest_access" DEFAULT 'ALLOWED' NOT NULL;--> statement-breakpoint
ALTER TABLE "space_invite_links" ADD CONSTRAINT "space_invite_links_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "space_invite_links" ADD CONSTRAINT "space_invite_links_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "space_guests" ADD CONSTRAINT "space_guests_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "space_guests" ADD CONSTRAINT "space_guests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "space_guests" ADD CONSTRAINT "space_guests_invite_link_id_space_invite_links_id_fk" FOREIGN KEY ("invite_link_id") REFERENCES "public"."space_invite_links"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "space_guests" ADD CONSTRAINT "space_guests_responded_by_users_id_fk" FOREIGN KEY ("responded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "space_invite_links_token_hash_unique" ON "space_invite_links" USING btree ("token_hash") WHERE "space_invite_links"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "space_invite_links_space_id_index" ON "space_invite_links" USING btree ("space_id");--> statement-breakpoint
CREATE UNIQUE INDEX "space_guests_space_id_user_id_unique" ON "space_guests" USING btree ("space_id","user_id") WHERE "space_guests"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "space_guests_user_id_index" ON "space_guests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "space_guests_space_id_status_index" ON "space_guests" USING btree ("space_id","status");