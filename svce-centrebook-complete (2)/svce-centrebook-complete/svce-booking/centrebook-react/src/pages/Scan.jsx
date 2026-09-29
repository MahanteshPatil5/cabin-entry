import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { API, ROOMS_STATIC, statusClass, STATUS_LABEL } from '../constants'

export default function Scan() {
  const [rooms, setRooms] = useState(ROOMS_STATIC.map(r => ({ ...r, occupied: 0 })))
  const [stats, setStats] = useState({ available: 0, occupied: 0 })
  const [section, setSection] = useState('rooms')
  const [scannerOpen, setScannerOpen] = useState(false)
  const [adminEntries, setAdminEntries] = useState([])
  const [adminLoading, setAdminLoading] = useState(false)
  const [toast, setToast] = useState('')
  const scannerRef = useRef(null)
  const navigate = useNavigate()

  async function loadRooms() {
    let data = ROOMS_STATIC.map(r => ({ ...r, occupied: 0 }))
    try {
      const res = await fetch(`${API}/rooms`)
      if (res.ok) data = await res.json()
    } catch {
      data = ROOMS_STATIC.map(r => ({ ...r, occupied: Math.floor(Math.random() * (r.capacity + 1)) }))
    }
    let available = 0, occupied = 0
    data.forEach(r => { if (statusClass(r.occupied, r.capacity) === 'available') available++; else occupied++ })
    setRooms(data.map(r => ({ ...r, capacity: r.capacity || (ROOMS_STATIC.find(s => s.id === r.id) || {}).capacity || 1 })))
    setStats({ available, occupied })
  }

  async function loadAdmin() {
    setAdminLoading(true)
    try {
      const res = await fetch(`${API}/entries/active`)
      if (res.ok) setAdminEntries(await res.json())
      else setAdminEntries([])
    } catch { setAdminEntries(null) }
    setAdminLoading(false)
  }

  function loadQRCodes() {}

  useEffect(() => { loadRooms(); const t = setInterval(loadRooms, 30000); return () => clearInterval(t) }, [])

  useEffect(() => {
    if (section === 'admin') loadAdmin()
  }, [section])

  async function openScanner() {
    setScannerOpen(true)
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      await new Promise(r => setTimeout(r, 100))
      const qr = new Html5Qrcode('qr-reader-scan')
      scannerRef.current = qr
      await qr.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (text) => {
          closeScanner()
          try {
            const url = new URL(text)
            const roomId = url.searchParams.get('room_id')
            if (roomId) navigate(`/room/${roomId}`)
            else navigate(`/room/1`)
          } catch { showToast('Invalid QR code') }
        },
        () => {}
      )
    } catch { showToast('Camera permission denied') }
  }

  async function closeScanner() {
    setScannerOpen(false)
    if (scannerRef.current) { try { await scannerRef.current.stop() } catch {} scannerRef.current = null }
  }

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const ROOMS_MAP = Object.fromEntries(ROOMS_STATIC.map(r => [r.id, r]))

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: '#F0F4FF', color: '#1F2937', minHeight: '100vh' }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        .sc-nav{background:#1E3A8A;padding:0 24px;height:60px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100;box-shadow:0 2px 12px rgba(30,58,138,.3)}
        .sc-brand{font-family:'Space Grotesk',sans-serif;font-size:20px;font-weight:700;color:white;letter-spacing:-.3px}
        .sc-brand span{color:#93C5FD}
        .sc-nav-links{display:flex;gap:8px}
        .sc-nav-btn{background:rgba(255,255,255,.12);border:none;color:white;padding:8px 16px;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:14px;cursor:pointer;transition:background .2s}
        .sc-nav-btn:hover{background:rgba(255,255,255,.2)}
        .sc-nav-btn.active{background:rgba(255,255,255,.25);font-weight:500}
        .sc-hero{background:linear-gradient(135deg,#1E3A8A 0%,#1e40af 50%,#2563EB 100%);padding:40px 24px 60px;text-align:center;color:white}
        .sc-hero-title{font-family:'Space Grotesk',sans-serif;font-size:clamp(26px,5vw,40px);font-weight:700;line-height:1.2;margin-bottom:12px}
        .sc-hero-sub{font-size:16px;color:#BFDBFE;margin-bottom:28px}
        .sc-hero-stats{display:flex;justify-content:center;gap:32px;flex-wrap:wrap}
        .sc-hero-stat .num{font-family:'Space Grotesk',sans-serif;font-size:28px;font-weight:700}
        .sc-hero-stat .lbl{font-size:12px;color:#93C5FD;text-transform:uppercase;letter-spacing:.5px}
        .sc-scan-cta{display:flex;justify-content:center;margin-top:28px}
        .sc-scan-btn{background:white;color:#1E3A8A;border:none;padding:14px 32px;border-radius:50px;font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:10px;box-shadow:0 4px 20px rgba(0,0,0,.2);transition:transform .2s,box-shadow .2s}
        .sc-scan-btn:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,0,0,.25)}
        main.sc-main{max-width:1100px;margin:-28px auto 40px;padding:0 20px}
        .sc-sec-hdr{display:flex;align-items:center;justify-content:space-between;margin:32px 0 18px}
        .sc-sec-title{font-family:'Space Grotesk',sans-serif;font-size:20px;font-weight:600;color:#1F2937}
        .sc-refresh-btn{background:white;border:1.5px solid #E5E7EB;color:#4B5563;padding:7px 14px;border-radius:8px;font-size:13px;cursor:pointer;display:flex;align-items:center;gap:6px;transition:all .2s}
        .sc-refresh-btn:hover{border-color:#3B82F6;color:#1E3A8A}
        .sc-room-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:18px}
        .sc-room-card{background:white;border-radius:14px;box-shadow:0 1px 3px rgba(0,0,0,.08);padding:20px;transition:transform .2s,box-shadow .2s;border:2px solid transparent;cursor:pointer;position:relative;overflow:hidden}
        .sc-room-card:hover{transform:translateY(-3px);box-shadow:0 4px 16px rgba(0,0,0,.1)}
        .sc-room-card::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;border-radius:14px 14px 0 0}
        .sc-room-card.available::before{background:#22C55E}
        .sc-room-card.partial::before{background:#FACC15}
        .sc-room-card.full::before{background:#EF4444}
        .sc-room-hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px}
        .sc-room-name{font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:600;color:#1F2937}
        .sc-room-type{font-size:12px;color:#9CA3AF;margin-top:2px}
        .sc-sbadge{display:flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:500;white-space:nowrap}
        .sc-sbadge.available{background:#F0FDF4;color:#15803D}
        .sc-sbadge.partial{background:#FEFCE8;color:#92400E}
        .sc-sbadge.full{background:#FEF2F2;color:#B91C1C}
        .sc-sdot{width:7px;height:7px;border-radius:50%}
        .available .sc-sdot{background:#22C55E}
        .partial .sc-sdot{background:#F59E0B}
        .full .sc-sdot{background:#EF4444}
        .sc-cap-info{margin:12px 0 8px}
        .sc-cap-lbl{display:flex;justify-content:space-between;font-size:13px;color:#4B5563;margin-bottom:6px}
        .sc-cap-bar{height:6px;background:#F3F4F6;border-radius:4px;overflow:hidden}
        .sc-cap-fill{height:100%;border-radius:4px;transition:width .4s}
        .sc-cap-fill.available{background:#22C55E}
        .sc-cap-fill.partial{background:#FACC15}
        .sc-cap-fill.full{background:#EF4444}
        .sc-card-footer{display:flex;justify-content:space-between;align-items:center;margin-top:14px}
        .sc-occupants{font-size:13px;color:#4B5563}
        .sc-occupants strong{color:#1F2937}
        .sc-book-btn{background:#1E3A8A;color:white;border:none;padding:7px 14px;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;transition:background .2s}
        .sc-book-btn:hover{background:#1d4ed8}
        .sc-book-btn:disabled{background:#E5E7EB;color:#9CA3AF;cursor:not-allowed}
        .sc-legend{display:flex;gap:20px;flex-wrap:wrap;background:white;padding:16px 20px;border-radius:14px;box-shadow:0 1px 3px rgba(0,0,0,.08);margin-bottom:24px}
        .sc-legend-item{display:flex;align-items:center;gap:8px;font-size:13px;color:#4B5563}
        .sc-ldot{width:10px;height:10px;border-radius:50%}
        .sc-modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:200;align-items:center;justify-content:center;padding:20px}
        .sc-modal.open{display:flex}
        .sc-modal-box{background:white;border-radius:20px;width:100%;max-width:420px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,.15);animation:slideUp .3s ease}
        @keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
        .sc-modal-hdr{background:#1E3A8A;padding:20px 24px;color:white;display:flex;align-items:center;justify-content:space-between}
        .sc-modal-hdr h2{font-family:'Space Grotesk',sans-serif;font-size:18px;font-weight:600}
        .sc-modal-close{background:rgba(255,255,255,.15);border:none;color:white;width:32px;height:32px;border-radius:50%;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center}
        .sc-modal-body{padding:24px}
        #qr-reader-scan{width:100% !important;border-radius:12px;overflow:hidden}
        .sc-scanner-hint{text-align:center;color:#9CA3AF;font-size:13px;margin-top:14px}
        .sc-toast{position:fixed;bottom:24px;right:24px;background:#1F2937;color:white;padding:12px 20px;border-radius:10px;font-size:14px;z-index:999;animation:fadeIn .3s ease}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .sc-admin-wrap{background:white;border-radius:14px;box-shadow:0 1px 3px rgba(0,0,0,.08);overflow:hidden}
        table{width:100%;border-collapse:collapse}
        th{background:#1E3A8A;color:white;padding:12px 16px;text-align:left;font-size:13px;font-weight:500}
        td{padding:12px 16px;font-size:14px;border-bottom:1px solid #F3F4F6}
        tr:last-child td{border-bottom:none}
        tr:hover td{background:#F9FAFB}
        .sc-qr-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:18px}
        .sc-qr-card{background:white;border-radius:14px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,.08);text-align:center}
      `}</style>

      <nav className="sc-nav">
        <div className="sc-brand">Centre<span>Book</span></div>
        <div className="sc-nav-links">
          <button className={`sc-nav-btn${section === 'rooms' ? ' active' : ''}`} onClick={() => setSection('rooms')}>Rooms</button>
          <button className={`sc-nav-btn${section === 'admin' ? ' active' : ''}`} onClick={() => setSection('admin')}>Admin</button>
          <button className={`sc-nav-btn${section === 'qrgen' ? ' active' : ''}`} onClick={() => setSection('qrgen')}>QR Codes</button>
        </div>
      </nav>

      <div className="sc-hero">
        <div className="sc-hero-title">Community Centre<br />Smart Booking</div>
        <div className="sc-hero-sub">Scan · Book · Track — all in real time</div>
        <div className="sc-hero-stats">
          <div className="sc-hero-stat"><div className="num">10</div><div className="lbl">Total Spaces</div></div>
          <div className="sc-hero-stat"><div className="num">{stats.available}</div><div className="lbl">Available</div></div>
          <div className="sc-hero-stat"><div className="num">{stats.occupied}</div><div className="lbl">Occupied</div></div>
        </div>
        <div className="sc-scan-cta">
          <button className="sc-scan-btn" onClick={openScanner}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="5" height="5" rx="1"/><rect x="16" y="3" width="5" height="5" rx="1"/><rect x="3" y="16" width="5" height="5" rx="1"/><path d="M12 3h1M15 3v1M12 7v1M15 6h1M16 9h1M12 12v3M12 16h3M16 12v1M19 12h1M19 15v1M16 15h3M19 16v3M12 19v1M15 19h1"/></svg>
            Scan Room QR Code
          </button>
        </div>
      </div>

      <main className="sc-main">
        {section === 'rooms' && (
          <>
            <div className="sc-legend">
              <div className="sc-legend-item"><div className="sc-ldot" style={{ background: '#22C55E' }} /> Available</div>
              <div className="sc-legend-item"><div className="sc-ldot" style={{ background: '#FACC15' }} /> Partially Occupied</div>
              <div className="sc-legend-item"><div className="sc-ldot" style={{ background: '#EF4444' }} /> Fully Occupied</div>
            </div>
            <div className="sc-sec-hdr">
              <div className="sc-sec-title">All Spaces</div>
              <button className="sc-refresh-btn" onClick={loadRooms}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                Refresh
              </button>
            </div>
            <div className="sc-room-grid">
              {rooms.map(r => {
                const s = statusClass(r.occupied, r.capacity)
                const pct = Math.round((r.occupied / r.capacity) * 100)
                return (
                  <div key={r.id} className={`sc-room-card ${s}`} onClick={() => navigate(`/room/${r.id}`)}>
                    <div className="sc-room-hdr">
                      <div><div className="sc-room-name">{r.name}</div><div className="sc-room-type">{r.type}</div></div>
                      <div className={`sc-sbadge ${s}`}><div className="sc-sdot" />{STATUS_LABEL[s]}</div>
                    </div>
                    <div className="sc-cap-info">
                      <div className="sc-cap-lbl"><span>Occupancy</span><span>{r.occupied} / {r.capacity}</span></div>
                      <div className="sc-cap-bar"><div className={`sc-cap-fill ${s}`} style={{ width: `${pct}%` }} /></div>
                    </div>
                    <div className="sc-card-footer">
                      <div className="sc-occupants"><strong>{r.capacity - r.occupied}</strong> seats left</div>
                      <button className="sc-book-btn" disabled={s === 'full'} onClick={e => { e.stopPropagation(); navigate(`/room/${r.id}`) }}>{s === 'full' ? 'Full' : 'Book'}</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {section === 'admin' && (
          <>
            <div className="sc-sec-hdr">
              <div className="sc-sec-title">Active Bookings</div>
              <button className="sc-refresh-btn" onClick={loadAdmin}>Refresh</button>
            </div>
            <div className="sc-admin-wrap">
              <table>
                <thead><tr><th>Room</th><th>Name</th><th>Role</th><th>USN/Dept</th><th>Purpose</th><th>Check In</th><th>Status</th></tr></thead>
                <tbody>
                  {adminLoading ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', color: '#9CA3AF', padding: 30 }}>Loading...</td></tr>
                  ) : adminEntries === null ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', color: '#9CA3AF', padding: 30 }}>Could not load – start backend server</td></tr>
                  ) : adminEntries.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', color: '#9CA3AF', padding: 30 }}>No active bookings</td></tr>
                  ) : adminEntries.map(e => (
                    <tr key={e.id}>
                      <td><strong>{e.roomName}</strong></td>
                      <td>{e.userName}</td>
                      <td><span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '2px 8px', borderRadius: 20, fontSize: 12 }}>{e.role}</span></td>
                      <td>{e.usnOrDept}</td>
                      <td>{e.purpose}</td>
                      <td>{new Date(e.entryTime).toLocaleTimeString()}</td>
                      <td><span style={{ background: '#F0FDF4', color: '#15803D', padding: '2px 8px', borderRadius: 20, fontSize: 12 }}>Active</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {section === 'qrgen' && (
          <>
            <div className="sc-sec-hdr"><div className="sc-sec-title">Generate QR Codes</div></div>
            <div className="sc-qr-grid">
              {ROOMS_STATIC.map(r => {
                const url = `${window.location.origin}/room/${r.id}`
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(url)}`
                return (
                  <div key={r.id} className="sc-qr-card">
                    <img src={qrUrl} alt={`QR ${r.name}`} style={{ width: 160, height: 160, borderRadius: 8 }} />
                    <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, marginTop: 12, fontSize: 15 }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF', margin: '4px 0 12px' }}>{r.type} · Cap: {r.capacity}</div>
                    <a href={url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#3B82F6', textDecoration: 'none' }}>Open Link ↗</a>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </main>

      {/* QR SCANNER MODAL */}
      <div className={`sc-modal${scannerOpen ? ' open' : ''}`}>
        <div className="sc-modal-box">
          <div className="sc-modal-hdr">
            <h2>Scan Room QR Code</h2>
            <button className="sc-modal-close" onClick={closeScanner}>✕</button>
          </div>
          <div className="sc-modal-body">
            <div id="qr-reader-scan" />
            <p className="sc-scanner-hint">Point your camera at a room's QR code</p>
          </div>
        </div>
      </div>

      {toast && <div className="sc-toast">{toast}</div>}
    </div>
  )
}
