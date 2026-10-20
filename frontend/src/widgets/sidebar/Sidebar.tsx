import Link from 'next/link';
import { FileText, Folder, LayoutDashboard, Settings, Users } from 'lucide-react';

const items = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Clients', href: '/', icon: Users },
  { label: 'Contracts', href: '/contracts', icon: FileText },
  { label: 'Templates', href: '/templates', icon: Folder },
  { label: 'Generated', href: '/generated', icon: Folder },
  { label: 'Settings', href: '/', icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">DG</div>
      <nav className="nav">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link key={item.label} className="navItem" href={item.href}>
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
