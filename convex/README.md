# Convex Backend

This directory contains the Convex backend configuration and functions.

## ⚠️ Important: First-Time Setup Required

Before running the development server, you must initialize Convex:

```bash
npx convex dev
```

This command will:
1. Create or connect to a Convex project
2. Generate TypeScript types in `_generated/`
3. Deploy your schema and functions
4. Start watching for changes

## Generated Files

The `_generated/` folder contains auto-generated TypeScript definitions. These files are created by `npx convex dev` and should not be edited manually. They will be regenerated whenever you run Convex.

**Note:** Temporary stub files exist to allow the dev server to start, but they will be replaced with proper types when you run `npx convex dev`.

## Files

- `schema.ts` - Database schema definitions
- `auth.ts` - Authentication configuration (GitHub & Google OAuth)
- `users.ts` - User management queries and mutations
- `convex.config.ts` - Convex project configuration

## Environment Setup

1. Run `npx convex dev` (this will open your browser)
2. Create or select a Convex project
3. Copy the deployment URL to your `.env.local` file
4. Follow the [CONVEX_SETUP.md](../CONVEX_SETUP.md) guide for OAuth configuration
