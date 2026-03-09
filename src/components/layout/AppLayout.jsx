import { NavLink, useLocation } from 'react-router-dom'

export default function AppLayout({ children }) {
  const { pathname } = useLocation()
  const isAuthRoute = pathname === '/signin' || pathname.startsWith('/signup')

  if (isAuthRoute) {
    return <>{children}</>
  }

  const linkClassName = ({ isActive }) =>
    `text-sm font-medium ${isActive ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'}`

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200">
        <nav className="flex items-center gap-6 px-4 py-4 md:px-8 lg:px-12">
          <NavLink to="/" className="inline-flex items-center">
            <img
              src="https://tse4.mm.bing.net/th/id/OIP.3a8sw23WNe5ELWaJ_H2IkQAAAA?pid=ImgDet&w=202&h=202&c=7&dpr=1.1&o=7&rm=3"
              alt="KryptKhaos"
              className="h-8 w-8 rounded"
            />
          </NavLink>
          <NavLink
            to="/"
            className={({ isActive }) =>
              `inline-flex items-center gap-2 text-sm font-medium ${
                isActive ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'
              }`
            }
            end
          >
            Home
          </NavLink>
          <NavLink to="/explore" className={linkClassName}>
            Explore
          </NavLink>
          <NavLink to="/asset/bitcoin" className={linkClassName}>
            Asset Detail
          </NavLink>
          <NavLink to="/learn" className={linkClassName}>
            Learn
          </NavLink>
          <NavLink to="/signin" className={linkClassName}>
            Sign In
          </NavLink>
          <NavLink to="/signup" className={linkClassName}>
            Sign Up
          </NavLink>
        </nav>
      </header>

      {children}

      <footer className="mt-12 border-t border-slate-200">
        <div className="px-4 py-6 text-sm text-slate-500 md:px-8 lg:px-12">
          Your investments are safest with us.
        </div>
      </footer>
    </div>
  )
}
