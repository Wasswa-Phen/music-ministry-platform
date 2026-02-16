export async function onRequestGet(ctx) {
  const headers = { "Content-Type": "application/json" };
  const url = new URL(ctx.request.url);

  const token = url.searchParams.get("token") || "";
  const from = (url.searchParams.get("from") || "").trim(); // YYYY-MM-DD
  const to = (url.searchParams.get("to") || "").trim();     // YYYY-MM-DD
  const service = (url.searchParams.get("service") || "").trim();
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10) || 50, 200);

  if (!ctx.env.ADMIN_TOKEN) {
    return new Response(JSON.stringify({ ok: false, error: "ADMIN_TOKEN not set" }), { status: 500, headers });
  }
  if (token !== ctx.env.ADMIN_TOKEN) {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401, headers });
  }

  // Build WHERE safely
  const where = [];
  const binds = [];

  if (from) { where.push("service_date >= ?"); binds.push(from); }
  if (to) { where.push("service_date <= ?"); binds.push(to); }
  if (service) { where.push("service_name = ?"); binds.push(service); }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  try {
    const q = `
      SELECT
        id, created_at, service_date, service_name, evaluator_name,
        v1,v2,v3,v4,v5,v6,v7,v8,
        i1,i2,i3,i4,
        s1,s2,s3,
        what_went_well, areas_to_improve, suggestions_next_service
      FROM evaluations
      ${whereSql}
      ORDER BY id DESC
      LIMIT ${limit};
    `;

    const rows = await ctx.env.D1.prepare(q).bind(...binds).all();
    return new Response(JSON.stringify({ ok: true, rows: rows.results }), { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }), { status: 500, headers });
  }
}
