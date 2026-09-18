import { useEffect, useState } from 'react';
import { getApiHealth } from '../services/api';

const CACHE_TTL_MS = 20000;
let cache = { status: 'checking', checkedAt: 0 };
let inFlight = null;

async function checkHealth() {
  const isFresh = Date.now() - cache.checkedAt < CACHE_TTL_MS && cache.status !== 'checking';
  if (isFresh) return cache.status;
  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      await getApiHealth();
      cache = { status: 'online', checkedAt: Date.now() };
    } catch {
      cache = { status: 'offline', checkedAt: Date.now() };
    } finally {
      inFlight = null;
    }
    return cache.status;
  })();

  return inFlight;
}

export default function useApiHealth() {
  const [status, setStatus] = useState(cache.status);

  useEffect(() => {
    let isMounted = true;
    checkHealth().then((result) => {
      if (isMounted) setStatus(result);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return status;
}
