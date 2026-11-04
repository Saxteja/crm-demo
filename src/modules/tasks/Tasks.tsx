import React, { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { useStore, type Task } from '../../store';
import { useModulePermissions } from '../../hooks/useModulePermissions';
import { Modal } from '../../components/ui/Modal';

type TaskForm = { title: string; description: string; assignee: string; priority: NonNullable<Task['priority']>; due: string; relatedRecord: string; status: Task['status'] };
const today = () => new Date().toISOString().slice(0, 10);
const initialForm: TaskForm = { title: '', description: '', assignee: '', priority: 'Medium', due: today(), relatedRecord: '', status: 'Pending' };

export const Tasks: React.FC = () => {
  const { tasks, setTasks, cases, orders, restaurants, clients, employees } = useStore();
  const permissions = useModulePermissions('tasks');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [form, setForm] = useState<TaskForm>(initialForm);
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const openNew = () => {
    setEditing(null);
    setForm({ ...initialForm, assignee: employees.find((item) => item.status !== 'Inactive')?.name ?? '' });
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (task: Task) => {
    setEditing(task);
    setForm({ title: task.title, description: task.description ?? '', assignee: task.assignee, priority: task.priority ?? 'Medium', due: task.due.slice(0, 10), relatedRecord: task.relatedRecord ?? (task.caseId ? `case:${task.caseId}` : ''), status: task.status });
    setFormError('');
    setShowModal(true);
  };

  const submitTask = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    if (!form.title.trim() || !form.assignee || !form.due) {
      setFormError('Task title, assigned employee and due date are required.');
      return;
    }

    setSubmitting(true);
    const caseId = form.relatedRecord.startsWith('case:') ? form.relatedRecord.slice(5) : '';
    const task: Task = {
      id: editing?.id ?? uuid(),
      caseId,
      title: form.title.trim(),
      description: form.description.trim(),
      assignee: form.assignee,
      priority: form.priority,
      due: form.due,
      relatedRecord: form.relatedRecord,
      status: form.status,
      createdAt: editing?.createdAt ?? new Date().toISOString(),
    };
    setTasks(editing ? tasks.map((item) => item.id === task.id ? task : item) : [...tasks, task]);
    setNotice(editing ? 'Task updated.' : 'Task added to the operations queue.');
    setShowModal(false);
    setFormError('');
    setSubmitting(false);
  };

  const toggleTask = (task: Task) => {
    if (!permissions.edit) return;
    const status = task.status === 'Pending' ? 'Done' : 'Pending';
    setTasks(tasks.map((item) => item.id === task.id ? { ...item, status } : item));
    setNotice(status === 'Done' ? 'Task marked complete.' : 'Task reopened.');
  };

  const deleteTask = (task: Task) => {
    if (!permissions.delete) return;
    setTasks(tasks.filter((item) => item.id !== task.id));
    setNotice('Task deleted from the demo task list.');
  };

  const relatedOptions = [
    ...cases.map((item) => ({ value: `case:${item.id}`, label: `Incident · ${item.title}` })),
    ...orders.map((item) => ({ value: `order:${item.id}`, label: `Order · ${item.orderNumber}` })),
    ...restaurants.map((item) => ({ value: `merchant:${item.id}`, label: `Merchant · ${item.name}` })),
    ...clients.filter((item) => item.type === 'Customer').map((item) => ({ value: `customer:${item.id}`, label: `Customer · ${item.name}` })),
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Onboarding, support and city operations</p>
          <h2>Operations Tasks</h2>
        </div>
        <div className="header-actions">
          <button className="primary-button" type="button" disabled={!permissions.create} onClick={openNew}><Plus size={15} /> New task</button>
          {!permissions.create && <p className="permission-hint">Your role does not have Create permission for tasks.</p>}
        </div>
      </div>
      {notice && <p className="form-feedback form-feedback-success" role="status">{notice}</p>}
      {!permissions.edit && <p className="permission-hint">Your role can view tasks but cannot complete, reopen or edit them.</p>}
      {!permissions.delete && <p className="permission-hint">Task deletion is unavailable for your role.</p>}

      <div className="list-stack">
        {tasks.map((task) => {
          const caseItem = cases.find((item) => item.id === task.caseId);
          const order = orders.find((item) => item.id === caseItem?.orderId);
          const related = task.relatedRecord?.split(':');
          const relatedLabel = related
            ? related[0] === 'case' ? cases.find((item) => item.id === related[1])?.title
              : related[0] === 'order' ? orders.find((item) => item.id === related[1])?.orderNumber
                : related[0] === 'merchant' ? restaurants.find((item) => item.id === related[1])?.name
                  : clients.find((item) => item.id === related[1])?.name
            : undefined;
          return (
            <div key={task.id} className="row-item">
              <div>
                <strong>{task.title}</strong>
                <div className="small-label">{task.assignee} · Due {new Date(`${task.due.slice(0, 10)}T00:00:00`).toLocaleDateString('en-IN')} · {task.priority ?? 'Normal'} priority</div>
                <div className="small-label">Ref {relatedLabel ?? order?.orderNumber ?? caseItem?.title ?? 'Operations'}</div>
                {task.description && <div className="small-label">{task.description}</div>}
              </div>
              <div className="record-actions">
                <span className={`badge status-${task.status.toLowerCase()}`}>{task.status}</span>
                <button className="secondary-button" type="button" disabled={!permissions.edit} title={!permissions.edit ? 'Your role does not have Edit permission' : undefined} onClick={() => toggleTask(task)}>{task.status === 'Pending' ? 'Mark done' : 'Reopen'}</button>
                <button className="secondary-button" type="button" disabled={!permissions.edit} title={!permissions.edit ? 'Your role does not have Edit permission' : undefined} onClick={() => openEdit(task)}><Pencil size={14} /> Edit</button>
                <button className="secondary-button" type="button" disabled={!permissions.delete} title={!permissions.delete ? 'Your role does not have Delete permission' : undefined} aria-label={`Delete ${task.title}`} onClick={() => deleteTask(task)}><Trash2 size={14} /></button>
              </div>
            </div>
          );
        })}
        {tasks.length === 0 && <div className="empty-state">No tasks yet. Create a follow-up or operations task.</div>}
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit task' : 'Create operations task'} size="large" onClose={() => setShowModal(false)}>
          <form onSubmit={submitTask}>
            <div className="modal-body">
              <div className="form-grid">
                <label className="field full"><span>Task title *</span><input autoFocus value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
                <label className="field full"><span>Description</span><textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
                <label className="field"><span>Assigned employee *</span><select value={form.assignee} onChange={(event) => setForm({ ...form, assignee: event.target.value })}><option value="">Select employee</option>{employees.filter((item) => item.status !== 'Inactive').map((item) => <option key={item.id} value={item.name}>{item.name} · {item.role}</option>)}</select></label>
                <label className="field"><span>Priority *</span><select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as TaskForm['priority'] })}>{['Low', 'Medium', 'High', 'Urgent'].map((value) => <option key={value}>{value}</option>)}</select></label>
                <label className="field"><span>Due date *</span><input type="date" value={form.due} onChange={(event) => setForm({ ...form, due: event.target.value })} /></label>
                <label className="field"><span>Related record</span><select value={form.relatedRecord} onChange={(event) => setForm({ ...form, relatedRecord: event.target.value })}><option value="">No linked record</option>{relatedOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
                <label className="field"><span>Status</span><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as Task['status'] })}><option>Pending</option><option>Done</option></select></label>
              </div>
              {formError && <p className="form-feedback form-feedback-error" role="alert">{formError}</p>}
            </div>
            <div className="modal-footer">
              <button className="secondary-button" type="button" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="primary-button" type="submit" disabled={submitting || (editing ? !permissions.edit : !permissions.create)}>{editing ? 'Save changes' : 'Create task'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
