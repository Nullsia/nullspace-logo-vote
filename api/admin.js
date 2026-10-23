import { configured, hgetall } from "../lib/store.js";
import { send } from "../lib/util.js";

// GET /api/admin  (header x-admin-key must equal ADMIN_KEY) → each participant with their picks
export default async function handler(req, res){
  const key = process.env.ADMIN_KEY;
  if(!key || req.headers["x-admin-key"] !== key) return send(res, 401, { error:"unauthorized" });
  if(!configured()) return send(res, 503, { error:"storage_not_configured" });
  try{
    const [people, votes] = await Promise.all([hgetall("people"), hgetall("votes")]);
    const rows = Object.entries(people).map(([id, p]) => {
      const v = votes[id] || {};
      return { name: p.name, job: p.job, at: v.at || p.at, r1: v.r1 || null, r2: v.r2 || null, r3: v.r3 || null };
    });
    return send(res, 200, { people: rows });
  }catch(e){ return send(res, 500, { error:"server" }); }
}
