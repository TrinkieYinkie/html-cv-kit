import { parentPort, workerData } from 'node:worker_threads';
import { writeExport } from './render.mjs';
try {
  parentPort.postMessage({ result: writeExport(workerData.options, workerData.token) });
} catch (error) {
  parentPort.postMessage({ error: error.message });
}
