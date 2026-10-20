import { Bell, Search } from 'lucide-react';

interface HeaderProps {
  eyebrow?: string;
  title?: string;
}

export function Header({
  eyebrow = 'Document Generator',
  title = 'Contracts workspace',
}: HeaderProps) {
  return (
    <header className="header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
      </div>
      <div className="headerActions">
        <button className="iconButton" aria-label="Search">
          <Search size={18} />
        </button>
        <button className="iconButton" aria-label="Notifications">
          <Bell size={18} />
        </button>
      </div>
    </header>
  );
}
