import { Link } from 'react-router-dom'
import FeaturedGuideCard from '../components/crypto/FeaturedGuideCard'
import LearningPathCard from '../components/crypto/LearningPathCard'
import { featuredGuides, learningPaths } from '../data/learnContent'

const quickTerms = [
  ['Market cap', 'The total value of a coin in circulation.'],
  ['Volatility', 'How quickly and sharply prices move up or down.'],
  ['Liquidity', 'How easily an asset can be bought or sold without big price impact.'],
  ['Cold wallet', 'An offline wallet used for stronger long-term storage security.']
]

const faqs = [
  {
    question: 'Do I need a lot of money to start?',
    answer: 'No. You can begin with small amounts and focus first on learning habits and risk control.'
  },
  {
    question: 'How often should I check prices?',
    answer: 'Build a routine that fits your plan. Long-term investors usually avoid constant chart checking.'
  },
  {
    question: 'What should I learn first?',
    answer: 'Start with wallets, security, and market basics before moving to advanced topics.'
  }
]

const popularReads = [
  { tag: 'Starter', title: 'What makes crypto different from traditional money?' },
  { tag: 'Beginner', title: 'How to build steady crypto rewards over time' },
  { tag: 'Wallets', title: 'How to safely move coins into your own wallet' },
  { tag: 'Taxes', title: 'Simple crypto tax records you should keep' },
  { tag: 'Security', title: '5 habits to protect your account from scams' }
]

const learnTracks = [
  {
    icon: 'B',
    title: 'Crypto basics',
    href: 'https://www.investopedia.com/terms/c/cryptocurrency.asp'
  },
  {
    icon: 'T',
    title: 'Tips and tutorials',
    href: 'https://academy.binance.com/en'
  },
  {
    icon: 'A',
    title: 'Advanced trading',
    href: 'https://www.babypips.com/learn/forex/technical-analysis'
  },
  {
    icon: 'F',
    title: 'Futures',
    href: 'https://www.cmegroup.com/education/courses/introduction-to-futures.html'
  }
]

export default function Learn() {
  return (
    <main className="min-h-screen px-5 py-12 md:px-10 lg:px-16">
      <section className="rounded-2xl border border-blue-300 bg-gradient-to-r from-blue-600 to-blue-700 p-7 md:p-9">
        <p className="text-sm font-medium uppercase tracking-wide text-blue-100">Learn hub</p>
        <h1 className="mt-2 text-4xl font-semibold text-white md:text-5xl">Build your crypto knowledge</h1>
        <p className="mt-4 max-w-2xl text-blue-100">
          Step-by-step lessons, practical guides, and essential terms to help you make better decisions.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/signup"
            className="inline-flex items-center justify-center rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-900 hover:text-white"
          >
            Start learning
          </Link>
          <Link
            to="/explore"
            className="inline-flex items-center justify-center rounded-xl border border-blue-200 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Explore markets
          </Link>
        </div>
      </section>

      <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-[#05080f] p-6 md:p-9">
        <div className="grid items-center gap-8 md:grid-cols-[1fr_1.25fr]">
          <div className="relative mx-auto h-64 w-64 md:h-80 md:w-80">
            <div className="absolute inset-0 rounded-[2.5rem] bg-blue-600/15" />
            <div className="absolute left-10 top-10 h-28 w-28 rounded-full bg-blue-600" />
            <div className="absolute right-10 top-20 h-20 w-20 rounded-xl bg-blue-500" />
            <div className="absolute bottom-10 left-16 h-40 w-14 rounded-full bg-blue-700" />
            <div className="absolute bottom-12 right-14 h-28 w-12 rounded-full bg-blue-400" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">Extra benefits</p>
            <h2 className="mt-3 text-4xl font-semibold text-white md:text-5xl">But wait, there&apos;s more</h2>
            <p className="mt-4 text-lg text-slate-300">
              Your account lets you trade, earn, spend, send, and borrow. When you aren&apos;t trading,
              rewards can grow automatically by holding selected assets and staking supported tokens.
            </p>
            <p className="mt-5 text-sm text-slate-400">
              APYs when displayed are indicative and are not guaranteed. They may vary over time.
              Learn more about APY calculations.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 p-6 md:p-7">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold md:text-3xl">Featured guides</h2>
          <p className="text-sm text-slate-500">Fresh picks for beginners</p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {featuredGuides.map((guide) => (
            <FeaturedGuideCard key={guide.slug} guide={guide} />
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-slate-200 p-6 md:p-7">
          <h2 className="text-2xl font-semibold md:text-3xl">Learning paths</h2>
          <p className="mt-2 text-slate-600">Pick a track and progress at your own pace.</p>

          <div className="mt-5 space-y-4">
            {learningPaths.map((path) => (
              <LearningPathCard key={path.slug} path={path} />
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <section className="rounded-2xl border border-slate-200 p-6 md:p-7">
            <h2 className="text-xl font-semibold">Quick terms</h2>
            <dl className="mt-4 space-y-3">
              {quickTerms.map(([term, definition]) => (
                <div key={term} className="rounded-lg border border-slate-200 bg-white p-3">
                  <dt className="text-sm font-semibold text-slate-900">{term}</dt>
                  <dd className="mt-1 text-sm text-slate-600">{definition}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-2xl border border-slate-200 p-6 md:p-7">
            <h2 className="text-xl font-semibold">FAQ</h2>
            <div className="mt-4 space-y-4">
              {faqs.map((item) => (
                <article key={item.question}>
                  <h3 className="text-sm font-semibold text-slate-900">{item.question}</h3>
                  <p className="mt-1 text-sm text-slate-600">{item.answer}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 p-6 md:p-8">
        <div className="text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">Crypto questions, clarified</h2>
          <p className="mt-3 text-base text-slate-600 md:text-lg">
            Practical explainers, market context, and security-first lessons for every experience level.
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.35fr_1fr]">
          <article className="rounded-2xl border border-slate-200 bg-[#dce6e6] p-4">
            <img
              src="https://images.pexels.com/photos/7567550/pexels-photo-7567550.jpeg?auto=compress&cs=tinysrgb&w=1400"
              alt="Featured learn video"
              className="h-72 w-full rounded-xl object-cover md:h-96"
            />
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Featured lesson</p>
            <h3 className="mt-2 text-3xl font-semibold text-slate-900">When is a smart time to enter the market?</h3>
            <p className="mt-3 text-slate-700">
              Learn how long-term strategies like dollar-cost averaging can help you manage volatility.
            </p>
          </article>

          <aside>
            <h3 className="text-3xl font-semibold text-slate-900">Popular</h3>
            <div className="mt-4 space-y-5">
              {popularReads.map((item) => (
                <article key={item.title}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.tag}</p>
                  <h4 className="mt-1 text-2xl font-semibold leading-snug text-slate-900">{item.title}</h4>
                </article>
              ))}
            </div>
          </aside>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {learnTracks.map((track) => (
            <a
              key={track.title}
              href={track.href}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:border-blue-300 hover:bg-blue-50"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-base font-bold text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-700">
                {track.icon}
              </span>
              <div>
                <p className="text-base font-semibold text-slate-900">{track.title}</p>
                <p className="text-sm text-slate-500">See more</p>
              </div>
            </a>
          ))}
        </div>
      </section>
    </main>
  )
}
