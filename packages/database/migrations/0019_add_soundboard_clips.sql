CREATE TABLE "soundboard_clips" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(40) NOT NULL,
	"icon" varchar(32),
	"volume" real DEFAULT 1 NOT NULL,
	"duration_ms" integer NOT NULL,
	"organization_id" text,
	"file_id" text NOT NULL,
	"created_by_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "soundboard_clips" ADD CONSTRAINT "soundboard_clips_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "soundboard_clips" ADD CONSTRAINT "soundboard_clips_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "soundboard_clips" ADD CONSTRAINT "soundboard_clips_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "soundboard_clips_default_name_unique" ON "soundboard_clips" USING btree ("name") WHERE "soundboard_clips"."organization_id" IS NULL AND "soundboard_clips"."deleted_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "soundboard_clips_organization_id_name_unique" ON "soundboard_clips" USING btree ("organization_id","name") WHERE "soundboard_clips"."organization_id" IS NOT NULL AND "soundboard_clips"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "soundboard_clips_organization_id_index" ON "soundboard_clips" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "soundboard_clips_deleted_at_index" ON "soundboard_clips" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "soundboard_clips_file_id_index" ON "soundboard_clips" USING btree ("file_id");--> statement-breakpoint
CREATE INDEX "soundboard_clips_created_by_id_index" ON "soundboard_clips" USING btree ("created_by_id");