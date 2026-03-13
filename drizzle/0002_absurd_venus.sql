ALTER TABLE "cinemas" ADD COLUMN "rating" numeric(2, 1);--> statement-breakpoint
ALTER TABLE "cinemas" ADD COLUMN "google_maps_uri" text;--> statement-breakpoint
ALTER TABLE "cinemas" ADD COLUMN "opening_hours" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "cinemas" ADD COLUMN "editorial_summary" text;--> statement-breakpoint
ALTER TABLE "cinemas" ADD COLUMN "types" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "cinemas" ADD COLUMN "details_source_updated_at" timestamp with time zone;