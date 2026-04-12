import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

// This route must always be server-rendered — never statically pre-built.
// The service role key is only ever present in the server environment.
export const prerender = false;

// Create the server-side Supabase client using the service role key.
// We intentionally use SUPABASE_SERVICE_ROLE_KEY (no PUBLIC_ prefix) so it
// is never bundled into client-side JavaScript by Astro/Vite.
function getSupabaseAdmin() {
  const url = import.meta.env.SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "[log-ip] Missing required environment variables: SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  return createClient(url, key, {
    auth: {
      // Disable session persistence — this is a pure server-side client.
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // ── 1. Extract the real client IP ──────────────────────────────────
    // Vercel (and most reverse proxies) populate x-forwarded-for with a
    // comma-separated list of IPs: "client, proxy1, proxy2".  We always
    // want the first entry, which is the original caller.
    const forwarded = request.headers.get("x-forwarded-for");
    let ip: string | null = forwarded
      ? forwarded.split(",")[0].trim()
      : request.headers.get("x-real-ip");

    if (!ip) {
      if (import.meta.env.DEV) {
        // In local development Vercel's edge headers are never present.
        // Use the loopback address so the full upsert path still runs and
        // the row shows up in Supabase during testing.
        ip = "127.0.0.1";
      } else {
        console.warn("[log-ip] Could not determine client IP from headers.");
        return json({ ok: false, error: "Unable to determine IP" }, 400);
      }
    }

    // ── 2. Collect optional metadata ───────────────────────────────────
    const userAgent = request.headers.get("user-agent") ?? null;

    // ── 3. Upsert into ip_logs ─────────────────────────────────────────
    // ignoreDuplicates: true  →  if a row with this IP already exists,
    // do nothing (no update, no error).  The UNIQUE constraint on the
    // `ip` column at the database level acts as the authoritative guard.
    const supabase = getSupabaseAdmin();

    const { error } = await supabase.from("ip_logs").upsert(
      { ip, user_agent: userAgent },
      {
        onConflict: "ip",
        ignoreDuplicates: true,
      },
    );

    if (error) {
      // Log for observability but never surface internals to the caller.
      console.error("[log-ip] Supabase upsert error:", error.message);
      return json({ ok: false, error: "Database error" }, 500);
    }

    return json({ ok: true }, 200);
  } catch (err) {
    console.error("[log-ip] Unexpected error:", err);
    return json({ ok: false, error: "Internal server error" }, 500);
  }
};

// Reject every other HTTP method cleanly.
export const GET: APIRoute = () => methodNotAllowed();
export const PUT: APIRoute = () => methodNotAllowed();
export const PATCH: APIRoute = () => methodNotAllowed();
export const DELETE: APIRoute = () => methodNotAllowed();

// ── Helpers ────────────────────────────────────────────────────────────────

function json(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function methodNotAllowed(): Response {
  return new Response(
    JSON.stringify({ ok: false, error: "Method not allowed" }),
    {
      status: 405,
      headers: {
        "Content-Type": "application/json",
        Allow: "POST",
      },
    },
  );
}
