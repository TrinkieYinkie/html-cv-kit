#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { Worker } from 'node:worker_threads';

const root = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const help = `CV toolkit — offline HTML export (Node.js 22+; no npm install)

node build.mjs "Structured CV example - Alisa Petrova/cv.html"
node build.mjs "Structured CV template/cv.html" --profile team-lead --theme editorial
node build.mjs "Structured CV template/cv.html" --headline "Your target role" --out "exports/application.html"
node build.mjs --all

Options: --profile mba|team-lead  --theme classic|editorial (or a local theme name)
         --headline "..." overrides the headline in the selected source HTML
         --out "...html" (default: exports/<profile>-<theme>.html inside that project)
--all rebuilds the eight gallery exports using the recommended profile headlines.
Single-file CVs are already ready to share and do not need this builder.`;
if (!args.length || args.includes('--help')) { console.log(help); process.exit(0); }

let jobs;
try {
  if (args[0] === '--all') {
    if (args.length !== 1) throw new Error('--all cannot be combined with other arguments');
    jobs = [];
    for (const folder of ['Structured CV example - Alisa Petrova', 'Structured CV template']) {
      for (const profile of ['mba', 'team-lead']) {
        const preset = JSON.parse(fs.readFileSync(path.join(root, folder, 'content/profiles', `${profile}.json`), 'utf8'));
        for (const theme of ['classic', 'editorial']) jobs.push({ source: path.join(root, folder, 'cv.html'), profile, theme,
          headline: preset.suggestedHeadline, out: path.join(root, folder, 'exports', `${profile}-${theme}.html`) });
      }
    }
  } else {
    const source = path.resolve(args[0]);
    const options = { source, profile: 'mba', theme: 'classic' };
    for (let i = 1; i < args.length; i += 2) {
      const key = args[i].replace(/^--/, '');
      if (!args[i].startsWith('--') || !['profile','theme','headline','out'].includes(key) || args[i+1] === undefined) throw new Error(`Invalid argument: ${args[i]}`);
      options[key] = args[i+1];
    }
    options.out = path.resolve(options.out ?? path.join(path.dirname(source), 'exports', `${options.profile}-${options.theme}.html`));
    jobs = [options];
  }
} catch (error) { console.error(error.message); process.exit(1); }

const token = randomUUID();
const lockPath = path.join(root, '.cv-build.lock');
let worker;
let stopped = false;
let lock;
try { lock = fs.openSync(lockPath, 'wx'); }
catch { console.error('A build lock already exists. Another build may be running; inspect .cv-build.lock before removing a stale lock.'); process.exit(1); }
fs.writeFileSync(lock, JSON.stringify({ pid: process.pid, started: new Date().toISOString(), token, taskToken: process.env.CV_TASK_TOKEN ?? null }));
fs.closeSync(lock);
const stop = () => { stopped = true; worker?.terminate(); };
process.on('SIGINT', stop); process.on('SIGTERM', stop);
try {
  for (const options of jobs) {
    if (stopped) throw new Error('Build interrupted');
    console.log(`BUILD ${path.relative(root, options.out)}`);
    const result = await new Promise((resolve, reject) => {
      worker = new Worker(new URL('./lib/build-worker.mjs', import.meta.url), { workerData: { options, token } });
      const deadline = setTimeout(() => { stopped = true; worker.terminate(); reject(new Error('Build exceeded 30 seconds')); }, 30_000);
      const heartbeat = setInterval(() => console.log('BUILD running…'), 10_000);
      let answer;
      worker.on('message', data => { answer = data; });
      worker.on('error', reject);
      worker.on('exit', code => {
        clearTimeout(deadline); clearInterval(heartbeat);
        if (stopped || code !== 0 || !answer) reject(new Error('Build interrupted or worker failed'));
        else if (answer.error) reject(new Error(answer.error));
        else resolve(answer.result);
      });
    });
    console.log(`SAVED ${result.output} (${result.bytes} bytes)`);
  }
} catch (error) { console.error(`FAILED: ${error.message}`); process.exitCode = 1; }
finally {
  await worker?.terminate();
  for (const options of jobs) {
    const temporary = `${path.resolve(options.out)}.cv-${token}.tmp`;
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
  if (JSON.parse(fs.readFileSync(lockPath, 'utf8')).token === token) fs.unlinkSync(lockPath);
}
