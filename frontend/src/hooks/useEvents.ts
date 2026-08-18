import { useState, useEffect } from 'react';
import { SorobanEvent } from '../types';
import { pollSorobanEvents } from '../lib/stellar';

export function useEvents(pollIntervalMs = 3000) {
  const [events, setEvents] = useState<SorobanEvent[]>([]);
  const [latestEvent, setLatestEvent] = useState<SorobanEvent | null>(null);

  useEffect(() => {
    let prevCount = 0;
    const interval = setInterval(async () => {
      try {
        const fetched = await pollSorobanEvents();
        setEvents(fetched);
        if (fetched.length > prevCount && prevCount !== 0) {
          setLatestEvent(fetched[0]);
        }
        prevCount = fetched.length;
      } catch (err) {
        console.warn('Soroban RPC event polling warning:', err);
      }
    }, pollIntervalMs);

    return () => clearInterval(interval);
  }, [pollIntervalMs]);

  return { events, latestEvent };
}
