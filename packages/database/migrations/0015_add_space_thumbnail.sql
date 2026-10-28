ALTER TABLE "spaces" ADD COLUMN "thumbnail_file_id" text;--> statement-breakpoint
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_thumbnail_file_id_files_id_fk" FOREIGN KEY ("thumbnail_file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "spaces_thumbnail_file_id_index" ON "spaces" USING btree ("thumbnail_file_id");