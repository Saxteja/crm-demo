import React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useStore } from '../../store';

const money = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

export const Reports: React.FC = () => {
  const { reports, orders, refunds, settlements } = useStore();
  const gmv = orders.reduce((sum, order) => sum + order.totalINR, 0);
  const delivered = orders.filter((order) => order.status === 'Delivered').length;
  const cancelled = orders.filter((order) => order.status === 'Cancelled').length;
  const refundValue = refunds.reduce((sum, refund) => sum + refund.amountINR, 0);
  const deliveredOrders = orders.filter((order) => order.status === 'Delivered');
  const avgDeliveryMinutes = Math.round(deliveredOrders.reduce((sum, order) => sum + order.etaMinutes, 0) / Math.max(deliveredOrders.length, 1));
  const cityData = [...new Set(orders.map((order) => order.city))].map((city) => ({
    city,
    orders: orders.filter((order) => order.city === city).length,
    gmv: orders.filter((order) => order.city === city).reduce((sum, order) => sum + order.totalINR, 0),
  }));
  const onTimeRate = Math.round((delivered / Math.max(orders.length - cancelled, 1)) * 100);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Commerce health across StudyBridge cities</p>
          <h2>Applications & Consultancy Reports</h2>
        </div>
      </div>

      <div className="stats-grid">
        <div className="card"><h3>Orders</h3><div className="metric-value">{orders.length}</div><div className="metric-sub">{delivered} delivered in the current sample</div></div>
        <div className="card"><h3>GMV</h3><div className="metric-value">{money(gmv)}</div><div className="metric-sub">Consultancy revenue</div></div>
        <div className="card"><h3>Delivery completion</h3><div className="metric-value">{onTimeRate}%</div><div className="metric-sub">Delivered of non-cancelled orders</div></div>
        <div className="card"><h3>Average application turnaround</h3><div className="metric-value">{avgDeliveryMinutes} min</div><div className="metric-sub">Across delivered orders</div></div>
        <div className="card"><h3>Cancellations</h3><div className="metric-value">{cancelled}</div><div className="metric-sub">{((cancelled / Math.max(orders.length, 1)) * 100).toFixed(1)}% of sample orders</div></div>
        <div className="card"><h3>Refund exposure</h3><div className="metric-value">{money(refundValue)}</div><div className="metric-sub">{refunds.length} customer refund requests</div></div>
      </div>

      <div className="panel-grid">
        <div className="panel">
          <div className="panel-header"><h3>Applications by destination</h3><span className="small-label">Order count</span></div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cityData} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="city" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="orders" fill="#2b6ef6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="panel">
          <div className="panel-header"><h3>Consultancy revenue by destination</h3><span className="small-label">Fictional order volume</span></div>
          <div className="list-stack">
            {cityData.sort((a, b) => b.gmv - a.gmv).map((city) => (
              <div className="row-item" key={city.city}><div><strong>{city.city}</strong><div className="small-label">{city.orders} orders</div></div><strong>{money(city.gmv)}</strong></div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header"><h3>Operations reports</h3><span className="small-label">{settlements.length} partner settlement batches tracked</span></div>
        <div className="list-stack">
          {reports.map((report) => (
            <div key={report.id} className="row-item">
              <div><strong>{report.title}</strong><div className="small-label">{report.summary}</div></div>
              <span className="small-label">{new Date(report.date).toLocaleDateString('en-IN')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
