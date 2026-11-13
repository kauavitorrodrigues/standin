CREATE TYPE "public"."space_ambient_range" AS ENUM('short', 'long', 'off');--> statement-breakpoint
ALTER TABLE "spaces" ADD COLUMN "ambient_range" "space_ambient_range" DEFAULT 'short' NOT NULL;