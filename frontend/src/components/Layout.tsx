import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Classes', end: true },
  { to: '/upload', label: 'Data Import', end: false },
  { to: '/reports/workload', label: 'Workload Report', end: false },
]

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-56 shrink-0 bg-indigo-800 text-white flex flex-col">
        <div className="px-5 py-6 text-lg font-bold tracking-wide border-b border-indigo-700">
          School Admin
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `block rounded px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-indigo-100 hover:bg-indigo-700'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
