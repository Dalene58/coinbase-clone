const API_BASE_URL = import.meta.env.VITE_COINGECKO_API_BASE_URL || 'https://api.coingecko.com/api/v3'
const COINGECKO_API_KEY = import.meta.env.VITE_COINGECKO_API_KEY || ''
const CACHE_TTL_MS = 60_000
const responseCache = new Map()
const inflightRequests = new Map()

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchJson(path, fallbackErrorMessage) {
  // Short TTL cache helps avoid repeated calls when multiple components load together.
  const now = Date.now()
  const cached = responseCache.get(path)
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data
  }

  // Reuse the same promise when a matching request is already in progress.
  if (inflightRequests.has(path)) {
    return inflightRequests.get(path)
  }

  const requestPromise = (async () => {
    let response = await fetch(`${API_BASE_URL}${path}`, {
      headers: COINGECKO_API_KEY
        ? {
            'x-cg-demo-api-key': COINGECKO_API_KEY,
          }
        : undefined,
    })

    if (response.status === 429) {
      await wait(1200)
      response = await fetch(`${API_BASE_URL}${path}`, {
        headers: COINGECKO_API_KEY
          ? {
              'x-cg-demo-api-key': COINGECKO_API_KEY,
            }
          : undefined,
      })
    }

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('CoinGecko rate limit reached. Add VITE_COINGECKO_API_KEY in .env or try again in a minute.')
      }

      let message = fallbackErrorMessage

      try {
        const payload = await response.json()
        if (payload?.message) {
          message = payload.message
        }
      } catch {
        message = fallbackErrorMessage
      }

      throw new Error(message)
    }

    const data = await response.json()
    responseCache.set(path, { timestamp: Date.now(), data })
    return data
  })()

  inflightRequests.set(path, requestPromise)

  try {
    return await requestPromise
  } finally {
    inflightRequests.delete(path)
  }
}

export async function getCoinList() {
  return fetchJson('/coins/list?include_platform=false', 'Unable to fetch coin list.')
}

export async function getMarkets(vsCurrency = 'usd') {
  return fetchJson(
    `/coins/markets?vs_currency=${encodeURIComponent(vsCurrency)}&order=market_cap_desc&per_page=100&page=1&sparkline=false`,
    'Unable to fetch market data.'
  )
}

export async function getCoinDetail(coinId) {
  return fetchJson(`/coins/${encodeURIComponent(coinId)}`, 'Unable to fetch coin details.')
}

export async function getCoinMarketChart(coinId, vsCurrency = 'usd', days = 7) {
  return fetchJson(
    `/coins/${encodeURIComponent(coinId)}/market_chart?vs_currency=${encodeURIComponent(vsCurrency)}&days=${encodeURIComponent(days)}`,
    'Unable to fetch coin chart data.'
  )
}

export async function getGlobalData() {
  return fetchJson('/global', 'Unable to fetch global market data.')
}

export async function getExchangeRates() {
  return fetchJson('/exchange_rates', 'Unable to fetch exchange rates.')
}

export async function getSimplePrices(ids = ['bitcoin', 'ethereum', 'litecoin'], vsCurrency = 'usd') {
  return fetchJson(
    `/simple/price?ids=${encodeURIComponent(ids.join(','))}&vs_currencies=${encodeURIComponent(vsCurrency)}`,
    'Unable to fetch simple prices.'
  )
}

export async function getLivePrices(ids = ['bitcoin', 'ethereum', 'litecoin']) {
  return fetchJson(
    `/simple/price?ids=${encodeURIComponent(ids.join(','))}&vs_currencies=usd&include_24hr_change=true`,
    'Unable to fetch live prices.'
  )
}
