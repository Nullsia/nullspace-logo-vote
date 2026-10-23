import { storageInfo } from "../lib/store.js";
import { send } from "../lib/util.js";

// GET /api/health → whether storage env vars were found (names only, never values), and whether Redis answers
export default async function handler(req, res){
  const info = storageInfo();
  if(!info.configured) return send(res, 503, { ...info, hint:"Vercel → Storage → Upstash for Redis → Connect, then Redeploy" });
  try{
    const r = await fetch(process.env[info.env], { method:"POST", headers:{ Authorization:`Bearer ${process.env[info.env.replace(/URL$/, "TOKEN")]}`, "Content-Type":"application/json" }, body: JSON.stringify(["PING"]) });
    const j = await r.json();
    return send(res, j.result === "PONG" ? 200 : 502, { ...info, redis: j.result || j.error || r.status });
  }catch(e){ return send(res, 502, { ...info, redis: "unreachable" }); }
}
