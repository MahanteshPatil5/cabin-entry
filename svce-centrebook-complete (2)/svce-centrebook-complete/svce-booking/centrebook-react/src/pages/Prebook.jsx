import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API } from '../constants'

function escapeHtml(v) {
  if (v == null) return ''
  return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;')
}

export default function Prebook() {
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [spaces, setSpaces] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchParams, setSearchParams] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setDate(today)
  }, [])

  async function findAvailableSpaces(e) {
    e.preventDefault()
    setError('')
    if (!date || !startTime || !endTime) { setError('Please select date, start time and end time.'); return }
    if (startTime >= endTime) { setError('End time must be after start time.'); return }
    setLoading(true)
    setSpaces(null)
    setSearchParams({ date, startTime, endTime })
    try {
      const url = `${API}/prebook/availability?date=${encodeURIComponent(date)}&startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`
      const res = await fetch(url)
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.message || 'Could not find available spaces.') }
      setSpaces(await res.json())
    } catch (err) { setError(err.message || 'Unable to connect to the server.') }
    setLoading(false)
  }

  function selectSpace(id, name) {
    if (!searchParams) { setError('Please select date and time first.'); return }
    const params = new URLSearchParams({ room_id: id, date: searchParams.date, startTime: searchParams.startTime, endTime: searchParams.endTime })
    navigate(`/prebook/room?${params.toString()}`)
  }

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: '#0F172A', color: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--primary:#1E3A8A;--primary-light:#3B82F6;--green:#22C55E;--yellow:#F59E0B;--red:#EF4444;--bg-dark:#0F172A;--card-bg:#1E293B;--glass-bg:rgba(30,41,59,.7);--glass-border:rgba(255,255,255,.08);--text-muted:#94A3B8;--radius:16px}
        .pb-nav{position:fixed;top:0;left:0;right:0;z-index:200;background:rgba(15,23,42,.85);backdrop-filter:blur(16px);border-bottom:1px solid var(--glass-border);height:64px;display:flex;align-items:center;padding:0 28px;justify-content:space-between}
        .pb-nav-brand{display:flex;align-items:center;gap:12px;text-decoration:none}
        .pb-nav-logo{width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#1E3A8A,#3B82F6);display:flex;align-items:center;justify-content:center;font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:800;color:white}
        .pb-nav-name{font-family:'Space Grotesk',sans-serif;font-size:18px;font-weight:700;color:white}
        .pb-nav-name span{color:#60A5FA}
        .pb-nav-college{font-size:11px;color:var(--text-muted);letter-spacing:.3px}
        .pb-pill{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);color:rgba(255,255,255,.8);padding:8px 18px;border-radius:50px;font-size:13px;text-decoration:none;transition:all .2s}
        .pb-pill:hover{background:rgba(255,255,255,.15);color:white}
        .pb-container{flex:1;max-width:1000px;margin:0 auto;width:100%;padding:100px 24px 60px}
        .pb-hero{text-align:center;margin-bottom:36px}
        .pb-hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(59,130,246,.15);border:1px solid rgba(59,130,246,.3);color:#93C5FD;padding:6px 18px;border-radius:50px;font-size:13px;font-weight:500;margin-bottom:20px}
        .pb-bdot{width:6px;height:6px;border-radius:50%;background:#22C55E;box-shadow:0 0 8px #22C55E}
        .pb-hero-title{font-family:'Space Grotesk',sans-serif;font-size:clamp(32px,5vw,48px);font-weight:800;line-height:1.1;margin-bottom:12px;background:linear-gradient(135deg,#fff 0%,#93C5FD 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .pb-hero-sub{font-size:18px;color:#E2E8F0;font-weight:500;margin-bottom:8px}
        .pb-hero-desc{font-size:14px;color:var(--text-muted);max-width:600px;margin:0 auto;line-height:1.6}
        .pb-glass-card{background:var(--glass-bg);backdrop-filter:blur(12px);border:1px solid var(--glass-border);border-radius:var(--radius);padding:28px;box-shadow:0 20px 40px rgba(0,0,0,.3);margin-bottom:32px}
        .pb-card-hdr{margin-bottom:24px}
        .pb-card-hdr h2{font-family:'Space Grotesk',sans-serif;font-size:20px;font-weight:700;color:white;margin-bottom:4px}
        .pb-card-hdr p{font-size:13px;color:var(--text-muted)}
        .pb-form-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;margin-bottom:24px}
        .pb-form-group{display:flex;flex-direction:column;gap:8px}
        .pb-form-group label{font-size:13px;font-weight:500;color:#CBD5E1}
        .pb-form-group input,.pb-form-group select{background:rgba(15,23,42,.6);border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:12px 16px;color:white;font-family:'DM Sans',sans-serif;font-size:14px;outline:none;transition:border-color .2s,box-shadow .2s}
        .pb-form-group input:focus,.pb-form-group select:focus{border-color:var(--primary-light);box-shadow:0 0 0 3px rgba(59,130,246,.25)}
        .pb-form-group select option{background:#1E293B;color:white}
        .pb-form-action{margin-top:10px;display:flex;justify-content:flex-end}
        .pb-btn-primary{background:linear-gradient(135deg,#3B82F6,#1D4ED8);color:white;border:none;padding:12px 28px;border-radius:50px;font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all .25s;box-shadow:0 4px 16px rgba(59,130,246,.3);display:inline-flex;align-items:center;justify-content:center}
        .pb-btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(59,130,246,.45)}
        .pb-btn-primary:disabled{opacity:.6;cursor:not-allowed;transform:none}
        .pb-sec-hdr{text-align:center;margin-bottom:28px}
        .pb-sec-tag{display:inline-block;background:rgba(59,130,246,.15);color:#60A5FA;padding:4px 14px;border-radius:20px;font-size:11px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;margin-bottom:10px}
        .pb-sec-title{font-family:'Space Grotesk',sans-serif;font-size:26px;font-weight:700;color:white;margin-bottom:6px}
        .pb-sec-sub{color:var(--text-muted);font-size:14px}
        .pb-rooms-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px}
        .pb-room-card{background:var(--card-bg);border:1px solid var(--glass-border);border-radius:var(--radius);padding:20px;display:flex;flex-direction:column;justify-content:space-between;transition:transform .25s,box-shadow .25s,border-color .25s;position:relative;overflow:hidden}
        .pb-room-card:hover{transform:translateY(-4px);box-shadow:0 16px 32px rgba(0,0,0,.4);border-color:rgba(59,130,246,.4)}
        .pb-room-card::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;border-radius:var(--radius) var(--radius) 0 0}
        .pb-room-card.available::before{background:var(--green)}
        .pb-room-card.partial::before{background:var(--yellow)}
        .pb-room-card.full::before{background:var(--red)}
        .pb-room-hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px}
        .pb-room-name{font-family:'Space Grotesk',sans-serif;font-size:18px;font-weight:700;color:white}
        .pb-room-type{font-size:12px;color:var(--text-muted);margin-top:2px}
        .pb-room-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:600}
        .pb-room-badge.available{background:rgba(34,197,94,.15);color:#4ADE80;border:1px solid rgba(34,197,94,.3)}
        .pb-sbdot{width:6px;height:6px;border-radius:50%;background:#4ADE80}
        .pb-room-details{margin:16px 0;padding:12px 0;border-top:1px solid rgba(255,255,255,.06);border-bottom:1px solid rgba(255,255,255,.06);display:flex;justify-content:space-between;font-size:13px;color:#CBD5E1}
        .pb-select-btn{width:100%;background:rgba(59,130,246,.15);border:1px solid rgba(59,130,246,.3);color:#60A5FA;padding:10px;border-radius:10px;font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:13px;cursor:pointer;transition:all .2s}
        .pb-select-btn:hover{background:#3B82F6;color:white}
        .pb-error{background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.3);color:#F87171;padding:12px 16px;border-radius:10px;font-size:13px;margin-bottom:18px}
        .pb-no-spaces{text-align:center;width:100%;grid-column:1/-1;padding:40px;background:var(--glass-bg);border-radius:var(--radius);border:1px solid var(--glass-border)}
        .pb-no-spaces h3{font-family:'Space Grotesk',sans-serif;font-size:20px;color:white;margin-bottom:8px}
        .pb-no-spaces p{color:var(--text-muted);font-size:14px}
        footer.pb-footer{text-align:center;padding:24px;color:#475569;font-size:13px;border-top:1px solid rgba(255,255,255,.05)}
        footer.pb-footer strong{color:#64748B}
        @media(max-width:640px){.pb-container{padding:84px 16px 40px}.pb-glass-card{padding:20px}.pb-form-grid{grid-template-columns:1fr}}
      `}</style>

      <nav className="pb-nav">
        <Link to="/" className="pb-nav-brand">
          <div className="pb-nav-logo">CB</div>
          <div>
            <div className="pb-nav-name">SVCE <span>CentreBook</span></div>
            <div className="pb-nav-college">Sri Venkateshwara College of Engineering</div>
          </div>
        </Link>
        <div>
          <Link to="/" className="pb-pill">← Back to Home</Link>
        </div>
      </nav>

      <main className="pb-container">
        <header className="pb-hero">
          <div className="pb-hero-badge"><span className="pb-bdot" /> Advance Space Reservation</div>
          <h1 className="pb-hero-title">Pre-Book a Space</h1>
          <p className="pb-hero-sub">Reserve a cabin before you arrive.</p>
          <p className="pb-hero-desc">Choose your date and time to find a space available for your meeting, project discussion or other activity.</p>
        </header>

        {/* STEP 1: DATE & TIME */}
        <section className="pb-glass-card">
          <div className="pb-card-hdr">
            <h2>1. Select Date &amp; Time</h2>
            <p>Find real-time cabin availability for your target schedule.</p>
          </div>
          {error && <div className="pb-error">{error}</div>}
          <form onSubmit={findAvailableSpaces}>
            <div className="pb-form-grid">
              <div className="pb-form-group">
                <label htmlFor="pb-date">Date</label>
                <input type="date" id="pb-date" value={date} min={new Date().toISOString().split('T')[0]} onChange={e => setDate(e.target.value)} required />
              </div>
              <div className="pb-form-group">
                <label htmlFor="pb-start">Start Time</label>
                <input type="time" id="pb-start" value={startTime} onChange={e => setStartTime(e.target.value)} required />
              </div>
              <div className="pb-form-group">
                <label htmlFor="pb-end">End Time</label>
                <input type="time" id="pb-end" value={endTime} onChange={e => setEndTime(e.target.value)} required />
              </div>
            </div>
            <div className="pb-form-action">
              <button type="submit" className="pb-btn-primary" disabled={loading}>
                {loading ? 'Searching…' : 'Find Available Spaces'}
              </button>
            </div>
          </form>
        </section>

        {/* STEP 2: AVAILABLE SPACES */}
        {spaces !== null && (
          <section>
            <div className="pb-sec-hdr">
              <span className="pb-sec-tag">Step 2</span>
              <h2 className="pb-sec-title">Available Spaces</h2>
              <p className="pb-sec-sub">Choose a space for your selected time.</p>
            </div>
            <div className="pb-rooms-grid">
              {spaces.length === 0 ? (
                <div className="pb-no-spaces">
                  <h3>No cabins available</h3>
                  <p>No cabins are available for the selected date and time.</p>
                </div>
              ) : spaces.map(room => {
                const status = (room.status || 'available').toLowerCase()
                const statusLabel = room.statusLabel || (status.charAt(0).toUpperCase() + status.slice(1))
                return (
                  <div key={room.id} className={`pb-room-card ${status}`}>
                    <div>
                      <div className="pb-room-hdr">
                        <div>
                          <div className="pb-room-name">{room.name}</div>
                          <div className="pb-room-type">{room.type}</div>
                        </div>
                        <span className={`pb-room-badge ${status}`}><span className="pb-sbdot" /> {statusLabel}</span>
                      </div>
                      <div className="pb-room-details">
                        <span>Capacity: <strong>{room.capacity}</strong></span>
                        <span>Status: <strong>{statusLabel}</strong></span>
                      </div>
                    </div>
                    <button className="pb-select-btn" onClick={() => selectSpace(room.id, room.name)}>Select Space</button>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </main>

      <footer className="pb-footer">
        <p>SVCE CentreBook © 2026. Designed for <strong>Sri Venkateshwara College of Engineering</strong>.</p>
      </footer>
    </div>
  )
}
