// /api/leaderboard.js — Escape the Brokerage global leaderboard
// --------------------------------------------------------------------------
// Zero-dependency Vercel serverless function. Storage is any Upstash-compatible
// Redis REST endpoint. When you connect a Vercel KV / Upstash store to this
// project, Vercel injects KV_REST_API_URL + KV_REST_API_TOKEN automatically and
// the global board switches on with no code change. Until then this returns 503
// and the game quietly uses its on-device leaderboard instead.
//
//   GET  /api/leaderboard        -> { scores: [ {name,score,time,ts}... ] }
//   POST /api/leaderboard  body  -> { name, score, time, ts }  (adds + returns board)
// --------------------------------------------------------------------------

const REST_URL   = process.env.KV_REST_API_URL   || process.env.UPSTASH_REDIS_REST_URL;
const REST_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const KEY = 'etb:scores';

async function redis(command) {
  const r = await fetch(REST_URL, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + REST_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  });
  if (!r.ok) throw new Error('redis ' + r.status);
  return (await r.json()).result;
}

// strip ASCII control chars and angle brackets; keep letters, digits, spaces, punctuation
function cleanName(raw) {
  var s = String(raw == null ? '' : raw);
  var out = '';
  for (var i = 0; i < s.length; i++) {
    var code = s.charCodeAt(i);
    if (code < 0x20 || code === 0x3c || code === 0x3e) continue; // <0x20 control, < = 0x3c, > = 0x3e
    out += s[i];
  }
  out = out.trim().slice(0, 20);
  return out || 'Anonymous';
}

module.exports = async (req, res) => {
  if (!REST_URL || !REST_TOKEN) {
    res.status(503).json({ error: 'leaderboard not configured', scores: [] });
    return;
  }
  try {
    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
      body = body || {};

      const name = cleanName(body.name);

      let score = Math.round(Number(body.score));
      if (!isFinite(score) || score < 0) score = 0;
      if (score > 100000) score = 100000;                 // sanity cap vs. tampering

      const time = Math.max(0, Math.round(Number(body.time) || 0));
      const ts   = Number(body.ts);
      const member = JSON.stringify({ name, time, ts: isFinite(ts) && ts > 0 ? ts : Date.now() });

      await redis(['ZADD', KEY, String(score), member]);
      await redis(['ZREMRANGEBYRANK', KEY, '0', '-201']);  // keep only the top 200
    }

    const raw = await redis(['ZREVRANGE', KEY, '0', '24', 'WITHSCORES']);
    const scores = [];
    for (let i = 0; i < raw.length; i += 2) {
      let m = {};
      try { m = JSON.parse(raw[i]); } catch (e) {}
      scores.push({ name: m.name || 'Anonymous', score: Number(raw[i + 1]) || 0, time: m.time || 0, ts: m.ts || 0 });
    }
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ scores, source: 'global' });
  } catch (e) {
    res.status(500).json({ error: 'leaderboard error', scores: [] });
  }
};
