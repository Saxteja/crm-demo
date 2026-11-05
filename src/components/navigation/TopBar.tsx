import React, { useState } from 'react';
import { RefreshCcw, User } from 'lucide-react';
import { useStore, type Role } from '../../store';

const roles: Role[] = [
  'Super Admin',
  'Business Owner',
  'Branch Manager',
  'Operations Manager',
  'Sales Executive',
  'Consultant',
  'Documentation Executive',
  'Accounts Executive',
  'Student Support',
];

export const TopBar: React.FC = () => {
  const { role, setRole } = useStore();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleReset = () => {
    localStorage.removeItem('study-abroad-crm-demo-v1');
    window.location.reload();
  };

  return (
    <div className="topbar-content">
      <div>
        <p className="eyebrow">Study abroad consultancy</p>
        <h1>StudyBridge</h1>
      </div>

      <div className="toolbar-group">
        <button className="action-button secondary" type="button" onClick={handleReset}>
          <RefreshCcw size={14} />
          Reset demo
        </button>
        <div className="profile-menu-wrap">
          <button
            className="profile-button"
            type="button"
            aria-expanded={profileOpen}
            aria-haspopup="true"
            onClick={() => setProfileOpen((open) => !open)}
          >
            <span className="profile-avatar"><User size={16} /></span>
            <span className="profile-label"><strong>{role}</strong><small>Demo profile</small></span>
          </button>
          {profileOpen && (
            <div className="profile-popover">
              <p className="eyebrow">Switch demo persona</p>
              <label className="field">
                <span>Workspace role</span>
                <select value={role} onChange={(event) => setRole(event.target.value as Role)}>
                  {roles.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <p className="small-label">Role-specific navigation and permissions are simulated for this profile.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
