import {
  BarChart3,
  BriefcaseBusiness,
  CalendarClock,
  CheckCheck,
  CircleHelp,
  FileCheck2,
  FileText,
  HandCoins,
  House,
  MessageSquareText,
  NotebookPen,
  PackageCheck,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ModuleKey } from '../store';

export type ModuleItem = {
  key: ModuleKey;
  name: string;
  path: string;
  icon: LucideIcon;
};

export const modules: ModuleItem[] = [
  { key: 'dashboard', name: 'Dashboard', path: '/dashboard', icon: House },
  { key: 'leads', name: 'Leads', path: '/leads', icon: Users },
  { key: 'clients', name: 'Clients', path: '/clients', icon: Users },
  { key: 'consultations', name: 'Consultations', path: '/consultations', icon: CalendarClock },
  { key: 'services', name: 'Services', path: '/services', icon: PackageCheck },
  { key: 'cases', name: 'Cases', path: '/cases', icon: FileCheck2 },
  { key: 'documents', name: 'Documents', path: '/documents', icon: NotebookPen },
  { key: 'tasks', name: 'Tasks', path: '/tasks', icon: CheckCheck },
  { key: 'communications', name: 'Communications', path: '/communications', icon: MessageSquareText },
  { key: 'invoices', name: 'Invoices', path: '/invoices', icon: HandCoins },
  { key: 'employees', name: 'Employees', path: '/employees', icon: BriefcaseBusiness },
  { key: 'marketing', name: 'Marketing', path: '/marketing', icon: BarChart3 },
  { key: 'feedback', name: 'Feedback', path: '/feedback', icon: CircleHelp },
  { key: 'reports', name: 'Reports', path: '/reports', icon: FileText },
];
