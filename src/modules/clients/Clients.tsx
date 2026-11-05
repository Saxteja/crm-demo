import React, { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { useStore, type Client } from '../../store';
import { useModulePermissions } from '../../hooks/useModulePermissions';

type ClientForm = Pick<Client, 'name' | 'type' | 'contactEmail' | 'contactPhone' | 'city' | 'segment'>;

const initialForm: ClientForm = {
  name: '',
  type: 'Customer',
  contactEmail: '',
  contactPhone: '',
  city: 'Bengaluru',
  segment: 'New',
};

export const Clients: React.FC = () => {
  const { clients, setClients, restaurants, setRestaurants } = useStore();
  const permissions = useModulePermissions('clients');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<ClientForm>(initialForm);

  const filteredClients = useMemo(() => clients.filter((client) => {
    const matchesSearch = `${client.name} ${client.city} ${client.contactEmail} ${client.contactPhone}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (typeFilter === 'All' || client.type === typeFilter);
  }), [clients, search, typeFilter]);

  const handleAddClient = () => {
    if (!form.name.trim() || !form.contactPhone.trim()) return;
    const newClient: Client = {
      ...form,
      id: uuid(),
      name: form.name.trim(),
      contactEmail: form.contactEmail.trim() || 'hello@studybridge.example',
      contactPhone: form.contactPhone.trim(),
      totalOrders: 0,
      lifetimeValueINR: 0,
    };
    setClients([...clients, newClient]);
    if (newClient.type === 'Merchant') {
      setRestaurants([...restaurants, {
        id: newClient.id,
        name: newClient.name,
        cuisine: 'Multi-cuisine',
        city: newClient.city,
        ownerName: newClient.name,
        phone: newClient.contactPhone,
        partnerStatus: 'Onboarding',
        avgRating: 0,
        commissionRate: 18,
      }]);
    }
    setForm(initialForm);
    setShowModal(false);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Student and university directory</p>
          <h2>Students & Universities</h2>
        </div>
        <button className="primary-button" type="button" disabled={!permissions.create} title={!permissions.create ? 'Your role does not have Create permission' : undefined} onClick={() => setShowModal(true)}>
          <Plus size={15} /> Add directory record
        </button>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={16} color="#667085" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, phone or city" />
        </div>
        <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="control-inline" aria-label="Filter by record type">
          <option>All</option><option>Customer</option><option>Merchant</option>
        </select>
      </div>

      <div className="table-shell">
        <table>
          <thead>
            <tr><th>Name</th><th>Type</th><th>City</th><th>Contact</th><th>Orders</th><th>Lifetime value</th><th>Segment</th></tr>
          </thead>
          <tbody>
            {filteredClients.map((client) => (
              <tr key={client.id}>
                <td>{client.name}</td>
                <td><span className={`badge ${client.type === 'Merchant' ? 'status-contacted' : 'status-new'}`}>{client.type}</span></td>
                <td>{client.city}</td>
                <td><div>{client.contactPhone}</div><small>{client.contactEmail}</small></td>
                <td>{client.totalOrders}</td>
                <td>{client.type === 'Customer' ? `₹${client.lifetimeValueINR.toLocaleString('en-IN')}` : '—'}</td>
                <td><span className="badge status-qualified">{client.segment}</span></td>
              </tr>
            ))}
            {filteredClients.length === 0 && <tr><td colSpan={7}><div className="empty-state">No customers or merchants match your search.</div></td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-head">
              <h3>Add StudyBridge directory record</h3>
              <button className="icon-button" type="button" aria-label="Close dialog" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <label className="field"><span>Name</span><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
                <label className="field"><span>Record type</span><select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as Client['type'] })}><option>Customer</option><option>Merchant</option></select></label>
                <label className="field"><span>City</span><input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} /></label>
                <label className="field"><span>Phone</span><input value={form.contactPhone} onChange={(event) => setForm({ ...form, contactPhone: event.target.value })} /></label>
                <label className="field full"><span>Email</span><input value={form.contactEmail} onChange={(event) => setForm({ ...form, contactEmail: event.target.value })} /></label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="secondary-button" type="button" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="primary-button" type="button" disabled={!permissions.create || !form.name.trim() || !form.contactPhone.trim()} onClick={handleAddClient}>Save record</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
