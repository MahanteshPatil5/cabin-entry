import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API } from '../constants'

const ROOMS_MAP = { 1: 'Cabin 1', 2: 'Cabin 2', 3: 'Cabin 3', 4: 'Cabin 4', 5: 'Project Room A', 6: 'Project Room B', 7: 'Top Floor Open Space', 8: 'Main Hall', 9: 'Seminar Room', 10: 'Discussion Room' }

export default function History() {
  const [allEntries, setAllEntries] = useState([])
  const [currentFilter, setCurrentFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [adminEntries, setAdminEntries] = useState([])
  const [adminLoading, setAdminLoading] = useState(true)
  const navigate = useNavigate()

  function loadHistory() {
    const stored = JSON.parse(localStorage.getItem('cc_history') || '[]')
    setAllEntries(stored)
  }

  async function fetchBackendHistory() {
    try {
      const res = await fetch(`${API}/entries/active`)
      if (res.ok) {
        const active = await res.json()
        setAllEntries(prev => {
          const merged = [...prev]
          active.forEach(e => {
            const idx = merged.findIndex(a => String(a.id) === String(e.id))
            const mapped = { id: e.id, roomId: e.roomId, roomName: e.roomName, userName: e.userName, role: e.role, usnOrDept: e.usnOrDept, purpose: e.purpose, peopleCount: e.peopleCount, entryTime: e.entryTime, exitTime: e.exitTime, active: e.active }
            if (idx !== -1) merged[idx] = { ...merged[idx], ...mapped }
            else merged.unshift(mapped)
          })
          localStorage.setItem('cc_history', JSON.stringify(merged.slice(0, 100)))
          return merged
        })
      }
    } catch {}
  }

  async function loadAdminData() {
    setAdminLoading(true)
    try {
      const res = await fetch(`${API}/entries/active`)
      if (!res.ok) throw new Error()
      setAdminEntries(await res.json())
    } catch { setAdminEntries(null) }
    setAdminLoading(false)
  }

  useEffect(() => { loadHistory(); fetchBackendHistory(); loadAdminData() }, [])

  function clearHistory() {
    if (!window.confirm('Clear all local history? This cannot be undone.')) return
    localStorage.removeItem('cc_history')
    setAllEntries([])
  }

  const filtered = allEntries.filter(e => {
    if (currentFilter === 'active' && !e.active) return false
    if (currentFilter === 'exited' && e.active) return false
    if (currentFilter === 'student' && e.role !== 'Student') return false
    if (currentFilter === 'professor' && e.role !== 'Professor') return false
    if (search) {
      const hay = `${e.userName} ${e.roomName || ROOMS_MAP[e.roomId] || ''} ${e.purpose} ${e.usnOrDept}`.toLowerCase()
      if (!hay.includes(search.toLowerCase())) return false
    }
    return true
  })

  const totalActive = allEntries.filter(e => e.active).length
  const totalExited = allEntries.filter(e => !e.active).length

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: '#F0F4FF', minHeight: '100vh', color: '#1F2937' }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        .hs-nav{background:#1E3A8A;padding:0 20px;height:56px;display:flex;align-items:center;gap:14px;position:sticky;top:0;z-index:100;box-shadow:0 2px 8px rgba(30,58,138,.25)}
        .hs-back{background:rgba(255,255,255,.15);border:none;color:white;width:34px;height:34px;border-radius:50%;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;text-decoration:none}
        .hs-nav-title{font-family:'Space Grotesk',sans-serif;font-size:17px;font-weight:600;color:white;flex:1}
        .hs-clear-btn{background:rgba(239,68,68,.3);border:none;color:white;padding:7px 14px;border-radius:8px;font-size:13px;cursor:pointer}
        .hs-clear-btn:hover{background:rgba(239,68,68,.5)}
        .hs-page-hdr{background:linear-gradient(135deg,#1E3A8A,#2563EB);padding:28px 20px 44px;color:white}
        .hs-page-hdr h1{font-family:'Space Grotesk',sans-serif;font-size:24px;font-weight:700;margin-bottom:6px}
        .hs-page-hdr p{color:#BFDBFE;font-size:14px}
        .hs-hdr-stats{display:flex;gap:16px;margin-top:16px;flex-wrap:wrap}
        .hs-hstat{background:rgba(255,255,255,.12);border-radius:10px;padding:10px 16px;text-align:center}
        .hs-hstat-num{font-family:'Space Grotesk',sans-serif;font-size:20px;font-weight:700}
        .hs-hstat-lbl{font-size:11px;color:#93C5FD;text-transform:uppercase;letter-spacing:.5px}
        main.hs-main{max-width:720px;margin:-20px auto 40px;padding:0 16px}
        .hs-filter-bar{background:white;border-radius:14px;padding:14px 18px;margin-bottom:18px;box-shadow:0 1px 4px rgba(0,0,0,.07);display:flex;gap:10px;flex-wrap:wrap;align-items:center}
        .hs-filter-lbl{font-size:13px;color:#4B5563;font-weight:500}
        .hs-filter-btn{background:#F3F4F6;border:1.5px solid #E5E7EB;color:#4B5563;padding:6px 14px;border-radius:20px;font-size:13px;cursor:pointer;transition:all .2s}
        .hs-filter-btn:hover,.hs-filter-btn.active{background:#EFF6FF;border-color:#3B82F6;color:#1E3A8A;font-weight:500}
        .hs-search{flex:1;min-width:180px;padding:8px 12px;border:1.5px solid #E5E7EB;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:13px;outline:none}
        .hs-search:focus{border-color:#3B82F6}
        .hs-list{display:flex;flex-direction:column;gap:12px}
        .hs-card{background:white;border-radius:14px;padding:18px 20px;box-shadow:0 1px 4px rgba(0,0,0,.07);border-left:5px solid #E5E7EB;transition:transform .2s}
        .hs-card:hover{transform:translateX(3px)}
        .hs-card.active-entry{border-color:#22C55E}
        .hs-card.exited-entry{border-color:#E5E7EB}
        .hs-card-hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px}
        .hs-card-name{font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:600}
        .hs-card-room{font-size:13px;color:#3B82F6;margin-top:2px}
        .hs-badge{font-size:12px;padding:4px 12px;border-radius:20px;font-weight:500;white-space:nowrap}
        .hs-badge.active{background:#F0FDF4;color:#15803D}
        .hs-badge.exited{background:#F3F4F6;color:#4B5563}
        .hs-details{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px;margin-top:10px;padding-top:10px;border-top:1px solid #F3F4F6}
        .hs-detail-key{font-size:11px;color:#9CA3AF;text-transform:uppercase;letter-spacing:.4px;margin-bottom:2px}
        .hs-detail-val{font-size:13px;font-weight:500;color:#1F2937}
        .hs-timeline{display:flex;gap:16px;margin-top:10px;padding-top:10px;border-top:1px solid #F3F4F6;flex-wrap:wrap}
        .hs-titem{display:flex;align-items:center;gap:6px;font-size:12px;color:#4B5563}
        .hs-tdot{width:8px;height:8px;border-radius:50%}
        .hs-tdot.in{background:#22C55E}
        .hs-tdot.out{background:#9CA3AF}
        .hs-dur{background:#F3F4F6;padding:2px 8px;border-radius:10px;font-size:11px;color:#4B5563;font-weight:500}
        .hs-empty{text-align:center;padding:60px 20px;color:#9CA3AF}
        .hs-empty-icon{font-size:48px;margin-bottom:12px}
        .hs-empty p{font-size:15px}
        .hs-empty a{color:#3B82F6;text-decoration:none;font-weight:500}
        .hs-admin-sec{margin-top:28px}
        .hs-admin-title{font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:600;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between}
        .hs-admin-wrap{background:white;border-radius:14px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.07)}
        table{width:100%;border-collapse:collapse;font-size:13px}
        th{background:#1E3A8A;color:white;padding:11px 14px;text-align:left;font-weight:500}
        td{padding:11px 14px;border-bottom:1px solid #F3F4F6}
        tr:last-child td{border-bottom:none}
        tr:hover td{background:#F9FAFB}
      `}</style>

      <nav className="hs-nav">
        <Link to="/rooms" className="hs-back">←</Link>
        <div className="hs-nav-title">Booking History</div>
        <button className="hs-clear-btn" onClick={clearHistory}>Clear All</button>
      </nav>

      <div className="hs-page-hdr">
        <h1>📋 Activity History</h1>
        <p>All login and logout records for this device</p>
        <div className="hs-hdr-stats">
          <div className="hs-hstat"><div className="hs-hstat-num">{allEntries.length}</div><div className="hs-hstat-lbl">Total</div></div>
          <div className="hs-hstat"><div className="hs-hstat-num">{totalActive}</div><div className="hs-hstat-lbl">Active</div></div>
          <div className="hs-hstat"><div className="hs-hstat-num">{totalExited}</div><div className="hs-hstat-lbl">Exited</div></div>
        </div>
      </div>

      <main className="hs-main">
        <div className="hs-filter-bar">
          <span className="hs-filter-lbl">Filter:</span>
          {[['all','All'],['active','Active'],['exited','Exited'],['student','Students'],['professor','Professors']].map(([val, lbl]) => (
            <button key={val} className={`hs-filter-btn${currentFilter === val ? ' active' : ''}`} onClick={() => setCurrentFilter(val)}>{lbl}</button>
          ))}
          <input className="hs-search" type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or room…" />
        </div>

        <div className="hs-list">
          {filtered.length === 0 ? (
            <div className="hs-empty">
              <div className="hs-empty-icon">📭</div>
              <p>No records found.<br /><Link to="/rooms">Book a room</Link> to get started.</p>
            </div>
          ) : filtered.map((e, i) => {
            const roomName = e.roomName || ROOMS_MAP[e.roomId] || `Room ${e.roomId}`
            const inTime = e.entryTime ? new Date(e.entryTime) : null
            const outTime = e.exitTime ? new Date(e.exitTime) : null
            let duration = ''
            if (inTime && outTime) {
              const mins = Math.round((outTime - inTime) / 60000)
              duration = mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h ${mins % 60}m`
            }
            return (
              <div key={e.id || i} className={`hs-card ${e.active ? 'active-entry' : 'exited-entry'}`}>
                <div className="hs-card-hdr">
                  <div>
                    <div className="hs-card-name">{e.userName}</div>
                    <div className="hs-card-room">📍 {roomName}</div>
                  </div>
                  <div className={`hs-badge ${e.active ? 'active' : 'exited'}`}>{e.active ? '● Currently Inside' : '✓ Exited'}</div>
                </div>
                <div className="hs-details">
                  <div><div className="hs-detail-key">Role</div><div className="hs-detail-val">{e.role}</div></div>
                  <div><div className="hs-detail-key">{e.role === 'Professor' ? 'Department' : 'USN'}</div><div className="hs-detail-val">{e.usnOrDept}</div></div>
                  <div><div className="hs-detail-key">Purpose</div><div className="hs-detail-val">{e.purpose}</div></div>
                  <div><div className="hs-detail-key">People</div><div className="hs-detail-val">{e.peopleCount}</div></div>
                  {e.teamMembers && <div style={{ gridColumn: '1/-1' }}><div className="hs-detail-key">Team</div><div className="hs-detail-val">{e.teamMembers}</div></div>}
                </div>
                <div className="hs-timeline">
                  {inTime && <div className="hs-titem"><div className="hs-tdot in" /><strong>In:</strong> {inTime.toLocaleString()}</div>}
                  {outTime && <div className="hs-titem"><div className="hs-tdot out" /><strong>Out:</strong> {outTime.toLocaleString()}</div>}
                  {duration && <span className="hs-dur">⏱ {duration}</span>}
                  {e.active && <span className="hs-dur" style={{ background: '#F0FDF4', color: '#15803D' }}>⏳ In session</span>}
                </div>
              </div>
            )
          })}
        </div>

        {/* LIVE ACTIVE BOOKINGS (SERVER) */}
        <div className="hs-admin-sec">
          <div className="hs-admin-title">
            🖥️ Live Active Bookings (Server)
            <button onClick={loadAdminData} style={{ background: '#F3F4F6', border: 'none', padding: '6px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>Refresh</button>
          </div>
          <div className="hs-admin-wrap">
            <table>
              <thead><tr><th>Room</th><th>Name</th><th>Role</th><th>Purpose</th><th>Check In</th></tr></thead>
              <tbody>
                {adminLoading ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: '#9CA3AF', padding: 20 }}>Loading…</td></tr>
                ) : adminEntries === null ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: '#9CA3AF', padding: 20 }}>Backend not connected</td></tr>
                ) : adminEntries.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: '#9CA3AF', padding: 20 }}>No active bookings</td></tr>
                ) : adminEntries.map(e => (
                  <tr key={e.id}>
                    <td><strong>{e.roomName}</strong></td>
                    <td>{e.userName}</td>
                    <td><span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '2px 8px', borderRadius: 20, fontSize: 11 }}>{e.role}</span></td>
                    <td>{e.purpose}</td>
                    <td>{new Date(e.entryTime).toLocaleTimeString()}</td>
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
