export async function onRequestGet(ctx) {
  const headers = { "Content-Type": "application/json" };

  const url = new URL(ctx.request.url);
  const token = url.searchParams.get("token") || "";

  if (!ctx.env.ADMIN_TOKEN) {
    return new Response(JSON.stringify({ ok: false, error: "ADMIN_TOKEN not set" }), { status: 500, headers });
  }

  if (token !== ctx.env.ADMIN_TOKEN) {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401, headers });
  }

  try {
    const rows = await ctx.env.D1
      .prepare(`
        SELECT
          id, created_at, service_date, service_name, evaluator_name,
          v1,v2,v3,v4,v5,v6,v7,v8,
          i1,i2,i3,i4,
          s1,s2,s3,
          what_went_well, areas_to_improve, suggestions_next_service
        FROM evaluations
        ORDER BY id DESC
        LIMIT 20;
      `)
      .all();

    return new Response(JSON.stringify({ ok: true, rows: rows.results }), { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }), { status: 500, headers });
  }
}
