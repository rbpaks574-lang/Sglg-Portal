import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { adminAPI } from '../../services/api'
import { format } from 'date-fns'
import {
  HiMenuAlt2,
  HiChevronLeft,
  HiChevronRight,
  HiLogout,
  HiBell,
  HiX,
  HiUserCircle
} from 'react-icons/hi'

export default function SidebarLayout({
  navItems = [],
  roleTitle = 'SGLG Portal',
  roleSubtitle = 'Portal',
  badgeColor = 'badge-primary',
  accentColor = 'bg-primary'
}) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Collapsed state persisted in localStorage
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sglg_sidebar_collapsed')
    return saved === 'true'
  })

  // Mobile sidebar drawer open/close
  const [mobileOpen, setMobileOpen] = useState(false)

  // Announcements notification state
  const [announcements, setAnnouncements] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Fetch announcements to determine unread count
    const fetchAnnouncements = async () => {
      try {
        const res = await adminAPI.announcements()
        const data = res.data.data || res.data
        setAnnouncements(data.slice(0, 5)) // Keep top 5 for dropdown
        
        const lastRead = localStorage.getItem('sglg_last_announcement_time')
        if (!lastRead) {
          setUnreadCount(data.length)
        } else {
          const lastReadTime = new Date(lastRead).getTime()
          const unread = data.filter(a => new Date(a.created_at).getTime() > lastReadTime)
          setUnreadCount(unread.length)
        }
      } catch (err) {
        console.error('Failed to fetch announcements for bell', err)
      }
    }

    fetchAnnouncements()

    const handleRead = () => setUnreadCount(0)
    window.addEventListener('sglg_announcements_read', handleRead)
    return () => window.removeEventListener('sglg_announcements_read', handleRead)
  }, [])

  useEffect(() => {
    localStorage.setItem('sglg_sidebar_collapsed', collapsed)
  }, [collapsed])

  // Close mobile drawer when route changes
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  // Get active item title for topbar
  const currentNav = navItems.find(item =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  )

  return (
    <div className="min-h-screen bg-base-200 flex">
      {/* ─── Mobile Backdrop Overlay ────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ─── Sidebar (Desktop & Mobile Drawer) ──────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-base-100 border-r border-base-300 shadow-md transition-all duration-300 ease-in-out
          ${collapsed ? 'lg:w-20' : 'lg:w-64'}
          ${mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Sidebar Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-base-300 flex-shrink-0 bg-base-100">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className={`w-10 h-10 rounded-xl ${accentColor} text-primary-content flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-sm`}>
              {roleTitle.charAt(0)}
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="min-w-0 transition-opacity duration-200">
                <h2 className="font-bold text-base leading-tight truncate text-base-content">
                  SGLG Portal
                </h2>
                <p className="text-xs text-base-content/60 font-medium truncate">
                  {roleSubtitle}
                </p>
              </div>
            )}
          </div>

          {/* Close button on Mobile */}
          <button
            type="button"
            className="btn btn-ghost btn-xs btn-square lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-4 px-2.5 overflow-y-auto space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={collapsed && !mobileOpen ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-sm transition-all duration-150 group relative
                ${isActive
                  ? 'bg-primary text-primary-content font-bold shadow-sm'
                  : 'text-base-content/70 hover:bg-base-200 hover:text-base-content'
                }
                ${collapsed && !mobileOpen ? 'justify-center px-2' : ''}
                `
              }
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110`} />
              
              {(!collapsed || mobileOpen) && (
                <span className="truncate flex-1">{item.label}</span>
              )}

              {/* Tooltip on mini collapsed sidebar */}
              {collapsed && !mobileOpen && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-neutral text-neutral-content text-xs font-semibold rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50 whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </NavLink>
          ))}
        </div>

      </aside>

      {/* ─── Main Content Layout Container ───────────────────────────────── */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out
          ${collapsed ? 'lg:pl-20' : 'lg:pl-64'}
        `}
      >
        {/* Top Navbar */}
        <header className="h-16 bg-base-100 border-b border-base-300 sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger toggle */}
            <button
              type="button"
              className="btn btn-ghost btn-sm btn-square lg:hidden text-base-content"
              onClick={() => setMobileOpen(!mobileOpen)}
              title="Open Navigation"
            >
              <HiMenuAlt2 className="w-6 h-6" />
            </button>

            {/* Desktop Collapse Icon Toggle in Topbar */}
            <button
              type="button"
              className="btn btn-ghost btn-sm btn-square hidden lg:flex text-base-content/70 hover:text-base-content"
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <HiMenuAlt2 className="w-5 h-5" />
            </button>

            <div className="hidden sm:block">
              <h2 className="font-bold text-lg text-base-content leading-tight">
                {currentNav?.label || roleTitle}
              </h2>
            </div>
          </div>

          {/* Topbar Right Controls */}
          <div className="flex items-center gap-2">
            <span className={`badge ${badgeColor} font-bold text-xs uppercase px-2.5 py-2.5 hidden sm:inline-flex`}>
              {roleSubtitle}
            </span>

            {/* Notifications Indicator */}
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-sm btn-circle" title="Notifications">
                <div className="indicator">
                  <HiBell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="indicator-item badge badge-error badge-xs w-2 h-2 p-0"></span>
                  )}
                </div>
              </label>
              <ul tabIndex={0} className="dropdown-content menu p-0 shadow-lg bg-base-100 text-base-content rounded-xl w-[85vw] sm:w-80 mt-2 border border-base-300 overflow-hidden">
                <li className="menu-title px-4 py-3 bg-base-200/50 flex flex-row items-center justify-between border-b border-base-300">
                  <span className="font-bold text-sm text-base-content">Notifications</span>
                  {unreadCount > 0 && <span className="badge badge-error badge-sm">{unreadCount} New</span>}
                </li>
                <div className="max-h-[60vh] overflow-y-auto">
                  {announcements.length === 0 ? (
                    <li className="p-4 text-center text-xs text-base-content/50">No recent announcements</li>
                  ) : (
                    announcements.map(a => (
                      <li key={a.id}>
                        <Link 
                          to={`/${user?.role === 'admin' ? 'admin' : user?.role}/announcements`}
                          className="px-4 py-3 border-b border-base-200/50 hover:bg-base-200 flex flex-col gap-1 items-start"
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="font-semibold text-sm truncate pr-2">{a.title}</span>
                            <span className="text-[10px] text-base-content/40 whitespace-nowrap">
                              {format(new Date(a.created_at), 'MMM d')}
                            </span>
                          </div>
                          <span className="text-xs text-base-content/60 line-clamp-2 w-full leading-relaxed">
                            {a.content}
                          </span>
                        </Link>
                      </li>
                    ))
                  )}
                </div>
                <li className="bg-base-200/50 border-t border-base-300">
                  <Link 
                    to={`/${user?.role === 'admin' ? 'admin' : user?.role}/announcements`}
                    className="justify-center text-primary font-semibold text-xs py-3"
                  >
                    View All Announcements
                  </Link>
                </li>
              </ul>
            </div>

            {/* User Dropdown */}
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-sm gap-2 pl-2 pr-3">
                <div className="avatar placeholder">
                  <div className="bg-primary text-primary-content rounded-full w-7">
                    <span className="text-xs font-bold">{user?.name?.charAt(0)}</span>
                  </div>
                </div>
                <span className="hidden md:inline text-xs font-semibold max-w-[120px] truncate">
                  {user?.name}
                </span>
              </label>
              <ul tabIndex={0} className="dropdown-content menu p-2 shadow-lg bg-base-100 text-base-content rounded-xl w-56 mt-2 border border-base-300">
                <li className="menu-title px-3 py-2">
                  <p className="font-bold text-sm text-base-content">{user?.name}</p>
                  <p className="text-xs text-base-content/50">{user?.email}</p>
                </li>
                <div className="divider my-1"></div>
                {user?.role === 'barangay' && (
                  <li>
                    <NavLink to="profile" className="font-medium">
                      <HiUserCircle className="w-4 h-4 text-primary" /> My Profile
                    </NavLink>
                  </li>
                )}
                <li>
                  <button onClick={handleLogout} className="text-error font-medium">
                    <HiLogout className="w-4 h-4" /> Sign Out
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
