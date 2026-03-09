import { Link, Navigate, useParams } from 'react-router-dom'
import { learningPaths } from '../data/learnContent'

export default function LearnPathDetail() {
  const { slug } = useParams()
  const path = learningPaths.find((item) => item.slug === slug)

  if (!path) {
    return <Navigate to="/learn" replace />
  }

  return (
    <main className="min-h-screen px-5 py-12 md:px-10 lg:px-16">
      <section className="rounded-2xl border border-slate-200 p-7 md:p-9">
        <Link
          to="/learn"
          className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Back to Learn
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span className="rounded-full bg-slate-100 px-2.5 py-1">Learning path</span>
          <span>{path.lessons} lessons</span>
        </div>

        <h1 className="mt-4 text-3xl font-semibold md:text-4xl">{path.title}</h1>
        <p className="mt-3 text-slate-600">{path.description}</p>

        <div className="mt-6 space-y-4 text-slate-700">
          {path.content.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>
    </main>
  )
}
