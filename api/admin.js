import { configured, hvals } from "../lib/store.js";
import { send } from "../lib/util.js";

// GET /api/admin  (header x-admin-key must equal ADMIN_KEY) → participant names
export default async function handler(req, res){
  const key = process.env.ADMIN_KEY;
  if(!key || req.headers["x-admin-key"] !== key) return send(res, 401, { error:"unauthorized" });
  if(!configured()) return send(res, 503, { error:"storage_not_configured" });
  try{
    return send(res, 200, { people: await hvals("people") });
  }catch(e){ return send(res, 500, { error:"server" }); }
}
