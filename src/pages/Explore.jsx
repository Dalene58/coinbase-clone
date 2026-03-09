import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCoinMarketChart, getExchangeRates, getGlobalData, getMarkets, getSimplePrices } from "../data/coingecko";

const FALLBACK_MARKET_ROWS = [
  { id: "bitcoin", name: "Bitcoin", symbol: "btc", current_price: 62140, price_change_percentage_24h: 1.28, market_cap: 1220000000000, total_volume: 32000000000 },
  { id: "ethereum", name: "Ethereum", symbol: "eth", current_price: 3420, price_change_percentage_24h: 0.94, market_cap: 410000000000, total_volume: 18000000000 },
  { id: "solana", name: "Solana", symbol: "sol", current_price: 142, price_change_percentage_24h: -0.56, market_cap: 64000000000, total_volume: 4200000000 },
  { id: "ripple", name: "XRP", symbol: "xrp", current_price: 0.59, price_change_percentage_24h: -0.21, market_cap: 32000000000, total_volume: 1600000000 },
  { id: "binancecoin", name: "BNB", symbol: "bnb", current_price: 535, price_change_percentage_24h: 0.44, market_cap: 78000000000, total_volume: 1300000000 },
  { id: "usd-coin", name: "USDC", symbol: "usdc", current_price: 1.0, price_change_percentage_24h: 0.0, market_cap: 32000000000, total_volume: 7800000000 },
];

function formatPrice(value) {
  if (typeof value !== "number") return "N/A";
  return `$${value.toLocaleString(undefined, {
    maximumFractionDigits: value > 1 ? 2 : 4,
  })}`;
}

function formatCompactUsd(value) {
  if (typeof value !== "number") return "N/A";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}

