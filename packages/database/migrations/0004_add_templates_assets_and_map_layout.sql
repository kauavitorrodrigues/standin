CREATE TYPE "public"."map_size_tier" AS ENUM('XS', 'S', 'M', 'L', 'XL');--> statement-breakpoint
CREATE TYPE "public"."map_template_status" AS ENUM('DRAFT', 'PUBLISHED', 'RETIRED');--> statement-breakpoint
CREATE TYPE "public"."asset_action" AS ENUM('SIT', 'TELEPORT');--> statement-breakpoint
CREATE TYPE "public"."asset_category" AS ENUM('SITTING', 'TABLES', 'SHELVES', 'MACHINES', 'FOOD_DRINK', 'ROOM_DECOR', 'WALL_DECOR', 'OUTDOOR');--> statement-breakpoint
CREATE TYPE "public"."asset_placement" AS ENUM('GROUND', 'SURFACE', 'WALL');--> statement-breakpoint
CREATE TYPE "public"."asset_rotation" AS ENUM('DEG_0', 'DEG_90', 'DEG_180', 'DEG_270');--> statement-breakpoint
CREATE TYPE "public"."asset_type" AS ENUM('CHAIR', 'TABLE', 'DESK', 'SOFA', 'TV', 'MONITOR', 'TREE', 'PLANT', 'RUG', 'POSTER', 'DOOR', 'WINDOW', 'DECORATION');--> statement-breakpoint
CREATE TABLE "map_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"status" "map_template_status" DEFAULT 'DRAFT' NOT NULL,
	"map_id" text NOT NULL,
	"organization_id" text,
	"thumbnail_file_id" text,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "tilesets" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text,
	"file_id" text NOT NULL,
	"created_by" text NOT NULL,
	"key" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"width_px" integer NOT NULL,
	"height_px" integer NOT NULL,
	"columns" integer NOT NULL,
	"tile_count" integer NOT NULL,
	"margin" integer DEFAULT 0 NOT NULL,
	"spacing" integer DEFAULT 0 NOT NULL,
	"tile_meta" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "assets" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text,
	"base_asset_id" text,
	"file_id" text NOT NULL,
	"created_by" text NOT NULL,
	"key" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "asset_type" NOT NULL,
	"category" "asset_category" NOT NULL,
	"rotation" "asset_rotation",
	"color_key" varchar(32),
	"color_hex" varchar(7),
	"sprite_w" integer NOT NULL,
	"sprite_h" integer NOT NULL,
	"footprint_w" integer DEFAULT 1 NOT NULL,
	"footprint_h" integer DEFAULT 1 NOT NULL,
	"footprint_offset_x" integer DEFAULT 0 NOT NULL,
	"placement" "asset_placement" DEFAULT 'GROUND' NOT NULL,
	"surface_height_px" integer DEFAULT 0 NOT NULL,
	"solid" boolean DEFAULT false NOT NULL,
	"action" "asset_action",
	"action_params" jsonb,
	"prompt_text" text,
	"animation" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "asset_parts" (
	"id" text PRIMARY KEY NOT NULL,
	"asset_id" text NOT NULL,
	"part_asset_id" text NOT NULL,
	"offset_x" integer NOT NULL,
	"offset_y" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "map_assets" (
	"id" text PRIMARY KEY NOT NULL,
	"map_id" text NOT NULL,
	"asset_id" text NOT NULL,
	"parent_id" text,
	"tile_x" integer NOT NULL,
	"tile_y" integer NOT NULL,
	"property_overrides" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "desk_assignments" (
	"id" text PRIMARY KEY NOT NULL,
	"space_id" text NOT NULL,
	"map_asset_id" text NOT NULL,
	"user_id" text NOT NULL,
	"assigned_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "map_tilesets" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "map_tilesets" CASCADE;--> statement-breakpoint
ALTER TABLE "maps" DROP CONSTRAINT "maps_organization_id_organizations_id_fk";
--> statement-breakpoint
ALTER TABLE "maps" DROP CONSTRAINT "maps_map_json_file_id_files_id_fk";
--> statement-breakpoint
ALTER TABLE "maps" DROP CONSTRAINT "maps_thumbnail_file_id_files_id_fk";
--> statement-breakpoint
ALTER TABLE "maps" DROP CONSTRAINT "maps_created_by_users_id_fk";
--> statement-breakpoint
DROP INDEX "maps_organization_id_index";--> statement-breakpoint
DROP INDEX "maps_map_json_file_id_index";--> statement-breakpoint
DROP INDEX "spaces_map_id_index";--> statement-breakpoint
ALTER TABLE "maps" ALTER COLUMN "tile_size" SET DEFAULT 32;--> statement-breakpoint
ALTER TABLE "maps" ADD COLUMN "layout" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "maps" ADD COLUMN "layout_version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "maps" ADD COLUMN "size_tier" "map_size_tier" NOT NULL;--> statement-breakpoint
ALTER TABLE "map_templates" ADD CONSTRAINT "map_templates_map_id_maps_id_fk" FOREIGN KEY ("map_id") REFERENCES "public"."maps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "map_templates" ADD CONSTRAINT "map_templates_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "map_templates" ADD CONSTRAINT "map_templates_thumbnail_file_id_files_id_fk" FOREIGN KEY ("thumbnail_file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "map_templates" ADD CONSTRAINT "map_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tilesets" ADD CONSTRAINT "tilesets_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tilesets" ADD CONSTRAINT "tilesets_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tilesets" ADD CONSTRAINT "tilesets_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_base_asset_id_assets_id_fk" FOREIGN KEY ("base_asset_id") REFERENCES "public"."assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_parts" ADD CONSTRAINT "asset_parts_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_parts" ADD CONSTRAINT "asset_parts_part_asset_id_assets_id_fk" FOREIGN KEY ("part_asset_id") REFERENCES "public"."assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "map_assets" ADD CONSTRAINT "map_assets_map_id_maps_id_fk" FOREIGN KEY ("map_id") REFERENCES "public"."maps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "map_assets" ADD CONSTRAINT "map_assets_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "map_assets" ADD CONSTRAINT "map_assets_parent_id_map_assets_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."map_assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "desk_assignments" ADD CONSTRAINT "desk_assignments_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "desk_assignments" ADD CONSTRAINT "desk_assignments_map_asset_id_map_assets_id_fk" FOREIGN KEY ("map_asset_id") REFERENCES "public"."map_assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "desk_assignments" ADD CONSTRAINT "desk_assignments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "desk_assignments" ADD CONSTRAINT "desk_assignments_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "map_templates_map_id_unique" ON "map_templates" USING btree ("map_id") WHERE "map_templates"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "map_templates_status_index" ON "map_templates" USING btree ("status");--> statement-breakpoint
CREATE INDEX "map_templates_organization_id_index" ON "map_templates" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "map_templates_created_by_index" ON "map_templates" USING btree ("created_by");--> statement-breakpoint
CREATE UNIQUE INDEX "tilesets_key_global_unique" ON "tilesets" USING btree ("key") WHERE "tilesets"."organization_id" IS NULL AND "tilesets"."deleted_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "tilesets_organization_id_key_unique" ON "tilesets" USING btree ("organization_id","key") WHERE "tilesets"."organization_id" IS NOT NULL AND "tilesets"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "tilesets_organization_id_index" ON "tilesets" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "tilesets_file_id_index" ON "tilesets" USING btree ("file_id");--> statement-breakpoint
CREATE UNIQUE INDEX "assets_key_global_unique" ON "assets" USING btree ("key") WHERE "assets"."organization_id" IS NULL AND "assets"."deleted_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "assets_organization_id_key_unique" ON "assets" USING btree ("organization_id","key") WHERE "assets"."organization_id" IS NOT NULL AND "assets"."deleted_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "assets_family_color_rotation_unique" ON "assets" USING btree (coalesce("base_asset_id", "id"),coalesce("color_key", ''),(case "rotation"
                    when 'DEG_0' then 0
                    when 'DEG_90' then 1
                    when 'DEG_180' then 2
                    when 'DEG_270' then 3
                    else -1 end)) WHERE "assets"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "assets_organization_id_index" ON "assets" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "assets_base_asset_id_index" ON "assets" USING btree ("base_asset_id");--> statement-breakpoint
CREATE INDEX "assets_file_id_index" ON "assets" USING btree ("file_id");--> statement-breakpoint
CREATE INDEX "assets_type_index" ON "assets" USING btree ("type");--> statement-breakpoint
CREATE UNIQUE INDEX "asset_parts_asset_id_part_asset_id_offset_unique" ON "asset_parts" USING btree ("asset_id","part_asset_id","offset_x","offset_y") WHERE "asset_parts"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "asset_parts_asset_id_index" ON "asset_parts" USING btree ("asset_id");--> statement-breakpoint
CREATE INDEX "asset_parts_part_asset_id_index" ON "asset_parts" USING btree ("part_asset_id");--> statement-breakpoint
CREATE INDEX "map_assets_map_id_index" ON "map_assets" USING btree ("map_id");--> statement-breakpoint
CREATE INDEX "map_assets_asset_id_index" ON "map_assets" USING btree ("asset_id");--> statement-breakpoint
CREATE INDEX "map_assets_parent_id_index" ON "map_assets" USING btree ("parent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "desk_assignments_map_asset_id_unique" ON "desk_assignments" USING btree ("map_asset_id") WHERE "desk_assignments"."deleted_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "desk_assignments_space_id_user_id_unique" ON "desk_assignments" USING btree ("space_id","user_id") WHERE "desk_assignments"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "desk_assignments_user_id_index" ON "desk_assignments" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_members_organization_id_owner_unique" ON "organization_members" USING btree ("organization_id") WHERE "organization_members"."role" = 'OWNER' AND "organization_members"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "maps_size_tier_index" ON "maps" USING btree ("size_tier");--> statement-breakpoint
CREATE UNIQUE INDEX "spaces_map_id_unique" ON "spaces" USING btree ("map_id") WHERE "spaces"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "spaces_created_by_index" ON "spaces" USING btree ("created_by");--> statement-breakpoint
ALTER TABLE "maps" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "maps" DROP COLUMN "organization_id";--> statement-breakpoint
ALTER TABLE "maps" DROP COLUMN "map_json_file_id";--> statement-breakpoint
ALTER TABLE "maps" DROP COLUMN "thumbnail_file_id";--> statement-breakpoint
ALTER TABLE "maps" DROP COLUMN "created_by";