import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { API } from '../constants'

// ── Static room data (matches HTML exactly) ───────────────────────────────────
const ROOMS = [
  { id:1,  name:'Cabin 1',                  type:'Small Cabin',        capacity:6,  img:'/images/cabin-overhead.jpg' },
  { id:2,  name:'Cabin 2',                  type:'Small Cabin',        capacity:6,  img:'/images/cabin-table.jpg' },
  { id:3,  name:'Cabin 3',                  type:'Small Cabin',        capacity:6,  img:'/images/cabin-overhead.jpg' },
  { id:4,  name:'Cabin 4',                  type:'Small Cabin',        capacity:6,  img:'/images/cabin-table.jpg' },
  { id:5,  name:'Project Room A',           type:'Project Room',       capacity:12, img:'/images/project-room-1.jpg' },
  { id:6,  name:'Project Room B',           type:'Project Room',       capacity:12, img:'/images/project-room-2.jpg' },
  { id:7,  name:'Open Space(Front)',        type:'Open Space · 1',     capacity:25, img:'/images/exterior view (5) - Copy.jpeg' },
  { id:8,  name:'Main Hall',                type:'Ground Floor Hall',  capacity:80, img:'/images/main-hall-1.jpg' },
  { id:9,  name:'Seminar Room(Top Floor)',  type:'Seminar / Training',  capacity:30, img:'/images/open-space-2.jpg' },
  { id:10, name:'Discussion Room',          type:'Open Space · 2',     capacity:10, img:'/images/exterior view (5) - Copy.jpeg' },
]

const SLIDES = ['/images/svce1.png', '/images/svce_clg.jpeg', '/images/poster.png']

function sc(occ, cap) {
  return occ === 0 ? 'available' : occ >= cap ? 'full' : 'partial'
}
const scLabel = { available: 'Available', partial: 'Partial', full: 'Full' }

