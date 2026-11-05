import React, { useMemo, useRef, useState } from 'react';
import { ArrowRight, Plus } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { useStore, type Settlement } from '../../store';
import { useModulePermissions } from '../../hooks/useModulePermissions';
import { Modal } from '../../components/ui/Modal';

const formatINR = (amount: number) => `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const today = () => new Date().toISOString().slice(0, 10);
const periodStart = () => `${today().slice(0, 8)}01`;

type SettlementForm = {
  restaurantId: string;
  startDate: string;
  endDate: string;
  ordersCount: string;
  grossOrderValue: string;
  commissionPercent: string;
  serviceFees: string;
  refunds: string;
  otherDeductions: string;
  reference: string;
  notes: string;
};

const emptyForm = (): SettlementForm => ({
  restaurantId: '',
  startDate: periodStart(),
  endDate: today(),
  ordersCount: '',
  grossOrderValue: '',
  commissionPercent: '18',
  serviceFees: '0',
  refunds: '0',
  otherDeductions: '0',
  reference: `SKST-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
  notes: '',
});

export const Invoices: React.FC = () => {
  const { invoices, setInvoices, clients, payments, orders, restaurants, settlements, setSettlements, refunds } = useStore();
  const permissions = useModulePermissions('invoices');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<SettlementForm>(emptyForm);
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const submissionLock = useRef(false);
  const [savingStatusId, setSavingStatusId] = useState('');

  const settledAmount = settlements.reduce((sum, item) => sum + item.amountINR, 0);
  const refundAmount = refunds.reduce((sum, item) => sum + item.amountINR, 0);
  const selectedMerchant = restaurants.find((item) => item.id === form.restaurantId);
  const gross = Number(form.grossOrderValue) || 0;
  const commissionPercent = Number(form.commissionPercent) || 0;
  const commission = Math.round(gross * commissionPercent) / 100;
  const serviceFees = Number(form.serviceFees) || 0;
  const refundAdjustments = Number(form.refunds) || 0;
  const otherDeductions = Number(form.otherDeductions) || 0;
  const deductions = commission + serviceFees + refundAdjustments + otherDeductions;
  const netPayable = gross - deductions;

  const sortedSettlements = useMemo(() => [...settlements].sort((a, b) => (b.createdAt ?? b.dueDate).localeCompare(a.createdAt ?? a.dueDate)), [settlements]);

  const openSettlement = () => {
    const formDefaults = emptyForm();
    const firstMerchant = restaurants[0];
    setForm({ ...formDefaults, restaurantId: firstMerchant?.id ?? '', commissionPercent: String(firstMerchant?.commissionRate ?? 18) });
    setFormError('');
    setShowModal(true);
  };

  const prepareSettlement = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!permissions.create || submitting || submissionLock.current) return;
    const numericValues = [form.ordersCount, form.grossOrderValue, form.commissionPercent, form.serviceFees, form.refunds, form.otherDeductions];
    const invalidNumber = numericValues.some((value) => value.trim() === '' || !Number.isFinite(Number(value)) || Number(value) < 0);
    if (!selectedMerchant || !form.startDate || !form.endDate || form.endDate < form.startDate || invalidNumber || !form.reference.trim()) {
      setFormError(!selectedMerchant
        ? 'Select a restaurant or merchant for this settlement.'
        : form.endDate < form.startDate
          ? 'Settlement end date must be on or after the start date.'
          : invalidNumber
            ? 'Enter valid, non-negative amounts and order count.'
            : 'Complete the settlement period and reference ID.');
      return;
    }
    if (!Number.isInteger(Number(form.ordersCount)) || Number(form.commissionPercent) > 100) {
      setFormError('Order count must be a whole number and commission cannot exceed 100%.');
      return;
    }
    if (netPayable < 0) {
      setFormError('Total deductions cannot exceed the gross order value.');
      return;
    }
    if (settlements.some((item) => item.reference?.toLowerCase() === form.reference.trim().toLowerCase())) {
      setFormError('This settlement reference ID is already in use.');
      return;
    }

    submissionLock.current = true;
    setSubmitting(true);
    const settlementId = uuid();
    const settlement: Settlement = {
      id: settlementId,
      restaurantId: selectedMerchant.id,
      period: `${new Date(`${form.startDate}T00:00:00`).toLocaleDateString('en-IN')} – ${new Date(`${form.endDate}T00:00:00`).toLocaleDateString('en-IN')}`,
      startDate: form.startDate,
      endDate: form.endDate,
      ordersCount: Number(form.ordersCount),
      grossOrderValueINR: gross,
      commissionPercent,
      commissionINR: commission,
      serviceFeesINR: serviceFees,
      refundsINR: refundAdjustments,
      otherDeductionsINR: otherDeductions,
      amountINR: netPayable,
      status: 'Prepared',
      dueDate: form.endDate,
      reference: form.reference.trim(),
      notes: form.notes.trim(),
      createdAt: new Date().toISOString(),
    };
    setSettlements([settlement, ...settlements]);
    setInvoices([{
      id: uuid(),
      clientId: selectedMerchant.id,
      amountINR: netPayable,
      paid: false,
      dueDate: form.endDate,
      invoiceType: 'Merchant settlement',
      reference: settlementId,
    }, ...invoices]);
    setNotice(`Settlement ${settlement.reference} prepared for ${selectedMerchant.name}.`);
    setForm(emptyForm());
    setFormError('');
    setShowModal(false);
    setSubmitting(false);
    submissionLock.current = false;
  };

  const changeSettlementStatus = (settlement: Settlement, nextStatus: 'Approved' | 'Paid') => {
    if (!permissions.edit || savingStatusId === settlement.id) return;
    if ((settlement.status === 'Prepared' && nextStatus !== 'Approved') || (settlement.status === 'Approved' && nextStatus !== 'Paid')) return;
    setSavingStatusId(settlement.id);
    setSettlements(settlements.map((item) => item.id === settlement.id ? { ...item, status: nextStatus } : item));
    if (nextStatus === 'Paid') {
      setInvoices(invoices.map((invoice) => invoice.reference === settlement.id ? { ...invoice, paid: true } : invoice));
    }
    setNotice(`${settlement.reference ?? 'Settlement'} marked ${nextStatus.toLowerCase()}.`);
    setSavingStatusId('');
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Consultancy fees and student payments</p>
          <h2>Consultancy Fees & Payments</h2>
        </div>
        <div className="header-actions">
          <button className="primary-button" type="button" disabled={!permissions.create} onClick={openSettlement}><Plus size={15} /> Prepare settlement</button>
          {!permissions.create && <p className="permission-hint">Your role does not have Create permission for merchant settlements.</p>}
        </div>
      </div>
      {notice && <p className="form-feedback form-feedback-success" role="status">{notice}</p>}
      {!permissions.edit && <p className="permission-hint">Your role can view settlements but cannot approve or mark them paid.</p>}

      <div className="stats-grid">
        <div className="card"><h3>Settlement cycle</h3><div className="metric-value">{formatINR(settledAmount)}</div><div className="metric-sub">{settlements.length} merchant batches · prepared and historical</div></div>
        <div className="card"><h3>Refund exposure</h3><div className="metric-value">{formatINR(refundAmount)}</div><div className="metric-sub">{refunds.filter((refund) => refund.status === 'Pending').length} requests pending</div></div>
        <div className="card"><h3>Captured payments</h3><div className="metric-value">{payments.filter((payment) => payment.status === 'Captured').length}</div><div className="metric-sub">Demo order payments</div></div>
      </div>

      <section>
        <div className="panel-header"><h3>Merchant settlement history</h3><span className="small-label">Prepared → Approved → Paid · simulated payouts only</span></div>
        <div className="table-shell">
          <table>
            <thead><tr><th>Merchant</th><th>Period</th><th>Orders</th><th>Gross</th><th>Deductions</th><th>Net payable</th><th>Reference</th><th>Status / action</th></tr></thead>
            <tbody>
              {sortedSettlements.map((settlement) => {
                const merchant = restaurants.find((restaurant) => restaurant.id === settlement.restaurantId);
                const grossAmount = settlement.grossOrderValueINR
                  ?? Math.round(settlement.amountINR / (1 - (merchant?.commissionRate ?? 18) / 100));
                const totalDeductions = grossAmount - settlement.amountINR;
                const nextStatus = settlement.status === 'Prepared' ? 'Approved' : settlement.status === 'Approved' ? 'Paid' : null;
                return (
                  <tr key={settlement.id}>
                    <td>{merchant?.name ?? 'Unknown merchant'}<small>{merchant?.city}</small></td>
                    <td>{settlement.period}</td>
                    <td>{settlement.ordersCount.toLocaleString('en-IN')}</td>
                    <td>{formatINR(grossAmount)}</td>
                    <td>{formatINR(totalDeductions)}</td>
                    <td><strong>{formatINR(settlement.amountINR)}</strong></td>
                    <td>{settlement.reference ?? settlement.id}<small>{settlement.notes}</small></td>
                    <td>
                      <div className="record-actions">
                        <span className={`badge ${settlement.status === 'Paid' ? 'status-done' : settlement.status === 'Approved' ? 'status-qualified' : settlement.status === 'Prepared' ? 'status-contacted' : 'status-pending'}`}>{settlement.status}</span>
                        {nextStatus && <button className="secondary-button" type="button" disabled={!permissions.edit || savingStatusId === settlement.id} title={!permissions.edit ? 'Your role does not have Edit permission' : undefined} onClick={() => changeSettlementStatus(settlement, nextStatus)}>{nextStatus}<ArrowRight size={13} /></button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {sortedSettlements.length === 0 && <tr><td colSpan={8}><div className="empty-state">No merchant settlements prepared yet.</div></td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="panel-header"><h3>Merchant invoices</h3><span className="small-label">Settlement records also appear in the ledger</span></div>
        <div className="table-shell">
          <table>
            <thead><tr><th>Merchant</th><th>Type</th><th>Reference</th><th>Amount</th><th>Due date</th><th>Status</th></tr></thead>
            <tbody>
              {invoices.filter((invoice) => invoice.invoiceType !== 'Refund').map((invoice) => {
                const merchant = restaurants.find((restaurant) => restaurant.id === invoice.clientId);
                const relatedSettlement = settlements.find((item) => item.id === invoice.reference);
                return (
                  <tr key={invoice.id}>
                    <td>{merchant?.name ?? clients.find((client) => client.id === invoice.clientId)?.name ?? 'Unknown merchant'}</td>
                    <td>{invoice.invoiceType}</td><td>{relatedSettlement?.reference ?? invoice.reference}</td>
                    <td>{formatINR(invoice.amountINR)}</td>
                    <td>{new Date(`${invoice.dueDate.slice(0, 10)}T00:00:00`).toLocaleDateString('en-IN')}</td>
                    <td><span className={`badge ${invoice.paid ? 'status-done' : relatedSettlement?.status === 'Approved' ? 'status-qualified' : relatedSettlement?.status === 'Prepared' ? 'status-contacted' : 'status-pending'}`}>{relatedSettlement?.status ?? (invoice.paid ? 'Paid' : 'Due')}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="panel-header"><h3>Refund requests</h3><span className="small-label">Linked to order and customer</span></div>
        <div className="table-shell">
          <table>
            <thead><tr><th>Refund</th><th>Order</th><th>Customer</th><th>Reason</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>{refunds.map((refund) => {
              const order = orders.find((item) => item.id === refund.orderId);
              const customer = clients.find((item) => item.id === order?.clientId);
              return <tr key={refund.id}><td>{refund.id}</td><td>{order?.orderNumber}</td><td>{customer?.name}</td><td>{refund.reason}</td><td>{formatINR(refund.amountINR)}</td><td><span className={`badge status-${refund.status.toLowerCase()}`}>{refund.status}</span></td></tr>;
            })}</tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="panel-header"><h3>Recent consultancy fee payments</h3><span className="small-label">Simulated payment records · no real processing</span></div>
        <div className="table-shell">
          <table>
            <thead><tr><th>Order</th><th>Customer</th><th>Method</th><th>Amount</th><th>Paid at</th><th>Status</th></tr></thead>
            <tbody>{payments.slice(0, 8).map((payment) => {
              const order = orders.find((item) => item.id === payment.orderId);
              const customer = clients.find((item) => item.id === order?.clientId);
              return <tr key={payment.id}><td>{order?.orderNumber}</td><td>{customer?.name}</td><td>{payment.method}</td><td>{formatINR(payment.amountINR)}</td><td>{new Date(payment.paidAt).toLocaleString('en-IN')}</td><td><span className={`badge status-${payment.status.toLowerCase()}`}>{payment.status}</span></td></tr>;
            })}</tbody>
          </table>
        </div>
      </section>

      {showModal && (
        <Modal title="Prepare merchant settlement" size="large" onClose={() => setShowModal(false)}>
          <form onSubmit={prepareSettlement}>
            <div className="modal-body">
              <p className="small-label">Settlement amounts are a local simulation; no bank or payment network is contacted.</p>
              <div className="form-grid">
                <label className="field full"><span>Restaurant / merchant *</span><select value={form.restaurantId} onChange={(event) => {
                  const merchant = restaurants.find((item) => item.id === event.target.value);
                  setForm((current) => ({ ...current, restaurantId: event.target.value, commissionPercent: String(merchant?.commissionRate ?? 18) }));
                  setFormError('');
                }}><option value="">Select a merchant</option>{restaurants.map((restaurant) => <option key={restaurant.id} value={restaurant.id}>{restaurant.name} · {restaurant.city}</option>)}</select></label>
                <label className="field"><span>Period start *</span><input type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} /></label>
                <label className="field"><span>Period end *</span><input type="date" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} /></label>
                <label className="field"><span>Total orders *</span><input type="number" min="0" step="1" value={form.ordersCount} onChange={(event) => setForm({ ...form, ordersCount: event.target.value })} /></label>
                <label className="field"><span>Gross order value (₹) *</span><input type="number" min="0" step="0.01" value={form.grossOrderValue} onChange={(event) => setForm({ ...form, grossOrderValue: event.target.value })} /></label>
                <label className="field"><span>Commission (%) *</span><input type="number" min="0" max="100" step="0.01" value={form.commissionPercent} onChange={(event) => setForm({ ...form, commissionPercent: event.target.value })} /></label>
                <label className="field"><span>Commission amount (calculated)</span><input readOnly value={formatINR(commission)} /></label>
                <label className="field"><span>Delivery / service fees (₹)</span><input type="number" min="0" step="0.01" value={form.serviceFees} onChange={(event) => setForm({ ...form, serviceFees: event.target.value })} /></label>
                <label className="field"><span>Refunds and adjustments (₹)</span><input type="number" min="0" step="0.01" value={form.refunds} onChange={(event) => setForm({ ...form, refunds: event.target.value })} /></label>
                <label className="field"><span>Other deductions (₹)</span><input type="number" min="0" step="0.01" value={form.otherDeductions} onChange={(event) => setForm({ ...form, otherDeductions: event.target.value })} /></label>
                <label className="field"><span>Settlement reference ID *</span><input value={form.reference} onChange={(event) => setForm({ ...form, reference: event.target.value })} /></label>
                <label className="field full"><span>Settlement notes</span><textarea rows={2} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></label>
              </div>
              <div className="settlement-breakdown">
                <span>Gross order value <strong>{formatINR(gross)}</strong></span>
                <span>Total deductions <strong>− {formatINR(deductions)}</strong></span>
                <span className="settlement-net">Final payable <strong>{formatINR(netPayable)}</strong></span>
              </div>
              {formError && <p className="form-feedback form-feedback-error" role="alert">{formError}</p>}
            </div>
            <div className="modal-footer">
              <button className="secondary-button" type="button" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="primary-button" type="submit" disabled={submitting || !permissions.create}>Prepare settlement</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
