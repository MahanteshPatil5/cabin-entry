-- ============================================================
-- SVCE CentreBook
-- COMPLETE MYSQL DATABASE SCHEMA
-- ============================================================
-- Purpose:
--   This is the master database setup file for the SVCE CentreBook
--   project.
--
-- IMPORTANT:
--   1. Run this file in MySQL before starting the Spring Boot backend.
--   2. The database name used by this project is:
--
--          community_centre
--
--   3. The Spring Boot application.properties must use the same
--      database name:
--
--          jdbc:mysql://localhost:3306/community_centre
--
-- ============================================================


-- ============================================================
-- 1. CREATE DATABASE
-- ============================================================

CREATE DATABASE IF NOT EXISTS community_centre
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE community_centre;


-- ============================================================
-- 2. TABLE: rooms
-- ============================================================
-- Stores all CentreBook rooms/spaces.
--
-- occupied is the CURRENT PHYSICAL occupancy.
-- A future reservation does NOT increase occupied.
-- ============================================================

CREATE TABLE IF NOT EXISTS rooms (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    type        VARCHAR(100) NOT NULL,
    capacity    INT NOT NULL,
    occupied    INT NOT NULL DEFAULT 0,

    CONSTRAINT chk_room_capacity
        CHECK (capacity > 0),

    CONSTRAINT chk_room_occupied
        CHECK (occupied >= 0 AND occupied <= capacity)
);


-- ============================================================
-- 3. TABLE: entry_logs
-- ============================================================
-- Stores actual physical room usage.
--
-- This table represents users who have ACTUALLY ENTERED a room.
-- It is separate from reservations.
-- ============================================================

