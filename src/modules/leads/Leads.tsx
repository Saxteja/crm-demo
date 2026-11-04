// src/modules/leads/Leads.tsx
import React, { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { useStore, type Lead } from '../../store';
import { useModulePermissions } from '../../hooks/useModulePermissions';

const statusOptions = ['All', 'New', 'Contacted', 'Qualified', 'Converted'];
const initialForm = {
  name: '',
  email: '',
  phone: '',
  city: '',
  cuisine: '',
  source: 'Merchant referral',
  valueINR: '',
};

export const Leads: React.FC = () => {
  const { leads, setLeads, role } = useStore();
  const permissions = useModulePermissions('leads');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
    const matchesSearch = `${lead.name} ${lead.email} ${lead.phone} ${lead.city} ${lead.cuisine}`.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === 'All' || lead.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [leads, search, status]);

  const updateForm = (field: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFormError('');
  };

  const handleAddLead = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!permissions.create) return;

    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const city = form.city.trim();
    const cuisine = form.cuisine.trim();
    const valueINR = Number(form.valueINR);
    if (!name || !email || !phone || !city || !cuisine || !form.valueINR.trim()) {
      setFormError('Complete all required fields before adding this merchant lead.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError('Enter a valid contact email address.');
      return;
    }
    if (!Number.isFinite(valueINR) || valueINR < 0) {
      setFormError('Expected monthly opportunity must be a non-negative amount.');
      return;
    }

    const newLead: Lead = {
      id: uuid(),
      name,
      email,
      phone,
      city,
      cuisine,
      source: form.source,
      status: 'New',
      assignedTo: role === 'Sales Executive' ? 'Ritika Sen' : role,
      valueINR,
      lastActivity: new Date().toISOString().slice(0, 10),
    };
    setLeads([...leads, newLead]);
    setSearch('');
    setStatus('All');
    setForm(initialForm);
    setFormError('');
    setShowModal(false);
    setSuccessMessage(`${name} was added to the merchant pipeline.`);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Restaurant and merchant acquisition</p>
          <h2>Merchant Leads</h2>
        </div>
        <div className="header-actions">
          <button className="primary-button" type="button" disabled={!permissions.create} title={!permissions.create ? 'Your role does not have Create permission' : undefined} onClick={() => { setSuccessMessage(''); setShowModal(true); }}>
            <Plus size={15} /> Add merchant lead
          </button>
        </div>
      </div>

      {successMessage && <div className="form-feedback form-feedback-success" role="status">{successMessage}</div>}

      <div className="toolbar">
        <div className="search-box">
          <Search size={16} color="#667085" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search restaurant, cuisine or city" />
        </div>

        <select value={status} onChange={(e) => setStatus(e.target.value)} className="control-inline">
          {statusOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      <div className="table-shell">
        <table>
          <thead>
            <tr>
              <th>Restaurant prospect</th>
              <th>Cuisine</th>
              <th>City</th>
              <th>Contact</th>
              <th>Source</th>
              <th>Pipeline</th>
              <th>Owner</th>
              <th>Opportunity</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="empty-state">No leads match the current filters.</div>
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => (
                <tr key={lead.id}>
                  <td>{lead.name}</td>
                  <td>{lead.cuisine}</td>
                  <td>{lead.city}</td>
                  <td><div>{lead.email}</div><small>{lead.phone}</small></td>
                  <td>{lead.source}</td>
                  <td><span className={`badge status-${lead.status.toLowerCase()}`}>{lead.status}</span></td>
                  <td>{lead.assignedTo}</td>
                  <td>₹{lead.valueINR.toLocaleString('en-IN')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <section className="modal-card lead-modal" role="dialog" aria-modal="true" aria-labelledby="add-lead-title" onClick={(event) => event.stopPropagation()}>
            <form onSubmit={handleAddLead} noValidate>
              <div className="modal-head">
                <h3 id="add-lead-title">Add merchant lead</h3>
                <button className="icon-button" type="button" aria-label="Close dialog" onClick={() => setShowModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <p className="small-label">Add a restaurant or merchant prospect to the SwiftKart acquisition pipeline.</p>
                <div className="form-grid">
                  <label className="field"><span>Restaurant / merchant name *</span><input autoFocus value={form.name} onChange={(event) => updateForm('name', event.target.value)} /></label>
                  <label className="field"><span>Contact email *</span><input type="email" value={form.email} onChange={(event) => updateForm('email', event.target.value)} /></label>
                  <label className="field"><span>Phone *</span><input type="tel" value={form.phone} onChange={(event) => updateForm('phone', event.target.value)} /></label>
                  <label className="field"><span>City *</span><input value={form.city} onChange={(event) => updateForm('city', event.target.value)} /></label>
                  <label className="field"><span>Cuisine / category *</span><input value={form.cuisine} onChange={(event) => updateForm('cuisine', event.target.value)} /></label>
                  <label className="field"><span>Lead source</span><select value={form.source} onChange={(event) => updateForm('source', event.target.value)}><option>Merchant referral</option><option>Outbound sales</option><option>Website</option><option>Food expo</option><option>Campaign</option></select></label>
                  <label className="field"><span>Expected monthly opportunity (₹) *</span><input type="number" min="0" step="1" value={form.valueINR} onChange={(event) => updateForm('valueINR', event.target.value)} /></label>
                </div>
                {formError && <p className="form-feedback form-feedback-error" role="alert">{formError}</p>}
              </div>
              <div className="modal-footer">
                <button className="secondary-button" type="button" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="primary-button" type="submit" disabled={!permissions.create}>Add lead</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};
