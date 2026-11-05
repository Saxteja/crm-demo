import React, { useState } from 'react';
import { CalendarClock, Pencil, XCircle } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { useStore, type Consultation } from '../../store';
import { useModulePermissions } from '../../hooks/useModulePermissions';
import { Modal } from '../../components/ui/Modal';

type MeetingForm = {
  clientId: string;
  contactPerson: string;
  date: string;
  time: string;
  meetingType: string;
  consultant: string;
  location: string;
  notes: string;
};

const meetingTypes = ['Merchant onboarding', 'Partner success review', 'Menu and catalogue review', 'Business review', 'Issue follow-up'];
const initialForm: MeetingForm = {
  clientId: '',
  contactPerson: '',
  date: '',
  time: '11:00',
  meetingType: meetingTypes[0],
  consultant: '',
  location: '',
  notes: '',
};

export const Consultations: React.FC = () => {
  const { consultations, setConsultations, restaurants, employees } = useStore();
  const permissions = useModulePermissions('consultations');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Consultation | null>(null);
  const [form, setForm] = useState<MeetingForm>(initialForm);
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const openNew = () => {
    setEditing(null);
    setForm({ ...initialForm, clientId: restaurants[0]?.id ?? '', contactPerson: restaurants[0]?.ownerName ?? '', consultant: employees[0]?.name ?? '' });
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (meeting: Consultation) => {
    const [date = '', time = '11:00'] = meeting.date.split('T');
    const restaurant = restaurants.find((item) => item.id === meeting.clientId);
    setEditing(meeting);
    setForm({
      clientId: meeting.clientId,
      contactPerson: meeting.contactPerson ?? restaurant?.ownerName ?? '',
      date,
      time: time.slice(0, 5),
      meetingType: meeting.meetingType,
      consultant: meeting.consultant,
      location: meeting.location ?? '',
      notes: meeting.notes,
    });
    setFormError('');
    setShowModal(true);
  };

  const submitMeeting = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const restaurant = restaurants.find((item) => item.id === form.clientId);
    if (!restaurant || !form.contactPerson.trim() || !form.date || !form.time || !form.consultant || !form.location.trim()) {
      setFormError('Complete all required meeting details before saving.');
      return;
    }

    setSubmitting(true);
    const meeting: Consultation = {
      id: editing?.id ?? uuid(),
      clientId: restaurant.id,
      consultant: form.consultant,
      date: `${form.date}T${form.time}`,
      status: editing?.status === 'Cancelled' ? 'Scheduled' : editing?.status ?? 'Scheduled',
      notes: form.notes.trim(),
      meetingType: form.meetingType,
      contactPerson: form.contactPerson.trim(),
      location: form.location.trim(),
      createdAt: editing?.createdAt ?? new Date().toISOString(),
    };
    setConsultations(editing
      ? consultations.map((item) => item.id === editing.id ? meeting : item)
      : [...consultations, meeting]);
    setNotice(editing ? 'Partner meeting updated.' : 'Partner meeting scheduled.');
    setShowModal(false);
    setSubmitting(false);
  };

  const cancelMeeting = (meeting: Consultation) => {
    if (!permissions.edit) return;
    setConsultations(consultations.map((item) => item.id === meeting.id ? { ...item, status: 'Cancelled' } : item));
    setNotice('Partner meeting cancelled.');
  };

  const sortedMeetings = [...consultations].sort((a, b) => a.date.localeCompare(b.date));
  const canEdit = permissions.edit;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Restaurant partner success</p>
          <h2>Counselling Sessions</h2>
        </div>
        <div className="header-actions">
          <button className="primary-button" type="button" disabled={!permissions.create} onClick={openNew}>
            <CalendarClock size={15} /> Schedule partner meeting
          </button>
          {!permissions.create && <p className="permission-hint">Your role does not have Create permission for partner meetings.</p>}
        </div>
      </div>
      {notice && <p className="form-feedback form-feedback-success" role="status">{notice}</p>}
      {!canEdit && <p className="permission-hint">Your role can view meetings but cannot reschedule, edit or cancel them.</p>}

      <div className="grid-2">
        {sortedMeetings.map((item) => {
          const restaurant = restaurants.find((entry) => entry.id === item.clientId);
          return (
            <div key={item.id} className="card">
              <div className="panel-header">
                <h3>{restaurant?.name ?? 'Restaurant partner'}</h3>
                <span className={`badge status-${item.status.toLowerCase()}`}>{item.status}</span>
              </div>
              <div className="list-stack">
                <div className="row-item"><span>{item.meetingType} · {item.contactPerson ?? restaurant?.ownerName ?? 'Partner contact'}</span><strong>{restaurant?.city}</strong></div>
                <div className="row-item">
                  <span>Partner manager · {item.consultant}</span>
                  <strong>{new Date(item.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</strong>
                </div>
                {item.location && <div className="row-item"><span>Location / link</span><small>{item.location}</small></div>}
                <div className="row-item"><span>Notes</span><small>{item.notes || 'No meeting notes added.'}</small></div>
              </div>
              <div className="record-actions" style={{ justifyContent: 'flex-end', marginTop: 12 }}>
                <button className="secondary-button" type="button" disabled={!canEdit} title={!canEdit ? 'Your role does not have Edit permission' : undefined} onClick={() => openEdit(item)}><Pencil size={14} /> Reschedule / edit</button>
                {item.status !== 'Cancelled' && item.status !== 'Completed' && (
                  <button className="secondary-button" type="button" disabled={!canEdit} title={!canEdit ? 'Your role does not have Edit permission' : undefined} onClick={() => cancelMeeting(item)}><XCircle size={14} /> Cancel</button>
                )}
              </div>
            </div>
          );
        })}
        {sortedMeetings.length === 0 && <div className="empty-state">No partner meetings scheduled yet.</div>}
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit / reschedule partner meeting' : 'Schedule partner meeting'} size="large" onClose={() => setShowModal(false)}>
          <form onSubmit={submitMeeting}>
            <div className="modal-body">
              <div className="form-grid">
                <label className="field"><span>Restaurant / merchant *</span><select value={form.clientId} onChange={(event) => {
                  const selected = restaurants.find((item) => item.id === event.target.value);
                  setForm((current) => ({ ...current, clientId: event.target.value, contactPerson: selected?.ownerName ?? '' }));
                  setFormError('');
                }}><option value="">Select a partner</option>{restaurants.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.city}</option>)}</select></label>
                <label className="field"><span>Contact person *</span><input value={form.contactPerson} onChange={(event) => setForm({ ...form, contactPerson: event.target.value })} /></label>
                <label className="field"><span>Date *</span><input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></label>
                <label className="field"><span>Time *</span><input type="time" value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} /></label>
                <label className="field"><span>Meeting type *</span><select value={form.meetingType} onChange={(event) => setForm({ ...form, meetingType: event.target.value })}>{meetingTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
                <label className="field"><span>Assigned employee *</span><select value={form.consultant} onChange={(event) => setForm({ ...form, consultant: event.target.value })}><option value="">Select employee</option>{employees.filter((item) => item.status !== 'Inactive').map((item) => <option key={item.id} value={item.name}>{item.name} · {item.role}</option>)}</select></label>
                <label className="field full"><span>Location or meeting link *</span><input placeholder="StudyBridge Bengaluru office or https://meet.example/..." value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} /></label>
                <label className="field full"><span>Notes</span><textarea rows={3} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></label>
              </div>
              {formError && <p className="form-feedback form-feedback-error" role="alert">{formError}</p>}
            </div>
            <div className="modal-footer">
              <button className="secondary-button" type="button" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="primary-button" type="submit" disabled={submitting || (editing ? !permissions.edit : !permissions.create)}>{editing ? 'Save changes' : 'Schedule meeting'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
