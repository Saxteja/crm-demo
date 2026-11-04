import React, { useRef, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { useStore, type Service } from '../../store';
import { useModulePermissions } from '../../hooks/useModulePermissions';
import { Modal } from '../../components/ui/Modal';

const categories = ['Merchant plan', 'Advertising', 'Promotional campaign', 'Delivery subscription', 'Customer subscription', 'Business orders'];
const pricingModels = ['Monthly subscription', 'One-time fee', 'Per campaign', 'Commission-based', 'Free'];
type ServiceForm = {
  name: string;
  category: string;
  description: string;
  pricingModel: string;
  priceINR: string;
  serviceFeeINR: string;
  duration: string;
  benefits: string;
  eligibility: string;
  active: boolean;
  assignedMerchantIds: string[];
};
const initialForm: ServiceForm = { name: '', category: categories[0], description: '', pricingModel: pricingModels[0], priceINR: '0', serviceFeeINR: '0', duration: 'Monthly', benefits: '', eligibility: '', active: true, assignedMerchantIds: [] };
const formatINR = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

export const Services: React.FC = () => {
  const { services, setServices, restaurants, setRestaurants } = useStore();
  const permissions = useModulePermissions('services');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState<ServiceForm>(initialForm);
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const submissionLock = useRef(false);

  const openNew = () => {
    setEditing(null);
    setForm(initialForm);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (service: Service) => {
    setEditing(service);
    setForm({
      name: service.name,
      category: service.category,
      description: service.description,
      pricingModel: service.pricingModel ?? 'Monthly subscription',
      priceINR: String(service.priceINR),
      serviceFeeINR: String(service.serviceFeeINR ?? 0),
      duration: service.duration ?? 'Monthly',
      benefits: (service.benefits ?? []).join('\n'),
      eligibility: service.eligibility ?? '',
      active: service.active ?? true,
      assignedMerchantIds: service.assignedMerchantIds ?? restaurants.filter((item) => item.packageId === service.id).map((item) => item.id),
    });
    setFormError('');
    setShowModal(true);
  };

  const syncMerchantPackages = (service: Service, merchantIds: string[]) => {
    const serviceExists = services.some((item) => item.id === service.id);
    const updatedServices = services.map((item) => {
      if (item.id === service.id) return service;
      const currentAssignments = item.assignedMerchantIds ?? restaurants.filter((merchant) => merchant.packageId === item.id).map((merchant) => merchant.id);
      return { ...item, assignedMerchantIds: currentAssignments.filter((merchantId) => !merchantIds.includes(merchantId)) };
    });
    setServices(serviceExists ? updatedServices : [...updatedServices, service]);
    setRestaurants(restaurants.map((merchant) => {
      if (merchantIds.includes(merchant.id)) return { ...merchant, packageId: service.id, packageName: service.name };
      if (merchant.packageId === service.id) return { ...merchant, packageId: undefined, packageName: undefined };
      return merchant;
    }));
  };

  const submitPackage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if ((editing ? !permissions.edit : !permissions.create) || submitting || submissionLock.current) return;
    const name = form.name.trim();
    const price = Number(form.priceINR);
    const serviceFee = Number(form.serviceFeeINR);
    if (!name || !form.category || !form.description.trim() || !form.pricingModel || !form.duration.trim()) {
      setFormError('Package name, category, description, pricing model and duration are required.');
      return;
    }
    if (!form.priceINR.trim() || !Number.isFinite(price) || price < 0 || !form.serviceFeeINR.trim() || !Number.isFinite(serviceFee) || serviceFee < 0) {
      setFormError('Enter valid non-negative INR values for base price and service fee.');
      return;
    }
    if (services.some((item) => item.name.toLowerCase() === name.toLowerCase() && item.id !== editing?.id)) {
      setFormError('A package with this name already exists.');
      return;
    }

    submissionLock.current = true;
    setSubmitting(true);
    const service: Service = {
      id: editing?.id ?? uuid(),
      name,
      category: form.category,
      description: form.description.trim(),
      pricingModel: form.pricingModel,
      priceINR: price,
      serviceFeeINR: serviceFee,
      duration: form.duration.trim(),
      benefits: form.benefits.split('\n').map((benefit) => benefit.trim()).filter(Boolean),
      eligibility: form.eligibility.trim(),
      active: form.active,
      assignedMerchantIds: form.assignedMerchantIds,
      createdAt: editing?.createdAt ?? new Date().toISOString(),
    };
    syncMerchantPackages(service, service.assignedMerchantIds ?? []);
    setNotice(editing ? `${service.name} package updated.` : `${service.name} package created.`);
    setShowModal(false);
    setFormError('');
    setSubmitting(false);
    submissionLock.current = false;
  };

  const toggleActive = (service: Service) => {
    if (!permissions.edit) return;
    const active = !(service.active ?? true);
    const updated = { ...service, active };
    setServices(services.map((item) => item.id === service.id ? updated : item));
    setNotice(`${service.name} is now ${active ? 'active' : 'inactive'}.`);
  };

  const deletePackage = (service: Service) => {
    if (!permissions.delete) return;
    setServices(services.filter((item) => item.id !== service.id));
    setRestaurants(restaurants.map((merchant) => merchant.packageId === service.id ? { ...merchant, packageId: undefined, packageName: undefined } : merchant));
    setNotice(`${service.name} was removed from the catalogue and unassigned from merchants.`);
  };

  const assignedMerchants = (service: Service) => {
    const assignedIds = service.assignedMerchantIds ?? restaurants.filter((merchant) => merchant.packageId === service.id).map((merchant) => merchant.id);
    return restaurants.filter((merchant) => assignedIds.includes(merchant.id) || merchant.packageId === service.id);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Commerce plans and monetisation</p>
          <h2>Subscriptions & Packages</h2>
        </div>
        <div className="header-actions">
          <button className="primary-button" type="button" disabled={!permissions.create} onClick={openNew}><Plus size={15} /> Create package</button>
          {!permissions.create && <p className="permission-hint">Your role does not have Create permission for packages.</p>}
        </div>
      </div>
      {notice && <p className="form-feedback form-feedback-success" role="status">{notice}</p>}
      {!permissions.edit && <p className="permission-hint">Your role can view packages but cannot edit or change activation status.</p>}
      {!permissions.delete && <p className="permission-hint">Package deletion is unavailable for your role.</p>}

      <div className="grid-3">
        {services.map((service) => {
          const merchants = assignedMerchants(service);
          const active = service.active ?? true;
          return (
            <div key={service.id} className="card service-card">
              <div className="panel-header"><span className="badge status-contacted">{service.category}</span><span className={`badge ${active ? 'status-done' : 'status-pending'}`}>{active ? 'Active' : 'Inactive'}</span></div>
              <h3>{service.name}</h3>
              <div className="metric-value" style={{ fontSize: '1.6rem' }}>{service.priceINR ? formatINR(service.priceINR) : 'Free'}{service.duration ? <small> / {service.duration.toLowerCase()}</small> : null}</div>
              <p className="small-label">{service.pricingModel ?? 'Pricing model not specified'}{service.serviceFeeINR ? ` · Service fee ${formatINR(service.serviceFeeINR)}` : ''}</p>
              <p className="metric-sub">{service.description}</p>
              {service.benefits && service.benefits.length > 0 && <div className="service-details"><strong>Included benefits</strong><ul>{service.benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}</ul></div>}
              {service.eligibility && <p className="small-label"><strong>Eligibility:</strong> {service.eligibility}</p>}
              <div className="service-details"><strong>Assigned merchants ({merchants.length})</strong><span>{merchants.length ? merchants.map((merchant) => `${merchant.name} · ${merchant.city}`).join(', ') : 'Not assigned'}</span></div>
              <div className="service-card-footer">
                <button className="secondary-button card-action-button" type="button" disabled={!permissions.edit} title={!permissions.edit ? 'Your role does not have Edit permission' : undefined} onClick={() => openEdit(service)}><Pencil size={14} /> Edit</button>
                <button className="secondary-button card-action-button" type="button" disabled={!permissions.edit} title={!permissions.edit ? 'Your role does not have Edit permission' : undefined} onClick={() => toggleActive(service)}>{active ? 'Deactivate' : 'Activate'}</button>
                <button className="secondary-button card-action-button delete-card-action" type="button" disabled={!permissions.delete} title={!permissions.delete ? 'Your role does not have Delete permission' : undefined} aria-label={`Delete ${service.name}`} onClick={() => deletePackage(service)}><Trash2 size={14} /><span>Delete</span></button>
              </div>
            </div>
          );
        })}
        {services.length === 0 && <div className="empty-state">No packages in the catalogue. Create a SwiftKart merchant or delivery package.</div>}
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit SwiftKart package' : 'Create SwiftKart package'} size="large" onClose={() => setShowModal(false)}>
          <form onSubmit={submitPackage}>
            <div className="modal-body">
              <div className="form-grid">
                <label className="field"><span>Package name *</span><input autoFocus placeholder="Merchant Growth" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
                <label className="field"><span>Package category *</span><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
                <label className="field full"><span>Description *</span><textarea rows={2} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
                <label className="field"><span>Pricing model *</span><select value={form.pricingModel} onChange={(event) => setForm({ ...form, pricingModel: event.target.value })}>{pricingModels.map((model) => <option key={model}>{model}</option>)}</select></label>
                <label className="field"><span>Base price (₹) *</span><input type="number" min="0" step="0.01" value={form.priceINR} onChange={(event) => setForm({ ...form, priceINR: event.target.value })} /></label>
                <label className="field"><span>Commission / service fee (₹)</span><input type="number" min="0" step="0.01" value={form.serviceFeeINR} onChange={(event) => setForm({ ...form, serviceFeeINR: event.target.value })} /></label>
                <label className="field"><span>Package duration *</span><input placeholder="Monthly, 7 days, 1 year" value={form.duration} onChange={(event) => setForm({ ...form, duration: event.target.value })} /></label>
                <label className="field full"><span>Included benefits (one per line)</span><textarea rows={3} value={form.benefits} onChange={(event) => setForm({ ...form, benefits: event.target.value })} /></label>
                <label className="field full"><span>Eligibility conditions</span><textarea rows={2} value={form.eligibility} onChange={(event) => setForm({ ...form, eligibility: event.target.value })} /></label>
                <label className="field"><span>Status *</span><select value={form.active ? 'Active' : 'Inactive'} onChange={(event) => setForm({ ...form, active: event.target.value === 'Active' })}><option>Active</option><option>Inactive</option></select></label>
                <label className="field full"><span>Assign to merchants</span><select multiple value={form.assignedMerchantIds} onChange={(event) => setForm({ ...form, assignedMerchantIds: Array.from(event.target.selectedOptions, (option) => option.value) })}>{restaurants.map((merchant) => <option key={merchant.id} value={merchant.id}>{merchant.name} · {merchant.city}</option>)}</select><small className="small-label">Use Ctrl / Cmd to select multiple merchants.</small></label>
              </div>
              {formError && <p className="form-feedback form-feedback-error" role="alert">{formError}</p>}
            </div>
            <div className="modal-footer">
              <button className="secondary-button" type="button" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="primary-button" type="submit" disabled={submitting || (editing ? !permissions.edit : !permissions.create)}>{editing ? 'Save changes' : 'Create package'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
