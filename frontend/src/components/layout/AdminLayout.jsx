import SidebarLayout from './SidebarLayout'
import {
  HiHome,
  HiClipboardCheck,
  HiSpeakerphone,
  HiChartBar,
  HiOfficeBuilding,
  HiUsers,
  HiClipboardList,
  HiUserCircle
} from 'react-icons/hi'

const navItems = [
  { to: '/admin', icon: HiHome, label: 'Dashboard', end: true },
  { to: '/admin/requirements', icon: HiClipboardCheck, label: 'Requirements' },
  { to: '/admin/announcements', icon: HiSpeakerphone, label: 'Announcements' },
  { to: '/admin/analytics', icon: HiChartBar, label: 'Analytics' },
  { to: '/admin/barangays', icon: HiOfficeBuilding, label: 'Barangays' },
  { to: '/admin/users', icon: HiUsers, label: 'Users' },
  { to: '/admin/audit-logs', icon: HiClipboardList, label: 'Audit Logs' },
]

export default function AdminLayout() {
  return (
    <SidebarLayout
      navItems={navItems}
      roleTitle="DILG Silang"
      roleSubtitle="Administrator"
      badgeColor="badge-primary"
      accentColor="bg-primary"
    />
  )
}
