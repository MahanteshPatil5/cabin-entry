import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { API, ROOMS_STATIC, statusClass, STATUS_LABEL } from '../constants'

export default function Rooms() {
  const [rooms, setRooms] = useState(ROOMS_STATIC.map(r => ({ ...r, occupied: 0 })))
  const [stats, setStats] = useState({ avail: 0, partial: 0, full: 0 })
  const [scannerOpen, setScannerOpen] = useState(false)
  const scannerRef = useRef(null)
  const navigate = useNavigate()

  async function loadRooms() {
    let data = ROOMS_STATIC.map(r => ({ ...r, occupied: 0 }))
    try {
      const res = await fetch(`${API}/rooms`)
      if (res.ok) {
        const live = await res.json()
        data = ROOMS_STATIC.map(r => ({ ...r, occupied: (live.find(d => d.id === r.id) || {}).occupied || 0 }))
      }
    } catch {}
    let avail = 0, partial = 0, full = 0
    data.forEach(r => { const s = statusClass(r.occupied, r.capacity); if (s === 'available') avail++; else if (s === 'partial') partial++; else full++ })
    setRooms(data)
    setStats({ avail, partial, full })
  }

  useEffect(() => { loadRooms(); const t = setInterval(loadRooms, 30000); return () => clearInterval(t) }, [])

  async function openScanner() {
    setScannerOpen(true)
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      await new Promise(r => setTimeout(r, 100))
      const qr = new Html5Qrcode('qr-reader-rooms')
      scannerRef.current = qr
      await qr.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (text) => {
          closeScanner()
          try {
            const url = new URL(text)
            const roomId = url.searchParams.get('room_id')
            navigate(roomId ? `/room/${roomId}` : `/room/1`)
          } catch { navigate('/room/1') }
        },
        () => {}
      )
    } catch { alert('Camera permission denied') }
  }

  async function closeScanner() {
    setScannerOpen(false)
    if (scannerRef.current) { try { await scannerRef.current.stop() } catch {} scannerRef.current = null }
  }

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: '#F0F4FF', minHeight: '100vh', color: '#1F2937' }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        .rm-nav{background:#1E3A8A;padding:0 28px;height:60px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 2px 12px rgba(30,58,138,.3);position:sticky;top:0;z-index:100}
        .rm-nav-left{display:flex;align-items:center;gap:16px}
        .rm-back{background:rgba(255,255,255,.15);border:none;color:white;width:34px;height:34px;border-radius:50%;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;text-decoration:none}
        .rm-brand{font-family:'Space Grotesk',sans-serif;font-size:20px;font-weight:700;color:white;text-decoration:none}
        .rm-brand span{color:#93C5FD}
        .rm-nav-right{display:flex;gap:8px}
        .rm-nav-btn{background:rgba(255,255,255,.12);border:none;color:white;padding:7px 16px;border-radius:8px;font-size:13px;cursor:pointer;transition:background .2s;text-decoration:none;display:inline-flex;align-items:center;gap:6px}
        .rm-nav-btn:hover{background:rgba(255,255,255,.22)}
        .rm-page-hdr{background:linear-gradient(135deg,#1E3A8A,#2563EB);padding:32px 28px 48px;color:white}
        .rm-page-hdr h1{font-family:'Space Grotesk',sans-serif;font-size:28px;font-weight:700;margin-bottom:6px}
        .rm-page-hdr p{color:#BFDBFE;font-size:15px}
        .rm-hdr-stats{display:flex;gap:24px;margin-top:20px;flex-wrap:wrap}
        .rm-hstat{background:rgba(255,255,255,.12);border-radius:10px;padding:10px 18px;text-align:center;min-width:80px}
        .rm-hstat-num{font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:700}
        .rm-hstat-lbl{font-size:11px;color:#93C5FD;text-transform:uppercase;letter-spacing:.5px}
        main.rm-main{max-width:1100px;margin:-24px auto 40px;padding:0 20px}
        .rm-legend{display:flex;gap:20px;flex-wrap:wrap;background:white;padding:14px 20px;border-radius:14px;box-shadow:0 1px 4px rgba(0,0,0,.07);margin-bottom:22px}
        .rm-legend-item{display:flex;align-items:center;gap:7px;font-size:13px;color:#4B5563}
        .rm-ldot{width:10px;height:10px;border-radius:50%}
        .rm-sec-bar{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
        .rm-sec-title{font-family:'Space Grotesk',sans-serif;font-size:18px;font-weight:600}
        .rm-refresh{background:white;border:1.5px solid #E5E7EB;color:#4B5563;padding:7px 14px;border-radius:8px;font-size:13px;cursor:pointer;display:flex;align-items:center;gap:6px;transition:all .2s}
        .rm-refresh:hover{border-color:#3B82F6;color:#1E3A8A}
        .rm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:18px}
        .rm-card{background:white;border-radius:14px;box-shadow:0 1px 4px rgba(0,0,0,.07);padding:20px;cursor:pointer;transition:transform .2s,box-shadow .2s;border:2px solid transparent;position:relative;overflow:hidden}
        .rm-card:hover{transform:translateY(-3px);box-shadow:0 6px 20px rgba(0,0,0,.1)}
        .rm-card::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;border-radius:14px 14px 0 0}
        .rm-card.available::before{background:#22C55E}
        .rm-card.partial::before{background:#F59E0B}
        .rm-card.full::before{background:#EF4444}
        .rm-card-hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px}
        .rm-name{font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:600}
        .rm-type{font-size:12px;color:#9CA3AF;margin-top:2px}
        .rm-sbadge{display:flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:500;white-space:nowrap}
        .rm-sbadge.available{background:#F0FDF4;color:#15803D}
        .rm-sbadge.partial{background:#FFFBEB;color:#92400E}
        .rm-sbadge.full{background:#FEF2F2;color:#B91C1C}
        .rm-sdot{width:7px;height:7px;border-radius:50%}
        .available .rm-sdot{background:#22C55E}
        .partial .rm-sdot{background:#F59E0B}
        .full .rm-sdot{background:#EF4444}
        .rm-cap-info{margin:12px 0 8px}
        .rm-cap-lbl{display:flex;justify-content:space-between;font-size:13px;color:#4B5563;margin-bottom:6px}
        .rm-cap-bar{height:6px;background:#F3F4F6;border-radius:4px;overflow:hidden}
        .rm-cap-fill{height:100%;border-radius:4px;transition:width .4s}
        .rm-cap-fill.available{background:#22C55E}
        .rm-cap-fill.partial{background:#F59E0B}
        .rm-cap-fill.full{background:#EF4444}
        .rm-footer{display:flex;justify-content:space-between;align-items:center;margin-top:14px}
        .rm-seats{font-size:13px;color:#4B5563}
        .rm-seats strong{color:#1F2937}
        .rm-book-btn{background:#1E3A8A;color:white;border:none;padding:8px 16px;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;transition:background .2s}
        .rm-book-btn:hover{background:#1d4ed8}
        .rm-book-btn:disabled{background:#E5E7EB;color:#9CA3AF;cursor:not-allowed}
        .rm-modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:200;align-items:center;justify-content:center;padding:20px}
        .rm-modal.open{display:flex}
        .rm-modal-box{background:white;border-radius:20px;width:100%;max-width:420px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,.15);animation:slideUp .3s ease}
        @keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
        .rm-modal-hdr{background:#1E3A8A;padding:20px 24px;color:white;display:flex;align-items:center;justify-content:space-between}
        .rm-modal-hdr h2{font-family:'Space Grotesk',sans-serif;font-size:18px;font-weight:600}
        .rm-modal-close{background:rgba(255,255,255,.15);border:none;color:white;width:32px;height:32px;border-radius:50%;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center}
        .rm-modal-body{padding:24px}
        #qr-reader-rooms{width:100% !important;border-radius:12px;overflow:hidden}
        .rm-scanner-hint{text-align:center;color:#9CA3AF;font-size:13px;margin-top:12px}
      `}</style>

      <nav className="rm-nav">
        <div className="rm-nav-left">
          <Link to="/" className="rm-back">←</Link>
          <Link to="/" className="rm-brand">Centre<span>Book</span></Link>
        </div>
        <div className="rm-nav-right">
          <button className="rm-nav-btn" onClick={openScanner}>📷 Scan QR</button>
        </div>
      </nav>

      <div className="rm-page-hdr">
        <h1>All Spaces</h1>
        <p>Select a room to check availability and book your entry</p>
        <div className="rm-hdr-stats">
          <div className="rm-hstat"><div className="rm-hstat-num">10</div><div className="rm-hstat-lbl">Total</div></div>
          <div className="rm-hstat"><div className="rm-hstat-num">{stats.avail}</div><div className="rm-hstat-lbl">Available</div></div>
          <div className="rm-hstat"><div className="rm-hstat-num">{stats.partial}</div><div className="rm-hstat-lbl">Partial</div></div>
          <div className="rm-hstat"><div className="rm-hstat-num">{stats.full}</div><div className="rm-hstat-lbl">Full</div></div>
        </div>
      </div>

      <main className="rm-main">
        <div className="rm-legend">
          <div className="rm-legend-item"><div className="rm-ldot" style={{ background: '#22C55E' }} /> Available</div>
          <div className="rm-legend-item"><div className="rm-ldot" style={{ background: '#F59E0B' }} /> Partially Occupied</div>
          <div className="rm-legend-item"><div className="rm-ldot" style={{ background: '#EF4444' }} /> Fully Occupied</div>
        </div>
        <div className="rm-sec-bar">
          <div className="rm-sec-title">Choose a Room</div>
          <button className="rm-refresh" onClick={loadRooms}>↻ Refresh</button>
        </div>
        <div className="rm-grid">
          {rooms.map(r => {
            const s = statusClass(r.occupied, r.capacity)
            const pct = Math.round((r.occupied / r.capacity) * 100)
            return (
              <div key={r.id} className={`rm-card ${s}`} onClick={() => navigate(`/room/${r.id}`)}>
                <div className="rm-card-hdr">
                  <div><div className="rm-name">{r.name}</div><div className="rm-type">{r.type}</div></div>
                  <div className={`rm-sbadge ${s}`}><div className="rm-sdot" />{STATUS_LABEL[s]}</div>
                </div>
                <div className="rm-cap-info">
                  <div className="rm-cap-lbl"><span>Occupancy</span><span>{r.occupied} / {r.capacity}</span></div>
                  <div className="rm-cap-bar"><div className={`rm-cap-fill ${s}`} style={{ width: `${pct}%` }} /></div>
                </div>
                <div className="rm-footer">
                  <div className="rm-seats"><strong>{r.capacity - r.occupied}</strong> seats left</div>
                  <button className="rm-book-btn" disabled={s === 'full'} onClick={e => { e.stopPropagation(); navigate(`/room/${r.id}`) }}>{s === 'full' ? 'Full' : 'Book'}</button>
                </div>
              </div>
            )
          })}
        </div>
      </main>

      <div className={`rm-modal${scannerOpen ? ' open' : ''}`}>
        <div className="rm-modal-box">
          <div className="rm-modal-hdr">
            <h2>Scan Room QR Code</h2>
            <button className="rm-modal-close" onClick={closeScanner}>✕</button>
          </div>
          <div className="rm-modal-body">
            <div id="qr-reader-rooms" />
            <p className="rm-scanner-hint">Point your camera at a room's QR code</p>
          </div>
        </div>
      </div>
    </div>
  )
}
