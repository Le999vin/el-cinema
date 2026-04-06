# Core runtime
NODE_ENV=development

# Local Postgres used by Next.js, Drizzle, migrations, seed and sync scripts
# Recommended for most uses
DATABASE_URL=postgresql://neondb_owner:npg_VtejfClpQ0M1@ep-icy-lab-alqiv1go-pooler.c-3.eu-central-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require

# For uses requiring a connection without pgbouncer
DATABASE_URL_UNPOOLED=postgresql://neondb_owner:npg_VtejfClpQ0M1@ep-icy-lab-alqiv1go.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require

# Parameters for constructing your own connection string
PGHOST=ep-icy-lab-alqiv1go-pooler.c-3.eu-central-1.aws.neon.tech
PGHOST_UNPOOLED=ep-icy-lab-alqiv1go.c-3.eu-central-1.aws.neon.tech
PGUSER=neondb_owner
PGDATABASE=neondb
PGPASSWORD=npg_VtejfClpQ0M1

# Parameters for Vercel Postgres Templates
POSTGRES_URL=postgresql://neondb_owner:npg_VtejfClpQ0M1@ep-icy-lab-alqiv1go-pooler.c-3.eu-central-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
POSTGRES_URL_NON_POOLING=postgresql://neondb_owner:npg_VtejfClpQ0M1@ep-icy-lab-alqiv1go.c-3.eu-central-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
POSTGRES_USER=neondb_owner
POSTGRES_HOST=ep-icy-lab-alqiv1go-pooler.c-3.eu-central-1.aws.neon.tech
POSTGRES_PASSWORD=npg_VtejfClpQ0M1
POSTGRES_DATABASE=neondb
POSTGRES_URL_NO_SSL=postgresql://neondb_owner:npg_VtejfClpQ0M1@ep-icy-lab-alqiv1go-pooler.c-3.eu-central-1.aws.neon.tech/neondb
POSTGRES_PRISMA_URL=postgresql://neondb_owner:npg_VtejfClpQ0M1@ep-icy-lab-alqiv1go-pooler.c-3.eu-central-1.aws.neon.tech/neondb?channel_binding=require&connect_timeout=15&sslmode=require
# Used by internal sync endpoints via the x-internal-sync-secret header
INTERNAL_SYNC_SECRET=409cb6ce064f78a3cce04e5d48ad29b27a0661023d83df80

# Optional integrations
# Leave these commented out until you have valid API keys.
# Empty strings currently break the env parser and disable all env values.

GOOGLE_PLACES_API_KEY=AIzaSyDjYe25Z18PhpR8NqIPbgqs7ZWSzNHDDSs
TMDB_API_KEY=c72b70436f21f4fe5d464917b18c7a48

#https://places.googleapis.com/v1/places/GyuEmsRBfy61i59si0?fields=addressComponents&key=AIzaSyDjYe25Z18PhpR8NqIPbgqs7ZWSzNHDDSs