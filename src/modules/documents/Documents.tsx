import React, { useState } from 'react';
import { Download, Eye, FilePlus2 } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { useStore, type DocumentItem } from '../../store';
import { useModulePermissions } from '../../hooks/useModulePermissions';
import { Modal } from '../../components/ui/Modal';

const categories = ['Food safety / FSSAI', 'Merchant agreement', 'Bank account proof', 'GST / tax compliance', 'Customer attachment', 'Other'];
const initialForm = { title: '', relatedEntityId: '', type: categories[0], status: 'Pending' as DocumentItem['status'], expiresAt: '' };

export const Documents: React.FC = () => {
  const { documents, setDocuments, clients } = useStore();
  const permissions = useModulePermissions('documents');
  const [showModal, setShowModal] = useState(false);
  const [preview, setPreview] = useState<DocumentItem | null>(null);
  const [form, setForm] = useState(initialForm);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const uploadDocument = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const owner = clients.find((client) => client.id === form.relatedEntityId);
    if (!selectedFile || !form.title.trim() || !owner || !form.type || !form.status) {
      setFormError('Choose a file and complete its name, related record, category and verification status.');
      return;
    }

    setSubmitting(true);
    const document: DocumentItem = {
      id: uuid(),
      title: form.title.trim(),
      type: form.type,
      status: form.status,
      owner: owner.name,
      reference: `DOC-${Date.now().toString().slice(-8)}`,
      city: owner.city,
      relatedEntityId: owner.id,
      fileName: selectedFile.name,
      fileType: selectedFile.type || 'Unknown file type',
      fileSize: selectedFile.size,
      expiresAt: form.expiresAt || undefined,
      createdAt: new Date().toISOString(),
    };
    setDocuments([document, ...documents]);
    setNotice(`${document.title} was added to the document library. File metadata is saved locally for this demo.`);
    setForm(initialForm);
    setSelectedFile(null);
    setFormError('');
    setShowModal(false);
    setSubmitting(false);
  };

  const changeStatus = (id: string, status: DocumentItem['status']) => {
    if (!permissions.edit) return;
    setDocuments(documents.map((item) => item.id === id ? { ...item, status } : item));
  };

  const simulateDownload = (doc: DocumentItem) => {
    const description = `SwiftKart demo document\nName: ${doc.title}\nFile: ${doc.fileName ?? doc.reference}\nThis is a local metadata preview; no uploaded file content is stored.`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([description], { type: 'text/plain' }));
    link.download = `${doc.title.replace(/[^a-z0-9-_]+/gi, '-')}-demo.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Merchant KYC and compliance</p>
          <h2>Partner Documents</h2>
        </div>
        <div className="header-actions">
          <button className="primary-button" type="button" disabled={!permissions.create} onClick={() => { setForm({ ...initialForm, relatedEntityId: clients.find((item) => item.type === 'Merchant')?.id ?? '' }); setSelectedFile(null); setFormError(''); setShowModal(true); }}>
            <FilePlus2 size={15} /> Upload document
          </button>
          {!permissions.create && <p className="permission-hint">Your role does not have Create permission for documents.</p>}
        </div>
      </div>
      {notice && <p className="form-feedback form-feedback-success" role="status">{notice}</p>}
      {!permissions.edit && <p className="permission-hint">Your role can view documents but cannot change verification status.</p>}

      <div className="table-shell">
        <table>
          <thead><tr><th>Document</th><th>Requirement</th><th>Merchant / customer</th><th>City</th><th>Reference / file</th><th>Expiry</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id}>
                <td>{doc.title}</td>
                <td>{doc.type}</td>
                <td>{doc.owner}</td>
                <td>{doc.city}</td>
                <td><div>{doc.reference}</div><small>{doc.fileName ?? 'Seeded demo record'}</small></td>
                <td>{doc.expiresAt ? new Date(`${doc.expiresAt}T00:00:00`).toLocaleDateString('en-IN') : '—'}</td>
                <td><select className="inline-control" aria-label={`Verification status for ${doc.title}`} value={doc.status} disabled={!permissions.edit} title={!permissions.edit ? 'Your role does not have Edit permission' : undefined} onChange={(event) => changeStatus(doc.id, event.target.value as DocumentItem['status'])}>{['Pending', 'Verified', 'Rejected'].map((status) => <option key={status}>{status}</option>)}</select></td>
                <td><div className="record-actions"><button className="secondary-button" type="button" onClick={() => setPreview(doc)}><Eye size={14} /> Preview</button><button className="secondary-button" type="button" onClick={() => simulateDownload(doc)}><Download size={14} /> Download</button></div></td>
              </tr>
            ))}
            {documents.length === 0 && <tr><td colSpan={8}><div className="empty-state">No documents yet. Upload a merchant or customer document to get started.</div></td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title="Add document to library" size="large" onClose={() => setShowModal(false)}>
          <form onSubmit={uploadDocument}>
            <div className="modal-body">
              <p className="small-label">This demo stores file metadata only. File content is not sent to a server.</p>
              <div className="form-grid">
                <label className="field"><span>Choose file *</span><input type="file" onChange={(event) => { setSelectedFile(event.target.files?.[0] ?? null); if (!form.title.trim() && event.target.files?.[0]) setForm((current) => ({ ...current, title: event.target.files?.[0].name.replace(/\.[^.]+$/, '') ?? '' })); setFormError(''); }} /></label>
                <label className="field"><span>Document name *</span><input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
                <label className="field"><span>Related merchant / customer *</span><select value={form.relatedEntityId} onChange={(event) => setForm({ ...form, relatedEntityId: event.target.value })}><option value="">Select a record</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name} · {client.type}</option>)}</select></label>
                <label className="field"><span>Document category *</span><select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
                <label className="field"><span>Verification status *</span><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as DocumentItem['status'] })}><option>Pending</option><option>Verified</option><option>Rejected</option></select></label>
                <label className="field"><span>Expiry date</span><input type="date" value={form.expiresAt} onChange={(event) => setForm({ ...form, expiresAt: event.target.value })} /></label>
              </div>
              {selectedFile && <p className="small-label">Selected: {selectedFile.name} · {(selectedFile.size / 1024).toFixed(1)} KB · {selectedFile.type || 'Unknown type'}</p>}
              {formError && <p className="form-feedback form-feedback-error" role="alert">{formError}</p>}
            </div>
            <div className="modal-footer">
              <button className="secondary-button" type="button" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="primary-button" type="submit" disabled={submitting || !permissions.create}>Add document</button>
            </div>
          </form>
        </Modal>
      )}

      {preview && (
        <Modal title="Document preview" onClose={() => setPreview(null)}>
          <div className="modal-body">
            <div className="file-preview"><Eye size={24} /><strong>{preview.fileName ?? preview.title}</strong><span>Local demo preview · file content is not stored</span></div>
            <div className="row-item"><span>Category</span><strong>{preview.type}</strong></div>
            <div className="row-item"><span>Related record</span><strong>{preview.owner}</strong></div>
            <div className="row-item"><span>File type / size</span><strong>{preview.fileType ?? 'Demo record'}{preview.fileSize ? ` · ${(preview.fileSize / 1024).toFixed(1)} KB` : ''}</strong></div>
            <div className="modal-footer"><button className="secondary-button" type="button" onClick={() => setPreview(null)}>Close</button><button className="primary-button" type="button" onClick={() => simulateDownload(preview)}><Download size={14} /> Download simulation</button></div>
          </div>
        </Modal>
      )}
    </div>
  );
};
