export async function onRequestGet(ctx) {
  try {
    const r = await ctx.env.DB.prepare("SELECT 1 as ok;").first();
    return new Response(JSON.stringify({ ok: true, db: r }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({
      ok: false,
      error: String(e?.message || e)
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
