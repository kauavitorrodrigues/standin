CREATE TABLE "global_settings" (
	"id" text PRIMARY KEY DEFAULT 'global' NOT NULL,
	"allow_signup" boolean DEFAULT true NOT NULL,
	"allow_organization_creation" boolean DEFAULT true NOT NULL,
	"allow_space_creation" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_invite_links" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"created_by" text,
	"token_hash" text NOT NULL,
	"role" text DEFAULT 'MEMBER' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"max_uses" integer,
	"uses_count" integer DEFAULT 0 NOT NULL,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "organization_invite_links" ADD CONSTRAINT "organization_invite_links_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_invite_links" ADD CONSTRAINT "organization_invite_links_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "organization_invite_links_token_hash_unique" ON "organization_invite_links" USING btree ("token_hash") WHERE "organization_invite_links"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "organization_invite_links_organization_id_index" ON "organization_invite_links" USING btree ("organization_id");