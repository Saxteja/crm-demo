import type { ModuleKey, ModulePermission, Role, RolePermissions } from '../store';

export type NavigationGroup = {
  label: string;
  modules: ModuleKey[];
};

export const roleNavigation: Record<Role, NavigationGroup[]> = {
  'Super Admin': [
    { label: 'Overview', modules: ['dashboard'] },
    { label: 'Commerce', modules: ['leads', 'clients', 'consultations', 'services', 'cases'] },
    { label: 'Fulfilment', modules: ['documents', 'tasks', 'communications', 'feedback'] },
    { label: 'Business', modules: ['invoices', 'employees', 'marketing', 'reports'] },
  ],
  'Business Owner': [
    { label: 'Overview', modules: ['dashboard'] },
    { label: 'Growth', modules: ['leads', 'clients', 'marketing', 'consultations'] },
    { label: 'Commerce operations', modules: ['services', 'cases', 'documents', 'tasks', 'communications', 'feedback'] },
    { label: 'Finance & team', modules: ['invoices', 'employees', 'reports'] },
  ],
  'Branch Manager': [
    { label: 'Overview', modules: ['dashboard'] },
    { label: 'City commerce', modules: ['leads', 'clients', 'consultations', 'cases'] },
    { label: 'City operations', modules: ['tasks', 'documents', 'employees', 'communications', 'feedback'] },
    { label: 'Performance & finance', modules: ['reports', 'marketing', 'invoices'] },
  ],
  'Operations Manager': [
    { label: 'Overview', modules: ['dashboard'] },
    { label: 'Orders & fulfilment', modules: ['cases', 'clients', 'consultations'] },
    { label: 'City operations', modules: ['tasks', 'documents', 'communications', 'employees', 'feedback'] },
    { label: 'Performance', modules: ['reports', 'services'] },
  ],
  'Sales Executive': [
    { label: 'Overview', modules: ['dashboard'] },
    { label: 'Merchant acquisition', modules: ['leads', 'clients', 'consultations'] },
    { label: 'Partnerships', modules: ['services', 'tasks', 'communications'] },
  ],
  Consultant: [
    { label: 'Overview', modules: ['dashboard'] },
    { label: 'Client work', modules: ['clients', 'consultations', 'services', 'cases'] },
    { label: 'Casework', modules: ['documents', 'tasks', 'communications'] },
  ],
  'Documentation Executive': [
    { label: 'Overview', modules: ['dashboard'] },
    { label: 'Documentation desk', modules: ['clients', 'cases', 'documents'] },
    { label: 'Follow-ups', modules: ['tasks', 'communications'] },
  ],
  'Accounts Executive': [
    { label: 'Overview', modules: ['dashboard'] },
    { label: 'Finance desk', modules: ['invoices', 'clients'] },
    { label: 'Reconciliation', modules: ['tasks', 'communications', 'reports'] },
  ],
  'Customer Support': [
    { label: 'Overview', modules: ['dashboard'] },
    { label: 'Customer care', modules: ['clients', 'feedback', 'communications'] },
    { label: 'Follow-ups', modules: ['tasks', 'cases'] },
  ],
};

const readOnlyActions: ModulePermission = {
  view: true,
  create: false,
  edit: false,
  delete: false,
};

const writableRoles: Partial<Record<Role, ModuleKey[]>> = {
  'Business Owner': [
    'leads', 'clients', 'consultations', 'services', 'cases', 'documents', 'tasks',
    'communications', 'invoices', 'employees', 'marketing', 'feedback', 'reports',
  ],
  'Branch Manager': ['leads', 'clients', 'consultations', 'services', 'cases', 'documents', 'tasks', 'communications', 'employees', 'feedback', 'invoices'],
  'Operations Manager': ['consultations', 'services', 'cases', 'documents', 'tasks', 'communications', 'feedback'],
  'Sales Executive': ['leads', 'clients', 'consultations', 'services', 'tasks', 'communications'],
  Consultant: ['clients', 'consultations', 'cases', 'documents', 'tasks', 'communications'],
  'Documentation Executive': ['documents', 'tasks', 'communications'],
  'Accounts Executive': ['invoices', 'tasks', 'communications'],
  'Customer Support': ['clients', 'feedback', 'tasks', 'communications'],
};

const allModuleKeys: ModuleKey[] = [
  'dashboard',
  'leads',
  'clients',
  'consultations',
  'services',
  'cases',
  'documents',
  'tasks',
  'communications',
  'invoices',
  'employees',
  'marketing',
  'feedback',
  'reports',
];

const allRoles: Role[] = [
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

const leadCreatorRoles: Role[] = ['Super Admin', 'Business Owner', 'Branch Manager', 'Sales Executive'];

function getDefaultRolePermissions(role: Role): Record<ModuleKey, ModulePermission> {
  const permissions = Object.fromEntries(
    allModuleKeys.map((key) => [key, { ...readOnlyActions, view: false }]),
  ) as Record<ModuleKey, ModulePermission>;

  for (const group of roleNavigation[role]) {
    for (const key of group.modules) {
      const canWrite = role === 'Super Admin' || writableRoles[role]?.includes(key) === true;
      permissions[key] = {
        view: true,
        create: key === 'leads' ? leadCreatorRoles.includes(role) : canWrite,
        edit: canWrite,
        delete: role === 'Super Admin',
      };
    }
  }

  return permissions;
}

export function createDefaultRolePermissions(): RolePermissions {
  return Object.fromEntries(
    allRoles.map((role) => [role, getDefaultRolePermissions(role)]),
  ) as RolePermissions;
}
