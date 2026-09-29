export const API = 'http://localhost:8080/api'

export const ROOMS_STATIC = [
  { id: 1,  name: 'Cabin 1',                 type: 'Small Cabin',        capacity: 6,  img: '/images/cabin-overhead.jpg' },
  { id: 2,  name: 'Cabin 2',                 type: 'Small Cabin',        capacity: 6,  img: '/images/cabin-table.jpg' },
  { id: 3,  name: 'Cabin 3',                 type: 'Small Cabin',        capacity: 6,  img: '/images/cabin-overhead.jpg' },
  { id: 4,  name: 'Cabin 4',                 type: 'Small Cabin',        capacity: 6,  img: '/images/cabin-table.jpg' },
  { id: 5,  name: 'Project Room A',          type: 'Project Room',       capacity: 12, img: '/images/project-room-1.jpg' },
  { id: 6,  name: 'Project Room B',          type: 'Project Room',       capacity: 12, img: '/images/project-room-2.jpg' },
  { id: 7,  name: 'Open Space(Front)',        type: 'Open Space',         capacity: 25, img: '/images/exterior view (5) - Copy.jpeg' },
  { id: 8,  name: 'Main Hall',               type: 'Ground Floor Hall',  capacity: 80, img: '/images/main-hall-1.jpg' },
  { id: 9,  name: 'Seminar Room(Top Floor)', type: 'Seminar / Training',  capacity: 30, img: '/images/open-space-2.jpg' },
  { id: 10, name: 'Discussion Room',         type: 'Open Space · 2',     capacity: 10, img: '/images/exterior view (5) - Copy.jpeg' },
]

export const ROOMS_MAP = Object.fromEntries(ROOMS_STATIC.map(r => [r.id, r]))

export function statusClass(occupied, capacity) {
  if (occupied === 0) return 'available'
  if (occupied >= capacity) return 'full'
  return 'partial'
}

export const STATUS_LABEL = { available: 'Available', partial: 'Partial', full: 'Full' }
