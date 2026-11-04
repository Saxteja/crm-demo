import React, { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { TopBar } from '../navigation/TopBar';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const content = document.querySelector('.content-panel');
    if (!content) return;
    const labelTables = () => {
      content.querySelectorAll<HTMLTableElement>('.table-shell table:not(.permissions-table)').forEach((table) => {
        const labels = Array.from(table.querySelectorAll('thead th')).map((cell) => cell.textContent?.trim() ?? '');
        table.querySelectorAll('tbody tr').forEach((row) => {
          Array.from(row.querySelectorAll('td')).forEach((cell, index) => {
            if (labels[index]) cell.dataset.label = labels[index];
          });
        });
      });
    };
    labelTables();
    const observer = new MutationObserver(labelTables);
    observer.observe(content, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [drawerOpen]);

  return (
    <div className="app-shell">
      <aside className="sidebar-panel"><Sidebar /></aside>
      {drawerOpen && <button className="drawer-backdrop" aria-label="Close navigation" onClick={() => setDrawerOpen(false)} />}
      <aside className={`mobile-drawer ${drawerOpen ? 'is-open' : ''}`} aria-label="Navigation drawer" aria-hidden={!drawerOpen}>
        <div className="mobile-drawer-head"><strong>SwiftKart menu</strong><button className="icon-button" type="button" aria-label="Close navigation" onClick={() => setDrawerOpen(false)}><X size={18} /></button></div>
        <Sidebar onNavigate={() => setDrawerOpen(false)} />
      </aside>

      <div className="main-panel">
        <header className="topbar">
          <button className="icon-button mobile-menu-button" type="button" aria-label="Open navigation" aria-expanded={drawerOpen} onClick={() => setDrawerOpen(true)}><Menu size={20} /></button>
          <TopBar />
        </header>
        <main className="content-panel">{children}</main>
        <footer className="app-attribution-footer">SwiftKart CRM — Powered by <strong>SoftIntellTech</strong></footer>
      </div>
    </div>
  );
};
