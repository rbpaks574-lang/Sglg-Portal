import SidebarLayout from './SidebarLayout'
import { HiHome, HiDocumentText, HiClipboardList, HiUserCircle, HiSpeakerphone } from 'react-icons/hi'

const navItems = [
  { to: '/barangay', icon: HiHome, label: 'Dashboard', end: true },
  { to: '/barangay/announcements', icon: HiSpeakerphone, label: 'Announcements' },
  { to: '/barangay/documents', icon: HiDocumentText, label: 'Required Documents' },
  { to: '/barangay/submissions', icon: HiClipboardList, label: 'My Submissions' },
  { to: '/barangay/profile', icon: HiUserCircle, label: 'My Profile' },
]

export default function BarangayLayout() {
  return (
    <SidebarLayout
      navItems={navItems}
      roleTitle="Barangay Submitter"
      roleSubtitle="Document Submission"
      badgeColor="badge-accent"
      accentColor="bg-accent"
    />
  )
}
