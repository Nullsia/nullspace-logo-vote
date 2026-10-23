// Upstash Redis over REST (Vercel Marketplace "Upstash for Redis" sets KV_REST_API_* automatically).
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const mem = new Map(); // local testing only (LOCAL_MEMORY=1)

export const configured = () => Boolean(URL_ && TOKEN) || process.env.LOCAL_MEMORY === "1";

async function cmd(...args){
  if(!URL_ || !TOKEN){
    if(process.env.LOCAL_MEMORY !== "1") throw new Error("storage_not_configured");
    const [op, key, ...rest] = args;
    const h = mem.get(key) || new Map(); mem.set(key, h);
    if(op === "HSET"){ for(let i=0;i<rest.length;i+=2) h.set(rest[i], rest[i+1]); return 1; }
    if(op === "HSETNX"){ if(h.has(rest[0])) return 0; h.set(rest[0], rest[1]); return 1; }
    if(op === "HGET") return h.get(rest[0]) ?? null;
    if(op === "HVALS") return [...h.values()];
    if(op === "HGETALL") return [...h.entries()].flat();
    throw new Error("unsupported " + op);
  }
  const r = await fetch(URL_, { method:"POST", headers:{ Authorization:`Bearer ${TOKEN}`, "Content-Type":"application/json" }, body: JSON.stringify(args) });
  const j = await r.json();
  if(j.error) throw new Error(j.error);
  return j.result;
}

export const hset = (k, f, v) => cmd("HSET", k, f, JSON.stringify(v));
export const hsetnx = (k, f, v) => cmd("HSETNX", k, f, v);
export const hgetRaw = (k, f) => cmd("HGET", k, f);
export const hget = async (k, f) => { const v = await cmd("HGET", k, f); return v ? JSON.parse(v) : null; };
export const hvals = async k => (await cmd("HVALS", k) || []).map(v => JSON.parse(v));