function buildTrendPath(values, width = 680, height = 220) {
  if (!Array.isArray(values) || values.length < 2) return "";

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const left = 20;
  const right = 30;
  const top = 16;
  const bottom = 40;
  const drawableWidth = width - left - right;
  const drawableHeight = height - top - bottom;

  return values
    .map((value, index) => {
      const x = left + (index / (values.length - 1)) * drawableWidth;
      const y = top + drawableHeight - ((value - min) / range) * drawableHeight;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

export default function Explore() {
  const [globalSnapshot, setGlobalSnapshot] = useState(null);
  const [exchangeRates, setExchangeRates] = useState(null);
  const [quickPrices, setQuickPrices] = useState(null);
  const [marketRows, setMarketRows] = useState(FALLBACK_MARKET_ROWS);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [marketsError, setMarketsError] = useState("");
  const [marketsNotice, setMarketsNotice] = useState("");
  const [trendPoints, setTrendPoints] = useState([]);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const markets = await getMarkets("usd");
        if (Array.isArray(markets)) {
          setMarketRows(markets.slice(0, 50));
          setMarketsError("");
          setMarketsNotice("");
        }
      } catch {
        // Keep the table usable if CoinGecko is unavailable or throttled.
        setMarketsError("");
        setMarketsNotice("Live prices are temporarily unavailable. Showing last synced data.");
        setMarketRows((previousRows) => (previousRows.length ? previousRows : FALLBACK_MARKET_ROWS));
      }
    };

    const fetchSnapshot = async () => {
      try {
        const [globalResponse, exchangeResponse, pricesResponse, chartResponse] = await Promise.all([
          getGlobalData(),
          getExchangeRates(),
          getSimplePrices(["bitcoin", "ethereum", "litecoin"], "usd"),
          getCoinMarketChart("bitcoin", "usd", 7),
        ]);

        setGlobalSnapshot(globalResponse?.data || null);
        setExchangeRates(exchangeResponse?.rates || null);
        setQuickPrices(pricesResponse || null);
        setTrendPoints(Array.isArray(chartResponse?.prices) ? chartResponse.prices : []);
        setError("");
      } catch {
        setError("Current prices are temporarily unavailable.");
        setTrendPoints([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSnapshot();
    fetchMarkets();

    const intervalId = setInterval(() => {
      fetchSnapshot();
      fetchMarkets();
    }, 300000);

    return () => clearInterval(intervalId);
  }, []);

  const visibleRows = marketRows.filter((coin) => {
    const symbol = String(coin.symbol || "").toLowerCase();
    const name = String(coin.name || "").toLowerCase();
    const query = searchTerm.toLowerCase().trim();
    if (!query) return true;
    return symbol.includes(query) || name.includes(query);
  });

  const trendValues = trendPoints
    // CoinGecko chart points come as [timestamp, price].
    .map((point) => (Array.isArray(point) ? point[1] : null))
    .filter((value) => typeof value === "number");
  const trendPath = buildTrendPath(trendValues);
  const trendOpen = trendValues.length ? trendValues[0] : null;
  const trendHigh = trendValues.length ? Math.max(...trendValues) : null;
  const trendClose = trendValues.length ? trendValues[trendValues.length - 1] : null;
  const trendChange =
    typeof trendOpen === "number" && typeof trendClose === "number" && trendOpen !== 0
      ? ((trendClose - trendOpen) / trendOpen) * 100
      : null;

  return (
    <main className="min-h-screen px-5 py-12 md:px-10 lg:px-16 [&_button]:text-white">
      <div className="flex items-center gap-3">
        <img
          src="https://images.pexels.com/photos/6770610/pexels-photo-6770610.jpeg?auto=compress&cs=tinysrgb&w=300"
          alt="Bitcoin sign"
          className="h-10 w-10 rounded-full border border-slate-200 bg-white"
        />
        <h1 className="text-4xl font-semibold md:text-5xl">Explore</h1>
      </div>
      <p className="mt-4 text-base text-slate-600 md:text-lg">Track live crypto current prices.</p>
      
      <section className="mt-8 rounded-2xl border border-slate-200 p-6 md:p-7">
        <div className="grid gap-6 md:grid-cols-[3fr_1fr] md:items-center">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <img
              src="https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Sign up illustration"
              className="h-72 w-full object-cover md:h-96"
            />
          </div>
          <div className="flex items-center md:justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 hover:text-white"
            >
              Sign up
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 p-6 md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Market trend snapshot</h2>
            <p className="mt-1 text-sm text-slate-500">Live Bitcoin 7-day movement overview</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              typeof trendChange === "number" && trendChange >= 0
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700"
            }`}
          >
            {typeof trendChange === "number" ? `${trendChange.toFixed(2)}% this week` : "N/A"}
          </span>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <svg viewBox="0 0 680 220" className="h-52 w-full">
            <defs>
              <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
            </defs>

            <g stroke="#cbd5e1" strokeWidth="1">
              <line x1="20" y1="180" x2="660" y2="180" />
              <line x1="20" y1="140" x2="660" y2="140" />
              <line x1="20" y1="100" x2="660" y2="100" />
              <line x1="20" y1="60" x2="660" y2="60" />
            </g>

            {trendPath ? (
              <>
                <path d={`${trendPath} L650 180 L20 180 Z`} fill="url(#trendFill)" />
                <path
                  d={trendPath}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            ) : null}
          </svg>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs text-slate-500">Open</p>
            <p className="mt-1 font-semibold text-slate-900">{formatPrice(trendOpen)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs text-slate-500">High</p>
            <p className="mt-1 font-semibold text-slate-900">{formatPrice(trendHigh)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs text-slate-500">Close</p>
            <p className="mt-1 font-semibold text-slate-900">{formatPrice(trendClose)}</p>
          </div>
        </div>
      </section>


      <section className="mt-8 rounded-2xl border border-slate-200 p-6 md:p-7">
        <h2 className="text-3xl font-semibold">Current prices</h2>

        {isLoading ? <p className="mt-3 text-sm text-slate-500">Loading current prices...</p> : null}
        {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}

        {!isLoading && !error ? (
          <>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <p>
                Coins tracked: {globalSnapshot?.active_cryptocurrencies?.toLocaleString?.() || "N/A"}
              </p>
              <p>Markets: {globalSnapshot?.markets?.toLocaleString?.() || "N/A"}</p>
              <p>
                BTC dominance:
                {typeof globalSnapshot?.market_cap_percentage?.btc === "number"
                  ? ` ${globalSnapshot.market_cap_percentage.btc.toFixed(2)}%`
                  : " N/A"}
              </p>
              <p>
                USD per BTC:
                {typeof exchangeRates?.btc?.value === "number"
                  ? ` $${exchangeRates.btc.value.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}`
                  : " N/A"}
              </p>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {[
                { id: "bitcoin", label: "Bitcoin" },
                { id: "ethereum", label: "Ethereum" },
                { id: "litecoin", label: "Litecoin" },
              ].map((coin) => {
                const price = quickPrices?.[coin.id]?.usd;
                return (
                  <div key={coin.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">{coin.label}</p>
                    <p className="mt-1 font-medium text-slate-900">
                      {formatPrice(price)}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        ) : null}
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 p-6 md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-3xl font-semibold">Live markets</h2>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by coin name or symbol"
            className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-900 md:w-72"
          />
        </div>

        {marketsError ? <p className="mt-3 text-sm text-rose-600">{marketsError}</p> : null}
        {marketsNotice ? <p className="mt-3 text-sm text-amber-600">{marketsNotice}</p> : null}

        {!marketsError ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="px-3 py-2 font-medium">Coin</th>
                  <th className="px-3 py-2 font-medium">Price</th>
                  <th className="px-3 py-2 font-medium">24h change</th>
                  <th className="px-3 py-2 font-medium">Market cap</th>
                  <th className="px-3 py-2 font-medium">24h volume</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((coin) => {
                  const change = coin.price_change_percentage_24h;
                  return (
                    <tr key={coin.id} className="border-b border-slate-100">
                      <td className="px-3 py-2 text-slate-900">
                        {coin.name} ({String(coin.symbol || "").toUpperCase()})
                      </td>
                      <td className="px-3 py-2 text-slate-900">{formatPrice(coin.current_price)}</td>
                      <td
                        className={`px-3 py-2 font-medium ${
                          typeof change === "number" && change >= 0 ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {typeof change === "number" ? `${change.toFixed(2)}%` : "N/A"}
                      </td>
                      <td className="px-3 py-2 text-slate-900">{formatCompactUsd(coin.market_cap)}</td>
                      <td className="px-3 py-2 text-slate-900">{formatCompactUsd(coin.total_volume)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!visibleRows.length ? <p className="px-3 py-4 text-sm text-slate-500">No coins match your search.</p> : null}
          </div>
        ) : null}
      </section>
    </main>
  );
}
