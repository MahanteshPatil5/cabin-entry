# SVCE CentreBook – React Frontend

Converted from the original HTML/CSS/JS frontend.  
All UI, logic, and backend API calls are identical to the originals.

## Getting Started

Make sure the Spring Boot backend is running on `http://localhost:8080`.

```bash
# From this folder
npm install        # first time only
npm run dev        # starts dev server on http://localhost:5500
```

## Route Map

| URL | Original Page |
|---|---|
| `/` | `welcome.html` |
| `/scan` | `index.html` (QR scanner + room grid) |
| `/rooms` | `rooms.html` |
| `/room/:id` | `room.html?room_id=…` |
| `/history` | `history.html` |
| `/logout` | `logout.html` |
| `/prebook` | `prebook/prebook.html` |
| `/prebook/room?room_id=…&date=…&startTime=…&endTime=…` | `prebook/prebook-room.html` |
| `/admin/login` | `admin/admin-login.html` |
| `/admin/dashboard` | `admin/admin-dashboard.html` |
| `/admin/cabins` | `admin/admin-cabin-management.html` |
| `/admin/history` | `admin/admin-history.html` |

## Project Structure

```
centrebook-react/
├── public/
│   ├── images/          ← all room/campus images
│   └── logo.png
├── src/
│   ├── App.jsx          ← router + AdminGuard
│   ├── constants.js     ← API base URL, ROOMS_STATIC data
│   ├── main.jsx
│   ├── index.css
│   ├── components/
│   │   └── AdminNav.jsx ← shared admin navbar
│   └── pages/
│       ├── Welcome.jsx
│       ├── Scan.jsx
│       ├── Rooms.jsx
│       ├── Room.jsx
│       ├── History.jsx
│       ├── Logout.jsx
│       ├── Prebook.jsx
│       ├── PrebookRoom.jsx
│       └── admin/
│           ├── AdminLogin.jsx
│           ├── AdminDashboard.jsx
│           ├── AdminCabins.jsx
│           └── AdminHistory.jsx
├── index.html
├── vite.config.js       ← proxy /api → localhost:8080
└── package.json
```

## Production Build

```bash
npm run build   # outputs to dist/
npm run preview # preview the production build locally
```
