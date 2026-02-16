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
    return new Response(JSON.stringify({ ok: false, error: "Invalid JSON" }), {
      status: 400,
      headers,
    });
  }

  // Map choices to numbers: Yes=1, No=0, Not sure=2
  const toChoice = (v) => (v === "Yes" ? 1 : v === "No" ? 0 : 2);

  const service_date = String(body.service_date || "").trim();
  if (!service_date) {
    return new Response(JSON.stringify({ ok: false, error: "service_date required" }), {
      status: 400,
      headers,
    });
  }

  const payload = {
    service_date,
    service_name: String(body.service_name || "").trim() || null,
    evaluator_name: String(body.evaluator_name || "").trim() || null,

    v1: toChoice(body.v1),
    v2: toChoice(body.v2),
    v3: toChoice(body.v3),
    v4: toChoice(body.v4),
    v5: toChoice(body.v5),
    v6: toChoice(body.v6),
    v7: toChoice(body.v7),
    v8: toChoice(body.v8),

    i1: toChoice(body.i1),
    i2: toChoice(body.i2),
    i3: toChoice(body.i3),
    i4: toChoice(body.i4),

    s1: toChoice(body.s1),
    s2: toChoice(body.s2),
    s3: toChoice(body.s3),

    what_went_well: String(body.what_went_well || "").trim() || null,
    areas_to_improve: String(body.areas_to_improve || "").trim() || null,
    suggestions_next_service: String(body.suggestions_next_service || "").trim() || null,
  };

  const stmt = ctx.env.D1.prepare(`
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
    payload.service_date,
    payload.service_name,
    payload.evaluator_name,

    payload.v1, payload.v2, payload.v3, payload.v4,
    payload.v5, payload.v6, payload.v7, payload.v8,

    payload.i1, payload.i2, payload.i3, payload.i4,

    payload.s1, payload.s2, payload.s3,

    payload.what_went_well,
    payload.areas_to_improve,
    payload.suggestions_next_service
  );

  try {
    const result = await stmt.run();
    return new Response(JSON.stringify({ ok: true, id: result.meta?.last_row_id ?? null }), {
      status: 200,
      headers,
    });
  } catch (e) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "DB insert failed",
        detail: String(e?.message || e),
      }),
      {
        status: 500,
        headers,
      }
    );
  }
}
