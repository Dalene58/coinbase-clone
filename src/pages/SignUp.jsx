import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { signUpWithEmail } from '../api/auth'
import { useAuth } from '../context/AuthContext'

export default function SignUp() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useAuth()

  const [accountType, setAccountType] = useState(() => {
    const queryType = String(searchParams.get('account') || 'personal').toLowerCase()
    return ['business', 'developer'].includes(queryType) ? queryType : 'personal'
  })

  const [step, setStep] = useState('choose')
  const [email, setEmail] = useState('')
  const [organization, setOrganization] = useState('')
  const [organizationRole, setOrganizationRole] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [savePassword, setSavePassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  const requiresOrganization = accountType !== 'personal'
  const requiresOrganizationRole = accountType === 'developer'

  const accountHeading =
    accountType === 'business'
      ? 'Create your business account'
      : accountType === 'developer'
      ? 'Create your developer account'
      : 'Create your personal account'

  const chooseAccount = (type) => {
    setAccountType(type)
    setStep('details')
    setStatusMessage('')
  }

  const handleContinue = () => {
    if (!email.trim()) return setStatusMessage('Please enter your email address.')
    if (!name.trim()) return setStatusMessage('Please enter your full name.')
    if (requiresOrganization && !organization.trim())
      return setStatusMessage('Please enter your organization name.')
    if (requiresOrganizationRole && !organizationRole.trim())
      return setStatusMessage('Please enter your role in the organization.')

    setStatusMessage('')
    setStep('password')
  }

  const handleCreateAccount = async () => {
    if (!password.trim()) {
      setStatusMessage('Please create a password with at least 8 characters.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await signUpWithEmail({
        email,
        password,
        name: requiresOrganization
          ? requiresOrganizationRole
            ? `${organization.trim()} - ${organizationRole.trim()}`
            : organization.trim()
          : name.trim(),
      })

      // ✅ CREATE USER OBJECT
      const userData = {
        name: requiresOrganization
          ? requiresOrganizationRole
            ? `${organization.trim()} - ${organizationRole.trim()}`
            : organization.trim()
          : name.trim(),
        email,
      }

      // ✅ SAVE GLOBAL STATE
      login(userData)

      // ✅ REDIRECT HOME
      navigate('/')

    } catch (error) {
      setStatusMessage(error?.message || 'Unable to create account right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#05080f] px-4 py-6 text-white md:px-6 lg:px-8">
      <Link to="/" className="inline-flex items-center">
        <img
          src="https://th.bing.com/th/id/OIP.8zoJ7gePbR2l782-2jBkzQHaHa?w=200&h=200&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3"
          alt="Coinbase"
          className="h-9 w-9 rounded-full"
        />
      </Link>

      <div className="mx-auto mt-8 max-w-md">
        <h1 className="text-3xl font-bold">{accountHeading}</h1>
        <p className="mt-2 text-sm text-slate-400">
          Already have a Coinbase account?{' '}
          <Link to="/signin" className="text-blue-400 hover:text-blue-300">
            Sign in
          </Link>
        </p>

        {step === 'choose' && (
          <div className="mt-8 space-y-4">
            <button
              onClick={() => chooseAccount('personal')}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 p-4 text-left hover:bg-slate-800 transition"
            >
              <h3 className="font-semibold">Personal</h3>
              <p className="mt-1 text-sm text-slate-400">
                Trade crypto and manage your portfolio
              </p>
            </button>
            <button
              onClick={() => chooseAccount('business')}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 p-4 text-left hover:bg-slate-800 transition"
            >
              <h3 className="font-semibold">Business</h3>
              <p className="mt-1 text-sm text-slate-400">
                Accept crypto payments and manage business finances
              </p>
            </button>
            <button
              onClick={() => chooseAccount('developer')}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 p-4 text-left hover:bg-slate-800 transition"
            >
              <h3 className="font-semibold">Developer</h3>
              <p className="mt-1 text-sm text-slate-400">
                Build crypto applications and access APIs
              </p>
            </button>
          </div>
        )}

        {step === 'details' && (
          <form className="mt-8 space-y-4" onSubmit={(e) => { e.preventDefault(); handleContinue(); }}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="name@example.com"
                required
              />
            </div>

            {!requiresOrganization ? (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-300">
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="John Doe"
                  required
                />
              </div>
            ) : (
              <>
                <div>
                  <label htmlFor="organization" className="block text-sm font-medium text-slate-300">
                    Organization name
                  </label>
                  <input
                    id="organization"
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Acme Corp"
                    required
                  />
                </div>

                {requiresOrganizationRole && (
                  <div>
                    <label htmlFor="organizationRole" className="block text-sm font-medium text-slate-300">
                      Your role
                    </label>
                    <input
                      id="organizationRole"
                      type="text"
                      value={organizationRole}
                      onChange={(e) => setOrganizationRole(e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Developer"
                      required
                    />
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 transition"
            >
              Continue
            </button>
          </form>
        )}

        {step === 'password' && (
          <form className="mt-8 space-y-4" onSubmit={(e) => { e.preventDefault(); handleCreateAccount(); }}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                Create password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Min. 8 characters"
                minLength={8}
                required
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={savePassword}
                  onChange={(e) => setSavePassword(e.target.checked)}
                  className="mr-2 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-300">Save password</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mr-2 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-300">Remember me for 30 days</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        )}

        {statusMessage && (
          <div className="mt-4 rounded-lg bg-red-900/50 border border-red-800 p-3">
            <p className="text-sm text-red-300">{statusMessage}</p>
          </div>
        )}
      </div>
    </main>
  )
}