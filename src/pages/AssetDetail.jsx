import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { getCoinDetail, getCoinMarketChart, getMarkets } from "../data/coingecko";

const ID_ALIASES = {
  btc: "bitcoin",
  eth: "ethereum",
  sol: "solana",
  xrp: "ripple",
  usdt: "tether",
  usdc: "usd-coin",
  bnb: "binancecoin",
};

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

function buildSparklinePath(values, width = 640, height = 180) {
  if (!Array.isArray(values) || values.length < 2) return "";

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function withTimeout(promise, timeoutMs = 12000, timeoutMessage = "Request timed out") {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
    }),
  ]);
}

export default function AssetDetail() {
  const { id } = useParams();
  const coinId = (id || "bitcoin").toLowerCase();
  const resolvedCoinId = ID_ALIASES[coinId] || coinId;

  const [coinDetail, setCoinDetail] = useState(null);
  const [chart, setChart] = useState([]);
  const [marketRows, setMarketRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [marketsError, setMarketsError] = useState("");

  useEffect(() => {
    const loadAssetData = async () => {
      setIsLoading(true);
      setError("");
      setMarketsError("");

      try {
        const [detailResult, marketChartResult, marketsResult] = await Promise.allSettled([
          withTimeout(
            getCoinDetail(resolvedCoinId),
            12000,
            "Coin details request timed out"
          ),
          withTimeout(
            getCoinMarketChart(resolvedCoinId, "usd", 7),
            12000,
            "Chart data request timed out"
          ),
          withTimeout(getMarkets("usd"), 12000, "Market list request timed out"),
        ]);

        const allMarkets =
          marketsResult.status === "fulfilled" && Array.isArray(marketsResult.value)
            ? marketsResult.value
            : [];

        if (detailResult.status === "fulfilled") {
          setCoinDetail(detailResult.value);
        } else {
          const fallbackCoin = allMarkets.find(
            (coin) =>
              coin.id === resolvedCoinId || String(coin.symbol || "").toLowerCase() === coinId
          );

          if (fallbackCoin) {
            setCoinDetail({
              name: fallbackCoin.name,
              symbol: fallbackCoin.symbol,
              market_data: {
                current_price: { usd: fallbackCoin.current_price },
                price_change_percentage_24h: fallbackCoin.price_change_percentage_24h,
                market_cap: { usd: fallbackCoin.market_cap },
                high_24h: { usd: fallbackCoin.high_24h },
                low_24h: { usd: fallbackCoin.low_24h },
                total_volume: { usd: fallbackCoin.total_volume },
              },
            });
          } else {
            setCoinDetail(null);
            const detailError = detailResult.reason instanceof Error ? detailResult.reason.message : "";
            setError(
              detailError.includes("rate limit")
                ? "Coin data is temporarily rate-limited. Please try again in a minute."
                : "Unable to load this asset right now."
            );
          }
        }

        if (marketChartResult.status === "fulfilled") {
          setChart(Array.isArray(marketChartResult.value?.prices) ? marketChartResult.value.prices : []);
        } else {
          setChart([]);
        }

        if (allMarkets.length) {
          setMarketRows(allMarkets.slice(0, 12));
        } else {
          setMarketRows([]);
          setMarketsError("Live market prices are temporarily unavailable.");
        }
      } catch {
        setCoinDetail(null);
        setChart([]);
        setMarketRows([]);
        setError("Unable to load this asset right now.");
      } finally {
        setIsLoading(false);
      }
    };

    loadAssetData();

    const intervalId = setInterval(() => {
      loadAssetData();
    }, 300000);

    return () => clearInterval(intervalId);
  }, [coinId, resolvedCoinId]);

  const latestChartPoint = useMemo(() => {
    if (!chart.length) return null;
    const [, price] = chart[chart.length - 1];
    return price;
  }, [chart]);

  const marketData = coinDetail?.market_data;
  const dayChange = marketData?.price_change_percentage_24h;
  const chartValues = chart
    .map(([, price]) => price)
    .filter((price) => typeof price === "number");
  const chartStart = chartValues.length ? chartValues[0] : null;
  const chartEnd = chartValues.length ? chartValues[chartValues.length - 1] : null;
  const chartHigh = chartValues.length ? Math.max(...chartValues) : null;
  const chartLow = chartValues.length ? Math.min(...chartValues) : null;
  const chartChangePercent =
    typeof chartStart === "number" && typeof chartEnd === "number" && chartStart !== 0
      ? ((chartEnd - chartStart) / chartStart) * 100
      : null;
  const chartPath = buildSparklinePath(chartValues);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-8">
      {isLoading ? (
        <p className="text-slate-600">Loading asset details...</p>
      ) : error ? (
        <p className="text-rose-600">{error}</p>
      ) : coinDetail ? (
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <img
              src="https://images.pexels.com/photos/6770610/pexels-photo-6770610.jpeg?auto=compress&cs=tinysrgb&w=300"
              alt={coinDetail.name}
              className="h-8 w-8"
            />
            <h1 className="text-3xl font-semibold">
              {coinDetail.name} ({String(coinDetail.symbol || "").toUpperCase()})
            </h1>
          </div>

          <section className="relative overflow-hidden rounded-2xl border border-slate-200">
            <img
              src="https://images.pexels.com/photos/6802042/pexels-photo-6802042.jpeg?auto=compress&cs=tinysrgb&w=1600"
              alt={`${coinDetail.name} trading`}
              className="h-56 w-full object-cover object-[center_65%] md:h-72"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
            <Link
              to="/signin"
              className="absolute bottom-4 right-4 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white"
            >
              Trade now
            </Link>
          </section>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="text-sm text-slate-500">Current price</p>
              <p className="mt-2 text-2xl font-semibold">
                {formatPrice(marketData?.current_price?.usd)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="text-sm text-slate-500">24h change</p>
              <p
                className={`mt-2 text-2xl font-semibold ${
                  typeof dayChange === "number" && dayChange >= 0 ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {typeof dayChange === "number"
                  ? `${dayChange.toFixed(2)}%`
                  : "N/A"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="text-sm text-slate-500">Market cap</p>
              <p className="mt-2 text-2xl font-semibold">
                {formatCompactUsd(marketData?.market_cap?.usd)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="text-sm text-slate-500">24h high</p>
              <p className="mt-2 text-2xl font-semibold">
                {formatPrice(marketData?.high_24h?.usd)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="text-sm text-slate-500">24h low</p>
              <p className="mt-2 text-2xl font-semibold">
                {formatPrice(marketData?.low_24h?.usd)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="text-sm text-slate-500">24h volume</p>
              <p className="mt-2 text-2xl font-semibold">
                {formatCompactUsd(marketData?.total_volume?.usd)}
              </p>
            </div>
          </div>

          <section className="rounded-2xl border border-slate-200 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-semibold">Chart of current market prices</h2>
              <p
                className={`text-sm font-medium ${
                  typeof chartChangePercent === "number" && chartChangePercent >= 0
                    ? "text-emerald-600"
                    : "text-rose-600"
                }`}
              >
                {typeof chartChangePercent === "number"
                  ? `${chartChangePercent.toFixed(2)}% (7d)`
                  : "N/A"}
              </p>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <svg viewBox="0 0 640 180" className="h-44 w-full">
                {chartPath ? (
                  <path
                    d={chartPath}
                    fill="none"
                    stroke={typeof chartChangePercent === "number" && chartChangePercent >= 0 ? "#059669" : "#dc2626"}
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                ) : null}
              </svg>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs text-slate-500">Start (7d)</p>
                <p className="mt-1 font-semibold text-slate-900">{formatPrice(chartStart)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs text-slate-500">Latest</p>
                <p className="mt-1 font-semibold text-slate-900">{formatPrice(latestChartPoint)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs text-slate-500">7d high</p>
                <p className="mt-1 font-semibold text-slate-900">{formatPrice(chartHigh)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs text-slate-500">7d low</p>
                <p className="mt-1 font-semibold text-slate-900">{formatPrice(chartLow)}</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 p-5">
            <h3 className="text-xl font-semibold">Prices for different cryptocurrencies</h3>
            {marketsError ? <p className="mt-3 text-sm text-rose-600">{marketsError}</p> : null}

            {!marketsError && marketRows.length ? (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="px-3 py-2 font-medium">Coin</th>
                      <th className="px-3 py-2 font-medium">Price (USD)</th>
                      <th className="px-3 py-2 font-medium">24h change</th>
                      <th className="px-3 py-2 font-medium">Market cap</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marketRows.map((coin) => {
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
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : !marketsError ? (
              <p className="mt-3 text-sm text-slate-500">Loading live market prices...</p>
            ) : null}
          </section>

          <section className="rounded-2xl border border-slate-200 p-5">
            <h3 className="text-lg font-semibold text-slate-900">
              Bitcoin: The World's First Decentralized Cryptocurrency
            </h3>
            <p className="mt-3 text-sm text-slate-600">
              Bitcoin, created in 2009 by Satoshi Nakamoto, is the world's first decentralized cryptocurrency. It operates on a peer-to-peer network without the need for intermediaries like banks or governments. Bitcoin's unique features include a fixed maximum supply of 21 million coins, issuance through mining, a decentralized network architecture, and a transparent ledger system (blockchain). This decentralized nature allows Bitcoin to function as a digital currency without reliance on a central authority or intermediary, making it a revolutionary concept in the financial landscape.
            </p>
          </section>
        </section>
      ) : (
        <p className="text-slate-600">No asset data found.</p>
      )}
    </main>
  );
}
