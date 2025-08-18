// Simple client helper for calling the proxy from React
export async function callN8n(path, payload) {
  const secret = import.meta.env.VITE_N8N_PROXY_SECRET;
  const proxyPath = import.meta.env.VITE_PROXY_PATH || '/api/n8n-proxy';

  if (!secret) {
    throw new Error('Missing VITE_N8N_PROXY_SECRET in environment');
  }

  const res = await fetch(proxyPath, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Proxy-Secret': secret,
    },
    body: JSON.stringify({ path, payload }),
  });

  const text = await res.text();
  try {
    return { ok: res.ok, status: res.status, data: JSON.parse(text) };
  } catch {
    return { ok: res.ok, status: res.status, data: text };
  }
}

