import React from 'react';
import { NavLink } from 'react-router-dom';
import { Info, ShieldCheck } from 'lucide-react';
import { modules } from '../../modules/catalog';
import { roleNavigation } from '../../config/roleAccess';
import { useStore } from '../../store';

export const Sidebar: React.FC<{ onNavigate?: () => void }> = ({ onNavigate }) => {
  const { role, permissions } = useStore();
  const roleGroups = roleNavigation[role]
    .map((group) => ({
      ...group,
      modules: group.modules.filter((key) => permissions[role][key].view),
    }))
    .filter((group) => group.modules.length > 0);
  const groupedModules = new Set(roleGroups.flatMap((group) => group.modules));
  const additionalModules = modules
    .filter((module) => permissions[role][module.key].view && !groupedModules.has(module.key))
    .map((module) => module.key);
  if (additionalModules.length > 0) {
    roleGroups.push({ label: 'Additional access', modules: additionalModules });
  }

  return (
    <div className="sidebar-inner">
      <div className="brand-block">
        <div className="brand-mark">S</div>
        <div>
          <div className="brand-name">SwiftKart</div>
          <div className="brand-subtitle">E-commerce</div>
          <div className="brand-attribution">Powered by SoftIntellTech</div>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label={`${role} CRM navigation`}>
        {roleGroups.map((group) => (
          <section className="nav-group" key={group.label}>
            <h2 className="nav-group-label">{group.label}</h2>
            {group.modules.map((key) => {
              const item = modules.find((module) => module.key === key);
              if (!item) return null;
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onNavigate}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon size={16} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </section>
        ))}

        {role === 'Super Admin' && (
          <section className="nav-group">
            <h2 className="nav-group-label">Administration</h2>
            <NavLink
              to="/permissions"
              onClick={onNavigate}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <ShieldCheck size={16} />
              <span>Role Permissions</span>
            </NavLink>
          </section>
        )}
        <section className="nav-group platform-nav-group">
          <h2 className="nav-group-label">Platform</h2>
          <NavLink
            to="/about"
            onClick={onNavigate}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Info size={16} />
            <span>About SoftIntellTech</span>
          </NavLink>
        </section>
      </nav>

      <section className="vendor-branding" aria-label="CRM platform provider">
        <div className="vendor-branding-divider" />
        <div className="vendor-branding-identity">
          <span className="vendor-brand-mark" aria-hidden="true">SI</span>
          <span className="vendor-brand-copy">
            <strong>SoftIntellTech</strong>
            <span>CRM Platform Provider</span>
          </span>
        </div>
      </section>
    </div>
  );
};
