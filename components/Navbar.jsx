import React from 'react';
import { Activity, Layers, Info } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home', label: 'Dashboard', icon: Activity },
  { id: 'features', label: 'Features', icon: Layers },
  { id: 'how-it-works', label: 'How It Works', icon: Info },
];

export default function Navbar({ onPageChange, currentPage = 'home' }) {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="title-gradient">MediLink AI</h1>
          <p className="subtitle">
            Emergency healthcare coordination with biometric identification and AI triage
          </p>
        </div>

        <nav className="header-right">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = currentPage === id || (id === 'home' && currentPage === 'dashboard');
            return (
              <button
                key={id}
                type="button"
                className={`nav-button ${active ? 'active' : ''}`}
                onClick={() => onPageChange?.(id)}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
