export const config = { runtime: 'edge' };

function jsonResponse(status: number, data: any, extraHeaders: HeadersInit = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
  });
}

function corsHeaders(origin?: string) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Proxy-Secret',
  } as HeadersInit;
}

export default async function handler(req: Request): Promise<Response> {
  const origin = req.headers.get('origin') || undefined;

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'Method Not Allowed' }, corsHeaders(origin));
  }

  const secretHeader = req.headers.get('x-proxy-secret');
  const expectedSecret = process.env.N8N_PROXY_SECRET;
  if (!expectedSecret) {
    return jsonResponse(500, { error: 'Server not configured: N8N_PROXY_SECRET missing' }, corsHeaders(origin));
  }
  if (secretHeader !== expectedSecret) {
    return jsonResponse(401, { error: 'Unauthorized' }, corsHeaders(origin));
  }

  const baseUrl = process.env.N8N_BASE_URL;
  if (!baseUrl) {
    return jsonResponse(500, { error: 'Server not configured: N8N_BASE_URL missing' }, corsHeaders(origin));
  }

  // Determine webhook path
  // Prefer explicit path in JSON body: { path: "permitpulse/event", payload: {...} }
  // Otherwise use env N8N_WEBHOOK_PATH
  let path: string | undefined;
  let forwardBody: any = undefined;
  try {
    const incoming = await req.json();
    if (incoming && typeof incoming === 'object') {
      if (typeof incoming.path === 'string') path = incoming.path;
      forwardBody = incoming.payload ?? incoming; // fall back to whole body if no payload wrapper
    }
  } catch (_) {
    // Non-JSON body
    return jsonResponse(400, { error: 'Invalid JSON body' }, corsHeaders(origin));
  }

  if (!path) {
    path = process.env.N8N_WEBHOOK_PATH || '';
  }
  if (!path) {
    return jsonResponse(400, { error: 'Missing webhook path. Include { "path": "your/webhook" } or set N8N_WEBHOOK_PATH.' }, corsHeaders(origin));
  }

  const prefix = (process.env.N8N_WEBHOOK_PREFIX || 'webhook').replace(/\/$/, '');
  const url = `${baseUrl.replace(/\/$/, '')}/${prefix}/${path.replace(/^\//, '')}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

  try {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    const auth = process.env.N8N_AUTH_HEADER;
    if (auth) headers['Authorization'] = auth;

    const resp = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(forwardBody ?? {}),
      signal: controller.signal,
    });

    const text = await resp.text();
    let data: any = text;
    try {
      data = JSON.parse(text);
    } catch (_) {}

    return new Response(typeof data === 'string' ? text : JSON.stringify(data), {
      status: resp.status,
      headers: {
        'Content-Type': resp.headers.get('content-type') || 'application/json',
        ...corsHeaders(origin),
      },
    });
  } catch (err: any) {
    const message = err?.name === 'AbortError' ? 'Upstream timeout' : (err?.message || 'Upstream error');
    return jsonResponse(502, { error: message }, corsHeaders(origin));
  } finally {
    clearTimeout(timeout);
  }
}

