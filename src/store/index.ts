import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createDefaultRolePermissions } from '../config/roleAccess';

export type Role =
  | 'Super Admin'
  | 'Business Owner'
  | 'Branch Manager'
  | 'Operations Manager'
  | 'Sales Executive'
  | 'Consultant'
  | 'Documentation Executive'
  | 'Accounts Executive'
  | 'Customer Support';

export type ModuleKey =
  | 'dashboard'
  | 'leads'
  | 'clients'
  | 'consultations'
  | 'services'
  | 'cases'
  | 'documents'
  | 'tasks'
  | 'communications'
  | 'invoices'
  | 'employees'
  | 'marketing'
  | 'feedback'
  | 'reports';

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete';
export type ModulePermission = Record<PermissionAction, boolean>;
export type RolePermissions = Record<Role, Record<ModuleKey, ModulePermission>>;

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Converted';
  assignedTo: string;
  valueINR: number;
  lastActivity: string;
  city: string;
  cuisine: string;
};

export type Client = {
  id: string;
  name: string;
  type: 'Customer' | 'Merchant';
  contactEmail: string;
  contactPhone: string;
  city: string;
  segment: string;
  totalOrders: number;
  lifetimeValueINR: number;
};

export type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  city: string;
  ownerName: string;
  phone: string;
  partnerStatus: 'Active' | 'Onboarding' | 'Paused';
  avgRating: number;
  commissionRate: number;
  packageId?: string;
  packageName?: string;
};

export type DeliveryPartner = {
  id: string;
  name: string;
  phone: string;
  city: string;
  vehicle: 'Bike' | 'Scooter' | 'Bicycle';
  availability: 'Available' | 'On delivery' | 'Off shift';
  rating: number;
  deliveries: number;
};

export type Order = {
  id: string;
  orderNumber: string;
  clientId: string;
  restaurantId: string;
  deliveryPartnerId: string;
  placedAt: string;
  items: string[];
  subtotalINR: number;
  deliveryFeeINR: number;
  discountINR: number;
  totalINR: number;
  status: 'Placed' | 'Preparing' | 'Picked up' | 'Delivered' | 'Cancelled';
  paymentStatus: 'Paid' | 'Refunded' | 'Pending';
  city: string;
  etaMinutes: number;
};

export type Refund = {
  id: string;
  orderId: string;
  amountINR: number;
  reason: string;
  status: 'Processed' | 'Pending' | 'Rejected';
  requestedAt: string;
};

export type Payment = {
  id: string;
  orderId: string;
  amountINR: number;
  method: 'UPI' | 'Card' | 'Cash' | 'Wallet';
  status: 'Captured' | 'Pending' | 'Refunded';
  paidAt: string;
};

export type Settlement = {
  id: string;
  restaurantId: string;
  period: string;
  amountINR: number;
  ordersCount: number;
  status: 'Prepared' | 'Approved' | 'Paid' | 'Processing' | 'Due';
  dueDate: string;
  startDate?: string;
  endDate?: string;
  grossOrderValueINR?: number;
  commissionPercent?: number;
  commissionINR?: number;
  serviceFeesINR?: number;
  refundsINR?: number;
  otherDeductionsINR?: number;
  reference?: string;
  notes?: string;
  createdAt?: string;
};

export type Case = {
  id: string;
  clientId: string;
  orderId: string;
  restaurantId: string;
  deliveryPartnerId: string;
  title: string;
  stage: string;
  valueINR: number;
  priority: 'Low' | 'Medium' | 'High';
  incidentType: string;
  description?: string;
  assignedTo?: string;
  createdAt?: string;
};

export type Task = {
  id: string;
  caseId: string;
  title: string;
  assignee: string;
  due: string;
  status: 'Pending' | 'Done';
  description?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  relatedRecord?: string;
  createdAt?: string;
};

export type Invoice = {
  id: string;
  clientId: string;
  amountINR: number;
  paid: boolean;
  dueDate: string;
  invoiceType: 'Merchant settlement' | 'Platform invoice' | 'Refund';
  reference: string;
};

export type Consultation = {
  id: string;
  clientId: string;
  consultant: string;
  date: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  notes: string;
  meetingType: string;
  contactPerson?: string;
  location?: string;
  createdAt?: string;
};

export type Service = {
  id: string;
  name: string;
  category: string;
  priceINR: number;
  description: string;
  pricingModel?: string;
  serviceFeeINR?: number;
  duration?: string;
  benefits?: string[];
  eligibility?: string;
  active?: boolean;
  assignedMerchantIds?: string[];
  createdAt?: string;
};

export type DocumentItem = {
  id: string;
  title: string;
  type: string;
  status: 'Pending' | 'Verified' | 'Rejected';
  owner: string;
  reference: string;
  city: string;
  relatedEntityId?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  expiresAt?: string;
  createdAt?: string;
};

export type Communication = {
  id: string;
  from: string;
  message: string;
  timestamp: string;
  channel: 'Email' | 'Call' | 'SMS' | 'WhatsApp' | 'In-app';
  audience: 'Customer' | 'Merchant' | 'Delivery partner' | 'Internal';
};

export type Employee = {
  id: string;
  name: string;
  role: string;
  email: string;
  location: string;
  phone?: string;
  employeeId?: string;
  department?: string;
  branch?: string;
  status?: 'Active' | 'Inactive';
  createdAt?: string;
};

export type MarketingCampaign = {
  id: string;
  name: string;
  leads: number;
  conversions: number;
  spendINR: number;
  orders: number;
  gmvINR: number;
};

