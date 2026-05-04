import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
	getCoinMarketChart,
	getGlobalData,
	getLivePrices,
	getMarkets,
} from "../data/coingecko";

const FALLBACK_LIVE_ASSETS = [
	{ label: "Tether", symbol: "USDT", apiId: "tether" },
	{ label: "BNB", symbol: "BNB", apiId: "binancecoin" },
	{ label: "XRP", symbol: "XRP", apiId: "ripple" },
	{ label: "USDC", symbol: "USDC", apiId: "usd-coin" },
];

const FALLBACK_LIVE_PRICES = {
	tether: { usd: 1.0, usd_24h_change: 0.01 },
	binancecoin: { usd: 640.41, usd_24h_change: 4.44 },
	ripple: { usd: 1.36, usd_24h_change: 1.7 },
	"usd-coin": { usd: 1.0, usd_24h_change: 0.01 },
};

const FALLBACK_QUICK_PRICES = {
	bitcoin: { usd: 69036 },
	ethereum: { usd: 2027.79 },
	litecoin: { usd: 54.04 },
};

const FALLBACK_GLOBAL_SNAPSHOT = {
	active_cryptocurrencies: 18306,
	markets: 1478,
	market_cap_percentage: { btc: 56.72 },
};

const FALLBACK_CHARTS = {
	bitcoin: [66000, 66500, 66800, 67100, 67600, 68050, 68400, 68900].map((price, index) => [index, price]),
	ethereum: [1960, 1975, 1988, 2001, 2010, 2015, 2022, 2028].map((price, index) => [index, price]),
};

const LIVE_CHART_COINS = [
	{ id: "bitcoin", label: "Bitcoin", symbol: "BTC" },
	{ id: "ethereum", label: "Ethereum", symbol: "ETH" },
];

function buildSparklinePath(values, width = 240, height = 72) {
	if (!Array.isArray(values) || values.length < 2) return "";

	const min = Math.min(...values);
	const max = Math.max(...values);
	const range = max - min || 1;

	return values
		.map((value, index) => {
			// Normalize values into the SVG viewport so each coin can reuse the same chart size.
			const x = (index / (values.length - 1)) * width;
			const y = height - ((value - min) / range) * height;
			return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
		})
		.join(" ");
}

function resolveErrorMessage(error, fallbackMessage) {
	if (!(error instanceof Error)) return fallbackMessage;
	if (/failed to fetch/i.test(error.message)) return fallbackMessage;
	return error.message;
}

