import { configured, hset, hsetnx, hgetRaw, hget } from "../lib/store.js";
import { JOBS, validId, normName, body, send } from "../lib/util.js";

// GET  /api/vote?id=…  → this browser's own vote (to restore the done screen)
// POST /api/vote       → { id, name, job, r1, r2, r3 }
export default async function handler(req, res){
  if(!configured()) return send(res, 503, { error:"storage_not_configured" });
  try{
    if(req.method === "GET"){
      const id = new URL(req.url, "http://x").searchParams.get("id");
      if(!validId(id)) return send(res, 400, { error:"bad_id" });
      const [vote, person, fb] = await Promise.all([hget("votes", id), hget("people", id), hget("feedback", id)]);
      return send(res, 200, { vote, name: person?.name || "", feedback: fb?.text || "" });
    }
    if(req.method !== "POST") return send(res, 405, { error:"method" });
    const { id, name, job, r1, r2, r3 } = body(req);
    const nm = String(name || "").trim().slice(0, 20);
    const ranks = [r1, r2, r3];
    if(!validId(id) || !nm || !JOBS.includes(job)) return send(res, 400, { error:"bad_input" });
    if(!ranks.every(n => Number.isInteger(n) && n >= 1 && n <= 8) || new Set(ranks).size !== 3) return send(res, 400, { error:"bad_ranks" });
    if(await hget("votes", id)) return send(res, 409, { error:"already_voted" });
    const key = normName(nm);
    await hsetnx("names", key, id);
    if(await hgetRaw("names", key) !== id) return send(res, 409, { error:"name_taken" });
    const at = Date.now();
    await hset("people", id, { name: nm, job, at });
    await hset("votes", id, { r1, r2, r3, job, at });
    return send(res, 200, { ok:true });
  }catch(e){ return send(res, 500, { error:"server" }); }
}
