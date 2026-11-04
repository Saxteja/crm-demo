import React, { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Bike,
  Building2,
  Check,
  Clock3,
  FileCheck2,
  HandCoins,
  Headset,
  MapPin,
  MessageSquareText,
  PackageCheck,
  Plus,
  Store,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore, type Role } from '../../store';

type Metric = {
  label: string;
  value: string;
  detail: string;
  trend?: string;
  direction?: 'up' | 'down';
  icon: React.ReactNode;
};

type Priority = {
  id: string;
  title: string;
  detail: string;
  level: 'Urgent' | 'High' | 'Normal';
};

type Activity = { title: string; detail: string; initials: string; color: string };
type TableSection = { title: string; subtitle: string; columns: string[]; rows: string[][]; emptyText?: string };
type ChartSeries = { key: string; label: string; color: string };
type ChartSection = {
  title: string;
  subtitle: string;
  type: 'area' | 'bar' | 'line' | 'donut';
  data: Record<string, string | number>[];
  series: ChartSeries[];
};
type QuickAction = { label: string; icon: React.ReactNode; path: string; description: string };
type DashboardModel = {
  heading: string;
  welcome: string;
  location: string;
  layout: 'executive' | 'owner' | 'branch' | 'operations' | 'sales' | 'consultant' | 'documents' | 'accounts' | 'support';
  metrics: Metric[];
  chart: ChartSection;
  priorities: Priority[];
  activity: Activity[];
  tables: TableSection[];
  quickActions: QuickAction[];
};

const money = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;
const number = (value: number) => value.toLocaleString('en-IN');

const weekTrend = [
  { day: 'Mon', gmv: 10.8, revenue: 1.84, orders: 2840 },
  { day: 'Tue', gmv: 11.6, revenue: 1.98, orders: 3020 },
  { day: 'Wed', gmv: 12.1, revenue: 2.06, orders: 3160 },
  { day: 'Thu', gmv: 11.4, revenue: 1.94, orders: 2960 },
  { day: 'Fri', gmv: 13.2, revenue: 2.25, orders: 3480 },
  { day: 'Sat', gmv: 15.6, revenue: 2.66, orders: 4180 },
  { day: 'Sun', gmv: 14.8, revenue: 2.51, orders: 3950 },
];

const cityPerformance = [
  { city: 'Bengaluru', orders: 4280, revenue: 8.6, onTime: 96 },
  { city: 'Delhi NCR', orders: 3920, revenue: 7.9, onTime: 93 },
  { city: 'Mumbai', orders: 3650, revenue: 7.4, onTime: 94 },
  { city: 'Hyderabad', orders: 2860, revenue: 5.8, onTime: 95 },
  { city: 'Chennai', orders: 2140, revenue: 4.1, onTime: 97 },
];

const prioritiesByRole: Record<Role, Priority[]> = {
  'Super Admin': [
    { id: 'sa-1', title: 'Review city margin variance', detail: 'Mumbai contribution margin is 1.8 pts below plan', level: 'High' },
    { id: 'sa-2', title: 'Approve weekly settlement batch', detail: '₹18.6L across 42 merchant partners', level: 'Normal' },
    { id: 'sa-3', title: 'Resolve Bengaluru SLA alert', detail: 'On-time delivery dipped to 92% during lunch peak', level: 'Urgent' },
  ],
  'Business Owner': [
    { id: 'bo-1', title: 'Review partner settlement run', detail: '42 merchant payouts · ₹18.6L scheduled today', level: 'High' },
    { id: 'bo-2', title: 'Approve retention campaign', detail: 'Gold member win-back · projected 4.2× return', level: 'Normal' },
    { id: 'bo-3', title: 'Check repeat-order trend', detail: 'Repeat rate is up 3.4% this week', level: 'Normal' },
  ],
  'Branch Manager': [
    { id: 'bm-1', title: 'Rebalance lunch-hour fleet', detail: 'Koramangala and HSR demand above rider capacity', level: 'Urgent' },
    { id: 'bm-2', title: 'Call 3 low-rated partner outlets', detail: 'Bengaluru partner score below 4.0', level: 'High' },
    { id: 'bm-3', title: 'Close unresolved order complaints', detail: '6 complaints awaiting local follow-up', level: 'High' },
  ],
  'Operations Manager': [
    { id: 'om-1', title: 'Assign 7 unassigned orders', detail: 'Oldest order waiting 8 minutes in Indiranagar', level: 'Urgent' },
    { id: 'om-2', title: 'Escalate delayed deliveries', detail: '12 orders currently beyond promised ETA', level: 'Urgent' },
    { id: 'om-3', title: 'Review 5 SLA breaches', detail: '3 late pickups and 2 hand-off delays', level: 'High' },
    { id: 'om-4', title: 'Follow up on incident reports', detail: '4 delivery incidents need an owner', level: 'Normal' },
  ],
  'Sales Executive': [
    { id: 'se-1', title: 'Follow up with Tandoor Tales', detail: 'Growth plan proposal · Mumbai · last contacted yesterday', level: 'High' },
    { id: 'se-2', title: 'Complete Old Delhi Chaat discovery', detail: 'New prospect · Delhi · target close 22 Nov', level: 'Normal' },
    { id: 'se-3', title: 'Submit weekly pipeline update', detail: 'Target attainment is 74% · 5 days remaining', level: 'High' },
  ],
  Consultant: [
    { id: 'co-1', title: 'Collect bank proof from Chennai Filter & Idli', detail: 'Partner launch blocked · requested 2 days ago', level: 'Urgent' },
    { id: 'co-2', title: 'Prepare Dosa District business review', detail: 'Today at 3:00 PM · Bengaluru', level: 'High' },
    { id: 'co-3', title: 'Check partner health for Pune Pantry', detail: 'Orders paused · menu refresh pending', level: 'Normal' },
  ],
  'Documentation Executive': [
    { id: 'de-1', title: 'Verify FSSAI certificate · Chennai Filter & Idli', detail: 'Merchant onboarding is waiting on this check', level: 'Urgent' },
    { id: 'de-2', title: 'Request clearer bank proof · Coastal Curry Cart', detail: 'Uploaded image is unreadable', level: 'High' },
    { id: 'de-3', title: 'Renew 5 merchant agreements', detail: 'Agreements expire within the next 30 days', level: 'Normal' },
  ],
  'Accounts Executive': [
    { id: 'ae-1', title: 'Reconcile settlement exception · SK-82118', detail: '₹12,450 variance between order and payout ledger', level: 'Urgent' },
    { id: 'ae-2', title: 'Release merchant payout batch', detail: '₹18.6L across 42 partners · cutoff 4:00 PM', level: 'High' },
    { id: 'ae-3', title: 'Review pending customer refunds', detail: '7 requests · ₹24,680 total', level: 'High' },
  ],
  'Customer Support': [
    { id: 'cs-1', title: 'Resolve missing-item complaint', detail: 'Order SK-82104 · customer waiting 11 minutes', level: 'Urgent' },
    { id: 'cs-2', title: 'Escalate restaurant cancellation', detail: 'Order SK-82098 · refund confirmation needed', level: 'High' },
    { id: 'cs-3', title: 'Reply to 4 new customer conversations', detail: 'Oldest unread message received 9 minutes ago', level: 'High' },
  ],
};