CREATE TABLE IF NOT EXISTS entry_logs (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_id       BIGINT NOT NULL,
    user_name     VARCHAR(100) NOT NULL,
    role          VARCHAR(20) NOT NULL,
    usn_or_dept   VARCHAR(100) NOT NULL,
    team_members  TEXT,
    purpose       VARCHAR(200) NOT NULL,
    people_count  INT NOT NULL DEFAULT 1,
    entry_time    DATETIME NOT NULL,
    exit_time     DATETIME NULL,
    active        TINYINT(1) NOT NULL DEFAULT 1,

    CONSTRAINT fk_entry_room
        FOREIGN KEY (room_id)
        REFERENCES rooms(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_entry_people
        CHECK (people_count > 0)
);

CREATE INDEX idx_entry_room
    ON entry_logs(room_id);

CREATE INDEX idx_entry_active
    ON entry_logs(active);

CREATE INDEX idx_entry_time
    ON entry_logs(entry_time);


-- ============================================================
-- 4. TABLE: reservations
-- ============================================================
-- Stores FUTURE / PRE-BOOK reservations.
--
-- Reservation and physical occupancy are intentionally separate.
--
-- RESERVED:
--     Booking exists but user has not entered.
--
-- ENTERED:
--     Reservation holder has entered and an entry_log exists.
--
-- COMPLETED:
--     Reservation/room usage has finished.
--
-- CANCELLED:
--     Reservation was cancelled.
-- ============================================================

CREATE TABLE IF NOT EXISTS reservations (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_id         BIGINT NOT NULL,

    user_name       VARCHAR(100) NOT NULL,
    role            VARCHAR(20) NOT NULL,
    usn_or_dept     VARCHAR(100) NOT NULL,
    team_members    TEXT,
    purpose         VARCHAR(200) NOT NULL,
    people_count    INT NOT NULL DEFAULT 1,

    booking_date    DATE NOT NULL,
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,

    status          VARCHAR(20) NOT NULL DEFAULT 'RESERVED',

    entry_id        BIGINT NULL,

    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                              ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_reservation_room
        FOREIGN KEY (room_id)
        REFERENCES rooms(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_reservation_entry
        FOREIGN KEY (entry_id)
        REFERENCES entry_logs(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT chk_reservation_people
        CHECK (people_count > 0),

    CONSTRAINT chk_reservation_time
        CHECK (start_time < end_time),

    CONSTRAINT chk_reservation_status
        CHECK (
            status IN (
                'RESERVED',
                'ENTERED',
                'COMPLETED',
                'CANCELLED'
            )
        )
);

CREATE INDEX idx_reservation_room_date
    ON reservations(room_id, booking_date);

CREATE INDEX idx_reservation_date_time
    ON reservations(booking_date, start_time, end_time);

CREATE INDEX idx_reservation_status
    ON reservations(status);


-- ============================================================
-- 5. TABLE: admins
-- ============================================================
-- Stores administrator login information.
--
-- If the current Spring Boot admin authentication is implemented
-- without database authentication, this table can remain empty.
-- It is included here so a new project setup has an admin table
-- available from the beginning.
-- ============================================================

CREATE TABLE IF NOT EXISTS admins (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(100) NOT NULL UNIQUE,
    password      VARCHAR(255) NOT NULL,
    full_name     VARCHAR(150),
    active        TINYINT(1) NOT NULL DEFAULT 1,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_username
    ON admins(username);


-- ============================================================
-- 6. SEED ROOMS
-- ============================================================
-- These are the current SVCE CentreBook rooms.
--
-- INSERT IGNORE prevents duplicate-key errors if the schema
-- is executed again.
-- ============================================================

INSERT IGNORE INTO rooms
    (id, name, type, capacity, occupied)
VALUES
    (1,  'Cabin 1',              'Small Cabin',         6,  0),
    (2,  'Cabin 2',              'Small Cabin',         6,  0),
    (3,  'Cabin 3',              'Small Cabin',         6,  0),
    (4,  'Cabin 4',              'Small Cabin',         6,  0),
    (5,  'Project Room A',       'Project Room',       12,  0),
    (6,  'Project Room B',       'Project Room',       12,  0),
    (7,  'Top Floor Open Space', 'Open Space',         40,  0),
    (8,  'Main Hall',            'Ground Floor Hall',  80,  0),
    (9,  'Seminar Room',         'Seminar',            30,  0),
    (10, 'Discussion Room',      'Meeting',             10,  0);


-- ============================================================
-- 7. OPTIONAL ADMIN SEED
-- ============================================================
-- Do NOT store a real production password here.
--
-- Uncomment and change this only for local development if the
-- Admin backend uses the admins table for authentication.
--
-- INSERT IGNORE INTO admins
--     (username, password, full_name, active)
-- VALUES
--     ('admin', 'CHANGE_THIS_PASSWORD', 'CentreBook Admin', 1);


-- ============================================================
-- 8. DATABASE VERIFICATION
-- ============================================================

SELECT DATABASE();


-- ============================================================
-- 9. SHOW ALL CENTREBOOK TABLES
-- ============================================================

SHOW TABLES;


-- ============================================================
-- 10. VERIFY ROOMS
-- ============================================================

SELECT
    id,
    name,
    type,
    capacity,
    occupied,
    (capacity - occupied) AS available
FROM rooms
ORDER BY id;


-- ============================================================
-- 11. VERIFY ACTIVE PHYSICAL ENTRIES
-- ============================================================

SELECT
    e.id,
    e.room_id,
    r.name AS room_name,
    e.user_name,
    e.role,
    e.usn_or_dept,
    e.people_count,
    e.purpose,
    e.entry_time,
    e.exit_time,
    e.active
FROM entry_logs e
JOIN rooms r
    ON e.room_id = r.id
WHERE e.active = 1
ORDER BY e.entry_time DESC;


-- ============================================================
-- 12. VERIFY RESERVATIONS
-- ============================================================

SELECT
    p.id,
    p.room_id,
    r.name AS room_name,
    p.user_name,
    p.role,
    p.usn_or_dept,
    p.people_count,
    p.booking_date,
    p.start_time,
    p.end_time,
    p.status,
    p.entry_id,
    p.created_at
FROM reservations p
JOIN rooms r
    ON p.room_id = r.id
ORDER BY
    p.booking_date DESC,
    p.start_time DESC;


-- ============================================================
-- 13. FIND CURRENT / UPCOMING RESERVATIONS
-- ============================================================
-- This query is useful for checking the reservation logic.
-- It uses the MySQL server's current date/time.

SELECT
    p.id,
    p.room_id,
    r.name AS room_name,
    p.user_name,
    p.booking_date,
    p.start_time,
    p.end_time,
    p.status
FROM reservations p
JOIN rooms r
    ON p.room_id = r.id
WHERE p.status IN ('RESERVED', 'ENTERED')
ORDER BY
    p.booking_date,
    p.start_time;


-- ============================================================
-- 14. FIND RESERVATIONS FOR A PARTICULAR ROOM AND DATE
-- ============================================================
-- Example:
-- Replace '2026-10-01' with the required date.

-- SELECT
--     p.*,
--     r.name AS room_name
-- FROM reservations p
-- JOIN rooms r
--     ON p.room_id = r.id
-- WHERE p.room_id = 1
--   AND p.booking_date = '2026-10-01'
--   AND p.status <> 'CANCELLED'
-- ORDER BY p.start_time;


-- ============================================================
-- 15. OVERLAPPING RESERVATION CHECK
-- ============================================================
-- Example:
--
-- Existing booking:
--     15:00 - 16:00
--
-- Requested booking:
--     15:30 - 17:00
--
-- This query detects the conflict.
--
-- Replace the example values as required.

-- SELECT
--     p.*
-- FROM reservations p
-- WHERE p.room_id = 1
--   AND p.booking_date = '2026-10-01'
--   AND p.status IN ('RESERVED', 'ENTERED')
--   AND p.start_time < '17:00:00'
--   AND p.end_time > '15:30:00';


-- ============================================================
-- 16. ROOM OCCUPANCY
-- ============================================================

SELECT
    id,
    name,
    type,
    capacity,
    occupied,
    (capacity - occupied) AS available
FROM rooms
ORDER BY id;


-- ============================================================
-- 17. COMPLETE ENTRY HISTORY
-- ============================================================

SELECT
    e.id,
    r.name AS room_name,
    e.user_name,
    e.role,
    e.usn_or_dept,
    e.team_members,
    e.purpose,
    e.people_count,
    e.entry_time,
    e.exit_time,
    e.active
FROM entry_logs e
JOIN rooms r
    ON e.room_id = r.id
ORDER BY e.entry_time DESC;


-- ============================================================
-- 18. ADMIN DASHBOARD - ROOM SUMMARY
-- ============================================================

SELECT
    COUNT(*) AS total_rooms,
    SUM(CASE WHEN occupied > 0 THEN 1 ELSE 0 END)
        AS occupied_rooms,
    SUM(CASE WHEN occupied = 0 THEN 1 ELSE 0 END)
        AS available_rooms
FROM rooms;


-- ============================================================
-- 19. ADMIN DASHBOARD - TODAY'S ENTRIES
-- ============================================================

SELECT
    COUNT(*) AS today_entries
FROM entry_logs
WHERE DATE(entry_time) = CURDATE();


-- ============================================================
-- 20. ADMIN DASHBOARD - TODAY'S COMPLETED ENTRIES
-- ============================================================

SELECT
    COUNT(*) AS today_completed_entries
FROM entry_logs
WHERE DATE(entry_time) = CURDATE()
  AND active = 0;


-- ============================================================
-- 21. RESET PHYSICAL OCCUPANCY
-- ============================================================
-- USE ONLY DURING DEVELOPMENT / TESTING.
--
-- This does not delete reservations.
-- ============================================================

-- UPDATE rooms
-- SET occupied = 0;


-- ============================================================
-- 22. CLOSE ALL ACTIVE ENTRIES
-- ============================================================
-- USE ONLY WHEN YOU NEED TO RESET TEST DATA.
--
-- This ends all currently active physical room sessions.
-- ============================================================

-- UPDATE entry_logs
-- SET active = 0,
--     exit_time = NOW()
-- WHERE active = 1;


-- ============================================================
-- 23. CANCEL ALL TEST RESERVATIONS
-- ============================================================
-- USE ONLY DURING DEVELOPMENT / TESTING.
-- ============================================================

-- UPDATE reservations
-- SET status = 'CANCELLED'
-- WHERE status = 'RESERVED';


-- ============================================================
-- 24. BACKEND CONNECTION
-- ============================================================
--
-- File:
--
-- backend/src/main/resources/application.properties
--
-- The Spring Boot backend MUST use the same database:
--
-- spring.datasource.url=jdbc:mysql://localhost:3306/community_centre
-- spring.datasource.username=root
-- spring.datasource.password=YOUR_MYSQL_PASSWORD
--
-- Optional:
--
-- spring.jpa.hibernate.ddl-auto=update
-- spring.jpa.show-sql=true
--
-- IMPORTANT:
-- The database name is:
--
--     community_centre
--
-- NOT:
--
--     community_center
--
-- ============================================================


-- ============================================================
-- END OF SVCE CENTREBOOK DATABASE SCHEMA
-- ============================================================