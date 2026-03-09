import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { signUpWithEmail } from '../api/auth'

export default function SignUp() {
  const [searchParams] = useSearchParams()
  const [accountType, setAccountType] = useState(() => {
    const queryType = String(searchParams.get('account') || 'personal').toLowerCase()
    return ['business', 'developer'].includes(queryType) ? queryType : 'personal'
  })
  const [step, setStep] = useState('choose')
  const [email, setEmail] = useState('')
  const [organization, setOrganization] = useState('')
  const [organizationRole, setOrganizationRole] = useState('')
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
    if (!email.trim()) {
      setStatusMessage('Please enter your email address.')
      return
    }

    if (requiresOrganization && !organization.trim()) {
      setStatusMessage('Please enter your organization name.')
      return
    }

    if (requiresOrganizationRole && !organizationRole.trim()) {
      setStatusMessage('Please enter your role in the organization.')
      return
    }

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
      const result = await signUpWithEmail({
        email,
        password,
        name: requiresOrganization
          ? requiresOrganizationRole
            ? `${organization.trim()} - ${organizationRole.trim()}`
            : organization.trim()
          : '',
      })
      setStatusMessage(result?.message || 'Account created successfully.')
    } catch (error) {
      setStatusMessage(error?.message || 'Unable to create account right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#05080f] px-4 py-6 text-white md:px-6 lg:px-8">
      <Link to="/" aria-label="Go to home" className="inline-flex items-center">
        <img
          src="https://th.bing.com/th/id/OIP.8zoJ7gePbR2l782-2jBkzQHaHa?w=200&h=200&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3"
          alt="Coinbase"
          className="h-9 w-9 rounded-full"
        />
      </Link>

      <section className="mx-auto mt-12 w-full max-w-md md:mt-16">
        {step === 'choose' ? (
          <>
            <h1 className="text-3xl font-semibold tracking-tight">Create your account</h1>
            <p className="mt-3 text-base leading-7 text-slate-300">
              Choose the account type that best fits your goals.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => chooseAccount('personal')}
                className="flex w-full items-center gap-4 rounded-2xl border border-blue-500/60 bg-blue-950/70 p-4 text-left text-white transition hover:bg-blue-900/80"
              >
                <img
                  src="https://tse2.mm.bing.net/th/id/OIP.a9zO-lmahnvAzXA7hDWM5QHaHa?pid=ImgDet&w=179&h=179&c=7&dpr=1.3&o=7&rm=3"
                  alt="Personal account"
                  className="h-10 w-10 rounded-full border border-blue-500"
                />
                <div>
                  <p className="text-base font-semibold">Personal</p>
                  <p className="mt-1 text-xs text-slate-300">For individuals buying, selling, and managing crypto.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => chooseAccount('business')}
                className="flex w-full items-center gap-4 rounded-2xl border border-blue-500/60 bg-blue-950/70 p-4 text-left text-white transition hover:bg-blue-900/80"
              >
                <img
                  src="https://tse1.mm.bing.net/th/id/OIP.RO3GhrprV70K6m6K3d1w7gAAAA?pid=ImgDet&w=92&h=97&c=7&dpr=1.3&o=7&rm=3"
                  alt="Business account"
                  className="h-10 w-10 rounded-full border border-blue-500"
                />
                <div>
                  <p className="text-base font-semibold">Business</p>
                  <p className="mt-1 text-xs text-slate-300">For companies, teams, and treasury management.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => chooseAccount('developer')}
                className="flex w-full items-center gap-4 rounded-2xl border border-blue-500/60 bg-blue-950/70 p-4 text-left text-white transition hover:bg-blue-900/80"
              >
                <img
                  src="https://tse1.mm.bing.net/th/id/OIP.V8S6ImuGgbTtKXutLzVFagAAAA?pid=ImgDet&w=85&h=85&c=7&o=7&rm=3"
                  alt="Developer account"
                  className="h-10 w-10 rounded-full border border-blue-500"
                />
                <div>
                  <p className="text-base font-semibold">Developers</p>
                  <p className="mt-1 text-xs text-slate-300">For developers integrating APIs and crypto tools.</p>
                </div>
              </button>
            </div>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => {
                setStep('choose')
                setStatusMessage('')
              }}
              className="mb-4 text-sm font-semibold text-[#3f6fe5] hover:underline"
            >
              Back
            </button>

            <h1 className="text-3xl font-semibold tracking-tight">{accountHeading}</h1>
            <p className="mt-3 text-base leading-7 text-slate-300">Access all that Coinbase has to offer with a single account.</p>

            {step === 'details' ? (
              <>
                <label htmlFor="email" className="mb-2 mt-7 block text-base font-semibold text-white">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Your email address"
                  className="w-full rounded-2xl border border-blue-500/60 bg-blue-950/60 px-4 py-3 text-base text-white outline-none ring-blue-400 placeholder:text-blue-200/70 focus:ring-2"
                />

                {requiresOrganization ? (
                  <>
                    <label htmlFor="organization" className="mb-2 mt-5 block text-base font-semibold text-white">
                      Which organization do you work for?
                    </label>
                    <input
                      id="organization"
                      type="text"
                      value={organization}
                      onChange={(event) => setOrganization(event.target.value)}
                      placeholder="Organization name"
                      className="w-full rounded-2xl border border-blue-500/60 bg-blue-950/60 px-4 py-3 text-base text-white outline-none ring-blue-400 placeholder:text-blue-200/70 focus:ring-2"
                    />

                    {requiresOrganizationRole ? (
                      <>
                        <label htmlFor="organization-role" className="mb-2 mt-5 block text-base font-semibold text-white">
                          What is your role in the organization?
                        </label>
                        <input
                          id="organization-role"
                          type="text"
                          value={organizationRole}
                          onChange={(event) => setOrganizationRole(event.target.value)}
                          placeholder="e.g. Backend Engineer"
                          className="w-full rounded-2xl border border-blue-500/60 bg-blue-950/60 px-4 py-3 text-base text-white outline-none ring-blue-400 placeholder:text-blue-200/70 focus:ring-2"
                        />
                      </>
                    ) : null}
                  </>
                ) : null}

                <button
                  type="button"
                  onClick={handleContinue}
                  className="mt-8 w-full rounded-full bg-[#3f6fe5] px-4 py-4 text-xl font-semibold text-[#020617] hover:bg-[#4e7bf0]"
                >
                  Continue
                </button>
              </>
            ) : (
              <>
                <p className="mb-2 mt-7 text-base font-semibold text-white">Email</p>
                <p className="mb-5 rounded-2xl border border-blue-500/60 bg-blue-950/60 px-4 py-3 text-base text-blue-100">{email}</p>

                {requiresOrganization ? (
                  <>
                    <p className="mb-2 text-base font-semibold text-white">Organization</p>
                    <p className="mb-5 rounded-2xl border border-blue-500/60 bg-blue-950/60 px-4 py-3 text-base text-blue-100">
                      {organization}
                    </p>

                    {requiresOrganizationRole ? (
                      <>
                        <p className="mb-2 text-base font-semibold text-white">Role</p>
                        <p className="mb-5 rounded-2xl border border-blue-500/60 bg-blue-950/60 px-4 py-3 text-base text-blue-100">
                          {organizationRole}
                        </p>
                      </>
                    ) : null}
                  </>
                ) : null}

                <label htmlFor="password" className="mb-2 block text-base font-semibold text-white">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Create a password"
                  className="w-full rounded-2xl border border-blue-500/60 bg-blue-950/60 px-4 py-3 text-base text-white outline-none ring-blue-400 placeholder:text-blue-200/70 focus:ring-2"
                />

                <label className="mt-5 flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={savePassword}
                    onChange={(event) => setSavePassword(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-600 bg-transparent text-blue-500 focus:ring-blue-500"
                  />
                  Save password
                </label>

                <label className="mt-2 flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-600 bg-transparent text-blue-500 focus:ring-blue-500"
                  />
                  Remember me
                </label>

                <button
                  type="button"
                  onClick={handleCreateAccount}
                  disabled={isSubmitting}
                  className="mt-6 w-full rounded-full bg-[#3f6fe5] px-4 py-4 text-xl font-semibold text-[#020617] hover:bg-[#4e7bf0]"
                >
                  {isSubmitting ? 'Creating account...' : 'Create account'}
                </button>
              </>
            )}
          </>
        )}

        {statusMessage ? <p className="mt-4 text-sm text-slate-300">{statusMessage}</p> : null}

        <p className="mt-6 text-lg text-white">
          Already have an account?{' '}
          <Link to="/signin" className="font-semibold text-[#3f6fe5] hover:underline">
            Sign in
          </Link>
        </p>

        <p className="mt-8 text-sm text-slate-500">
          By creating an account you certify that you are over the age of 18 and agree to our Privacy Policy and Cookie Policy.
        </p>
      </section>
    </main>
  )
}