const activityByRole: Record<Role, Activity[]> = {
  'Super Admin': [
    { title: 'Weekly GMV crossed ₹82L', detail: 'Company-wide · 12 min ago', initials: 'BI', color: 'blue' },
    { title: 'Delhi NCR delivery SLA recovered to 93.4%', detail: 'City operations · 34 min ago', initials: 'OP', color: 'green' },
    { title: '42 merchant settlements prepared', detail: 'Accounts · 1 hr ago', initials: 'AC', color: 'orange' },
  ],
  'Business Owner': [
    { title: 'Repeat customer rate improved by 3.4%', detail: 'Retention · 18 min ago', initials: 'GR', color: 'green' },
    { title: 'Bengaluru campaign delivered 1,240 orders', detail: 'Marketing · 42 min ago', initials: 'MK', color: 'blue' },
    { title: 'Payout batch ready for review', detail: 'Settlements · 1 hr ago', initials: 'FN', color: 'orange' },
  ],
  'Branch Manager': [
    { title: 'Dosa District rated 4.8 this week', detail: 'Bengaluru partner · 8 min ago', initials: 'DD', color: 'orange' },
    { title: 'Fleet shift started in Whitefield', detail: 'City operations · 24 min ago', initials: 'DP', color: 'blue' },
    { title: '3 customer complaints resolved', detail: 'Support team · 51 min ago', initials: 'CS', color: 'green' },
  ],
  'Operations Manager': [
    { title: 'Order SK-82121 assigned to Suresh Kumar', detail: 'Indiranagar · 3 min ago', initials: 'SK', color: 'blue' },
    { title: 'Pickup delay alert raised at Punjabi Junction', detail: 'Delhi · 11 min ago', initials: 'PJ', color: 'orange' },
    { title: 'Delivery partner Pooja Patil back online', detail: 'Mumbai · 19 min ago', initials: 'PP', color: 'green' },
  ],
  'Sales Executive': [
    { title: 'Biryani Bae moved to qualified', detail: 'Hyderabad · 16 min ago', initials: 'BB', color: 'orange' },
    { title: 'Kutch Kitchen requested Growth plan pricing', detail: 'Ahmedabad · 43 min ago', initials: 'KK', color: 'blue' },
    { title: 'Deccan Deli completed partner signup', detail: 'Pune · 2 hr ago', initials: 'DD', color: 'green' },
  ],
  Consultant: [
    { title: 'Menu catalogue approved', detail: 'Punjabi Junction · 14 min ago', initials: 'PJ', color: 'green' },
    { title: 'Bank proof requested', detail: 'Chennai Filter & Idli · 36 min ago', initials: 'CF', color: 'orange' },
    { title: 'Partner health check completed', detail: 'Dosa District · 1 hr ago', initials: 'DD', color: 'blue' },
  ],
  'Documentation Executive': [
    { title: 'Merchant agreement verified', detail: 'Bombay Tiffin House · 9 min ago', initials: 'BT', color: 'green' },
    { title: 'FSSAI image rejected for resubmission', detail: 'Coastal Curry Cart · 27 min ago', initials: 'CC', color: 'orange' },
    { title: 'GST document added to verification queue', detail: 'Kolkata Kathi Roll · 48 min ago', initials: 'KK', color: 'blue' },
  ],
  'Accounts Executive': [
    { title: 'Payout batch #ST-2408 reconciled', detail: '42 merchants · 12 min ago', initials: 'ST', color: 'green' },
    { title: 'Refund initiated for order SK-82098', detail: '₹840 · 31 min ago', initials: 'RF', color: 'orange' },
    { title: 'Settlement variance flagged', detail: 'Punjabi Junction · 54 min ago', initials: 'PJ', color: 'blue' },
  ],
  'Customer Support': [
    { title: 'Complaint resolved with ₹120 credit', detail: 'Ananya Iyer · 5 min ago', initials: 'AI', color: 'green' },
    { title: 'Delivery delay escalated to city ops', detail: 'Rahul Deshmukh · 17 min ago', initials: 'RD', color: 'orange' },
    { title: 'Merchant confirmed replacement item', detail: 'Simran Kaur · 29 min ago', initials: 'SK', color: 'blue' },
  ],
};

