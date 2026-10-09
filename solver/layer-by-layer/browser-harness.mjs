import fs from "node:fs";
import { kpuzzle } from "./solver.mjs";
import { faceletsFromPattern } from "./facelets.mjs";
const sample = faceletsFromPattern(kpuzzle.defaultPattern().applyAlg("R U 2R F' 2D L2 B U'"));
const dir = ".vercel/output/static";
const worker = fs.readdirSync(dir + "/assets").find((f) => f.startsWith("four-layer.worker-"));
const html = `<!doctype html><html><meta charset="utf-8"><body style="background:#17130c;color:#f8f2e5;font:18px sans-serif;padding:30px"><h1>4×4 production worker check</h1><p>Sample: R U 2R F′ 2D L2 B U′</p><button id="solve" style="padding:15px;background:#f06a36">Solve sample</button><pre id="result" style="white-space:pre-wrap"></pre><script>document.getElementById('solve').onclick=()=>{const w=new Worker('/assets/${worker}',{type:'module'});document.getElementById('result').textContent='Solving…';w.onmessage=e=>{const r=e.data;document.getElementById('result').textContent=r.ok?'PASS: '+r.solution.split(' ').length+' moves\\n'+r.stages.map(s=>s.name).join('\\n'):JSON.stringify(r);w.terminate()};w.onerror=e=>document.getElementById('result').textContent='ERROR: '+e.message;w.postMessage(${JSON.stringify(sample)})}</script></body></html>`;
fs.writeFileSync(dir + "/4x4-worker-check.html", html);
console.log("Worker harness:", worker);
