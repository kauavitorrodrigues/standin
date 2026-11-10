CREATE TYPE "public"."integration_provider" AS ENUM('SPOTIFY');--> statement-breakpoint
CREATE TYPE "public"."integration_service" AS ENUM('MUSIC');--> statement-breakpoint
CREATE TABLE "organization_integrations" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"updated_by_id" text NOT NULL,
	"provider" "integration_provider" NOT NULL,
	"client_id" text NOT NULL,
	"client_secret_sealed" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_connections" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"provider" "integration_provider" NOT NULL,
	"service" "integration_service" NOT NULL,
	"account_id" text NOT NULL,
	"account_image_url" text,
	"refresh_token_sealed" text NOT NULL,
	"scope" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organization_integrations" ADD CONSTRAINT "organization_integrations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_integrations" ADD CONSTRAINT "organization_integrations_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_connections" ADD CONSTRAINT "app_connections_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_connections" ADD CONSTRAINT "app_connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "organization_integrations_organization_provider_unique" ON "organization_integrations" USING btree ("organization_id","provider");--> statement-breakpoint
CREATE UNIQUE INDEX "app_connections_organization_user_service_unique" ON "app_connections" USING btree ("organization_id","user_id","provider","service");--> statement-breakpoint
CREATE INDEX "app_connections_user_id_index" ON "app_connections" USING btree ("user_id");