export default function Home() {
	const topAssetsFallback = [
		{ name: "Bitcoin", symbol: "BTC", price: "$62,140" },
		{ name: "Ethereum", symbol: "ETH", price: "$3,420" },
		{ name: "Solana", symbol: "SOL", price: "$142" },
	];

	const [liveAssets, setLiveAssets] = useState(FALLBACK_LIVE_ASSETS);
	const [livePrices, setLivePrices] = useState({});
	const [isLoadingLive, setIsLoadingLive] = useState(true);
	const [liveError, setLiveError] = useState("");
	const [topAssets, setTopAssets] = useState(topAssetsFallback);
	const [marketsError, setMarketsError] = useState("");
	const [globalSnapshot, setGlobalSnapshot] = useState(null);
	const [quickPrices, setQuickPrices] = useState(null);
	const [statsError, setStatsError] = useState("");
	const [liveCharts, setLiveCharts] = useState({});
	const [isLoadingCharts, setIsLoadingCharts] = useState(true);
	const [chartsError, setChartsError] = useState("");
	const usdPerBtc = typeof quickPrices?.bitcoin?.usd === "number" ? quickPrices.bitcoin.usd : null;
	const hasChartData = LIVE_CHART_COINS.some((coin) => (liveCharts[coin.id] || []).length > 1);

	useEffect(() => {
		const fetchMarketStats = async () => {
			try {
				const trackedIds = [
					"bitcoin",
					"ethereum",
					"litecoin",
					...FALLBACK_LIVE_ASSETS.map((asset) => asset.apiId),
				];
				const [globalResponse, pricesResponse] = await Promise.all([
					getGlobalData(),
					getLivePrices(trackedIds),
				]);

				setGlobalSnapshot(globalResponse?.data || null);
				const nextLivePrices = FALLBACK_LIVE_ASSETS.reduce((accumulator, asset) => {
					accumulator[asset.apiId] = pricesResponse?.[asset.apiId] || {};
					return accumulator;
				}, {});
				const nextQuickPrices = {
					bitcoin: pricesResponse?.bitcoin || null,
					ethereum: pricesResponse?.ethereum || null,
					litecoin: pricesResponse?.litecoin || null,
				};

				setLivePrices(nextLivePrices);
				setQuickPrices(nextQuickPrices);
				setStatsError("");
				setLiveError("");
			} catch (error) {
				setGlobalSnapshot(FALLBACK_GLOBAL_SNAPSHOT);
				setQuickPrices(FALLBACK_QUICK_PRICES);
				setLivePrices(FALLBACK_LIVE_PRICES);
				setStatsError("Using fallback market data while live data is temporarily unavailable.");
				setLiveError(resolveErrorMessage(error, "Realtime prices are temporarily unavailable."));
			}
			setIsLoadingLive(false);
		};

		const fetchTopAssets = async () => {
			try {
				const marketData = await getMarkets("usd");
				if (Array.isArray(marketData) && marketData.length > 0) {
					setTopAssets(
						marketData.slice(0, 3).map((asset) => ({
							name: asset.name,
							symbol: String(asset.symbol || "").toUpperCase(),
							price:
								typeof asset.current_price === "number"
									? `$${asset.current_price.toLocaleString(undefined, {
										maximumFractionDigits: asset.current_price > 1 ? 2 : 4,
									})}`
									: "N/A",
						}))
					);
					setMarketsError("");
				}
			} catch (error) {
				setMarketsError(resolveErrorMessage(error, "Showing fallback top assets while live data is unavailable."));
			}
		};

		const fetchLiveCharts = async () => {
			try {
				const chartResults = await Promise.allSettled(
					LIVE_CHART_COINS.map(async (coin) => {
						const chartData = await getCoinMarketChart(coin.id, "usd", 1);
						const points = Array.isArray(chartData?.prices) ? chartData.prices.slice(-40) : [];
						return { id: coin.id, points };
					})
				);

				const successfulCharts = chartResults
					.filter((result) => result.status === "fulfilled")
					.map((result) => [result.value.id, result.value.points]);

				setLiveCharts(Object.fromEntries(successfulCharts));

				if (successfulCharts.length === 0) {
					throw new Error("Live market charts are temporarily unavailable.");
				}

				setChartsError(
					successfulCharts.length < LIVE_CHART_COINS.length
						? "Some chart data is temporarily unavailable."
						: ""
				);
			} catch (error) {
				setLiveCharts(FALLBACK_CHARTS);
				setChartsError(resolveErrorMessage(error, "Using fallback chart data while live data is unavailable."));
			} finally {
				setIsLoadingCharts(false);
			}
		};

		let intervalId;
		let chartIntervalId;

		const startLiveFeed = async () => {
			const selectedAssets = FALLBACK_LIVE_ASSETS;
			setLiveAssets(selectedAssets);
			// Fetch once on mount, then keep prices/charts fresh with a shared 5 minute cadence.
			await fetchMarketStats();
			await fetchTopAssets();
			await fetchLiveCharts();
			intervalId = setInterval(fetchMarketStats, 300000);
			chartIntervalId = setInterval(fetchLiveCharts, 300000);
		};

		startLiveFeed();

		return () => {
			if (intervalId) clearInterval(intervalId);
			if (chartIntervalId) clearInterval(chartIntervalId);
		};
	}, []);

	return (
		<main className="px-4 py-10 md:px-8 lg:px-12">
			<section className="space-y-8">
				<div className="space-y-6">
					<section className="grid gap-6 md:grid-cols-12 md:items-start">
						<div className="md:col-span-6 md:order-2">
							<h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
								The next era of money is here
							</h1>
							<p className="mt-4 text-base text-slate-600 md:text-lg">
								Buy and sell crypto on a platform you can rely on.
							</p>
							<div className="mt-6 flex w-full flex-col gap-3 sm:flex-row sm:items-center">
								<input
									type="text"
										placeholder="satoshi@nakamoto.com"
										readOnly
										aria-label="Sign up input"
										className="block h-14 w-full rounded-xl border border-slate-300 bg-white px-5 text-slate-900 placeholder:text-slate-500"
								/>
								<Link
									to="/signup"
									className="inline-flex h-14 items-center justify-center rounded-full bg-blue-600 px-8 font-semibold text-white hover:bg-blue-700"
								>
									Sign up
								</Link>
							</div>
						</div>
						<div className="md:col-span-6 md:order-1">
							<img
								src="https://www.bing.com/th/id/OIP.Tdoy4Hi3hnrxjQKg7UMXKAHaMt?w=1200&h=2060&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3"
								alt="Crypto hero illustration"
								className="h-96 w-full rounded-3xl bg-transparent object-contain [image-rendering:auto] [filter:contrast(1.2)_brightness(1.1)] md:h-[32rem] lg:h-[38rem]"
							/>
							<p className="mt-2 text-xs text-slate-500">
								Stocks and prediction markets not available in your jurisdiction.
							</p>
						</div>
					</section>

					<section className="space-y-6">
							<div className="grid gap-6 lg:grid-cols-2 lg:items-center">
								<div className="space-y-4">
									<p className="max-w-4xl text-4xl font-semibold leading-tight text-slate-900 md:text-6xl">
										Discover crypto like Bitcoin, Ethereum, and Dogecoin.
									</p>
									<p className="text-lg text-slate-600 md:text-2xl">
										Easily and safely buy, sell, and manage hundreds of digital assets.
									</p>
									<Link
										to="/explore"
										className="inline-flex rounded-full bg-black px-10 py-4 text-2xl font-semibold text-white hover:bg-slate-900 md:text-3xl"
									>
										View more assets
									</Link>
								</div>

								<div className="overflow-hidden rounded-[2.25rem] border border-slate-100 bg-slate-100 p-2 shadow-sm">
									<img
										src="https://www.bing.com/th/id/OIP.lORdWcQ75OtCu3t-oCznxwHaNe?w=188&h=342&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2"
										alt="Explore crypto preview"
										className="h-[26rem] w-full rounded-[1.75rem] bg-[#03060b] object-contain [image-rendering:auto]"
									/>
								</div>
							</div>

							<div className="rounded-2xl border border-slate-200 p-4">
								<div className="mb-3 flex items-center justify-between">
									<h3 className="text-sm font-semibold text-slate-900">Realtime prices</h3>
									<span className="text-xs text-slate-500">Refreshes every 5m</span>
								</div>

								{isLoadingLive ? (
									<p className="text-sm text-slate-500">Loading realtime prices...</p>
								) : liveError ? (
									<p className="text-sm text-rose-600">{liveError}</p>
								) : (
									<div className="grid gap-2 sm:grid-cols-2">
										{liveAssets.map((asset) => {
											const liveAsset = livePrices[asset.apiId] || {};
											const usdPrice = liveAsset.usd;
											const change24h = liveAsset.usd_24h_change;

											return (
												<div
													key={asset.symbol}
													className="rounded-xl border border-slate-200 bg-slate-50 p-3"
												>
													<p className="text-xs font-medium text-slate-500">{asset.label}</p>
													<p className="mt-1 text-base font-semibold text-slate-900">
														{typeof usdPrice === "number"
															? `$${usdPrice.toLocaleString(undefined, {
																maximumFractionDigits: usdPrice > 1 ? 2 : 4,
															})}`
															: "N/A"}
													</p>
													<p
														className={`text-xs font-medium ${
															typeof change24h === "number" && change24h >= 0
																? "text-emerald-600"
																: "text-rose-600"
														}`}
													>
														{typeof change24h === "number" ? `${change24h.toFixed(2)}% (24h)` : "N/A"}
													</p>
												</div>
											);
										})}
									</div>
								)}
							</div>
					</section>

					<div className="grid gap-4 md:grid-cols-3">
						<div className="rounded-2xl border p-5">Safe storage</div>
						<div className="rounded-2xl border p-5">Quick transactions</div>
						<div className="rounded-2xl border p-5">Simple portfolio tracking</div>
					</div>

					<div className="grid gap-5 md:grid-cols-2">
						<div className="rounded-2xl border border-slate-200 bg-slate-50 p-8">
							<p className="text-sm font-medium text-slate-500">Portfolio value</p>
							<p className="mt-2 text-4xl font-bold text-slate-900">$124,580.29</p>
							<p className="mt-2 text-sm text-emerald-600">+8.42% this month</p>
						</div>

						<section className="rounded-2xl border border-slate-200 p-5">
							<h2 className="text-2xl font-semibold">Latest prices</h2>
							{statsError ? <p className="mt-3 text-sm text-rose-600">{statsError}</p> : null}
							<div className="mt-3 space-y-2 text-sm text-slate-700">
								<p>
									Assets tracked: {globalSnapshot?.active_cryptocurrencies?.toLocaleString?.() || "N/A"}
								</p>
								<p>
									Markets: {globalSnapshot?.markets?.toLocaleString?.() || "N/A"}
								</p>
								<p>
									BTC dominance:
									{typeof globalSnapshot?.market_cap_percentage?.btc === "number"
										? ` ${globalSnapshot.market_cap_percentage.btc.toFixed(2)}%`
										: " N/A"}
								</p>
								<p>
									USD per BTC:
									{typeof usdPerBtc === "number"
										? ` $${usdPerBtc.toLocaleString(undefined, {
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
												{typeof price === "number"
													? `$${price.toLocaleString(undefined, {
														maximumFractionDigits: price > 1 ? 2 : 4,
													})}`
													: "N/A"}
											</p>
										</div>
									);
								})}
							</div>
						</section>

						<section className="md:col-span-2">
							<h2 className="mb-4 text-2xl font-semibold">Leading assets</h2>
							{marketsError ? <p className="mb-3 text-sm text-rose-600">{marketsError}</p> : null}
							<div className="space-y-3">
								{topAssets.map((asset) => (
									<div
										key={asset.symbol}
										className="flex items-center justify-between rounded-xl border p-4"
									>
										<span>
											{asset.name} ({asset.symbol})
										</span>
										<span className="font-medium">{asset.price}</span>
									</div>
								))}
							</div>
						</section>

						<section className="md:col-span-2 rounded-2xl border border-slate-200 p-5">
							<div className="mb-4 flex items-center justify-between">
								<h2 className="text-2xl font-semibold">Realtime market charts</h2>
								<span className="text-xs text-slate-500">Updates every 5m</span>
							</div>

							{isLoadingCharts ? (
								<p className="text-sm text-slate-500">Loading realtime charts...</p>
							) : (
								<>
									{chartsError ? <p className="mb-3 text-sm text-amber-600">{chartsError}</p> : null}
									{hasChartData ? (
										<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
											{LIVE_CHART_COINS.map((coin) => {
												const points = liveCharts[coin.id] || [];
												const values = points.map(([, price]) => price).filter((price) => typeof price === "number");
												const latest = values.length ? values[values.length - 1] : null;
												const first = values.length ? values[0] : null;
												const change =
													typeof latest === "number" && typeof first === "number" && first !== 0
														? ((latest - first) / first) * 100
														: null;
												const path = buildSparklinePath(values);

												return (
													<div key={coin.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
														<p className="text-sm font-semibold text-slate-900">{coin.label}</p>
														<p className="mt-1 text-lg font-semibold text-slate-900">
															{typeof latest === "number"
																? `$${latest.toLocaleString(undefined, {
																	maximumFractionDigits: latest > 1 ? 2 : 4,
																})}`
																: "N/A"}
														</p>
														<p
															className={`text-xs font-medium ${
																typeof change === "number" && change >= 0 ? "text-emerald-600" : "text-rose-600"
															}`}
														>
															{typeof change === "number" ? `${change.toFixed(2)}% (24h)` : "N/A"}
														</p>
														<svg viewBox="0 0 240 72" className="mt-3 h-16 w-full">
															{path ? (
																<path
																	d={path}
																	fill="none"
																	stroke={typeof change === "number" && change >= 0 ? "#059669" : "#dc2626"}
																	strokeWidth="2"
																	strokeLinecap="round"
																/>
															) : null}
														</svg>
													</div>
												);
											})}
										</div>
									) : (
										<p className="text-sm text-rose-600">Live market charts are temporarily unavailable.</p>
									)}
								</>
							)}
						</section>
					</div>

					<section className="rounded-2xl bg-slate-900 p-8 text-white">
						<h3 className="text-2xl font-semibold">Begin your crypto journey today</h3>
						<p className="mt-2 text-slate-300">Open an account in minutes.</p>
					</section>

					<section className="rounded-2xl border border-slate-200 p-8">
						<div className="grid gap-6 md:grid-cols-12 md:items-center">
							<div className="md:col-span-7">
								<h3 className="text-2xl font-semibold text-slate-900">
									Powerful tools, built for advanced traders.
								</h3>
								<p className="mt-3 text-slate-600">
									Powerful analytics with Coinbase safety and security deliver a premium trading
									experience. Tap into advanced charting capabilities, realtime order books, and deep
									liquidity across hundreds of markets.
								</p>
								<Link
									to="/signin"
									className="mt-6 inline-flex rounded-xl bg-black px-5 py-3 font-medium text-white hover:bg-slate-900"
								>
									Begin trading
								</Link>
							</div>
							<div className="md:col-span-5">
								<img
									src="https://images.weserv.nl/?url=theforexgeek.com/wp-content/uploads/2021/07/Exclusive-Markets-MT4-Trading-Platforms.jpg&w=1600&output=webp&q=100"
									alt="Advanced trading tools preview"
									className="h-full w-full rounded-2xl border border-slate-200 bg-slate-50 object-cover [image-rendering:auto] [filter:contrast(1.12)_saturate(1.08)_brightness(1.03)]"
								/>
							</div>
						</div>
					</section>

					<section className="rounded-2xl border border-slate-200 bg-slate-50 p-8">
						<div className="grid gap-6 md:grid-cols-12 md:items-center">
							<div className="md:col-span-5">
								<img
									src="https://s3.envato.com/files/498768772/screenshot/10-created.png"
									alt="Coinbase One zero fees"
									className="mx-auto h-64 w-auto rounded-2xl border border-slate-200 bg-white object-contain md:h-72"
								/>
							</div>
							<div className="md:col-span-7">
								<p className="text-sm font-semibold uppercase tracking-wide text-blue-600">COINBASE ONE</p>
								<h3 className="mt-2 text-2xl font-semibold text-slate-900">No trading fees, extra rewards.</h3>
								<p className="mt-3 text-slate-600">
									Get more from crypto with one membership: no trading fees, enhanced rewards,
									priority support, and more.
								</p>
								<Link
									to="/signup"
									className="mt-6 inline-flex rounded-xl bg-black px-5 py-3 font-medium text-white hover:bg-slate-900"
								>
									Start free trial
								</Link>
							</div>
						</div>
					</section>

					<section className="rounded-2xl border border-slate-200 p-8">
						<div className="grid gap-6 md:grid-cols-12 md:items-center">
							<div className="md:col-span-7">
								<p className="text-sm font-semibold uppercase tracking-wide text-blue-600">BASE APP</p>
								<h3 className="mt-2 text-2xl font-semibold text-slate-900">
									Many ways to earn crypto with the Base App.
								</h3>
								<p className="mt-3 text-slate-600">
									An all-in-one app to trade, create, explore, and chat in one place.
								</p>
								<Link
									to="/learn"
									className="mt-6 inline-flex rounded-xl bg-black px-5 py-3 font-medium text-white hover:bg-slate-900"
								>
									Discover more
								</Link>
							</div>
							<div className="md:col-span-5">
								<img
									src="https://images.pexels.com/photos/6801874/pexels-photo-6801874.jpeg?auto=compress&cs=tinysrgb&w=1400"
									alt="Base App preview"
									className="h-full w-full rounded-2xl border border-slate-200 bg-slate-50 object-cover"
								/>
							</div>
						</div>
					</section>

					<section className="rounded-2xl border border-slate-200 p-8">
						<h3 className="text-2xl font-semibold text-slate-900">New to crypto? Learn the essentials</h3>
						<p className="mt-3 text-slate-600">
							Beginner guides, useful tips, and market updates for newcomers, seasoned
							investors, and everyone in between
						</p>
						<Link
							to="/learn"
							className="mt-6 inline-flex rounded-xl bg-black px-5 py-3 font-medium text-white hover:bg-slate-900"
						>
							Explore guides
						</Link>

						<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							<div className="space-y-2">
								<a
									href="https://www.coinbase.com/usdc"
									target="_blank"
									rel="noreferrer"
									className="block overflow-hidden rounded-2xl border border-slate-200"
								>
									<img
										src="https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=900"
										alt="USDC guide"
										className="h-44 w-full rounded-2xl object-cover"
									/>
								</a>
								<a
									href="https://www.coinbase.com/usdc"
									target="_blank"
									rel="noreferrer"
									className="text-sm text-blue-600 hover:underline"
								>
									Read about USDC: https://www.coinbase.com/usdc
								</a>
							</div>
							<div className="space-y-2">
								<a
									href="https://www.coinbase.com/learn/crypto-basics/can-crypto-really-replace-your-bank"
									target="_blank"
									rel="noreferrer"
									className="block overflow-hidden rounded-2xl border border-slate-200"
								>
									<img
										src="https://images.pexels.com/photos/6770610/pexels-photo-6770610.jpeg?auto=compress&cs=tinysrgb&w=900"
										alt="Crypto basics article"
										className="h-44 w-full rounded-2xl object-cover"
									/>
								</a>
								<a
									href="https://www.coinbase.com/learn/crypto-basics/can-crypto-really-replace-your-bank"
									target="_blank"
									rel="noreferrer"
									className="text-sm text-blue-600 hover:underline"
								>
									Crypto basics guide: https://www.coinbase.com/learn/crypto-basics/can-crypto-really-replace-your-bank
								</a>
							</div>
							<div className="space-y-2">
								<a
									href="https://www.coinbase.com/learn/tips-and-tutorials/dollar-cost-averaging"
									target="_blank"
									rel="noreferrer"
									className="block overflow-hidden rounded-2xl border border-slate-200"
								>
									<img
										src="https://images.pexels.com/photos/164527/pexels-photo-164527.jpeg?auto=compress&cs=tinysrgb&w=900"
										alt="Dollar cost averaging article"
										className="h-44 w-full rounded-2xl object-cover"
									/>
								</a>
								<a
									href="https://www.coinbase.com/learn/tips-and-tutorials/dollar-cost-averaging"
									target="_blank"
									rel="noreferrer"
									className="text-sm text-blue-600 hover:underline"
								>
									Dollar-cost averaging guide: https://www.coinbase.com/learn/tips-and-tutorials/dollar-cost-averaging
								</a>
							</div>
						</div>
					</section>

					<section className="relative overflow-hidden rounded-xl border border-slate-200 p-6">
						<div
							className="absolute inset-0 bg-cover bg-center"
							style={{
								backgroundImage:
									'url(https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=1200)',
							}}
						/>
						<div className="absolute inset-0 bg-slate-900/45" />
						<div className="relative">
							<h3 className="text-2xl font-semibold text-white">Take charge of your money</h3>
							<p className="mt-2 text-slate-100">Build your portfolio today and explore crypto</p>
							<Link
								to="/signup"
								className="mt-4 inline-flex rounded-xl bg-white px-5 py-3 font-medium text-slate-900 hover:bg-slate-100"
							>
								Sign up
							</Link>
						</div>
					</section>
				</div>

			</section>

			<section className="mt-10 space-y-3 border-t border-slate-200 pt-6 text-xs text-slate-500">
				<p align="center" font size="xs">DEX trading services are provided by Coinbase Bermuda Technologies Ltd.</p>
				<p align="center" font size="xs">
					Products and features may not be available in all regions. Information is for or informational purposes only, and is not 
					<p align="center" font size="xs">(i) an offer, or solicitation of an offer, to invest in, or to buy or sell, any interests or shares, or to participate in any investment or trading strategy or</p> 
					<p align="center" font size="xs">(ii) intended to provide accounting, legal, or tax advice, or investment recommendations. Trading cryptocurrency comes with risk.</p>
				</p>
			</section>
		</main>
	);
}
