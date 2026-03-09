const API_BASE_URL = import.meta.env.VITE_CRYPTO_API_BASE_URL || 'https://api.coincap.io/v2'
const CACHE_TTL_MS = 60_000
const responseCache = new Map()
const inflightRequests = new Map()

const APP_TO_PROVIDER_ID = {
  binancecoin: 'binance-coin',
  ripple: 'xrp',
}

const PROVIDER_TO_APP_ID = {
  'binance-coin': 'binancecoin',
  xrp: 'ripple',
}

function toNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function normalizeToProviderId(coinId) {
  const lowerId = String(coinId || '').toLowerCase()
  return APP_TO_PROVIDER_ID[lowerId] || lowerId
}

function normalizeToAppId(coinId) {
  const lowerId = String(coinId || '').toLowerCase()
  return PROVIDER_TO_APP_ID[lowerId] || lowerId
}

function buildMarketRow(asset) {
  const currentPrice = toNumber(asset?.priceUsd)
  const dayChange = toNumber(asset?.changePercent24Hr)
  const marketCap = toNumber(asset?.marketCapUsd)
  const volume24h = toNumber(asset?.volumeUsd24Hr)

  const openingPrice =
    typeof currentPrice === 'number' && typeof dayChange === 'number' && dayChange > -100
      ? currentPrice / (1 + dayChange / 100)
      : null

  return {
    id: normalizeToAppId(asset?.id),
    symbol: String(asset?.symbol || '').toLowerCase(),
    name: String(asset?.name || ''),
    current_price: currentPrice,
    price_change_percentage_24h: dayChange,
    market_cap: marketCap,
    total_volume: volume24h,
    high_24h:
      typeof currentPrice === 'number' && typeof openingPrice === 'number'
        ? Math.max(currentPrice, openingPrice)
        : null,
    low_24h:
      typeof currentPrice === 'number' && typeof openingPrice === 'number'
        ? Math.min(currentPrice, openingPrice)
        : null,
  }
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
  const payload = await fetchJson('/assets?limit=2000', 'Unable to fetch coin list.')
  const assets = Array.isArray(payload?.data) ? payload.data : []

  return assets.map((asset) => ({
    id: normalizeToAppId(asset?.id),
    symbol: String(asset?.symbol || '').toLowerCase(),
    name: String(asset?.name || ''),
  }))
}

export async function getMarkets(vsCurrency = 'usd') {
  if (String(vsCurrency).toLowerCase() !== 'usd') {
    throw new Error('Only USD is supported by the current market data provider.')
  }

  const payload = await fetchJson('/assets?limit=100', 'Unable to fetch market data.')
  const assets = Array.isArray(payload?.data) ? payload.data : []
  return assets.map(buildMarketRow)
}

export async function getCoinDetail(coinId) {
  const providerId = normalizeToProviderId(coinId)
  const payload = await fetchJson(`/assets/${encodeURIComponent(providerId)}`, 'Unable to fetch coin details.')
  const asset = payload?.data

  if (!asset) {
    throw new Error('Unable to fetch coin details.')
  }

  const marketRow = buildMarketRow(asset)

  return {
    id: normalizeToAppId(asset.id),
    symbol: marketRow.symbol,
    name: marketRow.name,
    market_data: {
      current_price: { usd: marketRow.current_price },
      price_change_percentage_24h: marketRow.price_change_percentage_24h,
      market_cap: { usd: marketRow.market_cap },
      high_24h: { usd: marketRow.high_24h },
      low_24h: { usd: marketRow.low_24h },
      total_volume: { usd: marketRow.total_volume },
    },
  }
}

