import { Link } from 'react-router-dom'

export default function FeaturedGuideCard({ guide }) {
  return (
    <Link
      to={`/learn/${guide.slug}`}
      className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:bg-slate-50"
    >
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="rounded-full bg-slate-100 px-2.5 py-1">{guide.level}</span>
        <span>{guide.readTime}</span>
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{guide.title}</h3>
      <p className="mt-2 text-sm text-slate-600">{guide.summary}</p>
    </Link>
  )
}
