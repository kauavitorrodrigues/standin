CREATE TYPE "public"."space_proximity_preset" AS ENUM('Short', 'Long');--> statement-breakpoint
ALTER TABLE "spaces" ADD COLUMN "proximity_preset" "space_proximity_preset" DEFAULT 'Long' NOT NULL;