import { configured, hvals } from "../lib/store.js";
import { send } from "../lib/util.js";

// GET /api/results → anonymous data only: rank picks [{ r1, r2, r3, job }] and feedback [{ text, at }]
export default async function handler(req, res){
  if(!configured()) return send(res, 503, { error:"storage_not_configured" });
  try{
    const [votes, feedback] = await Promise.all([hvals("votes"), hvals("feedback")]);
    return send(res, 200, {
      votes: votes.map(({ r1, r2, r3, job }) => ({ r1, r2, r3, job })),
      feedback: feedback.map(({ text, at }) => ({ text, at })),
    });
  }catch(e){ return send(res, 500, { error:"server" }); }
}
