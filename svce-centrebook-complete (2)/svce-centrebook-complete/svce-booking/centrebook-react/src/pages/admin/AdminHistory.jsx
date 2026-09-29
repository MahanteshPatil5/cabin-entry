import { useState, useEffect } from 'react'
import AdminNav from '../../components/AdminNav'
import { API } from '../../constants'

function escapeHtml(v) {
  if (v == null) return ''
  return String(v).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m])
}

function formatDateTime(dt) {
  if (!dt) return 'N/A'
  const d = new Date(dt)
  if (isNaN(d.getTime())) return dt
  return d.toLocaleString()
}

export default function AdminHistory() {
  const [allHistory, setAllHistory] = useState([])
  const [filtered, setFiltered] = useState([])
  const [cabinOptions, setCabinOptions] = useState([])
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(true)

  // Filter state
  const [search, setSearch] = useState('')
  const [cabinFilter, setCabinFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  async function loadHistory() {
    setLoading(true)
    try {
      const res = await fetch(`${API}/admin/history`)
      if (!res.ok) throw new Error('History API unavailable')
      const data = await res.json()
      setAllHistory(data)
      setFiltered(data)
      // populate cabin filter
      const cabins = [...new Set(data.map(i => i.cabin).filter(Boolean))]
      setCabinOptions(cabins)
    } catch (e) {
      setMessage({ text: 'Could not load history from backend.', type: 'error' })
      setFiltered([])
    }
    setLoading(false)
  }

  useEffect(() => { loadHistory() }, [])

  function applyFilter() {
    const term = search.toLowerCase().trim()
    const result = allHistory.filter(item => {
      const matchSearch = !term || (item.name && item.name.toLowerCase().includes(term)) || (item.usn && item.usn.toLowerCase().includes(term))
      const matchCabin = !cabinFilter || item.cabin === cabinFilter
      const matchRole = !roleFilter || item.role === roleFilter
      let matchDate = true
      if (item.entryTime) {
        const entryDate = item.entryTime.substring(0, 10)
        if (dateFrom) matchDate = matchDate && entryDate >= dateFrom
        if (dateTo) matchDate = matchDate && entryDate <= dateTo
      }
      return matchSearch && matchCabin && matchRole && matchDate
    })
    setFiltered(result)
  }

  function resetFilter() {
    setSearch(''); setCabinFilter(''); setRoleFilter(''); setDateFrom(''); setDateTo('')
    setFiltered(allHistory)
  }

  return (
    <div style={{ fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen,Ubuntu,Cantarell,sans-serif', background: '#F8FAFC', minHeight: '100vh', color: '#1E293B' }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        .ah-main{max-width:1200px;margin:24px auto;padding:0 16px}
        .ah-page-hdr{margin-bottom:24px}
        .ah-page-hdr h1{font-size:1.5rem;color:#0F172A}
        .ah-page-hdr p{color:#64748B;font-size:.875rem}
        .ah-alert{padding:10px 14px;border-radius:8px;margin-bottom:16px;font-size:.875rem}
        .ah-alert.error{background:#FEE2E2;color:#EF4444;border:1px solid #FECACA}
        .ah-filter-card{background:white;border-radius:8px;border:1px solid #E2E8F0;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,.1);margin-bottom:20px}
        .ah-filter-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;align-items:end}
        .ah-filter-grid label{display:block;font-size:.875rem;font-weight:500;margin-bottom:6px}
        .ah-filter-grid input,.ah-filter-grid select{width:100%;padding:8px 12px;border:1px solid #E2E8F0;border-radius:8px;font-size:.875rem;outline:none}
        .ah-filter-grid input:focus,.ah-filter-grid select:focus{border-color:#2563EB}
        .ah-filter-actions{display:flex;gap:8px;align-items:flex-end}
        .ah-btn{padding:8px 16px;border-radius:8px;border:none;font-weight:500;cursor:pointer;font-size:.875rem;transition:background .2s}
        .ah-btn-primary{background:#2563EB;color:white}
        .ah-btn-primary:hover{background:#1D4ED8}
        .ah-btn-secondary{background:#6B7280;color:white}
        .ah-btn-secondary:hover{background:#4B5563}
        .ah-card{background:white;border-radius:8px;border:1px solid #E2E8F0;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,.1)}
        .ah-table-wrap{overflow-x:auto}
        .ah-table{width:100%;border-collapse:collapse;text-align:left;font-size:.875rem}
        .ah-table th,.ah-table td{padding:12px;border-bottom:1px solid #E2E8F0}
        .ah-table th{background:#F8FAFC;color:#64748B;font-weight:600}
        .ah-table tr:hover td{background:#F9FAFB}
        .ah-badge{display:inline-block;padding:2px 8px;border-radius:12px;font-size:.75rem;font-weight:600;background:#DBEAFE;color:#2563EB}
        .ah-time-cell div{font-size:.8125rem}
      `}</style>

      <AdminNav />

      <main className="ah-main">
        <div className="ah-page-hdr">
          <h1>Usage History</h1>
          <p>View previous cabin entry and exit records.</p>
        </div>

        {message && <div className={`ah-alert ${message.type}`}>{message.text}</div>}

        {/* FILTERS */}
        <div className="ah-filter-card">
          <div className="ah-filter-grid">
            <div>
              <label>Search Name / USN</label>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." />
            </div>
            <div>
              <label>Cabin</label>
              <select value={cabinFilter} onChange={e => setCabinFilter(e.target.value)}>
                <option value="">All Cabins</option>
                {cabinOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label>Role</label>
              <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                <option value="">All Roles</option>
                <option value="Student">Student</option>
                <option value="Professor">Professor</option>
              </select>
            </div>
            <div>
              <label>Date From</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            </div>
            <div>
              <label>Date To</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
            <div className="ah-filter-actions">
              <button className="ah-btn ah-btn-primary" onClick={applyFilter}>Filter</button>
              <button className="ah-btn ah-btn-secondary" onClick={resetFilter}>Reset</button>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="ah-card">
          <div className="ah-table-wrap">
            <table className="ah-table">
              <thead>
                <tr><th>Name</th><th>Role</th><th>USN</th><th>People Count</th><th>Cabin</th><th>Time</th></tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: '#64748B', padding: 20 }}>Loading history records...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: '#64748B', padding: 20 }}>No history records found.</td></tr>
                ) : filtered.map((item, i) => (
                  <tr key={i}>
                    <td><strong>{escapeHtml(item.name || 'N/A')}</strong></td>
                    <td><span className="ah-badge">{escapeHtml(item.role || 'N/A')}</span></td>
                    <td>{escapeHtml(item.usn || 'N/A')}</td>
                    <td>{item.peopleCount || 0}</td>
                    <td>{escapeHtml(item.cabin || 'N/A')}</td>
                    <td className="ah-time-cell">
                      <div><strong>Entry:</strong> {formatDateTime(item.entryTime)}</div>
                      <div><strong>Exit:</strong> {item.exitTime ? formatDateTime(item.exitTime) : 'Active'}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
