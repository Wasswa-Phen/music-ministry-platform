function computeScore(yes, no) {
  const denom = yes + no;
  return denom === 0 ? null : Math.round((yes / denom) * 100);
}

export async function onRequestGet(ctx) {
  const headers = { "Content-Type": "application/json" };
  const url = new URL(ctx.request.url);

  const token = url.searchParams.get("token") || "";
  const from = (url.searchParams.get("from") || "").trim(); // YYYY-MM-DD
  const to = (url.searchParams.get("to") || "").trim();     // YYYY-MM-DD
  const service = (url.searchParams.get("service") || "").trim();

  if (!ctx.env.ADMIN_TOKEN) {
    return new Response(JSON.stringify({ ok: false, error: "ADMIN_TOKEN not set" }), { status: 500, headers });
  }
  if (token !== ctx.env.ADMIN_TOKEN) {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401, headers });
  }

  const where = [];
  const binds = [];
  if (from) { where.push("service_date >= ?"); binds.push(from); }
  if (to) { where.push("service_date <= ?"); binds.push(to); }
  if (service) { where.push("service_name = ?"); binds.push(service); }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  // Helper: build SUM() for a list of columns and a target value
  const sumEq = (cols, val) =>
    cols.map(c => `SUM(CASE WHEN ${c} = ${val} THEN 1 ELSE 0 END)`).join(" + ");

  const V = ["v1","v2","v3","v4","v5","v6","v7","v8"];
  const I = ["i1","i2","i3","i4"];
  const S = ["s1","s2","s3"];

  try {
    const q = `
      SELECT
        COUNT(*) as submissions,

        (${sumEq(V, 1)}) as v_yes,
        (${sumEq(V, 0)}) as v_no,
        (${sumEq(V, 2)}) as v_ns,

        (${sumEq(I, 1)}) as i_yes,
        (${sumEq(I, 0)}) as i_no,
        (${sumEq(I, 2)}) as i_ns,

        (${sumEq(S, 1)}) as s_yes,
        (${sumEq(S, 0)}) as s_no,
        (${sumEq(S, 2)}) as s_ns

      FROM evaluations
      ${whereSql};
    `;

    const row = await ctx.env.D1.prepare(q).bind(...binds).first();
    const v_yes = Number(row?.v_yes || 0), v_no = Number(row?.v_no || 0), v_ns = Number(row?.v_ns || 0);
    const i_yes = Number(row?.i_yes || 0), i_no = Number(row?.i_no || 0), i_ns = Number(row?.i_ns || 0);
    const s_yes = Number(row?.s_yes || 0), s_no = Number(row?.s_no || 0), s_ns = Number(row?.s_ns || 0);

    const out = {
      ok: true,
      filters: { from: from || null, to: to || null, service: service || null },
      submissions: Number(row?.submissions || 0),
      counts: {
        vocalists: { yes: v_yes, no: v_no, not_sure: v_ns },
        instrumentalists: { yes: i_yes, no: i_no, not_sure: i_ns },
        sound: { yes: s_yes, no: s_no, not_sure: s_ns }
      },
      kpi: {
        vocalists_score: computeScore(v_yes, v_no),           // 0–100 or null
        instrumentalists_score: computeScore(i_yes, i_no),
        sound_score: computeScore(s_yes, s_no)
      }
    };

    return new Response(JSON.stringify(out), { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }), { status: 500, headers });
  }
}
