import React from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { AppShell } from './components/layout/AppShell';
import { About } from './modules/about/About';
import { Clients } from './modules/clients/Clients';
import { Communications } from './modules/communications/Communications';
import { Consultations } from './modules/consultations/Consultations';
import { Dashboard } from './modules/dashboard/Dashboard';
import { Documents } from './modules/documents/Documents';
import { Employees } from './modules/employees/Employees';
import { Feedback } from './modules/feedback/Feedback';
import { Invoices } from './modules/invoices/Invoices';
import { Leads } from './modules/leads/Leads';
import { Marketing } from './modules/marketing/Marketing';
import { Reports } from './modules/reports/Reports';
import { Services } from './modules/services/Services';
import { Cases } from './modules/cases/Cases';
import { Tasks } from './modules/tasks/Tasks';
import { RolePermissions } from './modules/permissions/RolePermissions';
import { modules } from './modules/catalog';
import { useStore, type ModuleKey } from './store';

const ModuleGate: React.FC<{ moduleKey: ModuleKey; children: React.ReactNode }> = ({ moduleKey, children }) => {
  const { role, permissions } = useStore();
  const module = modules.find((item) => item.key === moduleKey);

  if (!permissions[role][moduleKey].view) {
    const firstAvailable = modules.find((item) => permissions[role][item.key].view);
    return (
      <div className="access-denied">
        <div className="access-denied-icon"><ShieldAlert size={24} /></div>
        <p className="eyebrow">Workspace access</p>
        <h2>{module?.name ?? 'This module'} is unavailable</h2>
        <p>{role} does not currently have View permission for this module.</p>
        {firstAvailable && <Link className="secondary-button" to={firstAvailable.path}>Go to {firstAvailable.name}</Link>}
      </div>
    );
  }

  return children;
};

const PermissionsGate: React.FC = () => {
  const role = useStore((state) => state.role);
  if (role !== 'Super Admin') {
    return (
      <div className="access-denied">
        <div className="access-denied-icon"><ShieldAlert size={24} /></div>
        <p className="eyebrow">Workspace access</p>
        <h2>Role Permissions is unavailable</h2>
        <p>Only Super Admin can configure role permissions in this demo.</p>
        <Link className="secondary-button" to="/dashboard">Go to Dashboard</Link>
      </div>
    );
  }
  return <RolePermissions />;
};

const Protected: React.FC<{ moduleKey: ModuleKey; children: React.ReactNode }> = ({ moduleKey, children }) => (
  <ModuleGate moduleKey={moduleKey}>{children}</ModuleGate>
);

export const App: React.FC = () => (
  <BrowserRouter>
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Protected moduleKey="dashboard"><Dashboard /></Protected>} />
        <Route path="/leads" element={<Protected moduleKey="leads"><Leads /></Protected>} />
        <Route path="/clients" element={<Protected moduleKey="clients"><Clients /></Protected>} />
        <Route path="/consultations" element={<Protected moduleKey="consultations"><Consultations /></Protected>} />
        <Route path="/services" element={<Protected moduleKey="services"><Services /></Protected>} />
        <Route path="/cases" element={<Protected moduleKey="cases"><Cases /></Protected>} />
        <Route path="/documents" element={<Protected moduleKey="documents"><Documents /></Protected>} />
        <Route path="/tasks" element={<Protected moduleKey="tasks"><Tasks /></Protected>} />
        <Route path="/communications" element={<Protected moduleKey="communications"><Communications /></Protected>} />
        <Route path="/invoices" element={<Protected moduleKey="invoices"><Invoices /></Protected>} />
        <Route path="/employees" element={<Protected moduleKey="employees"><Employees /></Protected>} />
        <Route path="/marketing" element={<Protected moduleKey="marketing"><Marketing /></Protected>} />
        <Route path="/feedback" element={<Protected moduleKey="feedback"><Feedback /></Protected>} />
        <Route path="/reports" element={<Protected moduleKey="reports"><Reports /></Protected>} />
        <Route path="/permissions" element={<PermissionsGate />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<div className="page-empty">Page not found</div>} />
      </Routes>
    </AppShell>
  </BrowserRouter>
);
