import React from 'react';
import { Blocks, Building2 } from 'lucide-react';

export const About: React.FC = () => (
  <div className="page about-page">
    <div className="page-header">
      <div>
        <p className="eyebrow">Platform information</p>
        <h2>About SoftIntellTech</h2>
      </div>
    </div>

    <section className="about-provider-card">
      <div className="about-provider-mark" aria-hidden="true">SI</div>
      <div className="about-provider-content">
        <p className="eyebrow">CRM Platform Provider</p>
        <h3>SoftIntellTech</h3>
        <p>SoftIntellTech develops and provides the CRM platform used in this demonstration.</p>
      </div>
    </section>

    <div className="about-details-grid">
      <section className="card about-detail-card">
        <div className="about-detail-icon"><Blocks size={18} /></div>
        <div>
          <h3>A reusable CRM platform</h3>
          <p>
            The platform can be customized for different industries and businesses, with workflows and
            workspaces adapted to each organization.
          </p>
        </div>
      </section>
      <section className="card about-detail-card">
        <div className="about-detail-icon about-tenant-icon"><Building2 size={18} /></div>
        <div>
          <h3>StudyBridge demonstration tenant</h3>
          <p>
            StudyBridge is the fictional client identity for this study abroad consultancy demonstration. The CRM
            platform is provided by SoftIntellTech.
          </p>
        </div>
      </section>
    </div>

    <div className="about-attribution">
      <span className="about-attribution-mark" aria-hidden="true">SI</span>
      <span><strong>StudyBridge CRM</strong> — Powered by SoftIntellTech</span>
    </div>
  </div>
);
