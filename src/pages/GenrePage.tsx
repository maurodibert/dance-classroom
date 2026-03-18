import { useNavigate, useParams } from 'react-router-dom'
import { getGenreById } from '../data/genres'
import type { Level } from '../data/types'

const levelColors: Record<Level, { bg: string; text: string; border: string; glow: string }> = {
  inicial: {
    bg: 'bg-emerald-950',
    text: 'text-emerald-400',
    border: 'border-emerald-900',
    glow: 'hover:border-emerald-800',
  },
  intermedio: {
    bg: 'bg-amber-950',
    text: 'text-amber-400',
    border: 'border-amber-900',
    glow: 'hover:border-amber-800',
  },
  avanzado: {
    bg: 'bg-rose-950',
    text: 'text-rose-400',
    border: 'border-rose-900',
    glow: 'hover:border-rose-800',
  },
}

const levelIcons: Record<Level, string> = {
  inicial: '🌱',
  intermedio: '🔥',
  avanzado: '⚡',
}

export default function GenrePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const genre = getGenreById(id ?? '')

  if (!genre) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center" style={{ animation: 'fade-in 0.4s ease-out both' }}>
          <p className="text-2xl mb-4 text-gray-400">Género no encontrado</p>
          <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-300 underline text-sm transition-colors">
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header
        className="px-4 pt-6 pb-8 max-w-2xl mx-auto"
        style={{ animation: 'hero-enter 0.5s ease-out both' }}
      >
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-gray-600 hover:text-gray-300 text-sm mb-7 transition-colors duration-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Todos los géneros
        </button>

        <div className="flex items-center gap-4 mb-2">
          <span className="text-5xl">{genre.emoji}</span>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{genre.name}</h1>
            <p className="text-gray-500 text-sm mt-0.5">{genre.tagline}</p>
          </div>
        </div>

        <div className="flex gap-4 mt-4 text-xs text-gray-600">
          <span>🌍 {genre.origin}</span>
          <span>🎵 {genre.tempo}</span>
        </div>
      </header>

      {/* Levels */}
      <main className="px-4 pb-16 max-w-2xl mx-auto space-y-3">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-5">
          Elegí tu nivel
        </p>

        {genre.levels.map((courseLevel, index) => {
          const colors = levelColors[courseLevel.level]
          return (
            <button
              key={courseLevel.level}
              onClick={() => navigate(`/genre/${genre.id}/level/${courseLevel.level}`)}
              className={`group w-full text-left ${colors.bg} border ${colors.border} ${colors.glow} rounded-2xl p-5 transition-all duration-300 active:scale-[0.98]`}
              style={{ animation: 'card-enter 0.45s ease-out both', animationDelay: `${index * 80}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xl">{levelIcons[courseLevel.level]}</span>
                    <span className={`text-lg font-semibold capitalize ${colors.text}`}>
                      {courseLevel.level}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {courseLevel.description}
                  </p>
                  <p className={`text-xs mt-2.5 ${colors.text} opacity-60`}>
                    {courseLevel.steps.length} pasos
                  </p>
                </div>
                <svg
                  className={`w-4 h-4 ${colors.text} opacity-40 group-hover:opacity-70 group-hover:translate-x-0.5 transition-all duration-200 mt-0.5 shrink-0`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          )
        })}
      </main>
    </div>
  )
}
