/**
 * Agriculture market service — data.gov.in API
 * Resource: https://api.data.gov.in/resource/{DATA_GOV_IN_RESOURCE_ID}
 * Variety-wise Daily Market Prices (AGMARKNET)
 *
 * Env (project root .env): DATA_GOV_IN_API_KEY, optional DATA_GOV_IN_RESOURCE_ID
 */
const DATA_GOV_BASE = 'https://api.data.gov.in/resource';
const RETRY_ATTEMPTS = 2;

/** Default resource: Variety-wise Daily Market Prices */
export const DEFAULT_RESOURCE_ID = '35985678-0d79-46b4-9ed6-6f13308a1d24';

const DEFAULT_COMMODITIES = ['Wheat', 'Rice', 'Gram', 'Soybean', 'Maize', 'Mustard'];

const INVALID_KEY_PLACEHOLDERS = new Set([
  '',
  'your-data-gov-in-api-key',
  'your_data_gov_in_api_key',
  'replace_me',
]);

function getConfig() {
  const raw = process.env.DATA_GOV_IN_API_KEY;
  const apiKey = typeof raw === 'string' ? raw.trim() : '';
  if (!apiKey || INVALID_KEY_PLACEHOLDERS.has(apiKey.toLowerCase())) {
    return null;
  }
  const resourceRaw = process.env.DATA_GOV_IN_RESOURCE_ID;
  const resourceId =
    typeof resourceRaw === 'string' && resourceRaw.trim()
      ? resourceRaw.trim()
      : DEFAULT_RESOURCE_ID;
  return { apiKey, resourceId };
}



function mapHttpError(status, json) {
  const body = json?.message || json?.error || '';
  if (status === 401 || status === 403) {
    return {
      message:
        'Invalid or unauthorized data.gov.in API key. Check DATA_GOV_IN_API_KEY in .env and restart the server.',
      code: 'INVALID_API_KEY',
      statusCode: status,
      hint: 'https://data.gov.in/',
    };
  }
  if (status === 429) {
    return {
      message: 'data.gov.in rate limit reached. Try again shortly.',
      code: 'RATE_LIMIT',
      statusCode: 429,
    };
  }
  return {
    message: body || `Market API error (${status})`,
    code: 'MARKET_HTTP_ERROR',
    statusCode: status >= 500 ? 502 : status,
  };
}

function isDataGovSuccess(json) {
  if (!json || typeof json !== 'object') return false;
  const st = json.status;
  if (st === undefined || st === null) return true;
  if (st === 'success' || st === true || st === 'true') return true;
  if (st === 'error' || st === false || st === 'false') return false;
  return true;
}

async function fetchWithRetry(url, retries = RETRY_ATTEMPTS) {
  let lastError;
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url);
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const mapped = mapHttpError(res.status, json);
        const e = new Error(mapped.message);
        e.statusCode = mapped.statusCode;
        e.code = mapped.code;
        e.hint = mapped.hint;
        throw e;
      }
      if (!isDataGovSuccess(json)) {
        const msg = json.message || 'Market API returned an error status';
        const e = new Error(msg);
        e.statusCode = 502;
        e.code = 'MARKET_API_ERROR';
        throw e;
      }
      return json;
    } catch (err) {
      lastError = err;
      if (err.code === 'INVALID_API_KEY' || err.statusCode === 401 || err.statusCode === 403) {
        throw err;
      }
      if (err.statusCode === 429) throw err;
      if (i < retries) await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw lastError;
}

function parsePrice(val) {
  if (val == null) return 0;
  const n = typeof val === 'string' ? parseFloat(val.replace(/,/g, '')) : Number(val);
  return isNaN(n) ? 0 : n;
}

function formatPrice(price) {
  return `₹${Math.round(price).toLocaleString('en-IN')}/q`;
}

/**
 * Fetch one commodity slice from data.gov.in
 */
async function fetchOneCommodity(apiKey, resourceId, commodity) {
  const params = new URLSearchParams({
    'api-key': apiKey,
    format: 'json',
    limit: '50',
    'filters[Commodity]': commodity,
    'sort[Arrival_Date]': 'desc',
  });
  const url = `${DATA_GOV_BASE}/${resourceId}?${params}`;
  const json = await fetchWithRetry(url);
  const records = json.records || [];

  if (records.length === 0) {
    return { commodity, price: 0, market: null, state: null, date: null, count: 0, ok: true };
  }

  const prices = records
    .map((r) => parsePrice(r.Modal_Price || r.Min_Price || r.Max_Price))
    .filter((p) => p > 0);
  const avgPrice = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
  const first = records[0];
  const market = first.Market || first.District;
  const state = first.State;

  return {
    commodity,
    price: Math.round(avgPrice),
    market: market || 'N/A',
    state: state || '',
    date: first.Arrival_Date,
    count: records.length,
    ok: true,
  };
}

/**
 * Fetch commodity prices from data.gov.in (live when API key is set).
 */
export async function fetchCommodityPrices(symbols = null) {
  const config = getConfig();
  if (!config) {
    const err = new Error('Missing or invalid DATA_GOV_IN_API_KEY. Add a valid key from data.gov.in to your .env file (project root) and restart the server.');
    err.code = 'MISSING_API_KEY';
    err.statusCode = 503;
    err.hint = 'https://data.gov.in/';
    throw err;
  }

  const { apiKey, resourceId } = config;
  const commodities = symbols?.length
    ? symbols.map((s) => String(s).trim()).filter(Boolean)
    : DEFAULT_COMMODITIES;

  const settled = await Promise.allSettled(
    commodities.map((c) => fetchOneCommodity(apiKey, resourceId, c))
  );

  const failures = [];
  const rows = [];

  settled.forEach((result, idx) => {
    const name = commodities[idx];
    if (result.status === 'fulfilled') {
      rows.push(result.value);
    } else {
      const err = result.reason;
      failures.push({ commodity: name, message: err?.message || 'Request failed' });
      rows.push({
        commodity: name,
        price: 0,
        market: null,
        state: null,
        date: null,
        count: 0,
        ok: false,
        error: err?.message,
      });
    }
  });

  const globalError = settled.find(
    (r) => r.status === 'rejected' && r.reason?.code === 'INVALID_API_KEY'
  );
  if (globalError) {
    const err = globalError.reason;
    throw err;
  }

  const commodities_out = rows.map((item) => ({
    crop: item.commodity,
    symbol: item.commodity.toUpperCase().replace(/\s+/g, '_'),
    price: item.price > 0 ? formatPrice(item.price) : '—',
    priceValue: item.price,
    change: '—',
    trend: 'up',
    unit: 'quintal',
    market: item.market
      ? `${item.market}${item.state ? `, ${item.state}` : ''}`
      : item.error
        ? '—'
        : 'India',
  }));

  return {
    commodities: commodities_out,
    updatedAt: new Date().toISOString(),
    base: 'INR',
    resourceId,
    message: 'Live prices from AGMARKNET (data.gov.in)',
    ...(failures.length
      ? {
          warnings: failures,
          partial: true,
        }
      : {}),
  };
}
