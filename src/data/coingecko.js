const API_BASE_URL = import.meta.env.VITE_COINGECKO_API_BASE_URL || 'https://api.coingecko.com/api/v3'
const CACHE_TTL_MS = 60_000
const responseCache = new Map()
const inflightRequests = new Map()

function toNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

async function fetchJson(path, fallbackErrorMessage) {
  const now = Date.now()
  const cached = responseCache.get(path)
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data
  }

  if (inflightRequests.has(path)) {
    return inflightRequests.get(path)
  }

  const requestPromise = (async () => {
    const response = await fetch(`${API_BASE_URL}${path}`)

    if (!response.ok) {
      let message = fallbackErrorMessage

      try {
        const payload = await response.json()
        if (payload?.error) {
          message = payload.error
        } else if (payload?.message) {
          message = payload.message
        } else if (response.status === 429) {
          message = 'CoinGecko rate limit exceeded. Please try again shortly.'
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
  const coins = await fetchJson('/coins/list?include_platform=false', 'Unable to fetch coin list.')
  const list = Array.isArray(coins) ? coins : []

  return list.map((coin) => ({
    id: String(coin?.id || ''),
    symbol: String(coin?.symbol || '').toLowerCase(),
    name: String(coin?.name || ''),
  }))
}

export async function getMarkets(vsCurrency = 'usd') {
  const currency = String(vsCurrency || 'usd').toLowerCase()
  const markets = await fetchJson(
    `/coins/markets?vs_currency=${encodeURIComponent(currency)}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`,
    'Unable to fetch market data.'
  )

  return Array.isArray(markets) ? markets : []
}

export async function getCoinDetail(coinId) {
  return fetchJson(
    `/coins/${encodeURIComponent(coinId)}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`,
    'Unable to fetch coin details.'
  )
}

export async function getCoinMarketChart(coinId, vsCurrency = 'usd', days = 7) {
  const currency = String(vsCurrency || 'usd').toLowerCase()
  const parsedDays = Number(days)
  const interval = Number.isFinite(parsedDays) && parsedDays <= 1 ? 'hourly' : 'daily'

  return fetchJson(
    `/coins/${encodeURIComponent(coinId)}/market_chart?vs_currency=${encodeURIComponent(currency)}&days=${encodeURIComponent(days)}&interval=${encodeURIComponent(interval)}`,
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
  const requestedIds = Array.isArray(ids) ? ids : []
  const currency = String(vsCurrency || 'usd').toLowerCase()

  const prices = await fetchJson(
    `/simple/price?ids=${encodeURIComponent(requestedIds.join(','))}&vs_currencies=${encodeURIComponent(currency)}`,
    'Unable to fetch simple prices.'
  )

  return prices && typeof prices === 'object' ? prices : {}
}

export async function getLivePrices(ids = ['bitcoin', 'ethereum', 'litecoin']) {
  const requestedIds = Array.isArray(ids) ? ids : []

  const prices = await fetchJson(
    `/simple/price?ids=${encodeURIComponent(requestedIds.join(','))}&vs_currencies=usd&include_24hr_change=true`,
    'Unable to fetch live prices.'
  )

  if (!prices || typeof prices !== 'object') {
    return {}
  }

  return Object.entries(prices).reduce((accumulator, [coinId, payload]) => {
    accumulator[coinId] = {
      usd: toNumber(payload?.usd),
      usd_24h_change: toNumber(payload?.usd_24h_change),
    }
    return accumulator
  }, {})
}
