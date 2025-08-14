import { spawn } from 'node:child_process';

const server = spawn('node', ['src/net/signalingServer.mjs'], {
  cwd: new URL('..', import.meta.url).pathname,
  stdio: 'inherit',
});

const vite = spawn('pnpm', ['vite'], {
  cwd: new URL('..', import.meta.url).pathname,
  stdio: 'inherit',
});

function open(url) {
  const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  spawn(cmd, [url], { shell: true });
}

setTimeout(() => {
  open('http://localhost:5173');
  open('http://localhost:5173');
}, 2000);

process.on('SIGINT', () => {
  server.kill('SIGINT');
  vite.kill('SIGINT');
  process.exit();
});
