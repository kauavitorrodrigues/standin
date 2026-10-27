ALTER TABLE "messages" ADD COLUMN "thread_parent_id" text;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "show_thread_reply_in_channel" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_thread_parent_id_messages_id_fk" FOREIGN KEY ("thread_parent_id") REFERENCES "public"."messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "messages_thread_parent_id_index" ON "messages" USING btree ("thread_parent_id");