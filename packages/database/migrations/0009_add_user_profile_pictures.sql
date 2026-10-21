CREATE TABLE "user_profile_pictures" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"file_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_profile_pictures" ADD CONSTRAINT "user_profile_pictures_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profile_pictures" ADD CONSTRAINT "user_profile_pictures_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_profile_pictures_user_id_unique" ON "user_profile_pictures" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_profile_pictures_file_id_index" ON "user_profile_pictures" USING btree ("file_id");--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "avatar";