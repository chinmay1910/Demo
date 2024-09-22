import { useState, useCallback, useEffect } from 'react';

export function useWebWorker(workerFunction) {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const workerBlob = new Blob([`(${workerFunction.toString()})()`], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(workerBlob);
    const newWorker = new Worker(workerUrl);

    newWorker.onmessage = (e) => setResult(e.data);

    setWorker(newWorker);

    return () => {
      newWorker.terminate();
      URL.revokeObjectURL(workerUrl);
    };
  }, [workerFunction]);

  const run = useCallback((data) => {
    if (worker) {
      worker.postMessage(data);
    }
  }, [worker]);

  return { result, run };
}
