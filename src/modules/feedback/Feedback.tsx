import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { useStore, type FeedbackEntry } from '../../store';
import { useModulePermissions } from '../../hooks/useModulePermissions';
import { Modal } from '../../components/ui/Modal';

const categories: Exclude<FeedbackEntry['category'], 'Complaint' | 'Support ticket' | 'Rating'>[] = ['delivery', 'order', 'payment', 'refund', 'restaurant', 'account', 'other'];
const statuses: FeedbackEntry['status'][] = ['Open', 'In Progress', 'Escalated', 'Resolved'];
const priorities: NonNullable<FeedbackEntry['priority']>[] = ['Low', 'Medium', 'High', 'Urgent'];
const initialForm = { subject: '', clientId: '', orderId: '', category: 'delivery' as FeedbackEntry['category'], priority: 'Medium' as NonNullable<FeedbackEntry['priority']>, description: '', assignedTo: '' };

export const Feedback: React.FC = () => {
  const { feedbackEntries, setFeedbackEntries, orders, clients, employees } = useStore();
  const permissions = useModulePermissions('feedback');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const updateTicket = (id: string, updates: Partial<FeedbackEntry>) => {
    if (!permissions.edit) return;
    setFeedbackEntries(feedbackEntries.map((item) => item.id === id ? { ...item, ...updates } : item));
  };

  const submitTicket = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const client = clients.find((item) => item.id === form.clientId);
    if (!form.subject.trim() || !client || !form.category || !form.priority || !form.description.trim() || !form.assignedTo) {
      setFormError('Subject, customer, category, priority, description and assigned support employee are required.');
      return;
    }

    setSubmitting(true);
    const ticket: FeedbackEntry = {
      id: uuid(),
      customer: client.name,
      rating: 0,
      comment: form.description.trim(),
      subject: form.subject.trim(),
      status: 'Open',
      orderId: form.orderId,
      city: client.city,
      category: form.category as FeedbackEntry['category'],
      priority: form.priority,
      assignedTo: form.assignedTo,
      createdAt: new Date().toISOString(),
    };
    setFeedbackEntries([ticket, ...feedbackEntries]);
    setNotice(`${ticket.subject} was added to the support queue.`);
    setForm(initialForm);
    setFormError('');
    setShowModal(false);
    setSubmitting(false);
  };

  const customerClients = clients.filter((item) => item.type === 'Customer');

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Ratings, complaints and customer help</p>
          <h2>Customer Support</h2>
        </div>
        <div className="header-actions">
          <button className="primary-button" type="button" disabled={!permissions.create} onClick={() => {
            setForm({ ...initialForm, clientId: customerClients[0]?.id ?? '', assignedTo: employees.find((item) => item.status !== 'Inactive' && /support/i.test(item.department ?? item.role))?.name ?? employees.find((item) => item.status !== 'Inactive')?.name ?? '' });
            setFormError('');
            setShowModal(true);
          }}><Plus size={15} /> New ticket</button>
          {!permissions.create && <p className="permission-hint">Your role does not have Create permission for support tickets.</p>}
        </div>
      </div>
      {notice && <p className="form-feedback form-feedback-success" role="status">{notice}</p>}
      {!permissions.edit && <p className="permission-hint">Your role can view tickets but cannot change status or assignment.</p>}

      <div className="grid-2">
        {feedbackEntries.map((entry) => (
          <div key={entry.id} className="card">
            <div className="panel-header">
              <div><h3>{entry.subject ?? entry.customer}</h3><span className="small-label">{entry.customer}</span></div>
              <select className="inline-control" aria-label={`Ticket status for ${entry.subject ?? entry.customer}`} value={entry.status} disabled={!permissions.edit} title={!permissions.edit ? 'Your role does not have Edit permission' : undefined} onChange={(event) => updateTicket(entry.id, { status: event.target.value as FeedbackEntry['status'] })}>{statuses.map((status) => <option key={status}>{status}</option>)}</select>
            </div>
            <div className="support-meta"><span className="badge status-contacted">{entry.category}</span><span>{entry.city}</span><span>{orders.find((order) => order.id === entry.orderId)?.orderNumber ?? 'No order linked'}</span></div>
            <div className="support-meta"><span>{entry.priority ? `${entry.priority} priority` : `Rating: ${'★'.repeat(entry.rating) || '—'}`}</span><span>Assigned to {entry.assignedTo ?? 'Support queue'}</span></div>
            <p className="metric-sub">{entry.comment}</p>
          </div>
        ))}
        {feedbackEntries.length === 0 && <div className="empty-state">No support tickets yet. Add a ticket to the queue.</div>}
      </div>

      {showModal && (
        <Modal title="Create customer support ticket" size="large" onClose={() => setShowModal(false)}>
          <form onSubmit={submitTicket}>
            <div className="modal-body">
              <div className="form-grid">
                <label className="field full"><span>Subject *</span><input autoFocus value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} /></label>
                <label className="field"><span>Customer *</span><select value={form.clientId} onChange={(event) => setForm({ ...form, clientId: event.target.value })}><option value="">Select customer</option>{customerClients.map((client) => <option key={client.id} value={client.id}>{client.name} · {client.city}</option>)}</select></label>
                <label className="field"><span>Order ID (optional)</span><select value={form.orderId} onChange={(event) => {
                  const order = orders.find((item) => item.id === event.target.value);
                  setForm((current) => ({ ...current, orderId: event.target.value, clientId: order?.clientId ?? current.clientId }));
                }}><option value="">No order linked</option>{orders.map((order) => <option key={order.id} value={order.id}>{order.orderNumber} · {order.city}</option>)}</select></label>
                <label className="field"><span>Category *</span><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as FeedbackEntry['category'] })}>{categories.map((category) => <option key={category} value={category}>{category[0].toUpperCase() + category.slice(1)}</option>)}</select></label>
                <label className="field"><span>Priority *</span><select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as NonNullable<FeedbackEntry['priority']> })}>{priorities.map((priority) => <option key={priority}>{priority}</option>)}</select></label>
                <label className="field"><span>Assigned support employee *</span><select value={form.assignedTo} onChange={(event) => setForm({ ...form, assignedTo: event.target.value })}><option value="">Select employee</option>{employees.filter((item) => item.status !== 'Inactive').map((item) => <option key={item.id} value={item.name}>{item.name} · {item.role}</option>)}</select></label>
                <label className="field full"><span>Description *</span><textarea rows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
              </div>
              {formError && <p className="form-feedback form-feedback-error" role="alert">{formError}</p>}
            </div>
            <div className="modal-footer">
              <button className="secondary-button" type="button" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="primary-button" type="submit" disabled={submitting || !permissions.create}>Create ticket</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
