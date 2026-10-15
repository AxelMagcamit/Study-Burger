export function pause(ms: number, signal: AbortSignal): Promise<void> {
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const abort = () => { clearTimeout(timer); reject(signal.reason); };
    const timer = setTimeout(() => { signal.removeEventListener('abort', abort); resolve(); }, ms);
    signal.addEventListener('abort', abort, { once: true });
  });
}

export function retryDelay(headers: Headers, body: unknown, attempt: number): number | null {
  const error = (body as {error?: {details?: Array<{quotaId?: string; violations?: Array<{quotaId?: string}>; retryDelay?: string}>}})?.error;
  const details = Array.isArray(error?.details) ? error.details : [];
  // Exhausted daily quotas do not recover through immediate retries or model rotation.
  if (details.some(d => d.violations?.some(v => /PerDay|daily/i.test(v.quotaId || '')))) return null;
  const header = headers.get('retry-after');
  let delay = header ? (/^\d+(\.\d+)?$/.test(header) ? Number(header) * 1000 : Date.parse(header) - Date.now()) : NaN;
  const provider = details.find(d => typeof d.retryDelay === 'string')?.retryDelay;
  if (provider && /^\d+(\.\d+)?s$/.test(provider)) delay = Math.max(Number.isFinite(delay) ? delay : 0, parseFloat(provider) * 1000);
  // Return control to the user for long cooldowns instead of exhausting the route deadline.
  if (delay > 10000) return null;
  return Math.max(Number.isFinite(delay) ? delay : 0, 1000 * 2 ** attempt + Math.floor(Math.random() * 300));
}
