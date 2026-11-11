CREATE TYPE "public"."object_behavior" AS ENUM('NONE', 'EMBEDDED_WEBSITE', 'GONG', 'GITHUB_TRACKER', 'WEBHOOK');--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "behavior" "object_behavior" DEFAULT 'NONE' NOT NULL;--> statement-breakpoint
ALTER TABLE "map_assets" ADD COLUMN "behavior_params" jsonb;