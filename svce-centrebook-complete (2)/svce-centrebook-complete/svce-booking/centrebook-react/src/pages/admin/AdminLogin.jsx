import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API } from '../../constants'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage('')
    if (!username.trim() || !password.trim()) { setMessage('Please enter username and password.'); return }
    try {
      const res = await fetch(`${API}/admin/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`, { method: 'POST' })
      const data = await res.json()
      if (res.ok && data.success) {
        sessionStorage.setItem('adminLoggedIn', 'true')
        navigate('/admin/dashboard')
      } else {
        setMessage(data.message || 'Invalid username or password.')
      }
    } catch { setMessage('Unable to connect to server.') }
  }

  return (
    <div style={{ fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen,Ubuntu,Cantarell,sans-serif', background: '#F8FAFC', color: '#1E293B', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        .al-container{width:100%;max-width:400px;padding:16px}
        .al-card{background:white;border-radius:8px;border:1px solid #E2E8F0;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,.1)}
        .al-header{text-align:center;margin-bottom:24px}
        .al-header h2{color:#0F172A;font-size:1.5rem;margin-bottom:4px}
        .al-header p{color:#64748B;font-size:.875rem}
        .al-form-group{margin-bottom:16px}
        .al-form-group label{display:block;font-size:.875rem;font-weight:500;margin-bottom:6px}
        .al-form-group input{width:100%;padding:8px 12px;border:1px solid #E2E8F0;border-radius:8px;font-size:.875rem;outline:none;transition:border-color .2s}
        .al-form-group input:focus{border-color:#2563EB;box-shadow:0 0 0 2px rgba(37,99,235,.2)}
        .al-btn{width:100%;padding:8px 16px;background:#2563EB;color:white;border:none;border-radius:8px;font-size:.875rem;font-weight:500;cursor:pointer;transition:background .2s;margin-top:8px}
        .al-btn:hover{background:#1D4ED8}
        .al-msg{padding:10px 14px;border-radius:8px;font-size:.875rem;margin-bottom:16px;background:#FEE2E2;color:#EF4444;border:1px solid #FECACA}
      `}</style>
      <div className="al-container">
        <div className="al-card">
          <div className="al-header">
            <h2>SVCE CentreBook</h2>
            <p>Admin Portal Authentication</p>
          </div>
          {message && <div className="al-msg">{message}</div>}
          <form onSubmit={handleSubmit}>
            <div className="al-form-group">
              <label htmlFor="adminId">Admin ID</label>
              <input id="adminId" type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter Admin ID" required autoFocus />
            </div>
            <div className="al-form-group">
              <label htmlFor="adminPassword">Password</label>
              <input id="adminPassword" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter Password" required />
            </div>
            <button type="submit" className="al-btn">Login to Control Panel</button>
          </form>
        </div>
      </div>
    </div>
  )
}
