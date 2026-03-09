import { Link } from 'react-router-dom'

export default function LearningPathCard({ path }) {
  return (
    <Link
      to={`/learn/path/${path.slug}`}
      className="block rounded-xl border border-slate-200 bg-slate-50 p-5 transition hover:border-slate-300 hover:bg-white"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{path.title}</h3>
          <p className="mt-1 text-sm text-slate-600">{path.description}</p>
        </div>
        <span className="shrink-0 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-600">
          {path.lessons} lessons
        </span>
      </div>
    </Link>
  )
}
