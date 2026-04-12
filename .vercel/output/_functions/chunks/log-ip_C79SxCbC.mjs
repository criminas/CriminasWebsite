const prerender = false;
function getSupabaseAdmin() {
  {
    throw new Error(
      "[log-ip] Missing required environment variables: SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY"
    );
  }
}
const POST = async ({ request }) => {
  try {
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : request.headers.get("x-real-ip");
    if (!ip) {
      console.warn("[log-ip] Could not determine client IP from headers.");
      return json({ ok: false, error: "Unable to determine IP" }, 400);
    }
    const userAgent = request.headers.get("user-agent") ?? null;
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("ip_logs").upsert(
      { ip, user_agent: userAgent },
      {
        onConflict: "ip",
        ignoreDuplicates: true
      }
    );
    if (error) {
      console.error("[log-ip] Supabase upsert error:", error.message);
      return json({ ok: false, error: "Database error" }, 500);
    }
    return json({ ok: true }, 200);
  } catch (err) {
    console.error("[log-ip] Unexpected error:", err);
    return json({ ok: false, error: "Internal server error" }, 500);
  }
};
const GET = () => methodNotAllowed();
const PUT = () => methodNotAllowed();
const PATCH = () => methodNotAllowed();
const DELETE = () => methodNotAllowed();
function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
function methodNotAllowed() {
  return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
    status: 405,
    headers: {
      "Content-Type": "application/json",
      Allow: "POST"
    }
  });
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    DELETE,
    GET,
    PATCH,
    POST,
    PUT,
    prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
