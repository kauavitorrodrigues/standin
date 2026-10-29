CREATE TABLE "service_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"created_by_id" text NOT NULL,
	"name" text NOT NULL,
	"token_hash" text NOT NULL,
	"token_prefix" text NOT NULL,
	"scopes" jsonb NOT NULL,
	"last_used_at" timestamp,
	"expires_at" timestamp,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "service_tokens" ADD CONSTRAINT "service_tokens_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "service_tokens_token_hash_unique" ON "service_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "service_tokens_created_by_id_index" ON "service_tokens" USING btree ("created_by_id");