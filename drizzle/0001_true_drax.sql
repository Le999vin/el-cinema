CREATE TABLE "series" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tmdb_id" integer NOT NULL,
	"name" text NOT NULL,
	"overview" text NOT NULL,
	"genres" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"episode_runtime_minutes" integer,
	"poster_url" text,
	"backdrop_url" text,
	"first_air_date" varchar(20),
	"vote_average" numeric(3, 1),
	"number_of_seasons" integer,
	"number_of_episodes" integer,
	"source_updated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "series_tmdb_id_unique" ON "series" USING btree ("tmdb_id");--> statement-breakpoint
CREATE INDEX "series_name_idx" ON "series" USING btree ("name");