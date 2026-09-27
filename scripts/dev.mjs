import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const children = [];
let stopping = false;
function shutdown(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill('SIGTERM');
  process.exitCode = code;
}
function start(command, args) {
  const child = spawn(command, args, { cwd: root, stdio: 'inherit' });
  children.push(child);
  child.on('error', (error) => { console.error(error.message); shutdown(1); });
  child.on('exit', (code) => { if (!stopping) shutdown(code ?? 1); });
}
let serviceRunning = false;
try {
  const response = await fetch('http://127.0.0.1:5174/api/nxn/health', { signal: AbortSignal.timeout(1000) });
  const health = await response.json();
  serviceRunning = response.ok && typeof health.ready === 'boolean';
} catch { /* Start our local service below. */ }
if (!serviceRunning) start('python3', ['solver/server.py']);
start(process.execPath, ['node_modules/vite/bin/vite.js', 'dev', ...process.argv.slice(2)]);
process.on('SIGINT', () => shutdown());
process.on('SIGTERM', () => shutdown());
