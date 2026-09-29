import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API } from '../constants'

export default function Logout() {
  const [entry, setEntry] = useState(null)
  const [message, setMessage] = useState(null) // { text, type }
  const [disabled, setDisabled] = useState(false)
  const [btnText, setBtnText] = useState('Logout / Check-Out')
  const navigate = useNavigate()

  useEffect(() => {
    const stored = sessionStorage.getItem('activeEntry')
    if (!stored) {
      setMessage({ text: 'No active entry found. Please register first.', type: 'error' })
      setDisabled(true)
      setBtnText('No Active Entry')
      return
    }
    try { setEntry(JSON.parse(stored)) }
    catch { setMessage({ text: 'Invalid active entry data.', type: 'error' }); setDisabled(true) }
  }, [])

  async function checkOut() {
    if (!entry) { setMessage({ text: 'No active entry found.', type: 'error' }); return }
    if (!entry.id) { setMessage({ text: 'Entry ID not found.', type: 'error' }); return }
    if (!window.confirm('Are you sure you want to check out?')) return

    setDisabled(true)
    setBtnText('Checking Out...')
    try {
      const res = await fetch(`${API}/entries/${entry.id}/exit`, { method: 'PUT' })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setMessage({ text: d.message || 'Could not complete checkout.', type: 'error' })
        setDisabled(false)
        setBtnText('Logout / Check-Out')
        return
      }
      sessionStorage.removeItem('activeEntry')
      setMessage({ text: 'Logged out successfully!', type: 'success' })
      setTimeout(() => navigate('/rooms'), 1000)
    } catch {
      setMessage({ text: 'Connection error. Is the server running?', type: 'error' })
      setDisabled(false)
      setBtnText('Logout / Check-Out')
    }
  }

  const roleLabel = entry?.role === 'Professor' ? 'Department' : 'USN'
  const entryTime = entry?.entryTime ? new Date(entry.entryTime).toLocaleString() : 'N/A'

  return (
    <div style={{ background: '#0f172a', color: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Segoe UI',Roboto,Helvetica,Arial,sans-serif" }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        .lg-nav{background:#1e293b;padding:1rem 2rem;display:flex;justify-content:space-between;align-items:center;box-shadow:0 4px 6px -1px rgba(0,0,0,.1);position:sticky;top:0;z-index:100}
        .lg-logo{font-size:1.5rem;font-weight:700;color:#3b82f6;letter-spacing:-.5px;text-decoration:none}
        .lg-nav-links{display:flex;gap:1.5rem}
        .lg-nav-links a{text-decoration:none;color:#94a3b8;font-weight:500;transition:color .3s}
        .lg-nav-links a:hover{color:#f8fafc}
        .lg-nav-links a.active{color:#3b82f6;border-bottom:2px solid #3b82f6}
        main.lg-main{flex:1;display:flex;justify-content:center;align-items:center;padding:2rem}
        .lg-card{background:#1e293b;width:100%;max-width:450px;padding:2.5rem;border-radius:1rem;box-shadow:0 20px 25px -5px rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.05);transition:transform .3s ease}
        .lg-card:hover{transform:translateY(-5px)}
        .lg-header{margin-bottom:2rem;text-align:center}
        .lg-header h1{font-size:1.75rem;margin-bottom:.5rem}
        .lg-header p{color:#94a3b8;font-size:.9rem}
        .lg-entry-box{margin-bottom:1.5rem}
        .lg-entry-row{display:flex;justify-content:space-between;padding:.5rem 0;border-bottom:1px solid rgba(255,255,255,.07);font-size:.9rem}
        .lg-entry-row:last-child{border-bottom:none}
        .lg-entry-row strong{color:#94a3b8;font-weight:500}
        .lg-entry-row span{color:#f8fafc}
        .lg-no-entry{color:#94a3b8;font-size:.9rem;text-align:center;padding:1rem 0}
        .lg-submit-btn{width:100%;padding:.75rem;background:#3b82f6;color:white;border:none;border-radius:.5rem;font-size:1rem;font-weight:600;cursor:pointer;transition:background .3s,opacity .3s;margin-top:1rem}
        .lg-submit-btn:hover:not(:disabled){background:#2563eb}
        .lg-submit-btn:disabled{background:#475569;cursor:not-allowed;opacity:.7}
        .lg-msg{margin-top:1.5rem;padding:.75rem;border-radius:.5rem;text-align:center;font-size:.9rem}
        .lg-msg.success{background:rgba(16,185,129,.1);color:#10b981;border:1px solid #10b981}
        .lg-msg.error{background:rgba(239,68,68,.1);color:#ef4444;border:1px solid #ef4444}
        @media(max-width:480px){.lg-nav{padding:1rem;flex-direction:column;gap:1rem}.lg-card{padding:1.5rem}}
      `}</style>

      <nav className="lg-nav">
        <Link to="/" className="lg-logo">CentreBook</Link>
        <div className="lg-nav-links">
          <Link to="/">Home</Link>
          <Link to="/rooms">Rooms</Link>
          <Link to="/logout" className="active">Logout</Link>
        </div>
      </nav>

      <main className="lg-main">
        <section className="lg-card">
          <div className="lg-header">
            <h1>Exit / Logout from Cabin</h1>
            <p>Check your active entry and check out</p>
          </div>

          {entry ? (
            <div className="lg-entry-box">
              {[
                ['Name', entry.name || 'N/A'],
                ['Role', entry.role || 'N/A'],
                [roleLabel, entry.usnOrDept || 'N/A'],
                ['Cabin', entry.roomName || 'N/A'],
                ['People', entry.peopleCount || 1],
                ['Check-in', entryTime],
              ].map(([k, v]) => (
                <div key={k} className="lg-entry-row"><strong>{k}:</strong><span>{v}</span></div>
              ))}
            </div>
          ) : (
            <div className="lg-no-entry">Loading active entry...</div>
          )}

          {message && <div className={`lg-msg ${message.type}`}>{message.text}</div>}

          <button className="lg-submit-btn" disabled={disabled} onClick={checkOut}>{btnText}</button>
        </section>
      </main>
    </div>
  )
}
