import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { signInWithGoogle } = useAuth()

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4">
      <div className="text-center w-full max-w-sm" style={{ animation: 'hero-enter 0.6s ease-out both' }}>

        <div className="text-6xl mb-5 select-none">💃</div>

        <h1 className="text-4xl font-bold tracking-tight mb-3">
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

        <p className="text-gray-500 text-sm max-w-xs mx-auto mb-10 leading-relaxed">
          Seguí tu progreso paso a paso, desde cualquier dispositivo.
        </p>

        <button
          onClick={signInWithGoogle}
          className="flex items-center gap-3 bg-white hover:bg-gray-100 active:scale-95 text-gray-900 font-medium px-6 py-3 rounded-xl transition-all duration-200 mx-auto shadow-lg shadow-black/20"
          style={{ animation: 'fade-in 0.5s ease-out 0.3s both' }}
        >
          {/* Google logo */}
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          Continuar con Google
        </button>

      </div>
    </div>
  )
}