export type FeedbackEntry = {
  id: string;
  customer: string;
  rating: number;
  comment: string;
  status: 'Open' | 'In Progress' | 'Escalated' | 'Resolved';
  orderId: string;
  city: string;
  category: 'Complaint' | 'Support ticket' | 'Rating' | 'delivery' | 'order' | 'payment' | 'refund' | 'restaurant' | 'account' | 'other';
  subject?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  assignedTo?: string;
  createdAt?: string;
};

export type Report = {
  id: string;
  title: string;
  date: string;
  summary: string;
};

export type StoreState = {
  leads: Lead[];
  clients: Client[];
  restaurants: Restaurant[];
  deliveryPartners: DeliveryPartner[];
  orders: Order[];
  refunds: Refund[];
  payments: Payment[];
  settlements: Settlement[];
  cases: Case[];
  tasks: Task[];
  invoices: Invoice[];
  consultations: Consultation[];
  services: Service[];
  documents: DocumentItem[];
  communications: Communication[];
  employees: Employee[];
  marketingCampaigns: MarketingCampaign[];
  feedbackEntries: FeedbackEntry[];
  reports: Report[];
  role: Role;
  permissions: RolePermissions;
  setLeads: (items: Lead[]) => void;
  setClients: (items: Client[]) => void;
  setRestaurants: (items: Restaurant[]) => void;
  setDeliveryPartners: (items: DeliveryPartner[]) => void;
  setOrders: (items: Order[]) => void;
  setRefunds: (items: Refund[]) => void;
  setPayments: (items: Payment[]) => void;
  setSettlements: (items: Settlement[]) => void;
  setCases: (items: Case[]) => void;
  setTasks: (items: Task[]) => void;
  setInvoices: (items: Invoice[]) => void;
  setConsultations: (items: Consultation[]) => void;
  setServices: (items: Service[]) => void;
  setDocuments: (items: DocumentItem[]) => void;
  setCommunications: (items: Communication[]) => void;
  setEmployees: (items: Employee[]) => void;
  setMarketingCampaigns: (items: MarketingCampaign[]) => void;
  setFeedbackEntries: (items: FeedbackEntry[]) => void;
  setReports: (items: Report[]) => void;
  setRole: (role: Role) => void;
  setPermissions: (permissions: RolePermissions) => void;
  resetDemo: () => void;
};

const emptyData = () => ({
  leads: [],
  clients: [],
  restaurants: [],
  deliveryPartners: [],
  orders: [],
  refunds: [],
  payments: [],
  settlements: [],
  cases: [],
  tasks: [],
  invoices: [],
  consultations: [],
  services: [],
  documents: [],
  communications: [],
  employees: [],
  marketingCampaigns: [],
  feedbackEntries: [],
  reports: [],
});

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      ...emptyData(),
      role: 'Operations Manager',
      permissions: createDefaultRolePermissions(),
      setLeads: (leads) => set({ leads }),
      setClients: (clients) => set({ clients }),
      setRestaurants: (restaurants) => set({ restaurants }),
      setDeliveryPartners: (deliveryPartners) => set({ deliveryPartners }),
      setOrders: (orders) => set({ orders }),
      setRefunds: (refunds) => set({ refunds }),
      setPayments: (payments) => set({ payments }),
      setSettlements: (settlements) => set({ settlements }),
      setCases: (cases) => set({ cases }),
      setTasks: (tasks) => set({ tasks }),
      setInvoices: (invoices) => set({ invoices }),
      setConsultations: (consultations) => set({ consultations }),
      setServices: (services) => set({ services }),
      setDocuments: (documents) => set({ documents }),
      setCommunications: (communications) => set({ communications }),
      setEmployees: (employees) => set({ employees }),
      setMarketingCampaigns: (marketingCampaigns) => set({ marketingCampaigns }),
      setFeedbackEntries: (feedbackEntries) => set({ feedbackEntries }),
      setReports: (reports) => set({ reports }),
      setRole: (role) => set({ role }),
      setPermissions: (permissions) => set({ permissions }),
      resetDemo: () => set({ ...emptyData(), role: 'Operations Manager', permissions: createDefaultRolePermissions() }),
    }),
    {
      name: 'study-abroad-crm-demo-v1',
      version: 4,
      migrate: (persistedState, version) => {
        const state = persistedState as Partial<StoreState>;
        if (version < 4 && state.permissions) {
          const permissions = { ...state.permissions };
          for (const role of ['Super Admin', 'Business Owner', 'Branch Manager', 'Sales Executive'] as const) {
            permissions[role] = {
              ...permissions[role],
              leads: { ...permissions[role].leads, view: true, create: true },
            };
          }
          for (const role of ['Branch Manager', 'Operations Manager'] as const) {
            permissions[role] = {
              ...permissions[role],
              feedback: { ...permissions[role].feedback, view: true, create: true, edit: true },
            };
          }
          permissions['Branch Manager'] = {
            ...permissions['Branch Manager'],
            employees: { ...permissions['Branch Manager'].employees, view: true, create: true, edit: true },
            invoices: { ...permissions['Branch Manager'].invoices, view: true, create: true, edit: true },
          };
          for (const role of ['Super Admin', 'Business Owner', 'Branch Manager', 'Accounts Executive'] as const) {
            permissions[role] = {
              ...permissions[role],
              invoices: { ...permissions[role].invoices, view: true, create: true, edit: true },
            };
          }
          for (const role of ['Super Admin', 'Business Owner', 'Operations Manager', 'Sales Executive'] as const) {
            permissions[role] = {
              ...permissions[role],
              services: { ...permissions[role].services, view: true, create: true, edit: true, delete: role === 'Super Admin' },
            };
          }
          return { ...state, permissions };
        }
        return state;
      },
    },
  ),
);
