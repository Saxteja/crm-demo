import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { useStore, type Case as Incident } from '../../store';
import { useModulePermissions } from '../../hooks/useModulePermissions';
import { Modal } from '../../components/ui/Modal';

const columns = ['Investigating', 'Assigned', 'Resolved'];
const categories = ['Delayed delivery', 'Missing order', 'Damaged order', 'Payment issue', 'Merchant issue', 'Delivery partner issue', 'Other'];
const initialForm = {
  title: '',
  orderId: '',
  clientId: '',
  incidentType: categories[0],
  priority: 'Medium' as Incident['priority'],
  description: '',
  assignedTo: '',
  stage: 'Investigating',
};

export const Cases: React.FC = () => {
  const { cases, setCases, clients, orders, restaurants, deliveryPartners, employees } = useStore();
  const permissions = useModulePermissions('cases');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const updateCase = (id: string, updates: Partial<Incident>) => {
    if (!permissions.edit) return;
    setCases(cases.map((item) => item.id === id ? { ...item, ...updates } : item));
  };

  const submitIncident = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const client = clients.find((item) => item.id === form.clientId);
    if (!form.title.trim() || !client || !form.incidentType || !form.priority || !form.assignedTo) {
      setFormError('Enter an incident title and select a customer or merchant and assignee.');
      return;
    }

    setSubmitting(true);
    const order = orders.find((item) => item.id === form.orderId);
    const relatedRestaurant = restaurants.find((item) => item.id === client.id)
      ?? restaurants.find((item) => item.id === order?.restaurantId);
    const incident: Incident = {
      id: uuid(),
      title: form.title.trim(),
      clientId: client.id,
      orderId: order?.id ?? '',
      restaurantId: relatedRestaurant?.id ?? '',
      deliveryPartnerId: order?.deliveryPartnerId ?? '',
      stage: form.stage,
      valueINR: order?.totalINR ?? 0,
      priority: form.priority,
      incidentType: form.incidentType,
      description: form.description.trim(),
      assignedTo: form.assignedTo,
      createdAt: new Date().toISOString(),
    };
    setCases([...cases, incident]);
    setNotice(`${incident.title} was added to the incident queue.`);
    setForm(initialForm);
    setFormError('');
    setShowModal(false);
    setSubmitting(false);
  };

  const openNew = () => {
    setForm({
      ...initialForm,
      clientId: clients[0]?.id ?? '',
      assignedTo: employees.find((item) => item.status !== 'Inactive')?.name ?? '',
    });
    setFormError('');
    setShowModal(true);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Applications, admissions and visa cases</p>
          <h2>Applications & Visa Cases</h2>
        </div>
        <div className="header-actions">
          <button className="primary-button" type="button" disabled={!permissions.create} onClick={openNew}><Plus size={15} /> Log incident</button>
          {!permissions.create && <p className="permission-hint">Your role does not have Create permission for incidents.</p>}
        </div>
      </div>
      {notice && <p className="form-feedback form-feedback-success" role="status">{notice}</p>}
      {!permissions.edit && <p className="permission-hint">Your role can view incidents but cannot change status or assignment.</p>}

      <div className="grid-2">
        {columns.map((column) => {
          const columnCases = cases.filter((item) => item.stage === column);
          return (
            <div key={column} className="panel">
              <div className="panel-header">
                <h3>{column}</h3>
                <span className="small-label">{columnCases.length}</span>
              </div>
              <div className="list-stack">
                {columnCases.length === 0 ? <div className="empty-state">No cases in this stage.</div> : columnCases.map((caseItem) => {
                  const client = clients.find((item) => item.id === caseItem.clientId);
                  const order = orders.find((item) => item.id === caseItem.orderId);
                  const restaurant = restaurants.find((item) => item.id === caseItem.restaurantId);
                  const deliveryPartner = deliveryPartners.find((item) => item.id === caseItem.deliveryPartnerId);
                  return (
                    <div key={caseItem.id} className="row-item">
                      <div>
                        <strong>{caseItem.title}</strong>
                        <div className="small-label">{order?.orderNumber ?? 'No order linked'} · {caseItem.incidentType}</div>
                        <div className="small-label">{client?.name ?? restaurant?.name} · {deliveryPartner?.name ?? 'No delivery partner linked'}</div>
                        {caseItem.description && <div className="small-label">{caseItem.description}</div>}
                        <div className="record-actions" style={{ marginTop: 8 }}>
                          <label className="field"><span>Owner</span><select className="inline-control" aria-label={`Assign ${caseItem.title}`} value={caseItem.assignedTo ?? ''} disabled={!permissions.edit} onChange={(event) => updateCase(caseItem.id, { assignedTo: event.target.value })}><option value="">Unassigned</option>{employees.filter((item) => item.status !== 'Inactive').map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</select></label>
                          <label className="field"><span>Status</span><select className="inline-control" aria-label={`Status for ${caseItem.title}`} value={caseItem.stage} disabled={!permissions.edit} onChange={(event) => updateCase(caseItem.id, { stage: event.target.value })}>{columns.map((value) => <option key={value}>{value}</option>)}</select></label>
                        </div>
                      </div>
                      <div>
                        <div className="small-label">{order?.city ?? client?.city ?? 'StudyBridge'} · ₹{caseItem.valueINR.toLocaleString('en-IN')}</div>
                        <span className={`badge status-${caseItem.priority.toLowerCase()}`}>{caseItem.priority}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <section>
        <div className="panel-header"><h3>Recent applications</h3><span className="small-label">{orders.length} fictional linked orders</span></div>
        <div className="table-shell">
          <table>
            <thead><tr><th>Order</th><th>Customer</th><th>Restaurant</th><th>Delivery partner</th><th>City</th><th>Order status</th><th>Total</th></tr></thead>
            <tbody>{orders.map((order) => (
              <tr key={order.id}>
                <td>{order.orderNumber}</td>
                <td>{clients.find((client) => client.id === order.clientId)?.name}</td>
                <td>{restaurants.find((restaurant) => restaurant.id === order.restaurantId)?.name}</td>
                <td>{deliveryPartners.find((partner) => partner.id === order.deliveryPartnerId)?.name}</td>
                <td>{order.city}</td>
                <td><span className={`badge status-${order.status.toLowerCase().replace(/\s+/g, '-')}`}>{order.status}</span></td>
                <td>₹{order.totalINR.toLocaleString('en-IN')}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </section>

      {showModal && (
        <Modal title="Log delivery or order incident" size="large" onClose={() => setShowModal(false)}>
          <form onSubmit={submitIncident}>
            <div className="modal-body">
              <div className="form-grid">
                <label className="field full"><span>Incident title *</span><input autoFocus value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
                <label className="field"><span>Order ID (optional)</span><select value={form.orderId} onChange={(event) => {
                  const order = orders.find((item) => item.id === event.target.value);
                  setForm((current) => ({ ...current, orderId: event.target.value, clientId: order?.clientId ?? current.clientId }));
                }}><option value="">No order linked</option>{orders.map((item) => <option key={item.id} value={item.id}>{item.orderNumber} · {item.city}</option>)}</select></label>
                <label className="field"><span>Customer / merchant *</span><select value={form.clientId} onChange={(event) => setForm({ ...form, clientId: event.target.value })}><option value="">Select a record</option>{clients.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.type}</option>)}</select></label>
                <label className="field"><span>Incident category *</span><select value={form.incidentType} onChange={(event) => setForm({ ...form, incidentType: event.target.value })}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
                <label className="field"><span>Severity *</span><select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as Incident['priority'] })}><option>Low</option><option>Medium</option><option>High</option></select></label>
                <label className="field"><span>Assigned employee *</span><select value={form.assignedTo} onChange={(event) => setForm({ ...form, assignedTo: event.target.value })}><option value="">Select employee</option>{employees.filter((item) => item.status !== 'Inactive').map((item) => <option key={item.id} value={item.name}>{item.name} · {item.role}</option>)}</select></label>
                <label className="field"><span>Status *</span><select value={form.stage} onChange={(event) => setForm({ ...form, stage: event.target.value })}>{columns.map((column) => <option key={column}>{column}</option>)}</select></label>
                <label className="field full"><span>Description</span><textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
              </div>
              {formError && <p className="form-feedback form-feedback-error" role="alert">{formError}</p>}
            </div>
            <div className="modal-footer">
              <button className="secondary-button" type="button" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="primary-button" type="submit" disabled={submitting || !permissions.create}>Save incident</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
