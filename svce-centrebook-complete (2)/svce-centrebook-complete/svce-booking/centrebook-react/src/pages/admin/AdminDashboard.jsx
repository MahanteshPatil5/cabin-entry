import { useState, useEffect } from 'react'
import AdminNav from '../../components/AdminNav'
import { API } from '../../constants'

function AnalyticsList({ items, unit }) {
  const list = items || []
  if (!list.length) return <p style={{ color: '#64748B', fontSize: '.875rem' }}>No records available.</p>
  const max = Math.max(...list.map(i => Number(i.value) || 0), 1)
  return list.map((item, i) => (
    <div key={i} style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.8125rem', marginBottom: 4 }}>
        <span>{item.label || 'Unknown'}</span>
        <strong>{Number(item.value) || 0} {unit}</strong>
      </div>
      <div style={{ height: 8, background: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.round(((Number(item.value) || 0) / max) * 100)}%`, background: '#2563EB', borderRadius: 4, transition: 'width .4s ease' }} />
      </div>
    </div>
  ))
}

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadDashboard() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}/admin/dashboard`)
      if (!res.ok) throw new Error('Dashboard API failed')
      setData(await res.json())
    } catch { setError('Could not load live dashboard data. Make sure the Spring Boot backend is running.') }
    setLoading(false)
  }

  useEffect(() => { loadDashboard() }, [])

  const cabins = data?.cabinStatus || []

  return (
    <div style={{ fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen,Ubuntu,Cantarell,sans-serif', background: '#F8FAFC', minHeight: '100vh', color: '#1E293B' }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        .ad-main{max-width:1200px;margin:24px auto;padding:0 16px}
        .ad-page-hdr{margin-bottom:24px}
        .ad-page-hdr h1{font-size:1.5rem;color:#0F172A}
        .ad-page-hdr p{color:#64748B;font-size:.875rem}
        .ad-alert{padding:10px 14px;border-radius:8px;margin-bottom:16px;font-size:.875rem;background:#FEE2E2;color:#EF4444;border:1px solid #FECACA}
        .ad-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-bottom:24px}
        .ad-stat-card{background:white;padding:20px;border-radius:8px;border:1px solid #E2E8F0;box-shadow:0 1px 3px rgba(0,0,0,.1)}
        .ad-stat-card.success{border-left:4px solid #16A34A}
        .ad-stat-card.warning{border-left:4px solid #F59E0B}
        .ad-stat-card.danger{border-left:4px solid #EF4444}
        .ad-stat-title{font-size:.875rem;color:#64748B;margin-bottom:8px}
        .ad-stat-val{font-size:1.875rem;font-weight:700;color:#0F172A}
        .ad-section{margin-top:24px}
        .ad-section-hdr{margin-bottom:16px}
        .ad-section-hdr h2{font-size:1.25rem;color:#0F172A}
        .ad-section-hdr p{font-size:.875rem;color:#64748B}
        .ad-card{background:white;border-radius:8px;border:1px solid #E2E8F0;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,.1);margin-bottom:20px}
        .ad-card h3{font-size:1rem;color:#0F172A;margin-bottom:12px}
        .ad-cabins-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px}
        .ad-cabin-card{background:white;border-radius:8px;border:1px solid #E2E8F0;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,.1);border-top:4px solid #E2E8F0}
        .ad-cabin-card.available{border-top-color:#16A34A}
        .ad-cabin-card.partial{border-top-color:#F59E0B}
        .ad-cabin-card.full{border-top-color:#EF4444}
        .ad-cabin-card-hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
        .ad-cabin-name{font-weight:700;font-size:1rem;color:#0F172A}
        .ad-cabin-status{display:inline-block;padding:2px 8px;border-radius:4px;font-size:.75rem;font-weight:600}
        .ad-cabin-card.available .ad-cabin-status{background:#DCFCE7;color:#16A34A}
        .ad-cabin-card.partial .ad-cabin-status{background:#FEF3C7;color:#B45309}
        .ad-cabin-card.full .ad-cabin-status{background:#FEE2E2;color:#EF4444}
        .ad-cabin-info{font-size:.9rem;color:#64748B}
        .ad-cabin-info p{margin-bottom:4px}
        .ad-analytics-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px}
        .ad-refresh-wrap{text-align:center;margin-top:25px}
        .ad-btn-primary{padding:8px 16px;background:#2563EB;color:white;border:none;border-radius:8px;font-weight:500;cursor:pointer;font-size:.875rem;transition:background .2s}
        .ad-btn-primary:hover{background:#1D4ED8}
      `}</style>

      <AdminNav />

      <main className="ad-main">
        <div className="ad-page-hdr">
          <h1>Community Centre Control Panel</h1>
          <p>Monitor cabin occupancy and usage in real time.</p>
        </div>

        {error && <div className="ad-alert">{error}</div>}

        {/* SUMMARY CARDS */}
        <div className="ad-grid">
          {[
            { title: 'Total Cabins', key: 'totalCabins', cls: '' },
            { title: 'Available Cabins', key: 'availableCabins', cls: 'success' },
            { title: 'Partially Occupied', key: 'partiallyOccupiedCabins', cls: 'warning' },
            { title: 'Full Cabins', key: 'fullCabins', cls: 'danger' },
            { title: 'People Currently Inside', key: 'peopleInside', cls: '' },
            { title: "Today's Visits", key: 'todayVisits', cls: '' },
          ].map(s => (
            <div key={s.key} className={`ad-stat-card${s.cls ? ' ' + s.cls : ''}`}>
              <div className="ad-stat-title">{s.title}</div>
              <div className="ad-stat-val">{loading ? '...' : (data?.[s.key] ?? 0)}</div>
            </div>
          ))}
        </div>

        {/* TODAY'S ACTIVITY */}
        <div className="ad-section">
          <div className="ad-section-hdr"><h2>Today's Activity</h2><p>Current and completed visits today.</p></div>
          <div className="ad-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
            {[
              { title: 'Active Visits', key: 'activeVisits' },
              { title: 'Completed Visits', key: 'completedVisitsToday' },
            ].map(s => (
              <div key={s.key} className="ad-stat-card">
                <div className="ad-stat-title">{s.title}</div>
                <div className="ad-stat-val">{loading ? '...' : (data?.[s.key] ?? 0)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* LIVE CABIN STATUS */}
        <div className="ad-section">
          <div className="ad-section-hdr"><h2>Live Cabin Status</h2><p>Real-time occupancy of all community centre cabins.</p></div>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#64748B', padding: 30 }}>Loading cabin status...</div>
          ) : !cabins.length ? (
            <div style={{ textAlign: 'center', color: '#64748B', padding: 30 }}>No cabins available.</div>
          ) : (
            <div className="ad-cabins-grid">
              {cabins.map((cabin, i) => {
                const st = (cabin.status || 'AVAILABLE').toLowerCase()
                const cls = st === 'full' ? 'full' : st === 'partial' ? 'partial' : 'available'
                const txt = st === 'full' ? 'FULL' : st === 'partial' ? 'PARTIALLY OCCUPIED' : 'AVAILABLE'
                return (
                  <div key={i} className={`ad-cabin-card ${cls}`}>
                    <div className="ad-cabin-card-hdr">
                      <strong className="ad-cabin-name">{cabin.name || 'Unknown Cabin'}</strong>
                      <span className="ad-cabin-status">{txt}</span>
                    </div>
                    <div className="ad-cabin-info">
                      <p>Capacity: <strong>{cabin.capacity ?? 0}</strong></p>
                      <p>Occupied: <strong>{cabin.occupied ?? 0}</strong></p>
                      <p>Available: <strong>{cabin.available ?? 0}</strong></p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ANALYTICS */}
        <div className="ad-section">
          <div className="ad-section-hdr"><h2>Usage Analytics</h2><p>Information calculated from centre usage history.</p></div>
          <div className="ad-analytics-grid">
            <div className="ad-card"><h3>Most Used Cabins</h3><AnalyticsList items={data?.mostUsedCabins} unit="visits" /></div>
            <div className="ad-card"><h3>Student / Professor Usage</h3><AnalyticsList items={data?.roleUsage} unit="visits" /></div>
            <div className="ad-card"><h3>Average People Per Cabin</h3><AnalyticsList items={data?.averagePeoplePerCabin} unit="people" /></div>
          </div>
        </div>

        <div className="ad-refresh-wrap">
          <button className="ad-btn-primary" onClick={loadDashboard}>Refresh Live Data</button>
        </div>
      </main>
    </div>
  )
}
