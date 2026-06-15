import { useEffect, useCallback, useRef } from 'react';

interface QueuedAction {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

const QUEUE_KEY = 'driver_offline_queue';

function getQueue(): QueuedAction[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: QueuedAction[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

function addToQueue(action: Omit<QueuedAction, 'id' | 'timestamp'>) {
  const queue = getQueue();
  queue.push({
    ...action,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  });
  saveQueue(queue);
}

export function useOfflineSync(syncFn: (action: QueuedAction) => Promise<void>) {
  const syncingRef = useRef(false);

  const processQueue = useCallback(async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;

    const queue = getQueue();
    if (queue.length === 0) {
      syncingRef.current = false;
      return;
    }

    const remaining: QueuedAction[] = [];

    for (const action of queue) {
      try {
        await syncFn(action);
      } catch {
        remaining.push(action);
      }
    }

    saveQueue(remaining);
    syncingRef.current = false;
  }, [syncFn]);

  useEffect(() => {
    const handleOnline = () => {
      processQueue();
    };

    window.addEventListener('online', handleOnline);

    processQueue();

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [processQueue]);

  const queueAction = useCallback(
    (type: string, payload: Record<string, unknown>) => {
      if (navigator.onLine) {
        return false;
      }
      addToQueue({ type, payload });
      return true;
    },
    []
  );

  return {
    queueAction,
    processQueue,
    getQueue,
  };
}
