import { Link, useNavigate, useLocation } from 'react-router-dom'

export default function AdminNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  function logout() {
    sessionStorage.removeItem('adminLoggedIn')
    sessionStorage.removeItem('adminId')
    navigate('/admin/login')
  }

  return (
    <>
      <style>{`
        .an-nav{background:#fff;border-bottom:1px solid #E2E8F0;padding:14px 24px;display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;z-index:100;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen,Ubuntu,Cantarell,sans-serif}
        .an-brand{display:flex;align-items:center;gap:8px}
        .an-brand-title{font-weight:700;font-size:1.125rem;color:#0F172A}
        .an-badge{background:#DBEAFE;color:#2563EB;padding:2px 8px;border-radius:12px;font-size:.75rem;font-weight:600}
        .an-links{display:flex;list-style:none;gap:16px;align-items:center}
        .an-link{text-decoration:none;color:#64748B;font-size:.875rem;font-weight:500;padding:6px 12px;border-radius:8px;transition:all .2s}
        .an-link:hover,.an-link.active{color:#2563EB;background:#EFF6FF}
        .an-logout-btn{padding:4px 10px;background:#EF4444;color:white;border:none;border-radius:8px;font-size:.75rem;font-weight:500;cursor:pointer;transition:background .2s}
        .an-logout-btn:hover{background:#DC2626}
        @media(max-width:768px){.an-nav{flex-direction:column;gap:12px}.an-links{flex-wrap:wrap;justify-content:center}}
      `}</style>
      <nav className="an-nav">
        <div className="an-brand">
          <span className="an-brand-title">SVCE CentreBook</span>
          <span className="an-badge">Admin Portal</span>
        </div>
        <ul className="an-links">
          <li><Link to="/admin/dashboard" className={`an-link${pathname === '/admin/dashboard' ? ' active' : ''}`}>Home</Link></li>
          <li><Link to="/admin/cabins" className={`an-link${pathname === '/admin/cabins' ? ' active' : ''}`}>Cabin Management</Link></li>
          <li><Link to="/admin/history" className={`an-link${pathname === '/admin/history' ? ' active' : ''}`}>History</Link></li>
          <li><button className="an-logout-btn" onClick={logout}>Logout</button></li>
        </ul>
      </nav>
    </>
  )
}
