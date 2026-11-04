import React, { useState } from 'react';
import { Eye, Play, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { modules } from '../catalog';
import {
  useStore,
  type ModuleKey,
  type PermissionAction,
  type Role,
} from '../../store';

const roles: Role[] = [
  'Super Admin',
  'Business Owner',
  'Branch Manager',
  'Operations Manager',
  'Sales Executive',
  'Consultant',
  'Documentation Executive',
  'Accounts Executive',
  'Customer Support',
];

const permissionActions: { key: PermissionAction; label: string }[] = [
  { key: 'view', label: 'View' },
  { key: 'create', label: 'Create' },
  { key: 'edit', label: 'Edit' },
  { key: 'delete', label: 'Delete' },
];

export const RolePermissions: React.FC = () => {
  const navigate = useNavigate();
  const { role, setRole, permissions, setPermissions } = useStore();
  const [selectedRole, setSelectedRole] = useState<Role>('Business Owner');
  const selectedPermissions = permissions[selectedRole];
  const viewableCount = modules.filter((module) => selectedPermissions[module.key].view).length;

  const updatePermission = (moduleKey: ModuleKey, action: PermissionAction, enabled: boolean) => {
    if (selectedRole === 'Super Admin' && action === 'view' && !enabled) return;

    const current = selectedPermissions[moduleKey];
    const updated = action === 'view' && !enabled
      ? { view: false, create: false, edit: false, delete: false }
      : { ...current, [action]: enabled };

    setPermissions({
      ...permissions,
      [selectedRole]: {
        ...selectedPermissions,
        [moduleKey]: updated,
      },
    });
  };

  const previewWorkspace = () => {
    setRole(selectedRole);
    navigate('/dashboard');
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Workspace administration</p>
          <h2>Role Permissions</h2>
        </div>
        <button className="primary-button" type="button" onClick={previewWorkspace}>
          <Play size={15} />
          Preview workspace
        </button>
      </div>

      <section className="panel permissions-intro">
        <div className="permissions-intro-icon"><ShieldCheck size={20} /></div>
        <div className="permissions-intro-copy">
          <h3>Configure simulated access</h3>
          <p>Changes are saved on this device and take effect as soon as you switch to or preview that role. This is a demo experience, not backend security.</p>
        </div>
        <label className="control-inline permissions-role-select">
          <span>Configure role</span>
          <select value={selectedRole} onChange={(event) => setSelectedRole(event.target.value as Role)}>
            {roles.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
      </section>

      <div className="permissions-summary">
        <span><Eye size={15} /> {viewableCount} of {modules.length} modules visible</span>
        {selectedRole === role && <span className="badge status-qualified">Currently previewing this role</span>}
      </div>

      <div className="table-shell permissions-table-shell">
        <table className="permissions-table">
          <thead>
            <tr>
              <th>Module</th>
              {permissionActions.map((action) => <th key={action.key}>{action.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <tr key={module.key}>
                  <td>
                    <div className="permissions-module">
                      <Icon size={16} />
                      <span>{module.name}</span>
                    </div>
                  </td>
                  {permissionActions.map((action) => {
                    const checked = selectedPermissions[module.key][action.key];
                    const viewLocked = selectedRole === 'Super Admin' && action.key === 'view';
                    const actionLocked = action.key !== 'view' && !selectedPermissions[module.key].view;
                    return (
                      <td key={action.key}>
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={viewLocked || actionLocked}
                          aria-label={`${action.label} ${module.name} for ${selectedRole}`}
                          title={viewLocked
                            ? 'Super Admin must retain access to all modules'
                            : actionLocked ? 'Grant View permission before other permissions' : undefined}
                          onChange={(event) => updatePermission(module.key, action.key, event.target.checked)}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
