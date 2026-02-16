export async function onRequestPost(ctx) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (ctx.request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  let body;
  try {
    body = await ctx.request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Invalid JSON" }), { status: 400, headers });
  }

  const toChoice = (v) => (v === "Yes" ? 1 : v === "No" ? 0 : 2);

  const service_date = String(body.service_date || "").trim();
  if (!service_date) {
    return new Response(JSON.stringify({ ok: false, error: "service_date required" }), { status: 400, headers });
  }

  const stmt = ctx.env.DB.prepare(`
    INSERT INTO evaluations (
      service_date, service_name, evaluator_name,
      v1,v2,v3,v4,v5,v6,v7,v8,
      i1,i2,i3,i4,
      s1,s2,s3,
      what_went_well, areas_to_improve, suggestions_next_service
    ) VALUES (
      ?, ?, ?,
      ?,?,?,?,?,?,?,?,
      ?,?,?,?,
      ?,?,?,
      ?,?,?
    )
  `).bind(
    service_date,
    String(body.service_name || "").trim() || null,
    String(body.evaluator_name || "").trim() || null,

    toChoice(body.v1), toChoice(body.v2), toChoice(body.v3), toChoice(body.v4),
    toChoice(body.v5), toChoice(body.v6), toChoice(body.v7), toChoice(body.v8),

    toChoice(body.i1), toChoice(body.i2), toChoice(body.i3), toChoice(body.i4),

    toChoice(body.s1), toChoice(body.s2), toChoice(body.s3),

    String(body.what_went_well || "").trim() || null,
    String(body.areas_to_improve || "").trim() || null,
    String(body.suggestions_next_service || "").trim() || null
  );

  try {
    const result = await stmt.run();
    return new Response(JSON.stringify({ ok: true, id: result.meta?.last_row_id ?? null }), { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: "DB insert failed" }), { status: 500, headers });
  }
}
