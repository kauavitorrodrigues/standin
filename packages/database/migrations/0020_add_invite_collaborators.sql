-- The invitations by e-mail had no writer before this change, so the rows (if any)
-- are discarded: the new columns are not null and a row cannot be filled in.
DELETE FROM "organization_invites";--> statement-breakpoint
ALTER TABLE "space_guests" ALTER COLUMN "expires_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "organization_invites" ADD COLUMN "space_id" text;--> statement-breakpoint
ALTER TABLE "organization_invites" ADD COLUMN "map_asset_id" text;--> statement-breakpoint
ALTER TABLE "organization_invites" ADD COLUMN "token_hash" text NOT NULL;--> statement-breakpoint
ALTER TABLE "organization_invites" ADD COLUMN "token_encrypted" text NOT NULL;--> statement-breakpoint
ALTER TABLE "organization_invites" ADD COLUMN "accepted_at" timestamp;--> statement-breakpoint
ALTER TABLE "space_invite_links" ADD COLUMN "token_encrypted" text;--> statement-breakpoint
ALTER TABLE "space_invite_links" ADD COLUMN "guest_validity_hours" integer;--> statement-breakpoint
ALTER TABLE "space_guests" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "organization_invite_links" ADD COLUMN "token_encrypted" text;--> statement-breakpoint
ALTER TABLE "organization_invites" ADD CONSTRAINT "organization_invites_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "organization_invites_token_hash_unique" ON "organization_invites" USING btree ("token_hash") WHERE "organization_invites"."deleted_at" IS NULL;--> statement-breakpoint
UPDATE "organization_invite_links" SET "revoked_at" = now() WHERE "revoked_at" IS NULL AND "deleted_at" IS NULL AND "token_encrypted" IS NULL;--> statement-breakpoint
UPDATE "space_invite_links" SET "revoked_at" = now() WHERE "revoked_at" IS NULL AND "deleted_at" IS NULL AND "token_encrypted" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "space_invite_links_fixed_unique" ON "space_invite_links" USING btree ("space_id") WHERE "space_invite_links"."deleted_at" IS NULL AND "space_invite_links"."revoked_at" IS NULL AND "space_invite_links"."token_encrypted" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "organization_invite_links_fixed_unique" ON "organization_invite_links" USING btree ("organization_id") WHERE "organization_invite_links"."deleted_at" IS NULL AND "organization_invite_links"."revoked_at" IS NULL AND "organization_invite_links"."token_encrypted" IS NOT NULL;
--> statement-breakpoint
DROP INDEX "organization_invites_token_unique";--> statement-breakpoint
ALTER TABLE "organization_invites" DROP COLUMN "token";
