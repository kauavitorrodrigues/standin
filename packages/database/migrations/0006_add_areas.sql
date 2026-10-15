CREATE TABLE "areas" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(60) NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"object_count" integer NOT NULL,
	"stamp" jsonb NOT NULL,
	"organization_id" text,
	"thumbnail_file_id" text NOT NULL,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "areas" ADD CONSTRAINT "areas_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "areas" ADD CONSTRAINT "areas_thumbnail_file_id_files_id_fk" FOREIGN KEY ("thumbnail_file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "areas" ADD CONSTRAINT "areas_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "areas_organization_id_index" ON "areas" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "areas_created_by_index" ON "areas" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "areas_thumbnail_file_id_index" ON "areas" USING btree ("thumbnail_file_id");