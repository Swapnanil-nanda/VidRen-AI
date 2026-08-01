// ============================================================
// Un-throttled Web Worker Background Timer
// Browser tab timers (setTimeout/setInterval) throttle to 1000ms in background tabs.
// Web Workers run on an isolated background OS thread and are NOT throttled by page visibility!
// ============================================================

const workerBlobCode = `
  const activeTimers = new Map();

  self.onmessage = function(e) {
    const { id, action, ms } = e.data;
    if (action === 'start') {
      if (activeTimers.has(id)) clearInterval(activeTimers.get(id));
      const intervalId = setInterval(() => {
        self.postMessage({ id, type: 'tick' });
      }, ms);
      activeTimers.set(id, intervalId);
    } else if (action === 'sleep') {
      setTimeout(() => {
        self.postMessage({ id, type: 'sleep_done' });
      }, ms);
    } else if (action === 'stop') {
      if (activeTimers.has(id)) {
        clearInterval(activeTimers.get(id));
        activeTimers.delete(id);
      }
    }
  };
`;

let workerInstance: Worker | null = null;
let timerIdCounter = 0;
const callbacks = new Map<number, () => void>();

function getWorker(): Worker | null {
  if (typeof window === "undefined" || !window.Worker) return null;
  if (!workerInstance) {
    try {
      const blob = new Blob([workerBlobCode], { type: "application/javascript" });
      const blobUrl = URL.createObjectURL(blob);
      workerInstance = new Worker(blobUrl);

      workerInstance.onmessage = (e) => {
        const { id, type } = e.data;
        const cb = callbacks.get(id);
        if (cb) {
          if (type === "sleep_done") {
            callbacks.delete(id);
            cb();
          } else if (type === "tick") {
            cb();
          }
        }
      };
    } catch (err) {
      console.warn("Could not instantiate background Web Worker timer, falling back to main thread:", err);
      workerInstance = null;
    }
  }
  return workerInstance;
}

/**
  Un-throttled sleep that executes reliably at full speed even if the tab/window is minimized or in the background.
 */
export function backgroundSleep(ms: number): Promise<void> {
  const worker = getWorker();
  if (!worker) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const id = ++timerIdCounter;
  return new Promise((resolve) => {
    callbacks.set(id, resolve);
    worker.postMessage({ id, action: "sleep", ms });
  });
}

/**
  Un-throttled interval timer running in Web Worker thread.
 */
export function backgroundInterval(callback: () => void, ms: number): () => void {
  const worker = getWorker();
  const id = ++timerIdCounter;

  if (!worker) {
    const handle = setInterval(callback, ms);
    return () => clearInterval(handle);
  }

  callbacks.set(id, callback);
  worker.postMessage({ id, action: "start", ms });

  return () => {
    callbacks.delete(id);
    worker.postMessage({ id, action: "stop" });
  };
}
