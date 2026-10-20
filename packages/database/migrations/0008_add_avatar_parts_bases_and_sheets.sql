CREATE TYPE "public"."avatar_slot" AS ENUM('SKIN', 'HAIR', 'FACIAL_HAIR', 'TOP', 'JACKET', 'BOTTOM', 'SHOES', 'HAT', 'GLASSES', 'OTHER', 'COSTUME');--> statement-breakpoint
CREATE TYPE "public"."avatar_base_kind" AS ENUM('BODY', 'MANNEQUIN');--> statement-breakpoint
CREATE TABLE "avatar_parts" (
	"id" text PRIMARY KEY NOT NULL,
	"base_part_id" text,
	"file_id" text NOT NULL,
	"preview_file_id" text NOT NULL,
	"created_by" text NOT NULL,
	"key" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"slot" "avatar_slot" NOT NULL,
	"color_key" varchar(32),
	"color_hex" varchar(7),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "avatar_parts_id_slot_unique" UNIQUE("id","slot")
);
--> statement-breakpoint
CREATE TABLE "avatar_bases" (
	"id" text PRIMARY KEY NOT NULL,
	"file_id" text NOT NULL,
	"preview_file_id" text,
	"created_by" text NOT NULL,
	"key" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"kind" "avatar_base_kind" DEFAULT 'BODY' NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "avatar_bases_id_kind_unique" UNIQUE("id","kind")
);
--> statement-breakpoint
CREATE TABLE "avatar_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"preview_file_id" text,
	"slot" "avatar_slot" NOT NULL,
	"name" varchar(255) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_avatar_bases" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"base_id" text NOT NULL,
	"kind" "avatar_base_kind" DEFAULT 'BODY' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_avatar_bases_kind_body" CHECK ("user_avatar_bases"."kind" = 'BODY')
);
--> statement-breakpoint
CREATE TABLE "user_avatar_parts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"part_id" text NOT NULL,
	"slot" "avatar_slot" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_avatar_sheets" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"file_id" text NOT NULL,
	"config_hash" varchar(64) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "avatar_parts" ADD CONSTRAINT "avatar_parts_base_part_id_avatar_parts_id_fk" FOREIGN KEY ("base_part_id") REFERENCES "public"."avatar_parts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "avatar_parts" ADD CONSTRAINT "avatar_parts_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "avatar_parts" ADD CONSTRAINT "avatar_parts_preview_file_id_files_id_fk" FOREIGN KEY ("preview_file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "avatar_parts" ADD CONSTRAINT "avatar_parts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "avatar_bases" ADD CONSTRAINT "avatar_bases_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "avatar_bases" ADD CONSTRAINT "avatar_bases_preview_file_id_files_id_fk" FOREIGN KEY ("preview_file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "avatar_bases" ADD CONSTRAINT "avatar_bases_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "avatar_categories" ADD CONSTRAINT "avatar_categories_preview_file_id_files_id_fk" FOREIGN KEY ("preview_file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_avatar_bases" ADD CONSTRAINT "user_avatar_bases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_avatar_bases" ADD CONSTRAINT "user_avatar_bases_base_id_kind_fk" FOREIGN KEY ("base_id","kind") REFERENCES "public"."avatar_bases"("id","kind") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_avatar_parts" ADD CONSTRAINT "user_avatar_parts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_avatar_parts" ADD CONSTRAINT "user_avatar_parts_part_id_slot_fk" FOREIGN KEY ("part_id","slot") REFERENCES "public"."avatar_parts"("id","slot") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_avatar_sheets" ADD CONSTRAINT "user_avatar_sheets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_avatar_sheets" ADD CONSTRAINT "user_avatar_sheets_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "avatar_parts_key_unique" ON "avatar_parts" USING btree ("key") WHERE "avatar_parts"."deleted_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "avatar_parts_family_color_unique" ON "avatar_parts" USING btree (coalesce("base_part_id", "id"),coalesce("color_key", '')) WHERE "avatar_parts"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "avatar_parts_slot_name_id_index" ON "avatar_parts" USING btree ("slot","name","id") WHERE "avatar_parts"."base_part_id" IS NULL AND "avatar_parts"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "avatar_parts_base_part_id_index" ON "avatar_parts" USING btree ("base_part_id");--> statement-breakpoint
CREATE INDEX "avatar_parts_slot_index" ON "avatar_parts" USING btree ("slot");--> statement-breakpoint
CREATE INDEX "avatar_parts_file_id_index" ON "avatar_parts" USING btree ("file_id");--> statement-breakpoint
CREATE INDEX "avatar_parts_preview_file_id_index" ON "avatar_parts" USING btree ("preview_file_id");--> statement-breakpoint
CREATE INDEX "avatar_parts_created_by_index" ON "avatar_parts" USING btree ("created_by");--> statement-breakpoint
CREATE UNIQUE INDEX "avatar_bases_key_unique" ON "avatar_bases" USING btree ("key") WHERE "avatar_bases"."deleted_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "avatar_bases_default_unique" ON "avatar_bases" USING btree ("kind") WHERE "avatar_bases"."is_default" AND "avatar_bases"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "avatar_bases_file_id_index" ON "avatar_bases" USING btree ("file_id");--> statement-breakpoint
CREATE INDEX "avatar_bases_preview_file_id_index" ON "avatar_bases" USING btree ("preview_file_id");--> statement-breakpoint
CREATE INDEX "avatar_bases_created_by_index" ON "avatar_bases" USING btree ("created_by");--> statement-breakpoint
CREATE UNIQUE INDEX "avatar_categories_slot_unique" ON "avatar_categories" USING btree ("slot");--> statement-breakpoint
CREATE INDEX "avatar_categories_preview_file_id_index" ON "avatar_categories" USING btree ("preview_file_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_avatar_bases_user_id_unique" ON "user_avatar_bases" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_avatar_bases_base_id_index" ON "user_avatar_bases" USING btree ("base_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_avatar_parts_user_id_slot_unique" ON "user_avatar_parts" USING btree ("user_id","slot");--> statement-breakpoint
CREATE INDEX "user_avatar_parts_part_id_index" ON "user_avatar_parts" USING btree ("part_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_avatar_sheets_user_id_unique" ON "user_avatar_sheets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_avatar_sheets_file_id_index" ON "user_avatar_sheets" USING btree ("file_id");--> statement-breakpoint
INSERT INTO "avatar_categories" ("id", "slot", "name", "sort_order") VALUES
	(gen_random_uuid()::text, 'SKIN', 'Skin', 0),
	(gen_random_uuid()::text, 'HAIR', 'Hair', 1),
	(gen_random_uuid()::text, 'FACIAL_HAIR', 'Facial hair', 2),
	(gen_random_uuid()::text, 'TOP', 'Top', 3),
	(gen_random_uuid()::text, 'JACKET', 'Jacket', 4),
	(gen_random_uuid()::text, 'BOTTOM', 'Bottom', 5),
	(gen_random_uuid()::text, 'SHOES', 'Shoes', 6),
	(gen_random_uuid()::text, 'HAT', 'Hat', 7),
	(gen_random_uuid()::text, 'GLASSES', 'Glasses', 8),
	(gen_random_uuid()::text, 'OTHER', 'Other', 9),
	(gen_random_uuid()::text, 'COSTUME', 'Costume', 10);