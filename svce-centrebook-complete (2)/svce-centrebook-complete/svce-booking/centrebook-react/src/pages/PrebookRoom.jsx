import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { API } from '../constants'

const PURPOSES = ['Project Work', 'Seminar', 'Meeting', 'Study Group', 'Presentation Practice', 'Faculty Discussion', 'Event', 'Other']

function escapeHtml(v) {
  if (v == null) return ''
  return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;')
}

function formatDate(ds) {
  if (!ds) return '--'
  const d = new Date(`${ds}T00:00:00`)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatTime(ts) {
  if (!ts) return '--'
  const [h, m] = ts.split(':')
  const d = new Date(); d.setHours(parseInt(h), parseInt(m), 0, 0)
  return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
}

export default function PrebookRoom() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const ROOM_ID = parseInt(searchParams.get('room_id') || '0')
  const BOOKING_DATE = searchParams.get('date') || ''
  const START_TIME = searchParams.get('startTime') || ''
  const END_TIME = searchParams.get('endTime') || ''

  const [selectedRoom, setSelectedRoom] = useState(null)
  const [selectedRole, setSelectedRole] = useState('Student')
  const [name, setName] = useState('')
  const [usn, setUsn] = useState('')
  const [count, setCount] = useState(1)
  const [team, setTeam] = useState('')
  const [purpose, setPurpose] = useState('')
  const [otherPurpose, setOtherPurpose] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [successData, setSuccessData] = useState(null)

  useEffect(() => {
    if (!ROOM_ID) { setError('Reservation date or time is missing. Please select the room again.'); return }
    fetch(`${API}/rooms/${ROOM_ID}`)
      .then(r => { if (!r.ok) throw new Error('Could not load room information.'); return r.json() })
      .then(setSelectedRoom)
      .catch(e => setError(e.message))
  }, [ROOM_ID])

  async function submitPreBook() {
    setError('')
    if (!selectedRoom) { setError('Room information is still loading. Please try again.'); return }
    if (!name.trim()) { setError('Please enter your full name.'); return }
    if (!usn.trim()) { setError(selectedRole === 'Professor' ? 'Please enter your department.' : 'Please enter your USN.'); return }
    if (!BOOKING_DATE) { setError('Reservation date is missing.'); return }
    if (!START_TIME || !END_TIME) { setError('Reservation time is missing.'); return }
    if (START_TIME >= END_TIME) { setError('End time must be after start time.'); return }
    if (isNaN(count) || count <= 0) { setError('Number of attendees must be at least 1.'); return }
    if (count > selectedRoom.capacity) { setError(`This room can accommodate only ${selectedRoom.capacity} people.`); return }
    if (!purpose) { setError('Please select a purpose.'); return }
    if (purpose === 'Other' && !otherPurpose.trim()) { setError('Please specify your purpose.'); return }

    const finalPurpose = purpose === 'Other' ? otherPurpose.trim() : purpose
    const payload = { roomId: ROOM_ID, userName: name.trim(), role: selectedRole, usnOrDept: usn.trim(), teamMembers: team.trim(), purpose: finalPurpose, peopleCount: count, bookingDate: BOOKING_DATE, startTime: START_TIME, endTime: END_TIME }

    setSubmitting(true)
    try {
      const res = await fetch(`${API}/prebook`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const result = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(result.message || 'Could not complete reservation.')
      setSuccessData({ result, payload })
    } catch (e) { setError(e.message || 'Could not connect to the server.') }
    setSubmitting(false)
  }

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: '#F0F4FF', minHeight: '100vh', color: '#1F2937' }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        .pbr-nav{background:#1E3A8A;padding:0 20px;height:56px;display:flex;align-items:center;gap:14px;position:sticky;top:0;z-index:100;box-shadow:0 2px 8px rgba(30,58,138,.25)}
        .pbr-back{background:rgba(255,255,255,.15);border:none;color:white;width:34px;height:34px;border-radius:50%;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;text-decoration:none}
        .pbr-nav-title{font-family:'Space Grotesk',sans-serif;font-size:17px;font-weight:600;color:white;flex:1}
        .pbr-wrap{max-width:560px;margin:0 auto;padding:20px 16px 60px}
        .pbr-status-card{background:white;border-radius:14px;padding:22px;margin-bottom:18px;box-shadow:0 1px 4px rgba(0,0,0,.07);border-left:5px solid #3B82F6}
        .pbr-rs-top{display:flex;justify-content:space-between;align-items:flex-start}
        .pbr-rs-name{font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:700}
        .pbr-rs-type{font-size:13px;color:#9CA3AF;margin-top:3px}
        .pbr-spill{display:flex;align-items:center;gap:6px;padding:6px 14px;border-radius:20px;font-size:13px;font-weight:500;background:#EFF6FF;color:#1E3A8A}
        .pbr-pdot{width:8px;height:8px;border-radius:50%;background:#3B82F6}
        .pbr-form-card{background:white;border-radius:14px;padding:24px;box-shadow:0 1px 4px rgba(0,0,0,.07)}
        .pbr-form-title{font-family:'Space Grotesk',sans-serif;font-size:17px;font-weight:600;margin-bottom:20px;display:flex;align-items:center;gap:8px}
        .pbr-role-sel{display:flex;gap:10px;margin-bottom:20px}
        .pbr-role-btn{flex:1;padding:12px;border:2px solid #E5E7EB;background:white;border-radius:10px;cursor:pointer;text-align:center;transition:all .2s}
        .pbr-role-icon{font-size:22px;display:block;margin-bottom:4px}
        .pbr-role-lbl{font-size:14px;font-weight:500;color:#4B5563}
        .pbr-role-btn.selected{border-color:#3B82F6;background:#EFF6FF}
        .pbr-role-btn.selected .pbr-role-lbl{color:#1E3A8A}
        .pbr-field{margin-bottom:16px}
        .pbr-field label{display:block;font-size:13px;font-weight:500;color:#4B5563;margin-bottom:6px}
        .pbr-field label span{color:#EF4444}
        .pbr-field input,.pbr-field select{width:100%;padding:11px 14px;border:1.5px solid #E5E7EB;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:14px;color:#1F2937;background:white;transition:border-color .2s;outline:none}
        .pbr-field input:focus,.pbr-field select:focus{border-color:#3B82F6;box-shadow:0 0 0 3px rgba(59,130,246,.1)}
        .pbr-summary{background:#F9FAFB;border-radius:10px;padding:14px 16px;margin-bottom:16px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
        .pbr-summary-item{display:flex;flex-direction:column;gap:2px}
        .pbr-summary-label{font-size:11px;color:#9CA3AF;text-transform:uppercase;letter-spacing:.4px}
        .pbr-summary-val{font-size:14px;font-weight:600;color:#1F2937}
        .pbr-submit-btn{width:100%;background:#1E3A8A;color:white;border:none;padding:15px;border-radius:12px;font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:600;cursor:pointer;margin-top:8px;transition:all .2s}
        .pbr-submit-btn:hover{background:#1d4ed8;transform:translateY(-1px)}
        .pbr-submit-btn:disabled{background:#E5E7EB;color:#9CA3AF;cursor:not-allowed;transform:none}
        .pbr-error{background:#FEF2F2;color:#B91C1C;padding:10px 14px;border-radius:8px;font-size:13px;margin-top:12px}
        .pbr-success-card{background:white;border-radius:14px;padding:32px 24px;box-shadow:0 1px 4px rgba(0,0,0,.07);text-align:center}
        .pbr-success-icon{width:64px;height:64px;background:#F0FDF4;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:28px}
        .pbr-success-title{font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:700;margin-bottom:8px}
        .pbr-success-sub{font-size:14px;color:#4B5563;margin-bottom:16px}
        .pbr-entry-info{background:#F9FAFB;border-radius:10px;padding:14px;margin-bottom:20px;text-align:left}
        .pbr-entry-row{display:flex;justify-content:space-between;font-size:13px;padding:5px 0;border-bottom:1px solid #F3F4F6}
        .pbr-entry-row:last-child{border-bottom:none}
        .pbr-entry-row .key{color:#9CA3AF}
        .pbr-entry-row .val{font-weight:500}
        .pbr-action-btn{width:100%;background:#1E3A8A;color:white;border:none;padding:14px;border-radius:12px;font-family:'Space Grotesk',sans-serif;font-size:15px;font-weight:600;cursor:pointer;transition:all .2s}
        .pbr-action-btn:hover{background:#1d4ed8}
      `}</style>

      <nav className="pbr-nav">
        <Link to="/prebook" className="pbr-back">←</Link>
        <div className="pbr-nav-title">{selectedRoom ? `Pre-Book ${selectedRoom.name}` : 'Pre-Book Room'}</div>
      </nav>

      <div className="pbr-wrap">
        {/* ROOM INFO CARD */}
        <div className="pbr-status-card">
          <div className="pbr-rs-top">
            <div>
              <div className="pbr-rs-name">{selectedRoom ? selectedRoom.name : 'Loading...'}</div>
              <div className="pbr-rs-type">{selectedRoom ? `${selectedRoom.type} · Capacity: ${selectedRoom.capacity} seats` : '–'}</div>
            </div>
            <div className="pbr-spill"><div className="pbr-pdot" /><span>Advance Booking</span></div>
          </div>
        </div>

        {/* FORM or SUCCESS */}
        {!successData ? (
          <div className="pbr-form-card">
            <div className="pbr-form-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E3A8A" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Schedule Reservation
            </div>
            <div className="pbr-role-sel">
              <div className={`pbr-role-btn${selectedRole === 'Student' ? ' selected' : ''}`} onClick={() => setSelectedRole('Student')}>
                <span className="pbr-role-icon">🎓</span><div className="pbr-role-lbl">Student</div>
              </div>
              <div className={`pbr-role-btn${selectedRole === 'Professor' ? ' selected' : ''}`} onClick={() => setSelectedRole('Professor')}>
                <span className="pbr-role-icon">👨‍🏫</span><div className="pbr-role-lbl">Professor</div>
              </div>
            </div>
            <div className="pbr-field"><label>Full Name <span>*</span></label><input value={name} onChange={e => setName(e.target.value)} placeholder="Enter your full name" /></div>
            <div className="pbr-field"><label>{selectedRole === 'Professor' ? <>Department <span>*</span></> : <>USN <span>*</span></>}</label><input value={usn} onChange={e => setUsn(e.target.value)} placeholder={selectedRole === 'Professor' ? 'e.g., Computer Science & Engineering' : 'e.g., 1XX21CS001'} /></div>

            {/* RESERVATION SUMMARY */}
            {(BOOKING_DATE || START_TIME) && (
              <div className="pbr-summary">
                <div className="pbr-summary-item"><div className="pbr-summary-label">Date</div><div className="pbr-summary-val">{formatDate(BOOKING_DATE)}</div></div>
                <div className="pbr-summary-item"><div className="pbr-summary-label">Time</div><div className="pbr-summary-val">{formatTime(START_TIME)} – {formatTime(END_TIME)}</div></div>
              </div>
            )}

            <div className="pbr-field"><label>Number of Expected Attendees <span>*</span></label><input type="number" value={count} min={1} onChange={e => setCount(parseInt(e.target.value) || 1)} /></div>
            <div className="pbr-field"><label>Team Members / Co-hosts</label><input value={team} onChange={e => setTeam(e.target.value)} placeholder="Names separated by commas (optional)" /></div>
            <div className="pbr-field">
              <label>Purpose of Reservation <span>*</span></label>
              <select value={purpose} onChange={e => setPurpose(e.target.value)}>
                <option value="">Select purpose</option>
                {PURPOSES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            {purpose === 'Other' && (
              <div className="pbr-field"><label>Specify Purpose</label><input value={otherPurpose} onChange={e => setOtherPurpose(e.target.value)} placeholder="Describe your purpose" /></div>
            )}
            {error && <div className="pbr-error">{error}</div>}
            <button className="pbr-submit-btn" disabled={submitting} onClick={submitPreBook}>
              {submitting ? 'Processing Reservation...' : '📅 Confirm Pre-Booking'}
            </button>
          </div>
        ) : (
          <div className="pbr-success-card">
            <div className="pbr-success-icon">🎉</div>
            <div className="pbr-success-title">Room Reserved!</div>
            <div className="pbr-success-sub">Reserved <strong>{selectedRoom?.name}</strong></div>
            <div className="pbr-entry-info">
              {[
                ['Reservation ID', successData.result.id || successData.result.bookingId || '--'],
                ['Reserved For', successData.payload.userName],
                ['Role', successData.payload.role],
                [successData.payload.role === 'Professor' ? 'Department' : 'USN', successData.payload.usnOrDept],
                ['Date', formatDate(successData.payload.bookingDate)],
                ['Time', `${formatTime(successData.payload.startTime)} – ${formatTime(successData.payload.endTime)}`],
                ['Attendees', successData.payload.peopleCount],
                ['Purpose', successData.payload.purpose],
              ].map(([k, v]) => (
                <div key={k} className="pbr-entry-row"><span className="key">{k}</span><span className="val">{v}</span></div>
              ))}
            </div>
            <button className="pbr-action-btn" onClick={() => navigate('/prebook')}>Return to Pre-Book</button>
          </div>
        )}
      </div>
    </div>
  )
}