const quickActionsByRole: Record<Role, QuickAction[]> = {
  'Super Admin': [
    { label: 'Business reports', icon: <ArrowRight size={15} />, path: '/reports', description: 'Open company reporting' },
    { label: 'Review settlements', icon: <HandCoins size={15} />, path: '/invoices', description: 'Review partner payouts' },
    { label: 'City operations', icon: <MapPin size={15} />, path: '/cases', description: 'Open operations overview' },
  ],
  'Business Owner': [
    { label: 'Revenue report', icon: <ArrowRight size={15} />, path: '/reports', description: 'View revenue and retention' },
    { label: 'Merchant payouts', icon: <HandCoins size={15} />, path: '/invoices', description: 'Review settlement status' },
    { label: 'Growth campaigns', icon: <ArrowUpRight size={15} />, path: '/marketing', description: 'Review campaign performance' },
  ],
  'Branch Manager': [
    { label: 'Local order queue', icon: <PackageCheck size={15} />, path: '/cases', description: 'Review city orders' },
    { label: 'Partner directory', icon: <Store size={15} />, path: '/clients', description: 'Check restaurant partners' },
    { label: 'Support escalations', icon: <Headset size={15} />, path: '/feedback', description: 'Review customer complaints' },
  ],
  'Operations Manager': [
    { label: 'Open order queue', icon: <PackageCheck size={15} />, path: '/cases', description: 'View active order incidents' },
    { label: 'Fleet roster', icon: <Bike size={15} />, path: '/employees', description: 'Review delivery capacity' },
    { label: 'Task board', icon: <Check size={15} />, path: '/tasks', description: 'Work operational follow-ups' },
  ],
  'Sales Executive': [
    { label: 'Add merchant prospect', icon: <Plus size={15} />, path: '/leads', description: 'Open merchant pipeline' },
    { label: 'Schedule partner meeting', icon: <Clock3 size={15} />, path: '/consultations', description: 'Open partner meetings' },
    { label: 'View active partners', icon: <Store size={15} />, path: '/clients', description: 'Browse merchant directory' },
  ],
  Consultant: [
    { label: 'Review onboarding', icon: <BadgeCheck size={15} />, path: '/clients', description: 'Open partner records' },
    { label: 'Today’s meetings', icon: <Clock3 size={15} />, path: '/consultations', description: 'Open meeting schedule' },
    { label: 'Requirements queue', icon: <FileCheck2 size={15} />, path: '/documents', description: 'Review merchant documents' },
  ],
  'Documentation Executive': [
    { label: 'Verification queue', icon: <FileCheck2 size={15} />, path: '/documents', description: 'Review submitted documents' },
    { label: 'Merchant onboarding', icon: <Store size={15} />, path: '/clients', description: 'Open pending partners' },
    { label: 'Follow-up tasks', icon: <Check size={15} />, path: '/tasks', description: 'Open documentation reminders' },
  ],
  'Accounts Executive': [
    { label: 'Settlement register', icon: <HandCoins size={15} />, path: '/invoices', description: 'Review payouts and refunds' },
    { label: 'Reconciliation report', icon: <ArrowRight size={15} />, path: '/reports', description: 'Review finance performance' },
    { label: 'Payment follow-ups', icon: <MessageSquareText size={15} />, path: '/communications', description: 'Open finance messages' },
  ],
  'Customer Support': [
    { label: 'Open ticket queue', icon: <Headset size={15} />, path: '/feedback', description: 'Work complaints and support tickets' },
    { label: 'Customer conversations', icon: <MessageSquareText size={15} />, path: '/communications', description: 'Open recent conversations' },
    { label: 'Find customer', icon: <Users size={15} />, path: '/clients', description: 'Search customer records' },
  ],
};

function ActionIcon({ icon }: { icon: React.ReactNode }) {
  return <span className="dashboard-action-icon">{icon}</span>;
}

function MetricsGrid({ metrics, className = '' }: { metrics: Metric[]; className?: string }) {
  return (
    <div className={`dashboard-metrics ${className}`}>
      {metrics.map((metric, index) => (
        <article className={`dashboard-metric metric-tone-${index % 4}`} key={metric.label}>
          <div className="dashboard-metric-top">
            <span className="dashboard-metric-icon">{metric.icon}</span>
            {metric.trend && (
              <span className={`dashboard-trend ${metric.direction === 'down' ? 'negative' : ''}`}>
                {metric.direction === 'down' ? <ArrowDownRight size={13} /> : <ArrowUpRight size={13} />}
                {metric.trend}
              </span>
            )}
          </div>
          <span className="dashboard-metric-label">{metric.label}</span>
          <strong className="dashboard-metric-value">{metric.value}</strong>
          <span className="dashboard-metric-detail">{metric.detail}</span>
        </article>
      ))}
    </div>
  );
}

