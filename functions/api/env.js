export async function onRequestGet(ctx) {
  const keys = Object.keys(ctx.env || {});
  return new Response(JSON.stringify({
    ok: true,
    envKeys: keys,
    hasDB: !!(ctx.env && ctx.env.DB),
  }, null, 2), { headers: { "Content-Type": "application/json" } });
}