export default function Welcome() {
  const [rooms, setRooms]           = useState(ROOMS.map(r => ({ ...r, occupied: 0 })))
  const [stats, setStats]           = useState({ avail: '–', partial: '–', full: '–' })
  const [refreshText, setRefreshText] = useState(null) // null = still loading
  const [slideIdx, setSlideIdx]     = useState(0)
  const navigate = useNavigate()

  // ── Image slider – rotates every 3 s ────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setSlideIdx(i => (i + 1) % SLIDES.length), 3000)
    return () => clearInterval(t)
  }, [])

  // ── Load live room data every 30 s ───────────────────────────────────────────
  async function load() {
    let data = ROOMS.map(r => ({ ...r, occupied: 0 }))
    try {
      const res = await fetch(`${API}/rooms`)
      if (res.ok) {
        const live = await res.json()
        data = ROOMS.map(r => {
          const liveRoom = live.find(d => d.id === r.id) || {}
          return { ...r, occupied: liveRoom.occupied || 0 }
        })
      }
    } catch {}

    let avail = 0, partial = 0, full = 0
    data.forEach(r => {
      const s = sc(r.occupied, r.capacity)
      if (s === 'available') avail++
      else if (s === 'partial') partial++
      else full++
    })

    setRooms(data)
    setStats({ avail, partial, full })
    setRefreshText(`✓ Updated at ${new Date().toLocaleTimeString()}`)
  }

  useEffect(() => {
    load()
    const t = setInterval(load, 30000)
    return () => clearInterval(t)
  }, [])

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: '#0F172A', color: 'white', minHeight: '100vh' }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --primary:#1E3A8A; --primary-light:#3B82F6;
          --green:#22C55E;   --green-bg:#F0FDF4;
          --yellow:#F59E0B;  --yellow-bg:#FFFBEB;
          --red:#EF4444;     --red-bg:#FEF2F2;
          --gray-800:#1F2937; --gray-600:#4B5563; --gray-400:#9CA3AF;
          --radius:16px;
        }

        /* ── NAV ── */
        .wl-nav {
          position:fixed; top:0; left:0; right:0; z-index:200;
          background:rgba(15,23,42,.85); backdrop-filter:blur(16px);
          border-bottom:1px solid rgba(255,255,255,.08);
          height:64px; display:flex; align-items:center;
          padding:0 28px; justify-content:space-between;
        }
        .wl-nav-brand { display:flex; align-items:center; gap:12px; text-decoration:none; cursor:pointer; }
        .wl-nav-logo {
          width:40px; height:40px; border-radius:10px;
          background:linear-gradient(135deg,#1E3A8A,#3B82F6);
          display:flex; align-items:center; justify-content:center;
          font-family:'Space Grotesk',sans-serif; font-size:16px; font-weight:800; color:white;
        }
        .wl-nav-name { font-family:'Space Grotesk',sans-serif; font-size:18px; font-weight:700; color:white; }
        .wl-nav-name span { color:#60A5FA; }
        .wl-nav-college { font-size:11px; color:#94A3B8; letter-spacing:.3px; }
        .wl-nav-right { display:flex; gap:10px; align-items:center; }
        .wl-pill {
          background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.12);
          color:rgba(255,255,255,.8); padding:8px 18px; border-radius:50px;
          font-size:13px; text-decoration:none; transition:all .2s; cursor:pointer;
        }
        .wl-pill:hover { background:rgba(255,255,255,.15); color:white; }
        .wl-pill.primary { background:#3B82F6; border-color:#3B82F6; color:white; font-weight:500; }
        .wl-pill.primary:hover { background:#2563EB; }
        .wl-pill.danger { background:#EF4444; color:white; border-color:#EF4444; }

        /* ── HERO ── */
        .wl-hero {
          min-height:100vh; display:flex; flex-direction:column;
          align-items:center; justify-content:center;
          text-align:center; padding:100px 24px 60px;
          position:relative; overflow:hidden;
        }

        /* ── SLIDER: each image fills the whole hero absolutely ── */
        .wl-slider { position:absolute; inset:0; z-index:0; }
        .wl-slide {
          position:absolute; inset:0;
          width:100%; height:100%;
          object-fit:cover;
          opacity:0;
          transition:opacity 1s ease-in-out;
        }
        .wl-slide.active { opacity:0.4; }

        .wl-hero-bg {
          position:absolute; inset:0;
          background:linear-gradient(135deg,#0F172A 0%,#1E3A8A 50%,#0F172A 100%);
        }
        .wl-hero-bg::after {
          content:''; position:absolute; inset:0;
          background:radial-gradient(ellipse at 50% 0%,rgba(59,130,246,.25) 0%,transparent 70%);
        }
        .wl-hero-content { position:relative; z-index:1; max-width:680px; }

        /* badge */
        .wl-badge {
          display:inline-flex; align-items:center; gap:8px;
          background:rgba(59,130,246,.15); border:1px solid rgba(59,130,246,.3);
          color:#93C5FD; padding:8px 20px; border-radius:50px;
          font-size:13px; font-weight:500; margin-bottom:28px;
        }
        .wl-bdot { width:6px; height:6px; border-radius:50%; background:#22C55E; animation:pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(1.3)} }

        .wl-title {
          font-family:'Space Grotesk',sans-serif;
          font-size:clamp(38px,7vw,68px); font-weight:800;
          line-height:1.05; margin-bottom:20px;
          background:linear-gradient(135deg,white 0%,#93C5FD 100%);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
        }
        .wl-sub { font-size:clamp(15px,2.5vw,18px); color:#94A3B8; line-height:1.7; margin-bottom:40px; }

        /* CTA buttons */
        .wl-cta { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; }
        .wl-btn {
          padding:16px 36px; border-radius:50px; font-family:'Space Grotesk',sans-serif;
          font-size:16px; font-weight:600; cursor:pointer; text-decoration:none;
          display:inline-flex; align-items:center; gap:8px; transition:all .25s; border:none;
        }
        .wl-btn.primary { background:linear-gradient(135deg,#3B82F6,#1D4ED8); color:white; box-shadow:0 8px 32px rgba(59,130,246,.4); }
        .wl-btn.primary:hover { transform:translateY(-2px); box-shadow:0 12px 40px rgba(59,130,246,.5); }
        .wl-btn.outline { background:transparent; color:white; border:1.5px solid rgba(255,255,255,.25); }
        .wl-btn.outline:hover { background:rgba(255,255,255,.08); border-color:rgba(255,255,255,.4); }

        /* stats bar */
        .wl-stats-bar {
          display:flex; margin-top:52px;
          background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1);
          border-radius:16px; overflow:hidden; flex-wrap:wrap;
        }
        .wl-stat { flex:1; min-width:100px; padding:18px 24px; text-align:center; border-right:1px solid rgba(255,255,255,.08); }
        .wl-stat:last-child { border-right:none; }
        .wl-stat-num { font-family:'Space Grotesk',sans-serif; font-size:28px; font-weight:700; color:white; }
        .wl-stat-num.green  { color:#4ADE80; }
        .wl-stat-num.yellow { color:#FCD34D; }
        .wl-stat-num.red    { color:#F87171; }
        .wl-stat-lbl { font-size:11px; color:#64748B; text-transform:uppercase; letter-spacing:.6px; margin-top:3px; }

        /* refresh tag */
        .wl-refresh {
          display:inline-flex; align-items:center; gap:6px;
          background:rgba(34,197,94,.1); border:1px solid rgba(34,197,94,.2);
          color:#4ADE80; padding:5px 14px; border-radius:20px; font-size:12px; margin-top:16px;
        }
        @keyframes spin { to { transform:rotate(360deg); } }
        .wl-spin { animation:spin .8s linear infinite; display:inline-block; }

        /* ── ROOMS SECTION ── */
        .wl-rooms-section { padding:60px 24px 80px; max-width:1200px; margin:0 auto; }
        .wl-sec-hdr { text-align:center; margin-bottom:44px; }
        .wl-sec-tag {
          display:inline-block; background:rgba(59,130,246,.15); color:#60A5FA;
          padding:5px 16px; border-radius:20px; font-size:12px; font-weight:500;
          letter-spacing:.5px; text-transform:uppercase; margin-bottom:14px;
        }
        .wl-sec-title { font-family:'Space Grotesk',sans-serif; font-size:clamp(26px,4vw,38px); font-weight:700; color:white; margin-bottom:10px; }
        .wl-sec-sub { color:#64748B; font-size:15px; }

        .wl-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:20px; }
        .wl-card {
          border-radius:var(--radius); overflow:hidden; cursor:pointer;
          background:#1E293B; border:1px solid rgba(255,255,255,.08);
          transition:transform .25s, box-shadow .25s, border-color .25s; position:relative;
        }
        .wl-card:hover { transform:translateY(-5px); box-shadow:0 20px 60px rgba(0,0,0,.4); border-color:rgba(59,130,246,.4); }
        .wl-photo-wrap { overflow:hidden; position:relative; }
        .wl-photo { width:100%; height:180px; object-fit:cover; display:block; transition:transform .4s; }
        .wl-card:hover .wl-photo { transform:scale(1.04); }
        .wl-photo-overlay { position:absolute; inset:0; background:linear-gradient(to bottom,transparent 40%,rgba(15,23,42,.85) 100%); }
        .wl-sbadge {
          position:absolute; top:12px; right:12px;
          display:flex; align-items:center; gap:5px;
          padding:5px 12px; border-radius:20px; font-size:12px; font-weight:600; backdrop-filter:blur(8px);
        }
        .wl-sbadge.available { background:rgba(34,197,94,.2);  color:#4ADE80; border:1px solid rgba(34,197,94,.3); }
        .wl-sbadge.partial   { background:rgba(245,158,11,.2); color:#FCD34D; border:1px solid rgba(245,158,11,.3); }
        .wl-sbadge.full      { background:rgba(239,68,68,.2);  color:#F87171; border:1px solid rgba(239,68,68,.3); }
        .wl-sbdot { width:6px; height:6px; border-radius:50%; }
        .wl-sbadge.available .wl-sbdot { background:#4ADE80; }
        .wl-sbadge.partial   .wl-sbdot { background:#FCD34D; }
        .wl-sbadge.full      .wl-sbdot { background:#F87171; }
        .wl-card-body { padding:18px; }
        .wl-card-name { font-family:'Space Grotesk',sans-serif; font-size:17px; font-weight:600; color:white; margin-bottom:4px; }
        .wl-card-type { font-size:12px; color:#64748B; margin-bottom:14px; }
        .wl-cap-row { display:flex; justify-content:space-between; font-size:12px; color:#64748B; margin-bottom:7px; }
        .wl-cap-bg { height:5px; background:rgba(255,255,255,.08); border-radius:3px; overflow:hidden; margin-bottom:14px; }
        .wl-cap-fill { height:100%; border-radius:3px; transition:width .5s; }
        .wl-cap-fill.available { background:linear-gradient(90deg,#22C55E,#4ADE80); }
        .wl-cap-fill.partial   { background:linear-gradient(90deg,#F59E0B,#FCD34D); }
        .wl-cap-fill.full      { background:linear-gradient(90deg,#EF4444,#F87171); }
        .wl-card-footer { display:flex; justify-content:space-between; align-items:center; }
        .wl-seats { font-size:13px; color:#94A3B8; }
        .wl-seats strong { color:white; }
        .wl-book-btn {
          background:linear-gradient(135deg,#3B82F6,#1D4ED8); color:white; border:none;
          padding:8px 18px; border-radius:8px; font-size:13px; font-weight:500; cursor:pointer; transition:all .2s;
        }
        .wl-book-btn:hover { background:linear-gradient(135deg,#2563EB,#1E40AF); transform:scale(1.03); }
        .wl-book-btn:disabled { background:rgba(255,255,255,.08); color:#475569; cursor:not-allowed; transform:none; }

        /* ── HOW IT WORKS ── */
        .wl-how {
          background:rgba(255,255,255,.02);
          border-top:1px solid rgba(255,255,255,.06); border-bottom:1px solid rgba(255,255,255,.06);
          padding:60px 24px;
        }
        .wl-how-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:28px; max-width:900px; margin:0 auto; }
        .wl-how-card { text-align:center; padding:28px 20px; }
        .wl-how-num {
          width:48px; height:48px; border-radius:50%;
          background:linear-gradient(135deg,#1E3A8A,#3B82F6);
          display:flex; align-items:center; justify-content:center;
          font-family:'Space Grotesk',sans-serif; font-size:18px; font-weight:700;
          color:white; margin:0 auto 16px;
        }
        .wl-how-title { font-family:'Space Grotesk',sans-serif; font-size:15px; font-weight:600; color:white; margin-bottom:8px; }
        .wl-how-desc { font-size:13px; color:#64748B; line-height:1.6; }

        /* ── FOOTER ── */
        .wl-footer { text-align:center; padding:28px; color:#334155; font-size:13px; border-top:1px solid rgba(255,255,255,.05); }
        .wl-footer strong { color:#64748B; }
      `}</style>

      {/* ── NAV ── */}
      <nav className="wl-nav">
        <div className="wl-nav-brand" onClick={() => navigate('/')}>
          <div className="wl-nav-logo">CB</div>
          <div>
            <div className="wl-nav-name">Centre<span>Book</span></div>
            <div className="wl-nav-college">SVCE Bengaluru</div>
          </div>
        </div>
        <div className="wl-nav-right">
          {/* <Link to="/history" className="wl-pill">📋 History</Link> */}
          <Link to="/admin/login" className="wl-pill primary">🧑‍💼Admin</Link>
          <Link to="/rooms"       className="wl-pill primary">Book a Space →</Link>
          <Link to="/logout"      className="wl-pill danger">🚪 Logout</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div className="wl-hero">
        {/* gradient background */}
        <div className="wl-hero-bg" />

        {/* full-cover image slider — each slide is position:absolute inset:0 */}
        <div className="wl-slider">
          {SLIDES.map((src, i) => (
            <img
              key={src}
              src={src}
              alt=""
              className={`wl-slide${i === slideIdx ? ' active' : ''}`}
            />
          ))}
        </div>

        {/* hero text */}
        <div className="wl-hero-content">
          <div className="wl-badge">
            <span className="wl-bdot" />
            Live Room Availability · SVCE Community Centre
          </div>

          <h1 className="wl-title">Welcome to SVCE<br />Registration System</h1>

          <p className="wl-sub">
            Scan a QR code at any room entrance or browse and book spaces instantly.
            Real-time availability, zero paperwork.
          </p>

          {/* CTA — matches HTML exactly */}
          <div className="wl-cta">
            <Link to="/prebook" className="wl-btn primary">📅 PRE-BOOK</Link>
            <Link to="/rooms"   className="wl-btn primary">🏠 Browse All Rooms</Link>
            <Link to="/scan"    className="wl-btn outline">📷 Scan QR Code</Link>
          </div>

          {/* live stats */}
          <div className="wl-stats-bar">
            <div className="wl-stat">
              <div className="wl-stat-num">10</div>
              <div className="wl-stat-lbl">Total Spaces</div>
            </div>
            <div className="wl-stat">
              <div className="wl-stat-num green">{stats.avail}</div>
              <div className="wl-stat-lbl">Available</div>
            </div>
            <div className="wl-stat">
              <div className="wl-stat-num yellow">{stats.partial}</div>
              <div className="wl-stat-lbl">Partial</div>
            </div>
            <div className="wl-stat">
              <div className="wl-stat-num red">{stats.full}</div>
              <div className="wl-stat-lbl">Full</div>
            </div>
          </div>

          {/* refresh indicator */}
          <div className="wl-refresh">
            {refreshText === null
              ? <><span className="wl-spin">↻</span> Loading live status…</>
              : refreshText
            }
          </div>
        </div>
      </div>

      {/* ── ROOMS GRID ── */}
      <div className="wl-rooms-section">
        <div className="wl-sec-hdr">
          <div className="wl-sec-tag">Available Spaces</div>
          <h2 className="wl-sec-title">All Community Centre Rooms</h2>
          <p className="wl-sec-sub">Click any room to check in · Updated in real time</p>
        </div>
        <div className="wl-grid">
          {rooms.map(r => {
            const s   = sc(r.occupied, r.capacity)
            const pct = Math.round((r.occupied / r.capacity) * 100)
            return (
              <div key={r.id} className="wl-card" onClick={() => navigate(`/room/${r.id}`)}>
                <div className="wl-photo-wrap">
                  <img
                    className="wl-photo"
                    src={r.img}
                    alt={r.name}
                    onError={e => { e.target.src = '/images/cabin-exterior.jpg' }}
                  />
                  <div className="wl-photo-overlay" />
                  <div className={`wl-sbadge ${s}`}>
                    <div className="wl-sbdot" />{scLabel[s]}
                  </div>
                </div>
                <div className="wl-card-body">
                  <div className="wl-card-name">{r.name}</div>
                  <div className="wl-card-type">{r.type}</div>
                  <div className="wl-cap-row">
                    <span>Occupancy</span>
                    <span>{r.occupied} / {r.capacity}</span>
                  </div>
                  <div className="wl-cap-bg">
                    <div className={`wl-cap-fill ${s}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="wl-card-footer">
                    <div className="wl-seats"><strong>{r.capacity - r.occupied}</strong> seats left</div>
                    <button
                      className="wl-book-btn"
                      disabled={s === 'full'}
                      onClick={e => { e.stopPropagation(); navigate(`/room/${r.id}`) }}
                    >
                      {s === 'full' ? 'Room Full' : 'Book Now'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div className="wl-how">
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div className="wl-sec-tag">How It Works</div>
          <h2 className="wl-sec-title">Book in 3 Simple Steps</h2>
        </div>
        <div className="wl-how-grid">
          <div className="wl-how-card">
            <div className="wl-how-num">1</div>
            <div className="wl-how-title">Scan QR Code</div>
            <div className="wl-how-desc">Each room has a unique QR code at the entrance. Scan with your phone camera.</div>
          </div>
          <div className="wl-how-card">
            <div className="wl-how-num">2</div>
            <div className="wl-how-title">Register Entry</div>
            <div className="wl-how-desc">Fill your name, USN, team members, and purpose. Takes under 30 seconds.</div>
          </div>
          <div className="wl-how-card">
            <div className="wl-how-num">3</div>
            <div className="wl-how-title">Check Out</div>
            <div className="wl-how-desc">Tap "Leave Room" when you're done. Room availability updates instantly.</div>
          </div>
          <div className="wl-how-card">
            <div className="wl-how-num">4</div>
            {/* how-title commented out in original */}
            <div className="wl-how-desc">All your check-ins and check-outs are saved with timestamps and duration.</div>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="wl-footer">
        <strong>CentreBook</strong> · SVCE Bengaluru Community Centre · Smart Booking System
      </footer>
    </div>
  )
}
