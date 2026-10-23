import { configured, hset, hget } from "../lib/store.js";
import { validId, body, send } from "../lib/util.js";

// POST /api/feedback → { id, text }   (only after voting; one note per voter, overwritten on resend; shown publicly as 익명N)
export default async function handler(req, res){
  if(!configured()) return send(res, 503, { error:"storage_not_configured" });
  if(req.method !== "POST") return send(res, 405, { error:"method" });
  try{
    const { id, text } = body(req);
    const t = String(text || "").trim().slice(0, 500);
    if(!validId(id) || !t) return send(res, 400, { error:"bad_input" });
    const vote = await hget("votes", id);
    if(!vote) return send(res, 403, { error:"not_voted" });
    const prev = await hget("feedback", id); // keep the first time so the 익명 number stays put
    await hset("feedback", id, { text: t, job: vote.job, at: prev?.at || Date.now() });
    return send(res, 200, { ok:true });
  }catch(e){ return send(res, 500, { error:"server" }); }
}
