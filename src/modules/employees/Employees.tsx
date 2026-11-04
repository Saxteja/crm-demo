import React, { useState } from 'react';
import { Pencil, Plus, UserRound, UserRoundX } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { useStore, type Employee, type Role } from '../../store';
import { useModulePermissions } from '../../hooks/useModulePermissions';
import { Modal } from '../../components/ui/Modal';

const roles: Role[] = ['Super Admin', 'Business Owner', 'Branch Manager', 'Operations Manager', 'Sales Executive', 'Consultant', 'Documentation Executive', 'Accounts Executive', 'Customer Support'];
const departments = ['Leadership', 'City Operations', 'Sales', 'Merchant Success', 'Documentation', 'Finance', 'Customer Support', 'Technology'];
type EmployeeForm = { name: string; email: string; phone: string; employeeId: string; role: Role; department: string; branch: string; status: NonNullable<Employee['status']> };
const initialForm: EmployeeForm = { name: '', email: '', phone: '', employeeId: '', role: 'Customer Support', department: 'Customer Support', branch: 'Bengaluru', status: 'Active' };

export const Employees: React.FC = () => {
  const { employees, setEmployees, deliveryPartners } = useStore();
  const permissions = useModulePermissions('employees');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const openNew = () => {
    setEditing(null);
    setForm({ ...initialForm, employeeId: `SK-${String(employees.length + 1).padStart(4, '0')}` });
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (employee: Employee) => {
    setEditing(employee);
    setForm({
      name: employee.name,
      email: employee.email,
      phone: employee.phone ?? '',
      employeeId: employee.employeeId ?? employee.id,
      role: (roles.includes(employee.role as Role) ? employee.role : 'Customer Support') as Role,
      department: employee.department ?? 'City Operations',
      branch: employee.branch ?? employee.location,
      status: employee.status ?? 'Active',
    });
    setFormError('');
    setShowModal(true);
  };

  const submitEmployee = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const employeeId = form.employeeId.trim();
    const duplicateEmail = employees.some((item) => item.email.toLowerCase() === email.toLowerCase() && item.id !== editing?.id);
    const duplicateId = employees.some((item) => item.employeeId === employeeId && item.id !== editing?.id);
    if (!name || !email || !phone || !employeeId || !form.role || !form.department || !form.branch) {
      setFormError('Complete all required employee details before saving.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError('Enter a valid work email address.');
      return;
    }
    if (duplicateEmail || duplicateId) {
      setFormError(duplicateEmail ? 'An employee already uses this email.' : 'That employee ID is already in use.');
      return;
    }

    setSubmitting(true);
    const employee: Employee = {
      id: editing?.id ?? uuid(),
      name,
      email,
      phone,
      employeeId,
      role: form.role,
      department: form.department,
      branch: form.branch.trim(),
      location: form.branch.trim(),
      status: form.status,
      createdAt: editing?.createdAt ?? new Date().toISOString(),
    };
    setEmployees(editing ? employees.map((item) => item.id === employee.id ? employee : item) : [...employees, employee]);
    setNotice(editing ? `${employee.name}'s profile was updated.` : `${employee.name} was added to the SwiftKart team.`);
    setShowModal(false);
    setFormError('');
    setSubmitting(false);
  };

  const toggleStatus = (employee: Employee) => {
    if (!permissions.edit) return;
    const status = employee.status === 'Inactive' ? 'Active' : 'Inactive';
    setEmployees(employees.map((item) => item.id === employee.id ? { ...item, status } : item));
    setNotice(`${employee.name} is now ${status.toLowerCase()}.`);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">City operations, merchant growth and support</p>
          <h2>SwiftKart Teams</h2>
        </div>
        <div className="header-actions">
          <button className="primary-button" type="button" disabled={!permissions.create} onClick={openNew}><Plus size={15} /> Add member</button>
          {!permissions.create && <p className="permission-hint">Your role does not have Create permission for team members.</p>}
        </div>
      </div>
      {notice && <p className="form-feedback form-feedback-success" role="status">{notice}</p>}
      {!permissions.edit && <p className="permission-hint">Your role can view the directory but cannot edit profiles or deactivate members.</p>}

      <div className="grid-3">
        {employees.map((employee) => (
          <div key={employee.id} className="card employee-card">
            <div className="record-actions" style={{ justifyContent: 'space-between' }}>
              <div className="brand-mark" style={{ width: 40, height: 40, marginBottom: 12 }}>{employee.name.charAt(0)}</div>
              <span className={`badge ${employee.status === 'Inactive' ? 'status-pending' : 'status-done'}`}>{employee.status ?? 'Active'}</span>
            </div>
            <h3 title={employee.name}>{employee.name}</h3>
            <div className="employee-role-label" title={`${employee.role} · ${employee.department ?? 'SwiftKart team'}`}>{employee.role} · {employee.department ?? 'SwiftKart team'}</div>
            <p className="metric-sub employee-card-copy" title={employee.email}>{employee.email}</p>
            <p className="metric-sub employee-card-copy">{employee.phone ?? 'Phone not listed'} · {employee.branch ?? employee.location}</p>
            <p className="small-label employee-card-copy">Employee ID · {employee.employeeId ?? employee.id}</p>
            <div className="employee-card-footer">
              <button className="secondary-button card-action-button" type="button" disabled={!permissions.edit} title={!permissions.edit ? 'Your role does not have Edit permission' : undefined} onClick={() => openEdit(employee)}><Pencil size={14} /> Edit</button>
              <button className="secondary-button card-action-button" type="button" disabled={!permissions.edit} title={!permissions.edit ? 'Your role does not have Edit permission' : undefined} onClick={() => toggleStatus(employee)}>{employee.status === 'Inactive' ? <UserRound size={14} /> : <UserRoundX size={14} />}{employee.status === 'Inactive' ? 'Reactivate' : 'Deactivate'}</button>
            </div>
          </div>
        ))}
        {employees.length === 0 && <div className="empty-state">No employees in the directory. Add a team member to get started.</div>}
      </div>
      <section>
        <div className="panel-header"><h3>Delivery partner fleet</h3><span className="small-label">{deliveryPartners.length} fictional delivery partners</span></div>
        <div className="table-shell">
          <table>
            <thead><tr><th>Delivery partner</th><th>City</th><th>Vehicle</th><th>Completed deliveries</th><th>Rating</th><th>Availability</th></tr></thead>
            <tbody>{deliveryPartners.map((partner) => (
              <tr key={partner.id}>
                <td><div>{partner.name}</div><small>{partner.phone}</small></td>
                <td>{partner.city}</td>
                <td>{partner.vehicle}</td>
                <td>{partner.deliveries.toLocaleString('en-IN')}</td>
                <td>★ {partner.rating.toFixed(1)}</td>
                <td><span className={`badge ${partner.availability === 'Available' ? 'status-done' : partner.availability === 'On delivery' ? 'status-contacted' : 'status-pending'}`}>{partner.availability}</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </section>

      {showModal && (
        <Modal title={editing ? 'Edit employee profile' : 'Add SwiftKart team member'} size="large" onClose={() => setShowModal(false)}>
          <form onSubmit={submitEmployee}>
            <div className="modal-body">
              <div className="form-grid">
                <label className="field"><span>Full name *</span><input autoFocus value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
                <label className="field"><span>Work email *</span><input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
                <label className="field"><span>Phone *</span><input type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
                <label className="field"><span>Employee ID *</span><input value={form.employeeId} onChange={(event) => setForm({ ...form, employeeId: event.target.value })} /></label>
                <label className="field"><span>Role *</span><select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as Role })}>{roles.map((role) => <option key={role}>{role}</option>)}</select></label>
                <label className="field"><span>Department *</span><select value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })}>{departments.map((department) => <option key={department}>{department}</option>)}</select></label>
                <label className="field"><span>Branch / city *</span><input value={form.branch} onChange={(event) => setForm({ ...form, branch: event.target.value })} /></label>
                <label className="field"><span>Status *</span><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as EmployeeForm['status'] })}><option>Active</option><option>Inactive</option></select></label>
              </div>
              {formError && <p className="form-feedback form-feedback-error" role="alert">{formError}</p>}
            </div>
            <div className="modal-footer">
              <button className="secondary-button" type="button" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="primary-button" type="submit" disabled={submitting || (editing ? !permissions.edit : !permissions.create)}>{editing ? 'Save changes' : 'Add member'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
