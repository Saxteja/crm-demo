import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from '../navigation/TopBar';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="app-shell">
    <aside className="sidebar-panel">
      <Sidebar />
    </aside>

    <div className="main-panel">
      <header className="topbar">
        <TopBar />
      </header>

      <main className="content-panel">{children}</main>
      <footer className="app-attribution-footer">
        SwiftKart CRM — Powered by <strong>SoftIntellTech</strong>
      </footer>
    </div>
  </div>
);
