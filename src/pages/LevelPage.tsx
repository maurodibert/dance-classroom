import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getGenreById } from '../data/genres'
import type { Level, Step } from '../data/types'
import { StepPlayer } from '../remotion/StepPlayer'
import { useProgress } from '../hooks/useProgress'

const levelColors: Record<Level, { accent: string; badge: string; bar: string; border: string }> = {
  inicial: {
    accent: 'text-emerald-400',
    badge: 'bg-emerald-950 text-emerald-400 border border-emerald-900',
    bar: 'bg-emerald-500',
    border: 'border-emerald-900/60',
  },
  intermedio: {
    accent: 'text-amber-400',
    badge: 'bg-amber-950 text-amber-400 border border-amber-900',
    bar: 'bg-amber-500',
    border: 'border-amber-900/60',
  },
  avanzado: {
    accent: 'text-rose-400',
    badge: 'bg-rose-950 text-rose-400 border border-rose-900',
    bar: 'bg-rose-500',
    border: 'border-rose-900/60',
  },
}

function StepCard({
  step,
  index,
  total,
  accent,
  borderColor,
  isExpanded,
  onToggle,
  isKnown,
  onToggleKnown,
}: {
  step: Step
  index: number
  total: number
  accent: string
  borderColor: string
  isExpanded: boolean
  onToggle: () => void
  isKnown: boolean
  onToggleKnown: () => void
}) {
  return (
    <div
      className={`border rounded-2xl transition-all duration-300 ${
        isExpanded
          ? `${borderColor} bg-gray-900`
          : isKnown
          ? 'border-emerald-900/50 bg-emerald-950/20 hover:bg-emerald-950/30'
          : 'border-gray-800/60 bg-gray-900/50 hover:bg-gray-900 hover:border-gray-700'
      }`}
      style={{ animation: 'card-enter 0.4s ease-out both', animationDelay: `${index * 55}ms` }}
    >
      <button className="w-full text-left px-5 py-4" onClick={onToggle}>
        <div className="flex items-center gap-3">
          {/* Badge — clickable as "mark known" toggle in beta mode */}
          <div
            onClick={(e) => { e.stopPropagation(); onToggleKnown() }}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 ${
              isKnown
                ? 'bg-emerald-500 text-white shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                : isExpanded
                ? `${accent} bg-gray-800`
                : 'text-gray-700 bg-gray-800'
            }`}
            title={isKnown ? 'Marcar como no conocido' : 'Ya lo sé'}
          >
            {isKnown ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              index + 1
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className={`font-medium transition-colors duration-200 ${
              isKnown ? 'text-emerald-300' : isExpanded ? 'text-white' : 'text-gray-300'
            }`}>
              {step.name}
            </p>
            {!isExpanded && (
              <p className="text-gray-600 text-xs truncate mt-0.5">{step.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-gray-800 text-xs tabular-nums">{index + 1}/{total}</span>
            <svg
              className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="px-5 pb-5" style={{ animation: 'fade-in 0.25s ease-out both' }}>
          <div className="ml-11">
            <p className="text-gray-300 text-sm leading-relaxed">{step.description}</p>

            {step.id === 'bach-i-11' && (
              <div className="mt-4 rounded-xl overflow-hidden">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">Animación esquemática</p>
                <StepPlayer />
              </div>
            )}

            {step.videoUrl && (
              <div className="mt-4 rounded-xl overflow-hidden" style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                <iframe
                  src={step.videoUrl}
                  title={step.name}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  frameBorder="0"
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                />
              </div>
            )}

            {step.tips && step.tips.length > 0 && (
              <div className="mt-4">
                <p className={`text-xs font-semibold uppercase tracking-wider mb-2.5 ${accent}`}>
                  Consejos
                </p>
                <ul className="space-y-2">
                  {step.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                      <span className="mt-0.5 shrink-0 text-gray-700">·</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function LevelPage() {
  const { id, level } = useParams<{ id: string; level: string }>()
  const navigate = useNavigate()
  const [expandedStep, setExpandedStep] = useState<string | null>(null)
  const { isKnown, toggleKnown, knownIds } = useProgress()

  const genre = getGenreById(id ?? '')
  const courseLevel = genre?.levels.find((l) => l.level === level)
  const colors = levelColors[(level as Level) ?? 'inicial']

  if (!genre || !courseLevel) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center" style={{ animation: 'fade-in 0.4s ease-out both' }}>
          <p className="text-2xl mb-4 text-gray-400">Nivel no encontrado</p>
          <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-300 underline text-sm transition-colors">
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  const currentLevelIndex = genre.levels.findIndex((l) => l.level === level)
  const prevLevel = genre.levels[currentLevelIndex - 1]
  const nextLevel = genre.levels[currentLevelIndex + 1]

  const barWidth = currentLevelIndex === 0 ? 'w-1/3' : currentLevelIndex === 1 ? 'w-2/3' : 'w-full'

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header
        className="px-4 pt-6 pb-6 max-w-2xl mx-auto"
        style={{ animation: 'hero-enter 0.5s ease-out both' }}
      >
        <button
          onClick={() => navigate(`/genre/${genre.id}`)}
          className="flex items-center gap-1.5 text-gray-600 hover:text-gray-300 text-sm mb-7 transition-colors duration-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {genre.name}
        </button>

        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{genre.emoji}</span>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{genre.name}</h1>
              <span className={`text-xs px-2.5 py-0.5 rounded-full capitalize font-medium ${colors.badge}`}>
                {level}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-0.5">{courseLevel.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 mt-5">
          <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${colors.bar} transition-all duration-500`}
              style={{ width: barWidth === 'w-1/3' ? '33%' : barWidth === 'w-2/3' ? '66%' : '100%' }}
            />
          </div>
          <span className="text-xs text-gray-600 shrink-0 tabular-nums">
            {currentLevelIndex + 1} / {genre.levels.length}
          </span>
        </div>

        {/* Progress of known steps in this level */}
        {(() => {
          const levelKnown = courseLevel.steps.filter(s => knownIds.has(s.id)).length
          const total = courseLevel.steps.length
          const pct = total > 0 ? (levelKnown / total) * 100 : 0
          return (
            <div className="mt-3 flex items-center gap-2.5" style={{ animation: 'fade-in 0.4s ease-out both' }}>
              <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs text-emerald-600 shrink-0 tabular-nums font-medium">
                {levelKnown}/{total} conocidos
              </span>
            </div>
          )
        })()}
      </header>

      <main className="px-4 pb-8 max-w-2xl mx-auto space-y-2.5">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-5">
          {courseLevel.steps.length} pasos en orden
        </p>

        {courseLevel.steps.map((step, index) => (
          <StepCard
            key={step.id}
            step={step}
            index={index}
            total={courseLevel.steps.length}
            accent={colors.accent}
            borderColor={colors.border}
            isExpanded={expandedStep === step.id}
            onToggle={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
            isKnown={isKnown(step.id)}
            onToggleKnown={() => toggleKnown(step.id)}
          />
        ))}
      </main>

      <footer className="px-4 pb-14 pt-4 max-w-2xl mx-auto">
        <div
          className="flex gap-3"
          style={{ animation: 'fade-in 0.5s ease-out 0.4s both' }}
        >
          {prevLevel && (
            <button
              onClick={() => navigate(`/genre/${genre.id}/level/${prevLevel.level}`)}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 rounded-xl py-3 text-sm text-gray-500 hover:text-gray-300 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="capitalize">{prevLevel.level}</span>
            </button>
          )}
          {nextLevel && (
            <button
              onClick={() => navigate(`/genre/${genre.id}/level/${nextLevel.level}`)}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 rounded-xl py-3 text-sm text-gray-500 hover:text-gray-300 transition-all duration-200"
            >
              <span className="capitalize">{nextLevel.level}</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </footer>
    </div>
  )
}