function ChartPanel({ chart }: { chart: ChartSection }) {
  const axis = { tickLine: false, axisLine: false, tick: { fill: '#667085', fontSize: 11 } };
  return (
    <section className="panel dashboard-panel">
      <div className="panel-header">
        <div><h3>{chart.title}</h3><span className="small-label">{chart.subtitle}</span></div>
        <span className="dashboard-chart-period">Last 7 days</span>
      </div>
      <div className="dashboard-chart">
        <ResponsiveContainer width="100%" height="100%">
          {chart.type === 'area' ? (
            <AreaChart data={chart.data} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
              <defs>
                {chart.series.map((series) => <linearGradient id={`fill-${series.key}`} key={series.key} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={series.color} stopOpacity={0.2} /><stop offset="95%" stopColor={series.color} stopOpacity={0} /></linearGradient>)}
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9edf3" />
              <XAxis dataKey="day" {...axis} />
              <YAxis {...axis} />
              <Tooltip />
              <Legend />
              {chart.series.map((series) => <Area key={series.key} type="monotone" dataKey={series.key} name={series.label} stroke={series.color} fill={`url(#fill-${series.key})`} strokeWidth={2} />)}
            </AreaChart>
          ) : chart.type === 'line' ? (
            <LineChart data={chart.data} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9edf3" />
              <XAxis dataKey={String(Object.keys(chart.data[0] ?? {})[0])} {...axis} />
              <YAxis {...axis} />
              <Tooltip />
              <Legend />
              {chart.series.map((series) => <Line key={series.key} type="monotone" dataKey={series.key} name={series.label} stroke={series.color} strokeWidth={2.5} dot={{ r: 3 }} />)}
            </LineChart>
          ) : chart.type === 'donut' ? (
            <PieChart>
              <Tooltip />
              <Legend />
              <Pie data={chart.data} dataKey={chart.series[0]?.key ?? 'value'} nameKey={String(Object.keys(chart.data[0] ?? {})[0])} innerRadius={62} outerRadius={92} paddingAngle={3}>
                {chart.data.map((entry, index) => <Cell key={String(entry.name ?? index)} fill={['#2b6ef6', '#ee7625', '#16a078', '#c4a4f5', '#e4a834'][index % 5]} />)}
              </Pie>
            </PieChart>
          ) : (
            <BarChart data={chart.data} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9edf3" />
              <XAxis dataKey={String(Object.keys(chart.data[0] ?? {})[0])} {...axis} />
              <YAxis {...axis} />
              <Tooltip />
              <Legend />
              {chart.series.map((series) => <Bar key={series.key} dataKey={series.key} name={series.label} fill={series.color} radius={[6, 6, 0, 0]} />)}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function PrioritiesPanel({
  title,
  priorities,
  completed,
  onComplete,
}: {
  title: string;
  priorities: Priority[];
  completed: string[];
  onComplete: (id: string) => void;
}) {
  return (
    <section className="panel dashboard-panel">
      <div className="panel-header"><div><h3>{title}</h3><span className="small-label">Your next best actions</span></div><span className="dashboard-count">{priorities.length - completed.length} open</span></div>
      <div className="dashboard-priorities">
        {priorities.map((item) => {
          const isDone = completed.includes(item.id);
          return (
            <div className={`dashboard-priority ${isDone ? 'is-complete' : ''}`} key={item.id}>
              <button className="dashboard-check" type="button" aria-label={`${isDone ? 'Reopen' : 'Complete'} ${item.title}`} onClick={() => onComplete(item.id)}>{isDone && <Check size={13} />}</button>
              <div className="dashboard-priority-copy"><strong>{item.title}</strong><span>{item.detail}</span></div>
              <span className={`priority-pill priority-${item.level.toLowerCase()}`}>{isDone ? 'Done' : item.level}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ActivityPanel({ activities }: { activities: Activity[] }) {
  return (
    <section className="panel dashboard-panel">
      <div className="panel-header"><div><h3>Recent activity</h3><span className="small-label">Updates relevant to your role</span></div></div>
      <div className="dashboard-activity-list">
        {activities.map((item) => (
          <div className="dashboard-activity" key={`${item.title}-${item.detail}`}>
            <span className={`dashboard-activity-avatar avatar-${item.color}`}>{item.initials}</span>
            <div><strong>{item.title}</strong><span>{item.detail}</span></div>
          </div>
        ))}
      </div>
    </section>
  );
}

function DataTable({ table }: { table: TableSection }) {
  return (
    <section className="panel dashboard-panel dashboard-table-panel">
      <div className="panel-header"><div><h3>{table.title}</h3><span className="small-label">{table.subtitle}</span></div></div>
      <div className="table-shell dashboard-table-shell">
        <table>
          <thead><tr>{table.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
          <tbody>
            {table.rows.map((row, rowIndex) => <tr key={`${row[0]}-${rowIndex}`}>{row.map((cell, cellIndex) => <td key={`${cellIndex}-${cell}`}>{cell}</td>)}</tr>)}
            {table.rows.length === 0 && <tr><td colSpan={table.columns.length}><div className="empty-state">{table.emptyText ?? 'No records to show.'}</div></td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function QuickActions({ actions, onAction }: { actions: QuickAction[]; onAction: (action: QuickAction) => void }) {
  return (
    <section className="panel dashboard-panel dashboard-quick-panel">
      <div className="panel-header"><div><h3>Quick actions</h3><span className="small-label">Common tasks for your role</span></div></div>
      <div className="dashboard-quick-actions">
        {actions.map((action) => (
          <button type="button" className="dashboard-quick-action" key={action.label} onClick={() => onAction(action)} title={action.description}>
            <ActionIcon icon={action.icon} />
            <span>{action.label}</span>
            <ArrowRight size={14} className="dashboard-quick-arrow" />
          </button>
        ))}
      </div>
    </section>
  );
}

function makeDashboard(role: Role, data: ReturnType<typeof useStore.getState>): DashboardModel {
  const { orders, restaurants, leads, cases, tasks, documents, refunds, settlements, payments, consultations, feedbackEntries, employees, marketingCampaigns, invoices } = data;
  const restaurantById = new Map(restaurants.map((item) => [item.id, item]));
  const orderById = new Map(orders.map((item) => [item.id, item]));
  const orderTotal = orders.reduce((sum, item) => sum + item.totalINR, 0);
  const deliveredCount = orders.filter((item) => item.status === 'Delivered').length;
  const deliveredGmv = orders.filter((item) => item.status === 'Delivered').reduce((sum, item) => sum + item.totalINR, 0);
  const todayOrders = 18420;
  const activeOrders = orders.filter((item) => ['Placed', 'Preparing', 'Picked up'].includes(item.status));
  const merchantName = (id: string) => restaurantById.get(id)?.name ?? 'Restaurant partner';
  const orderName = (id: string) => orderById.get(id)?.orderNumber ?? 'Order';

  const sharedQuickActions = quickActionsByRole[role];
  const sharedPriorities = prioritiesByRole[role];
  const sharedActivity = activityByRole[role];
  const roleModels: Record<Role, Omit<DashboardModel, 'quickActions' | 'priorities' | 'activity'>> = {
    'Super Admin': {
      heading: 'Company command centre',
      welcome: 'Good morning, Admin. SwiftKart is tracking ahead of its weekly order plan.',
      location: 'All cities · National view',
      layout: 'executive',
      metrics: [
        { label: 'GMV this week', value: '₹82.4L', detail: 'Across 18,420 orders', trend: '+12.8%', direction: 'up', icon: <HandCoins size={17} /> },
        { label: 'Net platform revenue', value: '₹14.8L', detail: 'After promotions and refunds', trend: '+9.6%', direction: 'up', icon: <ArrowUpRight size={17} /> },
        { label: 'Orders', value: number(todayOrders), detail: 'Across 8 active cities', trend: '+8.2%', direction: 'up', icon: <PackageCheck size={17} /> },
        { label: 'Active customers', value: '12,840', detail: '4,210 repeat customers', trend: '+6.1%', direction: 'up', icon: <Users size={17} /> },
        { label: 'On-time delivery', value: '94.6%', detail: 'Target 95% · 0.4 pts gap', trend: '-0.4 pts', direction: 'down', icon: <Bike size={17} /> },
        { label: 'Cancellation rate', value: '2.8%', detail: 'Below 3% threshold', trend: '-0.6 pts', direction: 'up', icon: <ArrowDownRight size={17} /> },
      ],
      chart: { title: 'Business trends', subtitle: 'GMV in ₹ lakh · net revenue in ₹ lakh', type: 'area', data: weekTrend, series: [{ key: 'gmv', label: 'GMV (₹L)', color: '#2b6ef6' }, { key: 'revenue', label: 'Net revenue (₹L)', color: '#ee7625' }] },
      tables: [{
        title: 'City performance',
        subtitle: 'Revenue and delivery health by market',
        columns: ['City', 'Orders', 'Net revenue', 'On-time', 'Trend'],
        rows: cityPerformance.slice(0, 4).map((city) => [city.city, number(city.orders), money(city.revenue * 100000), `${city.onTime}%`, '↑ 4.2%']),
      }, {
        title: 'Employee performance',
        subtitle: 'City operations and partner support leaders',
        columns: ['Team member', 'Role', 'City', 'Today'],
        rows: employees.slice(0, 4).map((employee, index) => [employee.name, employee.role, employee.location, ['42 orders monitored', '18 partners helped', '12 tickets resolved', '8 payouts reconciled'][index]]),
      }],
    },
    'Business Owner': {
      heading: 'Business health',
      welcome: 'Good morning. Retention and order value are both trending up this week.',
      location: 'SwiftKart · All markets',
      layout: 'owner',
      metrics: [
        { label: 'Net revenue', value: '₹14.8L', detail: 'Net of promotions and refunds', trend: '+9.6%', direction: 'up', icon: <HandCoins size={17} /> },
        { label: 'GMV', value: '₹82.4L', detail: '18,420 completed and active orders', trend: '+12.8%', direction: 'up', icon: <PackageCheck size={17} /> },
        { label: 'Customer retention', value: '42.6%', detail: 'Repeat order rate this month', trend: '+3.4 pts', direction: 'up', icon: <Users size={17} /> },
        { label: 'Marketing ROI', value: '4.2×', detail: '₹4.20 GMV per ₹1 spent', trend: '+0.5×', direction: 'up', icon: <ArrowUpRight size={17} /> },
      ],
      chart: { title: 'GMV and net revenue', subtitle: 'Daily trend · ₹ lakh', type: 'area', data: weekTrend, series: [{ key: 'gmv', label: 'GMV', color: '#2b6ef6' }, { key: 'revenue', label: 'Net revenue', color: '#ee7625' }] },
      tables: [{
        title: 'Merchant settlement outlook',
        subtitle: 'Next payout window · 42 partners',
        columns: ['Partner', 'City', 'Orders', 'Payout', 'Status'],
        rows: settlements.slice(0, 4).map((item) => [merchantName(item.restaurantId), restaurantById.get(item.restaurantId)?.city ?? '', number(item.ordersCount), money(item.amountINR), item.status]),
      }, {
        title: 'Campaign returns',
        subtitle: 'Customer and restaurant growth',
        columns: ['Campaign', 'Spend', 'Attributed GMV', 'ROI'],
        rows: marketingCampaigns.slice(0, 3).map((campaign) => [campaign.name, money(campaign.spendINR), money(campaign.gmvINR), `${(campaign.gmvINR / campaign.spendINR).toFixed(1)}×`]),
      }],
    },
    'Branch Manager': {
      heading: 'Bengaluru city pulse',
      welcome: 'Good morning, Meera. Bengaluru is handling lunch peak with steady delivery performance.',
      location: 'Bengaluru · Local operations',
      layout: 'branch',
      metrics: [
        { label: 'Branch orders', value: '3,240', detail: 'Today across Bengaluru', trend: '+7.3%', direction: 'up', icon: <PackageCheck size={17} /> },
        { label: 'Local revenue', value: '₹8.9L', detail: 'GMV across city zones', trend: '+5.8%', direction: 'up', icon: <HandCoins size={17} /> },
        { label: 'Delivery on-time', value: '95.1%', detail: 'Target 95% · on track', trend: '+1.2 pts', direction: 'up', icon: <Bike size={17} /> },
        { label: 'Active partners', value: '186', detail: '14 onboarding this month', icon: <Store size={17} /> },
        { label: 'Cancellations', value: '2.4%', detail: '78 orders · mostly stock-outs', trend: '-0.3 pts', direction: 'up', icon: <ArrowDownRight size={17} /> },
        { label: 'Open complaints', value: '6', detail: '2 require city escalation', icon: <Headset size={17} /> },
      ],
      chart: { title: 'Today by hour', subtitle: 'Bengaluru orders · local time', type: 'bar', data: [{ hour: '9 AM', orders: 128 }, { hour: '10 AM', orders: 244 }, { hour: '11 AM', orders: 420 }, { hour: '12 PM', orders: 612 }, { hour: '1 PM', orders: 574 }, { hour: '2 PM', orders: 398 }, { hour: '3 PM', orders: 282 }], series: [{ key: 'orders', label: 'Orders', color: '#2b6ef6' }] },
      tables: [{
        title: 'Top restaurant partners',
        subtitle: 'Bengaluru performance today',
        columns: ['Restaurant', 'Orders', 'Rating', 'Prep time', 'Health'],
        rows: restaurants.filter((item) => item.city === 'Bengaluru').slice(0, 4).map((item, index) => [item.name, ['184', '152', '96', '74'][index], `★ ${item.avgRating}`, ['18 min', '21 min', '24 min', '19 min'][index], index === 2 ? 'Needs attention' : 'On track']),
      }],
    },
    'Operations Manager': {
      heading: 'Live fulfilment desk',
      welcome: 'Operations are live. Prioritize unassigned orders and breaches before the dinner ramp.',
      location: 'City operations · Multi-city queue',
      layout: 'operations',
      metrics: [
        { label: 'Active orders', value: '148', detail: '32 preparing · 116 in transit', icon: <PackageCheck size={17} /> },
        { label: 'Delayed deliveries', value: '12', detail: 'Oldest delay 18 minutes', trend: '+3', direction: 'down', icon: <Clock3 size={17} /> },
        { label: 'Unassigned orders', value: '7', detail: 'Needs rider assignment now', trend: '-2', direction: 'up', icon: <Users size={17} /> },
        { label: 'Riders available', value: '36 / 42', detail: '6 currently on active trips', icon: <Bike size={17} /> },
        { label: 'SLA breaches', value: '5', detail: '3 pickup · 2 hand-off', icon: <Clock3 size={17} /> },
        { label: 'Open incidents', value: number(cases.filter((item) => item.stage !== 'Resolved').length + 5), detail: '4 need an assigned owner', icon: <Building2 size={17} /> },
      ],
      chart: { title: 'Live order status', subtitle: 'Current order queue', type: 'donut', data: [{ name: 'Preparing', value: 32 }, { name: 'On the way', value: 109 }, { name: 'Delayed', value: 12 }, { name: 'Unassigned', value: 7 }], series: [{ key: 'value', label: 'Orders', color: '#2b6ef6' }] },
      tables: [{
        title: 'Priority order queue',
        subtitle: 'Orders needing an operations decision',
        columns: ['Order', 'City', 'Restaurant', 'Issue', 'Wait', 'Action'],
        rows: activeOrders.slice(0, 4).map((item, index) => [item.orderNumber, item.city, merchantName(item.restaurantId), ['Unassigned rider', 'Pickup running late', 'ETA exceeded', 'Restaurant prep delay'][index], `${8 + index * 3} min`, 'Review']),
      }, {
        title: 'Delivery partner availability',
        subtitle: 'Fleet ready by city',
        columns: ['City', 'Available', 'On delivery', 'Off shift', 'Coverage'],
        rows: ['Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad'].map((city, index) => [city, String([12, 8, 6, 5][index]), String([14, 11, 12, 9][index]), String([3, 4, 5, 2][index]), ['Good', 'Watch', 'Watch', 'Good'][index]]),
      }],
    },
    'Sales Executive': {
      heading: 'Merchant acquisition',
      welcome: 'Good morning, Sanjay. You are 74% to target with 5 days left in the month.',
      location: 'South & West partnerships',
      layout: 'sales',
      metrics: [
        { label: 'Open prospects', value: '42', detail: 'Across 6 city territories', icon: <Store size={17} /> },
        { label: 'Onboarding pipeline', value: '12', detail: '8 ready to launch this week', icon: <BadgeCheck size={17} /> },
        { label: 'Follow-ups due', value: '9', detail: '3 high-priority conversations', icon: <Clock3 size={17} /> },
        { label: 'Conversion rate', value: '28.4%', detail: 'Target 30% · +2.1 pts MoM', trend: '+2.1 pts', direction: 'up', icon: <ArrowUpRight size={17} /> },
      ],
      chart: { title: 'Acquisition funnel', subtitle: 'Merchant prospects by pipeline stage', type: 'bar', data: [{ stage: 'New', value: 18 }, { stage: 'Contacted', value: 13 }, { stage: 'Qualified', value: 8 }, { stage: 'Onboarding', value: 5 }, { stage: 'Live', value: 3 }], series: [{ key: 'value', label: 'Prospects', color: '#ee7625' }] },
      tables: [{
        title: 'Priority merchant pipeline',
        subtitle: 'Next conversations and onboarding milestones',
        columns: ['Prospect', 'City', 'Stage', 'Potential', 'Next follow-up'],
        rows: leads.slice(0, 5).map((lead) => [lead.name, lead.city, lead.status, money(lead.valueINR), new Date(lead.lastActivity).toLocaleDateString('en-IN')]),
      }],
    },
    Consultant: {
      heading: 'Partner success portfolio',
      welcome: 'Good morning, Ritika. 8 partner launches are in progress and 6 reviews are scheduled today.',
      location: 'Partner success · Bengaluru & Hyderabad',
      layout: 'consultant',
      metrics: [
        { label: 'Assigned merchants', value: '24', detail: 'Across 2 operating cities', icon: <Store size={17} /> },
        { label: 'Onboarding progress', value: '8', detail: '5 ready for launch this week', icon: <BadgeCheck size={17} /> },
        { label: 'Partner health', value: '92 / 100', detail: 'Portfolio average score', trend: '+4 pts', direction: 'up', icon: <ArrowUpRight size={17} /> },
        { label: 'Meetings today', value: '6', detail: '2 onboarding · 4 reviews', icon: <Clock3 size={17} /> },
      ],
      chart: { title: 'Partner service health', subtitle: 'Portfolio health by operating city', type: 'line', data: [{ city: 'Bengaluru', health: 88, sla: 93 }, { city: 'Hyderabad', health: 91, sla: 95 }, { city: 'Mumbai', health: 85, sla: 92 }, { city: 'Delhi', health: 89, sla: 94 }, { city: 'Chennai', health: 94, sla: 97 }], series: [{ key: 'health', label: 'Partner health', color: '#2b6ef6' }, { key: 'sla', label: 'Order SLA', color: '#16a078' }] },
      tables: [{
        title: 'Merchant health & onboarding',
        subtitle: 'Assigned portfolio · action needed on low scores',
        columns: ['Merchant', 'City', 'Stage', 'Health', 'Pending requirement'],
        rows: restaurants.slice(0, 5).map((item, index) => [item.name, item.city, item.partnerStatus, `${[94, 88, 91, 83, 76][index]}/100`, ['Menu photos', 'None', 'Bank proof', 'Operating hours', 'FSSAI certificate'][index]]),
      }],
    },
    'Documentation Executive': {
      heading: 'Merchant verification queue',
      welcome: 'Good morning, Neha. Clear the FSSAI queue first to unblock three partner launches.',
      location: 'KYC and compliance · All cities',
      layout: 'documents',
      metrics: [
        { label: 'Pending KYC', value: '18', detail: '9 FSSAI · 5 PAN · 4 GST', icon: <FileCheck2 size={17} /> },
        { label: 'Awaiting verification', value: number(documents.filter((item) => item.status === 'Pending').length + 9), detail: '4 items older than 24 hours', icon: <Clock3 size={17} /> },
        { label: 'Rejected documents', value: number(documents.filter((item) => item.status === 'Rejected').length + 2), detail: 'Resubmission requested', icon: <ArrowDownRight size={17} /> },
        { label: 'Agreements expiring', value: '5', detail: 'Renewal needed within 30 days', icon: <FileCheck2 size={17} /> },
      ],
      chart: { title: 'Verification queue', subtitle: 'Documents by review status', type: 'donut', data: [{ name: 'Verified', value: 64 }, { name: 'Pending', value: 18 }, { name: 'Rejected', value: 5 }], series: [{ key: 'value', label: 'Documents', color: '#2b6ef6' }] },
      tables: [{
        title: 'Priority verification queue',
        subtitle: 'Merchant documents awaiting review',
        columns: ['Merchant', 'Document', 'City', 'Received', 'Status'],
        rows: documents.slice(0, 5).map((item, index) => [item.owner, item.title, item.city, `${index + 1}h ago`, item.status]),
      }],
    },
    'Accounts Executive': {
      heading: 'Settlements & reconciliation',
      welcome: 'Good morning, Ishant. The current payout batch closes at 4:00 PM.',
      location: 'Finance operations · India',
      layout: 'accounts',
      metrics: [
        { label: 'Merchant settlements', value: money(settlements.reduce((sum, item) => sum + item.amountINR, 0)), detail: `${settlements.length} prepared or historical batches`, icon: <HandCoins size={17} /> },
        { label: 'Invoices pending', value: number(settlements.filter((item) => item.status !== 'Paid').length + invoices.filter((item) => !item.paid && item.invoiceType !== 'Merchant settlement').length), detail: `${money(invoices.filter((item) => !item.paid).reduce((sum, item) => sum + item.amountINR, 0))} awaiting payment`, icon: <FileCheck2 size={17} /> },
        { label: 'Refunds to process', value: '7', detail: '₹24,680 customer refund value', icon: <ArrowDownRight size={17} /> },
        { label: 'Reconciliation exceptions', value: '4', detail: '2 order · 2 settlement variance', icon: <Clock3 size={17} /> },
        { label: 'Outstanding balance', value: '₹12.4L', detail: 'Across merchant and ad invoices', icon: <HandCoins size={17} /> },
      ],
      chart: { title: 'Settlement batch progress', subtitle: 'Partner payout amount by status · ₹ lakh', type: 'bar', data: (['Prepared', 'Approved', 'Paid', 'Processing', 'Due'] as const).map((status) => ({ status, amount: settlements.filter((item) => item.status === status).reduce((sum, item) => sum + item.amountINR, 0) / 100000 })), series: [{ key: 'amount', label: '₹ lakh', color: '#16a078' }] },
      tables: [{
        title: 'Merchant settlement register',
        subtitle: 'Next payout window · 01–15 Nov',
        columns: ['Partner', 'Orders', 'Gross sales', 'Settlement', 'Status'],
        rows: settlements.slice(0, 5).map((item) => [merchantName(item.restaurantId), number(item.ordersCount), money(item.amountINR * 1.19), money(item.amountINR), item.status]),
      }, {
        title: 'Reconciliation exceptions',
        subtitle: 'Items needing ledger review',
        columns: ['Reference', 'Issue', 'Amount', 'Owner'],
        rows: refunds.slice(0, 3).map((item) => [orderName(item.orderId), item.reason, money(item.amountINR), 'Ishant Agarwal']),
      }],
    },
    'Customer Support': {
      heading: 'Customer care desk',
      welcome: 'Good morning, Ravi. Your response time is 6 minutes and customer rating is 4.6 today.',
      location: 'Customer support · Live queue',
      layout: 'support',
      metrics: [
        { label: 'Open tickets', value: '28', detail: '11 new · 17 in progress', icon: <Headset size={17} /> },
        { label: 'Unresolved complaints', value: '9', detail: '4 delivery · 3 order · 2 payment', icon: <MessageSquareText size={17} /> },
        { label: 'Avg first response', value: '6 min', detail: 'SLA under 8 minutes', trend: '-2 min', direction: 'up', icon: <Clock3 size={17} /> },
        { label: 'Escalations', value: '3', detail: '2 city ops · 1 payments', icon: <ArrowUpRight size={17} /> },
        { label: 'Customer rating', value: '4.6 / 5', detail: 'From 186 order ratings today', trend: '+0.2', direction: 'up', icon: <BadgeCheck size={17} /> },
        { label: 'Refund requests', value: '7', detail: `Pending value ${money(refunds.filter((item) => item.status === 'Pending').reduce((sum, item) => sum + item.amountINR, 0) + 24320)}`, icon: <HandCoins size={17} /> },
      ],
      chart: { title: 'Customer conversation load', subtitle: 'Open customer cases by city', type: 'bar', data: [{ city: 'Bengaluru', tickets: 8 }, { city: 'Mumbai', tickets: 6 }, { city: 'Delhi', tickets: 5 }, { city: 'Hyderabad', tickets: 4 }, { city: 'Other', tickets: 5 }], series: [{ key: 'tickets', label: 'Open tickets', color: '#2b6ef6' }] },
      tables: [{
        title: 'Priority customer tickets',
        subtitle: 'Oldest and escalated conversations first',
        columns: ['Customer', 'Order', 'Issue', 'City', 'Waiting', 'Priority'],
        rows: feedbackEntries.slice(0, 5).map((item, index) => [item.customer, orderName(item.orderId), item.category, item.city, `${[11, 9, 7, 5, 3][index]} min`, index < 2 ? 'High' : 'Normal']),
      }],
    },
  };

  const base = roleModels[role];
  const roleTableRows = base.tables.map((table) => ({
    ...table,
    rows: table.rows.map((row) => row.map((cell) => cell || '—')),
  }));
  if (role === 'Consultant') {
    const now = new Date();
    const upcoming = consultations
      .filter((meeting) => meeting.status === 'Scheduled' && new Date(meeting.date) >= now)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
    roleTableRows.push({
      title: 'Upcoming partner meetings',
      subtitle: 'Scheduled onboarding sessions and merchant reviews',
      columns: ['Merchant', 'Contact', 'Meeting', 'When', 'Owner', 'Location'],
      rows: upcoming.map((meeting) => [
        restaurantById.get(meeting.clientId)?.name ?? 'Restaurant partner',
        meeting.contactPerson ?? restaurantById.get(meeting.clientId)?.ownerName ?? 'Partner contact',
        meeting.meetingType,
        new Date(meeting.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        meeting.consultant,
        meeting.location ?? restaurantById.get(meeting.clientId)?.city ?? '—',
      ]),
    });
  }
  const newRecordActivity = [
    ...cases.filter((item) => item.createdAt).map((item) => ({ createdAt: item.createdAt!, title: `Incident logged · ${item.title}`, detail: `${item.incidentType} · ${item.assignedTo ?? 'Unassigned'}`, initials: 'OP', color: 'orange' })),
    ...consultations.filter((item) => item.createdAt).map((item) => ({ createdAt: item.createdAt!, title: `Partner meeting · ${restaurantById.get(item.clientId)?.name ?? 'Merchant'}`, detail: `${item.meetingType} · ${new Date(item.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}`, initials: 'MS', color: 'blue' })),
    ...tasks.filter((item) => item.createdAt).map((item) => ({ createdAt: item.createdAt!, title: `Task added · ${item.title}`, detail: `Assigned to ${item.assignee} · Due ${new Date(`${item.due.slice(0, 10)}T00:00:00`).toLocaleDateString('en-IN')}`, initials: 'TK', color: 'green' })),
    ...documents.filter((item) => item.createdAt).map((item) => ({ createdAt: item.createdAt!, title: `Document added · ${item.title}`, detail: `${item.owner} · ${item.status} verification`, initials: 'DK', color: 'blue' })),
    ...feedbackEntries.filter((item) => item.createdAt).map((item) => ({ createdAt: item.createdAt!, title: `Support ticket · ${item.subject ?? item.customer}`, detail: `${item.category} · ${item.priority ?? item.status}`, initials: 'CS', color: 'orange' })),
    ...employees.filter((item) => item.createdAt).map((item) => ({ createdAt: item.createdAt!, title: `Team member added · ${item.name}`, detail: `${item.role} · ${item.branch ?? item.location}`, initials: 'HR', color: 'green' })),
    ...settlements.filter((item) => item.createdAt).map((item) => ({ createdAt: item.createdAt!, title: `Settlement prepared · ${restaurantById.get(item.restaurantId)?.name ?? 'Merchant'}`, detail: `${item.reference ?? item.id} · ${money(item.amountINR)} payable`, initials: 'FN', color: 'green' })),
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3).map(({ createdAt: _createdAt, ...item }) => item);
  void orderTotal;
  void deliveredCount;
  void deliveredGmv;
  void activeOrders;
  void payments;
  void tasks;
  return {
    ...base,
    location: base.location,
    priorities: sharedPriorities,
    activity: [...newRecordActivity, ...sharedActivity].slice(0, 5),
    tables: roleTableRows,
    quickActions: sharedQuickActions,
  };
}

function RoleDashboardView({
  model,
  completed,
  onComplete,
  onAction,
  notice,
}: {
  model: DashboardModel;
  completed: string[];
  onComplete: (id: string) => void;
  onAction: (action: QuickAction) => void;
  notice: string;
}) {
  const [mainTable, secondaryTable] = model.tables;
  const metrics = <MetricsGrid metrics={model.metrics} />;
  const chart = <ChartPanel chart={model.chart} />;
  const priorities = <PrioritiesPanel title="Today's priorities" priorities={model.priorities} completed={completed} onComplete={onComplete} />;
  const activity = <ActivityPanel activities={model.activity} />;
  const quickActions = <QuickActions actions={model.quickActions} onAction={onAction} />;
  const firstTable = mainTable && <DataTable table={mainTable} />;
  const secondTable = secondaryTable && <DataTable table={secondaryTable} />;
  const statusNotice = notice && <div className="dashboard-notice" role="status"><Check size={15} />{notice}</div>;

  return (
    <>
      {statusNotice}
      <div className={`role-dashboard-layout layout-${model.layout}`}>
        {model.layout === 'executive' && <>{metrics}<div className="dashboard-main-split">{chart}<div className="dashboard-side-stack">{priorities}{quickActions}</div></div>{firstTable}{secondTable}<div className="dashboard-bottom-split">{activity}</div></>}
        {model.layout === 'owner' && <>{metrics}<div className="dashboard-main-split">{chart}<div className="dashboard-side-stack">{priorities}{quickActions}</div></div><div className="dashboard-two-tables">{firstTable}{secondTable}</div>{activity}</>}
        {model.layout === 'branch' && <>{metrics}<div className="dashboard-main-split">{firstTable}<div className="dashboard-side-stack">{priorities}{quickActions}</div></div>{chart}{activity}</>}
        {model.layout === 'operations' && <>{metrics}<div className="dashboard-ops-focus">{priorities}{chart}</div>{firstTable}{secondTable}{activity}{quickActions}</>}
        {model.layout === 'sales' && <>{metrics}<div className="dashboard-pipeline-focus">{chart}{priorities}</div>{firstTable}<div className="dashboard-bottom-split">{activity}{quickActions}</div></>}
        {model.layout === 'consultant' && <>{metrics}<div className="dashboard-main-split">{firstTable}<div className="dashboard-side-stack">{priorities}{quickActions}</div></div>{secondTable}{chart}{activity}</>}
        {model.layout === 'documents' && <>{metrics}<div className="dashboard-main-split">{firstTable}<div className="dashboard-side-stack">{priorities}{chart}</div></div>{activity}{quickActions}</>}
        {model.layout === 'accounts' && <>{metrics}<div className="dashboard-main-split">{chart}<div className="dashboard-side-stack">{priorities}{quickActions}</div></div><div className="dashboard-two-tables">{firstTable}{secondTable}</div>{activity}</>}
        {model.layout === 'support' && <>{metrics}<div className="dashboard-support-focus">{firstTable}<div className="dashboard-side-stack">{priorities}{chart}</div></div><div className="dashboard-bottom-split">{activity}{quickActions}</div></>}
      </div>
    </>
  );
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const storeData = useStore();
  const model = useMemo(() => makeDashboard(storeData.role, storeData), [storeData]);
  const [completed, setCompleted] = useState<string[]>([]);
  const [notice, setNotice] = useState('');
  const role = storeData.role;

  const togglePriority = (id: string) => {
    const item = model.priorities.find((priority) => priority.id === id);
    setCompleted((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
    setNotice(item ? `${item.title} ${completed.includes(id) ? 'reopened' : 'marked complete'} for this demo session.` : 'Priority updated.');
  };

  const handleAction = (action: QuickAction) => {
    setNotice(`${action.description} · opening ${action.path.slice(1)}.`);
    navigate(action.path);
  };

  return (
    <div className="page role-dashboard-page">
      <div className="role-dashboard-heading">
        <div>
          <p className="eyebrow">{model.location} · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <h2>{model.heading}</h2>
          <p className="dashboard-welcome">{model.welcome}</p>
        </div>
        <div className="dashboard-user-chip"><span className="dashboard-user-avatar">{role.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><span><strong>{role}</strong><small>SwiftKart demo workspace</small></span></div>
      </div>
      <RoleDashboardView model={model} completed={completed} onComplete={togglePriority} onAction={handleAction} notice={notice} />
    </div>
  );
};
