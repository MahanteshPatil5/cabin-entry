import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { API } from '../constants'

const PURPOSES = [
  'Project Work', 'Seminar', 'Meeting', 'Study Group',
  'Presentation Practice', 'Faculty Discussion', 'Event', 'Other'
]

const ROOMS_STATIC = {
  1:  { name: 'Cabin 1',               type: 'Small Cabin',        capacity: 6  },
  2:  { name: 'Cabin 2',               type: 'Small Cabin',        capacity: 6  },
  3:  { name: 'Cabin 3',               type: 'Small Cabin',        capacity: 6  },
  4:  { name: 'Cabin 4',               type: 'Small Cabin',        capacity: 6  },
  5:  { name: 'Project Room A',        type: 'Project Room',       capacity: 12 },
  6:  { name: 'Project Room B',        type: 'Project Room',       capacity: 12 },
  7:  { name: 'Top Floor Open Space',  type: 'Open Space',         capacity: 40 },
  8:  { name: 'Main Hall',             type: 'Ground Floor Hall',  capacity: 80 },
  9:  { name: 'Seminar Room',          type: 'Seminar',            capacity: 30 },
  10: { name: 'Discussion Room',       type: 'Meeting',            capacity: 10 },
}

export default function Room() {
  const { roomId } = useParams()
  const ROOM_ID = parseInt(roomId || '1')
  const navigate = useNavigate()

  // Room data
  const [room, setRoom] = useState({
    ...(ROOMS_STATIC[ROOM_ID] || ROOMS_STATIC[1]),
    id: ROOM_ID,
    occupied: 0,
  })

  // Form state
  const [selectedRole, setSelectedRole]   = useState('Student')
  const [name, setName]                   = useState('')
  const [usn, setUsn]                     = useState('')
  const [count, setCount]                 = useState(1)
  const [teamMembers, setTeamMembers]     = useState([]) // array of strings, one per member
  const [purpose, setPurpose]             = useState('')
  const [otherPurpose, setOtherPurpose]   = useState('')

  // UI state
  const [error, setError]         = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [successData, setSuccessData] = useState(null)
  const [currentEntryId, setCurrentEntryId] = useState(null)

  // ── Load room from backend ──────────────────────────────────────────────────
  async function loadRoom() {
    try {
      const res = await fetch(`${API}/rooms/${ROOM_ID}`)
      if (res.ok) setRoom(await res.json())
    } catch {}
  }

  useEffect(() => {
    loadRoom()
    const t = setInterval(loadRoom, 20000)
    return () => clearInterval(t)
  }, [ROOM_ID])

  // ── Derived room status ─────────────────────────────────────────────────────
  const sc = room.occupied === 0 ? 'available' : room.occupied >= room.capacity ? 'full' : 'partial'
  const pct = Math.round((room.occupied / room.capacity) * 100)
  const scLabels = { available: 'Available', partial: 'Partial', full: 'Full' }

  // ── Team member fields ──────────────────────────────────────────────────────
  // When `count` changes, resize the teamMembers array preserving existing values
  useEffect(() => {
    const roomCap = (ROOMS_STATIC[ROOM_ID] || room).capacity
    const clamped = Math.min(Math.max(count, 1), roomCap)
    const teamCount = Math.max(0, clamped - 1) // main user counts as 1
    setTeamMembers(prev => {
      const next = Array(teamCount).fill('')
      for (let i = 0; i < Math.min(prev.length, teamCount); i++) next[i] = prev[i]
      return next
    })
  }, [count, ROOM_ID])

  function updateMember(idx, val) {
    setTeamMembers(prev => {
      const next = [...prev]
      next[idx] = val
      return next
    })
  }

  // teamMembers joined to comma-separated string for the backend
  const teamMembersValue = teamMembers.filter(Boolean).join(', ')

  // ── Count change with capacity cap ─────────────────────────────────────────
  function handleCountChange(val) {
    const roomCap = (ROOMS_STATIC[ROOM_ID] || room).capacity
    let n = parseInt(val, 10)
    if (!Number.isFinite(n) || n < 1) n = 1
    if (n > roomCap) {
      n = roomCap
      showError(`This room can accommodate a maximum of ${roomCap} people.`)
    }
    setCount(n)
  }

  // ── Error helper ────────────────────────────────────────────────────────────
  function showError(msg) {
    setError(msg)
    setTimeout(() => setError(''), 4000)
  }

  // ── Submit entry ────────────────────────────────────────────────────────────
  async function submitEntry() {
    if (!name.trim()) return showError('Please enter your name.')
    if (!usn.trim())  return showError(selectedRole === 'Professor' ? 'Please enter department.' : 'Please enter USN.')

    const roomCap = (ROOMS_STATIC[ROOM_ID] || room).capacity
    if (count < 1)        return showError('Number of people must be at least 1.')
    if (count > roomCap)  return showError(`This room can accommodate a maximum of ${roomCap} people.`)
    if (!purpose)         return showError('Please select a purpose.')

    const finalPurpose = purpose === 'Other' ? (otherPurpose.trim() || 'Other') : purpose

    setSubmitting(true)

    const payload = {
      roomId:      ROOM_ID,
      userName:    name.trim(),
      role:        selectedRole,
      usnOrDept:   usn.trim(),
      teamMembers: teamMembersValue,
      purpose:     finalPurpose,
      peopleCount: count,
    }

    try {
      const res = await fetch(`${API}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok) {
        showError(data.message || 'Booking failed.')
        setSubmitting(false)
        return
      }

      setCurrentEntryId(data.id)

      const entryData = {
        ...payload,
        id:        data.id,
        entryTime: new Date().toISOString(),
        roomName:  data.roomName || ROOMS_STATIC[ROOM_ID]?.name,
      }

      // Save to sessionStorage for logout page
      sessionStorage.setItem('activeEntry', JSON.stringify({
        id:          data.id,
        name:        data.userName,
        role:        data.role,
        usnOrDept:   data.usnOrDept,
        roomId:      ROOM_ID,
        roomName:    data.roomName || ROOMS_STATIC[ROOM_ID]?.name,
        peopleCount: data.peopleCount,
        entryTime:   new Date().toISOString(),
        active:      true,
      }))

      setSuccessData(entryData)
      loadRoom()
    } catch {
      showError('Could not connect to the server. Please try again.')
    }

    setSubmitting(false)
  }

  // ── Checkout ────────────────────────────────────────────────────────────────
  async function checkOut() {
    if (!currentEntryId) { alert('No active entry found.'); return }
    if (!window.confirm('Are you sure you want to leave the room?')) return
    try {
      const res = await fetch(`${API}/entries/${currentEntryId}/exit`, { method: 'PUT' })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        alert(d.message || 'Could not complete checkout.')
        return
      }
      sessionStorage.removeItem('activeEntry')
      navigate('/rooms')
    } catch {
      alert('Connection error. Please try again.')
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: '#F0F4FF', minHeight: '100vh', color: '#1F2937' }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --primary: #1E3A8A; --primary-light: #3B82F6;
          --green: #22C55E;  --green-bg: #F0FDF4;
          --yellow: #F59E0B; --yellow-bg: #FFFBEB;
          --red: #EF4444;    --red-bg: #FEF2F2;
          --gray-50: #F9FAFB; --gray-100: #F3F4F6; --gray-200: #E5E7EB;
          --gray-400: #9CA3AF; --gray-600: #4B5563; --gray-800: #1F2937;
          --radius: 14px;
        }

        /* NAV */
        .ro-nav { background: var(--primary); padding: 0 20px; height: 56px; display: flex; align-items: center; gap: 14px; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 8px rgba(30,58,138,.25); }
        .ro-back { background: rgba(255,255,255,.15); border: none; color: white; width: 34px; height: 34px; border-radius: 50%; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; text-decoration: none; }
        .ro-nav-title { font-family: 'Space Grotesk',sans-serif; font-size: 17px; font-weight: 600; color: white; flex: 1; }

        /* PAGE */
        .ro-wrap { max-width: 560px; margin: 0 auto; padding: 20px 16px 60px; }

        /* STATUS CARD */
        .ro-status-card { background: white; border-radius: var(--radius); padding: 22px; margin-bottom: 18px; box-shadow: 0 1px 4px rgba(0,0,0,.07); border-left: 5px solid var(--primary); }
        .ro-status-card.available { border-color: var(--green); }
        .ro-status-card.partial   { border-color: var(--yellow); }
        .ro-status-card.full      { border-color: var(--red); }
        .ro-rs-top { display: flex; justify-content: space-between; align-items: flex-start; }
        .ro-rs-name { font-family: 'Space Grotesk',sans-serif; font-size: 22px; font-weight: 700; }
        .ro-rs-type { font-size: 13px; color: var(--gray-400); margin-top: 3px; }
        .ro-spill { display: flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 500; }
        .ro-spill.available { background: var(--green-bg);  color: #15803D; }
        .ro-spill.partial   { background: var(--yellow-bg); color: #92400E; }
        .ro-spill.full      { background: var(--red-bg);    color: #B91C1C; }
        .ro-pdot { width: 8px; height: 8px; border-radius: 50%; }
        .ro-spill.available .ro-pdot { background: var(--green); }
        .ro-spill.partial   .ro-pdot { background: var(--yellow); }
        .ro-spill.full      .ro-pdot { background: var(--red); }
        .ro-cap-wrap { margin-top: 16px; }
        .ro-cap-lbl { display: flex; justify-content: space-between; font-size: 13px; color: var(--gray-600); margin-bottom: 6px; }
        .ro-cap-bar { height: 8px; background: var(--gray-100); border-radius: 6px; overflow: hidden; }
        .ro-cap-fill { height: 100%; border-radius: 6px; transition: width .5s; }
        .ro-cap-fill.available { background: var(--green); }
        .ro-cap-fill.partial   { background: var(--yellow); }
        .ro-cap-fill.full      { background: var(--red); }

        /* FULL BANNER */
        .ro-full-banner { background: var(--red-bg); border: 1.5px solid #FECACA; border-radius: var(--radius); padding: 24px; text-align: center; margin-bottom: 18px; }
        .ro-full-banner .icon { font-size: 36px; margin-bottom: 8px; }
        .ro-full-banner h3 { font-family: 'Space Grotesk',sans-serif; font-size: 18px; font-weight: 600; color: #B91C1C; }
        .ro-full-banner p { font-size: 14px; color: #DC2626; margin-top: 6px; }

        /* FORM CARD */
        .ro-form-card { background: white; border-radius: var(--radius); padding: 24px; box-shadow: 0 1px 4px rgba(0,0,0,.07); }
        .ro-form-title { font-family: 'Space Grotesk',sans-serif; font-size: 17px; font-weight: 600; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }

        /* ROLE SELECTOR */
        .ro-role-sel { display: flex; gap: 10px; margin-bottom: 20px; }
        .ro-role-btn { flex: 1; padding: 12px; border: 2px solid var(--gray-200); background: white; border-radius: 10px; cursor: pointer; text-align: center; transition: all .2s; }
        .ro-role-icon { font-size: 22px; display: block; margin-bottom: 4px; }
        .ro-role-lbl { font-size: 14px; font-weight: 500; color: var(--gray-600); }
        .ro-role-btn.selected { border-color: var(--primary-light); background: #EFF6FF; }
        .ro-role-btn.selected .ro-role-lbl { color: var(--primary); }

        /* FIELDS */
        .ro-field { margin-bottom: 16px; }
        .ro-field label { display: block; font-size: 13px; font-weight: 500; color: var(--gray-600); margin-bottom: 6px; }
        .ro-field label span { color: #EF4444; }
        .ro-field input, .ro-field select {
          width: 100%; padding: 11px 14px; border: 1.5px solid var(--gray-200);
          border-radius: 10px; font-family: 'DM Sans',sans-serif; font-size: 14px;
          color: var(--gray-800); background: white; transition: border-color .2s; outline: none;
        }
        .ro-field input:focus, .ro-field select:focus { border-color: var(--primary-light); box-shadow: 0 0 0 3px rgba(59,130,246,.1); }

        /* TEAM MEMBERS GRID */
        .ro-team-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 10px; margin-top: 6px; }
        @media (max-width: 520px) { .ro-team-grid { grid-template-columns: 1fr; } }
        .ro-team-field label { font-size: 12px; color: var(--gray-400); margin-bottom: 5px; }
        .ro-team-empty {
          grid-column: 1 / -1; padding: 11px 14px;
          background: var(--gray-50); border: 1px dashed var(--gray-200);
          border-radius: 10px; color: var(--gray-400); font-size: 13px;
        }

        /* SUBMIT */
        .ro-submit-btn { width: 100%; background: var(--primary); color: white; border: none; padding: 15px; border-radius: 12px; font-family: 'Space Grotesk',sans-serif; font-size: 16px; font-weight: 600; cursor: pointer; margin-top: 8px; transition: all .2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .ro-submit-btn:hover { background: #1d4ed8; transform: translateY(-1px); }
        .ro-submit-btn:disabled { background: var(--gray-200); color: var(--gray-400); cursor: not-allowed; transform: none; }
        .ro-error { background: var(--red-bg); color: #B91C1C; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-top: 12px; }

        /* SUCCESS */
        .ro-success-card { background: white; border-radius: var(--radius); padding: 32px 24px; box-shadow: 0 1px 4px rgba(0,0,0,.07); text-align: center; }
        .ro-success-icon { width: 64px; height: 64px; background: var(--green-bg); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 28px; }
        .ro-success-title { font-family: 'Space Grotesk',sans-serif; font-size: 22px; font-weight: 700; margin-bottom: 8px; }
        .ro-success-sub { font-size: 14px; color: var(--gray-600); margin-bottom: 16px; }
        .ro-entry-info { background: var(--gray-50); border-radius: 10px; padding: 14px; margin-bottom: 20px; text-align: left; }
        .ro-entry-row { display: flex; justify-content: space-between; font-size: 13px; padding: 5px 0; border-bottom: 1px solid var(--gray-100); }
        .ro-entry-row:last-child { border-bottom: none; }
        .ro-entry-row .key { color: var(--gray-400); }
        .ro-entry-row .val { font-weight: 500; }
        .ro-logout-btn { width: 100%; background: var(--red-bg); color: #B91C1C; border: 1.5px solid #FECACA; padding: 14px; border-radius: 12px; font-family: 'Space Grotesk',sans-serif; font-size: 15px; font-weight: 600; cursor: pointer; transition: all .2s; }
        .ro-logout-btn:hover { background: #FEE2E2; }

        /* LOADER */
        .ro-loader { display: inline-block; width: 18px; height: 18px; border: 2px solid rgba(255,255,255,.3); border-top-color: white; border-radius: 50%; animation: spin .7s linear infinite; vertical-align: middle; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* ── NAV ── */}
      <nav className="ro-nav">
        <Link to="/rooms" className="ro-back">←</Link>
        <div className="ro-nav-title">{room.name || 'Loading…'}</div>
        {/* history link commented out in original: */}
        {/* <Link to="/history" className="ro-nav-hist">📋 History</Link> */}
      </nav>

      <div className="ro-wrap">

        {/* ── ROOM STATUS CARD ── */}
        <div className={`ro-status-card ${sc}`}>
          <div className="ro-rs-top">
            <div>
              <div className="ro-rs-name">{room.name}</div>
              <div className="ro-rs-type">{room.type} · Capacity: {room.capacity}</div>
            </div>
            <div className={`ro-spill ${sc}`}>
              <div className="ro-pdot" />
              <span>{scLabels[sc]}</span>
            </div>
          </div>
          <div className="ro-cap-wrap">
            <div className="ro-cap-lbl"><span>Capacity</span><span>{room.occupied} / {room.capacity}</span></div>
            <div className="ro-cap-bar">
              <div className={`ro-cap-fill ${sc}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>

        {/* ── FULL BANNER ── */}
        {sc === 'full' && !currentEntryId && !successData && (
          <div className="ro-full-banner">
            <div className="icon">🚫</div>
            <h3>Cabin Full</h3>
            <p>This space is at full capacity. Please try another room or check back later.</p>
          </div>
        )}

        {/* ── ENTRY FORM ── */}
        {!successData && !(sc === 'full' && !currentEntryId) && (
          <div className="ro-form-card">
            <div className="ro-form-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E3A8A" strokeWidth="2.5">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
              Register Entry
            </div>

            {/* Role selector */}
            <div className="ro-role-sel">
              <div className={`ro-role-btn${selectedRole === 'Student' ? ' selected' : ''}`} onClick={() => setSelectedRole('Student')}>
                <span className="ro-role-icon">🎓</span>
                <div className="ro-role-lbl">Student</div>
              </div>
              <div className={`ro-role-btn${selectedRole === 'Professor' ? ' selected' : ''}`} onClick={() => setSelectedRole('Professor')}>
                <span className="ro-role-icon">👨‍🏫</span>
                <div className="ro-role-lbl">Professor</div>
              </div>
            </div>

            {/* Full Name */}
            <div className="ro-field">
              <label>Full Name <span>*</span></label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Enter your full name" />
            </div>

            {/* USN / Department */}
            <div className="ro-field">
              <label>
                {selectedRole === 'Professor' ? <>Department <span>*</span></> : <>USN <span>*</span></>}
              </label>
              <input
                value={usn}
                onChange={e => setUsn(e.target.value)}
                placeholder={selectedRole === 'Professor' ? 'e.g., Computer Science' : 'e.g., 1XX21CS001'}
              />
            </div>

            {/* Number of people */}
            <div className="ro-field">
              <label>Number of People (including you) <span>*</span></label>
              <input
                type="number"
                min={1}
                value={count}
                onChange={e => handleCountChange(e.target.value)}
              />
            </div>

            {/* ── Dynamic team member inputs ── */}
            <div className="ro-field">
              <label>Team Members / Colleagues</label>
              <div className="ro-team-grid">
                {teamMembers.length === 0 ? (
                  <div className="ro-team-empty">
                    {count <= 1
                      ? 'No additional team members needed for 1 person.'
                      : 'Enter the number of people above to add team-member names.'}
                  </div>
                ) : (
                  teamMembers.map((val, i) => (
                    <div key={i} className="ro-team-field">
                      <label>Team Member {i + 1}</label>
                      <input
                        type="text"
                        value={val}
                        placeholder={`Enter member ${i + 1} name`}
                        autoComplete="off"
                        onChange={e => updateMember(i, e.target.value)}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Purpose */}
            <div className="ro-field">
              <label>Purpose of Visit <span>*</span></label>
              <select value={purpose} onChange={e => setPurpose(e.target.value)}>
                <option value="">Select purpose</option>
                {PURPOSES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>

            {/* Other purpose */}
            {purpose === 'Other' && (
              <div className="ro-field">
                <label>Specify Purpose</label>
                <input value={otherPurpose} onChange={e => setOtherPurpose(e.target.value)} placeholder="Describe your purpose" />
              </div>
            )}

            {error && <div className="ro-error">{error}</div>}

            <button className="ro-submit-btn" disabled={submitting} onClick={submitEntry}>
              {submitting ? <><span className="ro-loader" /> Confirming…</> : '✅ Confirm Entry'}
            </button>
          </div>
        )}

        {/* ── SUCCESS CARD ── */}
        {successData && (
          <div className="ro-success-card">
            <div className="ro-success-icon">✅</div>
            <div className="ro-success-title">You're Checked In!</div>
            <div className="ro-success-sub">
              Checked into <strong>{successData.roomName}</strong>
            </div>
            <div className="ro-entry-info">
              {[
                ['Entry ID',    successData.id],
                ['Name',        successData.userName],
                ['Role',        successData.role],
                [successData.role === 'Professor' ? 'Department' : 'USN', successData.usnOrDept],
                ['Purpose',     successData.purpose],
                ['People',      successData.peopleCount],
                ['Check-in time', new Date(successData.entryTime).toLocaleTimeString()],
              ].map(([k, v]) => (
                <div key={k} className="ro-entry-row">
                  <span className="key">{k}</span>
                  <span className="val">{v}</span>
                </div>
              ))}
            </div>
            <button className="ro-logout-btn" onClick={checkOut}>🚪 Leave Room</button>
          </div>
        )}

      </div>
    </div>
  )
}
