import React from 'react';
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useStore } from '../../store';

export const Marketing: React.FC = () => {
  const { marketingCampaigns } = useStore();
  const campaignOrders = marketingCampaigns.reduce((sum, campaign) => sum + campaign.orders, 0);
  const campaignGMV = marketingCampaigns.reduce((sum, campaign) => sum + campaign.gmvINR, 0);
  const campaignSpend = marketingCampaigns.reduce((sum, campaign) => sum + campaign.spendINR, 0);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Student recruitment and study abroad campaigns</p>
          <h2>Campaign Performance</h2>
        </div>
      </div>

      <div className="stats-grid">
        <div className="card"><h3>Campaign applications</h3><div className="metric-value">{campaignOrders.toLocaleString('en-IN')}</div><div className="metric-sub">Applications attributed to demo data</div></div>
        <div className="card"><h3>Consultancy revenue</h3><div className="metric-value">₹{campaignGMV.toLocaleString('en-IN')}</div><div className="metric-sub">Consultancy fees attributed</div></div>
        <div className="card"><h3>Marketing spend</h3><div className="metric-value">₹{campaignSpend.toLocaleString('en-IN')}</div><div className="metric-sub">Fictional campaign budget</div></div>
      </div>
      <div className="panel-grid">
        <div className="panel">
          <div className="panel-header">
            <h3>Applications by campaign</h3>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={marketingCampaigns} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="orders" fill="#2b6ef6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Campaign summary</h3>
          </div>
          <div className="list-stack">
            {marketingCampaigns.map((campaign) => (
              <div key={campaign.id} className="row-item">
                <div>
                  <strong>{campaign.name}</strong>
                  <div className="small-label">{campaign.orders.toLocaleString('en-IN')} orders · {campaign.conversions} partner/customer conversions</div>
                </div>
                <div className="campaign-values"><strong>₹{campaign.gmvINR.toLocaleString('en-IN')} GMV</strong><span className="small-label">Spend ₹{campaign.spendINR.toLocaleString('en-IN')}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
