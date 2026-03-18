import { useNavigate } from 'react-router-dom'
import { genres, availableGenreIds } from '../data/genres'

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <header
        className="pt-16 pb-10 px-4 text-center"
        style={{ animation: 'hero-enter 0.6s ease-out both' }}
      >
        <div className="text-6xl mb-5 select-none">💃</div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">
          <span
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #9ca3af 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Dance Classroom
          </span>
        </h1>
        <p className="text-gray-500 text-base max-w-xs mx-auto leading-relaxed">
          Elegí un género y seguí el camino paso a paso, desde cero hasta avanzado.
        </p>
      </header>

      {/* Genre list */}
      <main className="px-4 pb-20 max-w-2xl mx-auto">
        <p
          className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-5 text-center"
          style={{ animation: 'fade-in 0.5s ease-out 0.2s both' }}
        >
          Géneros
        </p>

        <div className="grid gap-3">
          {genres.map((genre, index) => {
            const isAvailable = availableGenreIds.includes(genre.id)
            const delay = `${index * 65}ms`

            if (isAvailable) {
              return (
                <button
                  key={genre.id}
                  onClick={() => navigate(`/genre/${genre.id}`)}
                  className="group w-full text-left bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 rounded-2xl p-5 transition-all duration-300 active:scale-[0.98]"
                  style={{ animation: 'card-enter 0.45s ease-out both', animationDelay: delay }}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-4xl transition-transform duration-300 group-hover:scale-110">
                      {genre.emoji}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xl font-semibold text-white">{genre.name}</span>
                        <span className="text-gray-600 text-xs shrink-0 tabular-nums">{genre.tempo}</span>
                      </div>
                      <p className="text-gray-400 text-sm mt-0.5">{genre.tagline}</p>
                      <p className="text-gray-700 text-xs mt-1">{genre.origin}</p>
                    </div>
                    <svg
                      className="w-4 h-4 text-gray-700 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all duration-200 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>

                  <div className="flex gap-2 mt-4">
                    {genre.levels.map((lvl) => (
                      <span
                        key={lvl.level}
                        className="text-xs px-2.5 py-1 rounded-full bg-gray-800 group-hover:bg-gray-700 text-gray-500 capitalize transition-colors duration-200"
                      >
                        {lvl.level}
                      </span>
                    ))}
                  </div>
                </button>
              )
            }

            return (
              <div
                key={genre.id}
                className="relative w-full bg-gray-900/30 border border-gray-800/40 rounded-2xl p-5 cursor-default select-none"
                style={{ animation: 'card-enter 0.45s ease-out both', animationDelay: delay }}
              >
                {/* Coming soon badge */}
                <div className="absolute top-4 right-4">
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-gray-800 text-gray-600 uppercase tracking-wider"
                    style={{ animation: 'pulse-soft 3s ease-in-out infinite', animationDelay: delay }}
                  >
                    Próximamente
                  </span>
                </div>

                <div className="flex items-center gap-4 opacity-35">
                  <span className="text-4xl">{genre.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-semibold text-white">{genre.name}</span>
                    </div>
                    <p className="text-gray-400 text-sm mt-0.5">{genre.tagline}</p>
                    <p className="text-gray-600 text-xs mt-1">{genre.origin}</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 opacity-25">
                  {genre.levels.map((lvl) => (
                    <span
                      key={lvl.level}
                      className="text-xs px-2.5 py-1 rounded-full bg-gray-800 text-gray-500 capitalize"
                    >
                      {lvl.level}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <p
          className="text-center text-gray-800 text-xs mt-10"
          style={{ animation: 'fade-in 0.5s ease-out 0.6s both' }}
        >
          Más géneros en camino · Tango · Swing · Forró
        </p>
      </main>
    </div>
  )
}
