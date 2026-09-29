import { useState, useEffect } from 'react'
import AdminNav from '../../components/AdminNav'
import { API } from '../../constants'

function escapeHtml(str) {
  if (!str) return ''
  return str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m])
}

const CABIN_TYPES = ['Mini Cabin', 'Project Room', 'Main Hall', 'Seminar Hall', 'Open Space']

export default function AdminCabins() {
  const [cabins, setCabins] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [editId, setEditId] = useState('')
  const [formName, setFormName] = useState('')
  const [formType, setFormType] = useState('')
  const [formCapacity, setFormCapacity] = useState('')
  const [message, setMessage] = useState(null) // { text, type }
  const [loading, setLoading] = useState(true)

  async function loadCabins() {
    setLoading(true)
    try {
      const res = await fetch(`${API}/admin/cabins`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setCabins(data)
      setFiltered(data)
    } catch { showAlert('Unable to load cabins from backend.', 'error') }
    setLoading(false)
  }

  useEffect(() => { loadCabins() }, [])

  useEffect(() => {
    const term = search.toLowerCase()
    setFiltered(cabins.filter(c => c.name.toLowerCase().includes(term) || c.type.toLowerCase().includes(term)))
  }, [search, cabins])

  function showAlert(text, type) {
    setMessage({ text, type })
    if (type === 'success') setTimeout(() => setMessage(null), 4000)
  }

  function editCabin(id) {
    const c = cabins.find(c => c.id === id)
    if (!c) return
    setEditId(String(c.id))
    setFormName(c.name)
    setFormType(c.type)
    setFormCapacity(String(c.capacity))
  }

  function resetForm() {
    setEditId('')
    setFormName('')
    setFormType('')
    setFormCapacity('')
  }

  async function saveCabin() {
    if (!formName.trim() || !formType || isNaN(parseInt(formCapacity))) {
      showAlert('Please enter cabin name, type and capacity.', 'error'); return
    }
    const payload = { name: formName.trim(), type: formType, capacity: parseInt(formCapacity) }
    const method = editId ? 'PUT' : 'POST'
    const url = editId ? `${API}/admin/cabins/${editId}` : `${API}/admin/cabins`
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error()
      showAlert(editId ? 'Cabin updated successfully.' : 'Cabin added successfully.', 'success')
      resetForm()
      await loadCabins()
    } catch { showAlert('Failed to save cabin.', 'error') }
  }

  async function deleteCabin(id, occupied) {
    if (occupied > 0) { alert('Cannot delete a cabin while it is occupied.'); return }
    if (!window.confirm(`Are you sure you want to delete Cabin #${id}?`)) return
    try {
      const res = await fetch(`${API}/admin/cabins/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      showAlert('Cabin deleted successfully.', 'success')
      await loadCabins()
    } catch { showAlert('Unable to delete cabin.', 'error') }
  }

  function getCabinStatus(c) {
    if (c.occupied === 0) return 'AVAILABLE'
    if (c.occupied >= c.capacity) return 'FULL'
    return 'PARTIAL'
  }

  return (
    <div style={{ fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen,Ubuntu,Cantarell,sans-serif', background: '#F8FAFC', minHeight: '100vh', color: '#1E293B' }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        .ac-main{max-width:1200px;margin:24px auto;padding:0 16px}
        .ac-page-hdr{margin-bottom:24px}
        .ac-page-hdr h1{font-size:1.5rem;color:#0F172A}
        .ac-page-hdr p{color:#64748B;font-size:.875rem}
        .ac-alert{padding:10px 14px;border-radius:8px;margin-bottom:16px;font-size:.875rem}
        .ac-alert.success{background:#DCFCE7;color:#16A34A;border:1px solid #BBF7D0}
        .ac-alert.error{background:#FEE2E2;color:#EF4444;border:1px solid #FECACA}
        .ac-layout{display:grid;grid-template-columns:1fr 2fr;gap:20px}
        @media(max-width:768px){.ac-layout{grid-template-columns:1fr}}
        .ac-card{background:white;border-radius:8px;border:1px solid #E2E8F0;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,.1);margin-bottom:20px}
        .ac-card h3{font-size:1rem;color:#0F172A;margin-bottom:16px}
        .ac-form-group{margin-bottom:16px}
        .ac-form-group label{display:block;font-size:.875rem;font-weight:500;margin-bottom:6px}
        .ac-form-group input,.ac-form-group select{width:100%;padding:8px 12px;border:1px solid #E2E8F0;border-radius:8px;font-size:.875rem;outline:none}
        .ac-form-group input:focus,.ac-form-group select:focus{border-color:#2563EB;box-shadow:0 0 0 2px rgba(37,99,235,.2)}
        .ac-btn-group{display:flex;gap:8px;margin-top:16px}
        .ac-btn{padding:8px 16px;border-radius:8px;border:none;font-weight:500;cursor:pointer;font-size:.875rem;transition:background .2s}
        .ac-btn-primary{background:#2563EB;color:white}
        .ac-btn-primary:hover{background:#1D4ED8}
        .ac-btn-secondary{background:#6B7280;color:white}
        .ac-card-hdr-actions{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
        .ac-search{padding:4px 8px;border:1px solid #E2E8F0;border-radius:8px;font-size:.8125rem;outline:none;width:180px}
        .ac-search:focus{border-color:#2563EB}
        .ac-table-wrap{overflow-x:auto}
        .ac-table{width:100%;border-collapse:collapse;text-align:left;font-size:.875rem}
        .ac-table th,.ac-table td{padding:12px;border-bottom:1px solid #E2E8F0}
        .ac-table th{background:#F8FAFC;color:#64748B;font-weight:600}
        .ac-badge{display:inline-block;padding:2px 8px;border-radius:12px;font-size:.75rem;font-weight:600}
        .ac-badge-av{background:#DCFCE7;color:#16A34A}
        .ac-badge-pa{background:#FEF3C7;color:#B45309}
        .ac-badge-fu{background:#FEE2E2;color:#EF4444}
        .ac-btn-sm{padding:4px 10px;font-size:.75rem}
        .ac-btn-edit{background:#6B7280;color:white;border:none;border-radius:8px;padding:4px 10px;font-size:.75rem;cursor:pointer;margin-right:4px}
        .ac-btn-delete{background:#EF4444;color:white;border:none;border-radius:8px;padding:4px 10px;font-size:.75rem;cursor:pointer}
        .ac-btn-edit:hover{background:#4B5563}
        .ac-btn-delete:hover{background:#DC2626}
      `}</style>

      <AdminNav />

      <main className="ac-main">
        <div className="ac-page-hdr">
          <h1>Cabin Management</h1>
          <p>Add new cabins, edit capacity, update status, or remove unused rooms.</p>
        </div>

        {message && <div className={`ac-alert ${message.type}`}>{message.text}</div>}

        <div className="ac-layout">
          {/* ADD / EDIT FORM */}
          <div className="ac-card">
            <h3>{editId ? `Edit Cabin #${editId}` : 'Add New Cabin'}</h3>
            <div className="ac-form-group">
              <label>Cabin Name</label>
              <input type="text" value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g. Project Room A" />
            </div>
            <div className="ac-form-group">
              <label>Cabin Type</label>
              <select value={formType} onChange={e => setFormType(e.target.value)}>
                <option value="">Select Type</option>
                {CABIN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="ac-form-group">
              <label>Capacity</label>
              <input type="number" value={formCapacity} onChange={e => setFormCapacity(e.target.value)} min="1" placeholder="e.g. 12" />
            </div>
            <div className="ac-btn-group">
              <button className="ac-btn ac-btn-primary" onClick={saveCabin}>Save Cabin</button>
              <button className="ac-btn ac-btn-secondary" onClick={resetForm}>Cancel</button>
            </div>
          </div>

          {/* TABLE */}
          <div className="ac-card">
            <div className="ac-card-hdr-actions">
              <h3>All Cabins</h3>
              <input className="ac-search" type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cabins..." />
            </div>
            <div className="ac-table-wrap">
              <table className="ac-table">
                <thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Capacity</th><th>Occupancy</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', color: '#64748B', padding: 20 }}>Loading cabin data...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', color: '#64748B', padding: 20 }}>No cabins found.</td></tr>
                  ) : filtered.map(c => {
                    const st = getCabinStatus(c)
                    const badgeCls = st === 'AVAILABLE' ? 'ac-badge-av' : st === 'FULL' ? 'ac-badge-fu' : 'ac-badge-pa'
                    return (
                      <tr key={c.id}>
                        <td>{c.id}</td>
                        <td><strong>{c.name}</strong></td>
                        <td>{c.type}</td>
                        <td>{c.capacity}</td>
                        <td>{c.occupied} / {c.capacity}</td>
                        <td><span className={`ac-badge ${badgeCls}`}>{st}</span></td>
                        <td>
                          <button className="ac-btn-edit" onClick={() => editCabin(c.id)}>Edit</button>
                          <button className="ac-btn-delete" onClick={() => deleteCabin(c.id, c.occupied)}>Delete</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