export async function getCoinMarketChart(coinId, vsCurrency = 'usd', days = 7) {
  if (String(vsCurrency).toLowerCase() !== 'usd') {
    throw new Error('Only USD is supported by the current chart data provider.')
  }

  const providerId = normalizeToProviderId(coinId)
  const parsedDays = Number(days)
  const interval = parsedDays <= 1 ? 'm15' : parsedDays <= 7 ? 'h1' : parsedDays <= 30 ? 'h6' : 'd1'

  const payload = await fetchJson(
    `/assets/${encodeURIComponent(providerId)}/history?interval=${encodeURIComponent(interval)}`,
    'Unable to fetch coin chart data.'
  )

  const points = Array.isArray(payload?.data) ? payload.data : []

  return {
    prices: points
      .map((point) => [toNumber(point?.time), toNumber(point?.priceUsd)])
      .filter((point) => typeof point[0] === 'number' && typeof point[1] === 'number'),
  }
}

export async function getGlobalData() {
  const payload = await fetchJson('/assets?limit=200', 'Unable to fetch global market data.')
  const assets = Array.isArray(payload?.data) ? payload.data : []

  const totalMarketCap = assets.reduce((sum, asset) => sum + (toNumber(asset?.marketCapUsd) || 0), 0)
  const bitcoinAsset = assets.find((asset) => String(asset?.id).toLowerCase() === 'bitcoin')
  const bitcoinMarketCap = toNumber(bitcoinAsset?.marketCapUsd)
  const btcDominance =
    typeof bitcoinMarketCap === 'number' && totalMarketCap > 0
      ? (bitcoinMarketCap / totalMarketCap) * 100
      : null

  const exchangePayload = await fetchJson('/exchanges?limit=200', 'Unable to fetch global market data.')
  const exchanges = Array.isArray(exchangePayload?.data) ? exchangePayload.data : []

  return {
    data: {
      active_cryptocurrencies: assets.length,
      markets: exchanges.length,
      market_cap_percentage: {
        btc: btcDominance,
      },
    },
  }
}

export async function getExchangeRates() {
  const payload = await fetchJson('/assets/bitcoin', 'Unable to fetch exchange rates.')
  const btcUsd = toNumber(payload?.data?.priceUsd)
  const usdPerBtcBase = typeof btcUsd === 'number' && btcUsd > 0 ? 1 / btcUsd : null

  return {
    rates: {
      btc: {
        name: 'Bitcoin',
        unit: 'BTC',
        value: btcUsd,
        type: 'crypto',
      },
      usd: {
        name: 'US Dollar',
        unit: 'USD',
        value: usdPerBtcBase,
        type: 'fiat',
      },
    },
  }
}

export async function getSimplePrices(ids = ['bitcoin', 'ethereum', 'litecoin'], vsCurrency = 'usd') {
  if (String(vsCurrency).toLowerCase() !== 'usd') {
    throw new Error('Only USD is supported by the current price provider.')
  }

  const requestedIds = Array.isArray(ids) ? ids : []
  const providerIds = requestedIds.map(normalizeToProviderId)

  const payload = await fetchJson(
    `/assets?ids=${encodeURIComponent(providerIds.join(','))}`,
    'Unable to fetch simple prices.'
  )

  const assets = Array.isArray(payload?.data) ? payload.data : []

  return assets.reduce((accumulator, asset) => {
    const appId = normalizeToAppId(asset?.id)
    accumulator[appId] = {
      usd: toNumber(asset?.priceUsd),
    }
    return accumulator
  }, {})
}

export async function getLivePrices(ids = ['bitcoin', 'ethereum', 'litecoin']) {
  const requestedIds = Array.isArray(ids) ? ids : []
  const providerIds = requestedIds.map(normalizeToProviderId)

  const payload = await fetchJson(
    `/assets?ids=${encodeURIComponent(providerIds.join(','))}`,
    'Unable to fetch live prices.'
  )

  const assets = Array.isArray(payload?.data) ? payload.data : []

  return assets.reduce((accumulator, asset) => {
    const appId = normalizeToAppId(asset?.id)
    accumulator[appId] = {
      usd: toNumber(asset?.priceUsd),
      usd_24h_change: toNumber(asset?.changePercent24Hr),
    }
    return accumulator
  }, {})
}
