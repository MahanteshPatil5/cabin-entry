import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Welcome from './pages/Welcome.jsx'
import Scan from './pages/Scan.jsx'
import Rooms from './pages/Rooms.jsx'
import Room from './pages/Room.jsx'
import History from './pages/History.jsx'
import Logout from './pages/Logout.jsx'
import Prebook from './pages/Prebook.jsx'
import PrebookRoom from './pages/PrebookRoom.jsx'
import AdminLogin from './pages/admin/AdminLogin.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminCabins from './pages/admin/AdminCabins.jsx'
import AdminHistory from './pages/admin/AdminHistory.jsx'

function AdminGuard({ children }) {
  if (sessionStorage.getItem('adminLoggedIn') !== 'true') {
    return <Navigate to="/admin/login" replace />
  }
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/scan" element={<Scan />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/room/:roomId" element={<Room />} />
        <Route path="/history" element={<History />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/prebook" element={<Prebook />} />
        <Route path="/prebook/room" element={<PrebookRoom />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
        <Route path="/admin/cabins" element={<AdminGuard><AdminCabins /></AdminGuard>} />
        <Route path="/admin/history" element={<AdminGuard><AdminHistory /></AdminGuard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
