export const maxDuration = 120;
export const dynamic = 'force-dynamic';

import nodeFetch from 'node-fetch';
import { SocksProxyAgent } from 'socks-proxy-agent';
import * as cheerio from 'cheerio';

// ── regex patterns ──────────────────────────────────────────────────────────
const REGEX_BTC      = /\b(bc1[a-z0-9]{25,39}|[13][a-zA-Z0-9]{25,34})\b/g;
const REGEX_ETH      = /\b0x[a-fA-F0-9]{40}\b/g;
const REGEX_XMR      = /\b4[0-9AB][1-9A-HJ-NP-Za-km-z]{93}\b/g;
const REGEX_TELEGRAM = /@[a-zA-Z0-9_]{5,32}/g;
const REGEX_EMAIL    = /\b[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}\b/g;

const DEFAULT_TARGETS = [
  'http://ciadotgov4sjwlzihbbgxnqg3xiyrg7so2r2o3lt5wz5ypk4sxyjstad.onion/',
];

const TOR_PROXY      = 'socks5h://127.0.0.1:9050';
const TIMEOUT_MS     = 45_000;
const MAX_BODY_CHARS = 3_000;

// ── helpers ─────────────────────────────────────────────────────────────────

function unique(arr: string[]): string[] {
  return [...new Set(arr)];
}

function extractEntities(text: string) {
  return {
    btcAddresses:    unique(text.match(REGEX_BTC)      ?? []),
    ethAddresses:    unique(text.match(REGEX_ETH)      ?? []),
    xmrAddresses:    unique(text.match(REGEX_XMR)      ?? []),
    telegramHandles: unique(text.match(REGEX_TELEGRAM) ?? []),
    emails:          unique(text.match(REGEX_EMAIL)    ?? []),
  };
}

async function fetchOnion(url: string): Promise<{
  title: string;
  bodyText: string;
  bytesReceived: number;
}> {
  const agent      = new SocksProxyAgent(TOR_PROXY);
  const controller = new AbortController();
  const timer      = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await nodeFetch(url, {
      agent,
      // node-fetch v2 accepts signal via the options object
      signal: controller.signal as never,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; rv:109.0) Gecko/20100101 Firefox/115.0',
      },
    });

    const rawArrayBuffer = await response.arrayBuffer();
    const rawBuffer = Buffer.from(rawArrayBuffer);
    const bytesReceived = rawBuffer.length;
    const html = rawBuffer.toString('utf-8');

    const $ = cheerio.load(html);

    // Remove script / style noise before extracting text
    $('script, style, noscript').remove();

    const title    = $('title').text().trim() || '(no title)';
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim().slice(0, MAX_BODY_CHARS);

    return { title, bodyText, bytesReceived };
  } finally {
    clearTimeout(timer);
  }
}

async function postToIngestParse(
  text: string,
  investigationId?: string,
): Promise<unknown> {
  const body: Record<string, unknown> = { text, autoIngest: true };
  if (investigationId) body.investigationId = investigationId;

  const res = await fetch('http://localhost:3000/api/ingest/parse', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`/api/ingest/parse responded ${res.status}: ${errText}`);
  }

  return res.json();
}

// ── route handler ────────────────────────────────────────────────────────────

export async function POST(request: Request): Promise<Response> {
  let body: { targets?: string[]; investigationId?: string } = {};

  try {
    body = await request.json();
  } catch {
    // malformed or empty body — use defaults
  }

  const targets: string[] =
    Array.isArray(body.targets) && body.targets.length > 0
      ? body.targets
      : DEFAULT_TARGETS;

  const investigationId = body.investigationId;

  const results: Array<{
    url: string;
    title: string;
    bytesReceived: number;
    entities: ReturnType<typeof extractEntities>;
    ingestResult: unknown;
  }> = [];

  const errors: Array<{ url: string; error: string }> = [];

  await Promise.all(
    targets.map(async (url) => {
      try {
        const { title, bodyText, bytesReceived } = await fetchOnion(url);

        const fullText = `${title}\n\n${bodyText}`;
        const entities = extractEntities(fullText);

        let ingestResult: unknown = null;
        try {
          ingestResult = await postToIngestParse(bodyText, investigationId);
        } catch (ingestErr) {
          ingestResult = {
            error: ingestErr instanceof Error ? ingestErr.message : String(ingestErr),
          };
        }

        results.push({ url, title, bytesReceived, entities, ingestResult });
      } catch (err) {
        errors.push({
          url,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }),
  );

  return Response.json({ success: true, results, errors });
}
