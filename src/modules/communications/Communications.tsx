import React from 'react';
import { useStore } from '../../store';
import { useModulePermissions } from '../../hooks/useModulePermissions';

export const Communications: React.FC = () => {
  const { communications } = useStore();
  const permissions = useModulePermissions('communications');

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Customer, merchant and fleet conversations</p>
          <h2>Communications & Alerts</h2>
        </div>
        <button className="primary-button" type="button" disabled={!permissions.create} title={!permissions.create ? 'Your role does not have Create permission' : undefined}>Send broadcast</button>
      </div>

      <div className="grid-2">
        <div className="panel">
          <div className="panel-header">
            <h3>Message activity</h3>
          </div>
          <div className="list-stack">
            {communications.map((item) => (
              <div key={item.id} className="row-item">
                <div>
                  <strong>{item.from}</strong>
                  <div className="small-label">{item.audience} · {item.channel}</div>
                  <p className="communication-message">{item.message}</p>
                </div>
                <div className="small-label">{new Date(item.timestamp).toLocaleString('en-IN')}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Automation rules</h3>
          </div>
          <div className="list-stack">
            <div className="row-item"><span>Order delay customer update</span><span className="badge status-new">Active</span></div>
            <div className="row-item"><span>Merchant KYC follow-up</span><span className="badge status-contacted">Queued</span></div>
            <div className="row-item"><span>Pending settlement reminder</span><span className="badge status-qualified">Ready</span></div>
            <div className="row-item"><span>Post-delivery rating request</span><span className="badge status-scheduled">Scheduled</span></div>
            <div className="row-item"><span>Delivery incident escalation</span><span className="badge status-pending">Active</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
