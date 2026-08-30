CREATE TABLE "files" (
	"id" text PRIMARY KEY NOT NULL,
	"original_name" text NOT NULL,
	"file_name" text NOT NULL,
	"extension" varchar(32) NOT NULL,
	"mime_type" varchar(255) NOT NULL,
	"size_in_bytes" bigint NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "map_tilesets" (
	"id" text PRIMARY KEY NOT NULL,
	"map_id" text NOT NULL,
	"file_id" text NOT NULL,
	"tileset_name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maps" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"tile_size" integer NOT NULL,
	"organization_id" text,
	"map_json_file_id" text NOT NULL,
	"thumbnail_file_id" text,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "organization_invites" ADD COLUMN "created_by" text;--> statement-breakpoint
ALTER TABLE "spaces" ADD COLUMN "map_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "spaces" ADD COLUMN "created_by" text;--> statement-breakpoint
ALTER TABLE "map_tilesets" ADD CONSTRAINT "map_tilesets_map_id_maps_id_fk" FOREIGN KEY ("map_id") REFERENCES "public"."maps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "map_tilesets" ADD CONSTRAINT "map_tilesets_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maps" ADD CONSTRAINT "maps_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maps" ADD CONSTRAINT "maps_map_json_file_id_files_id_fk" FOREIGN KEY ("map_json_file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maps" ADD CONSTRAINT "maps_thumbnail_file_id_files_id_fk" FOREIGN KEY ("thumbnail_file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maps" ADD CONSTRAINT "maps_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "files_file_name_unique" ON "files" USING btree ("file_name") WHERE "files"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "map_tilesets_map_id_index" ON "map_tilesets" USING btree ("map_id");--> statement-breakpoint
CREATE INDEX "map_tilesets_file_id_index" ON "map_tilesets" USING btree ("file_id");--> statement-breakpoint
CREATE UNIQUE INDEX "map_tilesets_map_id_tileset_name_unique" ON "map_tilesets" USING btree ("map_id","tileset_name");--> statement-breakpoint
CREATE INDEX "maps_organization_id_index" ON "maps" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "maps_map_json_file_id_index" ON "maps" USING btree ("map_json_file_id");--> statement-breakpoint
ALTER TABLE "organization_invites" ADD CONSTRAINT "organization_invites_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_map_id_maps_id_fk" FOREIGN KEY ("map_id") REFERENCES "public"."maps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "spaces_map_id_index" ON "spaces" USING btree ("map_id");