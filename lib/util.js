export const JOBS = ["개발자","디자이너","기획자","경영·운영","영업·마케팅","기타"];
export const validId = id => typeof id === "string" && /^[A-Za-z0-9-]{16,64}$/.test(id);
export const normName = n => String(n || "").normalize("NFC").replace(/\s+/g, "").toLowerCase();
export function body(req){
  if(req.body && typeof req.body === "object") return req.body;
  try{ return JSON.parse(req.body || "{}"); }catch{ return {}; }
}
export function send(res, status, data){
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(data));
}
