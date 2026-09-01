import SidebarLayout from './SidebarLayout'
import { HiHome, HiClipboardCheck, HiSpeakerphone } from 'react-icons/hi'

const navItems = [
  { to: '/checker', icon: HiHome, label: 'Dashboard', end: true },
  { to: '/checker/queue', icon: HiClipboardCheck, label: 'Review Queue' },
  { to: '/checker/announcements', icon: HiSpeakerphone, label: 'Announcements' },
]

export default function CheckerLayout() {
  return (
    <SidebarLayout
      navItems={navItems}
      roleTitle="DILG Checker"
      roleSubtitle="Document Reviewer"
      badgeColor="badge-secondary"
      accentColor="bg-secondary"
    />
  )
}
