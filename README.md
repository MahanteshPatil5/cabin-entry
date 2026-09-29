# SVCE CentreBook – Setup & Run Guide

## 1. Project Overview

SVCE CentreBook is a community-centre room management system built with:

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Java + Spring Boot
- **Database:** MySQL
- **Build Tool:** Maven
- **Development Environment:** Visual Studio Code
- **Frontend Server:** VS Code Live Server

The project supports room browsing, room details, check-in/check-out, history, logout, QR functionality, and an Admin Dashboard.

---

# 2. Current Project Structure

The current project structure shown in the project workspace is:

```text
svce-booking/
│
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/
│   │       │       └── communitycentre/
│   │       │           │
│   │       │           ├── admin/
│   │       │           │   ├── controller/
│   │       │           │   ├── model/
│   │       │           │   ├── repository/
│   │       │           │   └── service/
│   │       │           │
│   │       │           ├── config/
│   │       │           ├── controller/
│   │       │           ├── model/
│   │       │           ├── repository/
│   │       │           ├── service/
│   │       │           └── CommunitycentreApplication.java
│   │       │
│   │       └── resources/
│   │
│   ├── target/
│   └── pom.xml
│
├── database/
│   └── schema.sql
│
├── frontend/
│   ├── admin/
│   ├── images/
│   ├── center4.png
│   ├── exterior view (5) - Copy.jpeg
│   ├── history.html
│   ├── index.html
│   ├── logout.html
│   ├── room.html
│   ├── rooms.html
│   ├── svce community center.html
│   └── welcome.html
│
├── excel.py
├── output.xlsx
└── SETUP_GUIDE.md
```

> The exact Java files inside each package can be viewed in the `backend/src/main/java/com/communitycentre/` directory.

---

# 3. Software Requirements

Install the following before running the project.

## 3.1 Java JDK

Java is required for the Spring Boot backend.

Check whether Java is installed:

```bash
java -version
```

Also check the Java compiler:

```bash
javac -version
```

Use the Java version required by the project's `pom.xml`.

If Java is not installed, install a compatible JDK and make sure `JAVA_HOME` is configured correctly.

---

## 3.2 Maven

Maven is required to build and run the Spring Boot backend.

Check Maven:

```bash
mvn -version
```

The command should display:

- Maven version
- Java version
- Java home
- Operating system information

The project contains:

```text
backend/pom.xml
```

which defines the backend dependencies and build configuration.

---

## 3.3 MySQL

MySQL is required for the application database.

Check that MySQL is installed and running.

On Windows, the MySQL service used by this project can normally be started with:

```bash
net start mysql80
```

If the service is already running, Windows may report that it is already started.

---

## 3.4 Visual Studio Code

VS Code is recommended for development.

Useful VS Code extensions:

- Extension Pack for Java
- Spring Boot Extension Pack
- Live Server
- HTML/CSS/JavaScript support

---

## 3.5 Web Browser

Use a modern browser such as:

- Google Chrome
- Microsoft Edge
- Mozilla Firefox

Chrome or Edge is recommended for development and testing.

---

## 3.6 Git

Git is optional for running the project, but recommended for source-code version control.

Check:

```bash
git --version
```

---

# 4. Optional Python Requirement

The project root contains:

```text
excel.py
output.xlsx
```

Python is therefore only required if `excel.py` is used.

Check Python:

```bash
python --version
```

or:

```bash
py --version
```

If `excel.py` uses external Python packages, install the packages required by that script.

The main CentreBook web application does **not** require Python to start the Spring Boot backend unless a separate workflow depends on `excel.py`.

---

# 5. Database Setup

## 5.1 Create the Database

Open MySQL.

You can use MySQL Command Line, MySQL Workbench, or another MySQL client.

Run:

```sql
CREATE DATABASE IF NOT EXISTS community_centre;
```

Select the database:

```sql
USE community_centre;
```

---

## 5.2 Run the Database Schema

The project contains:

```text
database/schema.sql
```

Run the SQL statements from this file inside the `community_centre` database.

If using the MySQL command line:

```sql
USE community_centre;
SOURCE path/to/database/schema.sql;
```

Replace the path with the actual location of your `schema.sql`.

---

# 6. Configure the Backend Database Connection

Open:

```text
backend/src/main/resources/application.properties
```

Configure the MySQL connection used by the project.

A typical configuration looks like:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/community_centre
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

Use the actual username and password configured on your computer.

Do not commit a real production password to GitHub.

---

# 7. Start MySQL

Before starting the backend, start MySQL.

On Windows:

```bash
net start mysql80
```

Confirm that the database is available.

The backend cannot read or save room information if MySQL is stopped.

---

# 8. Start the Spring Boot Backend

Open VS Code or Command Prompt.

Move into the backend directory:

```bash
cd svce-booking\backend
```

Run:

```bash
mvn spring-boot:run
```

Maven will:

1. Read `pom.xml`
2. Download required dependencies
3. Compile the Java source code
4. Start the Spring Boot application

Wait until Spring Boot reports that the application has started.

The backend normally runs on:

```text
http://localhost:8080
```

---

# 9. Build the Backend Without Starting It

To compile the project:

```bash
cd svce-booking\backend
mvn clean package
```

If the build succeeds, Maven will create the compiled application inside:

```text
backend/target/
```

You can also use:

```bash
mvn clean install
```

---

# 10. Start the Frontend

The frontend is made from HTML, CSS, and JavaScript files.

The recommended starting page is:

```text
frontend/welcome.html
```

## Using VS Code Live Server

1. Open the project in VS Code.
2. Open the `frontend` folder.
3. Right-click:

```text
welcome.html
```

4. Select:

```text
Open with Live Server
```

The browser should open a URL similar to:

```text
http://127.0.0.1:5500/welcome.html
```

The exact port may be different if another application is already using port `5500`.

---

# 11. Correct Startup Order

Always use this order:

```text
1. Start MySQL
       ↓
2. Start Spring Boot Backend
       ↓
3. Start Frontend using Live Server
       ↓
4. Open welcome.html
```

In short:

```bash
net start mysql80
```

Then:

```bash
cd svce-booking\backend
mvn spring-boot:run
```

Then open:

```text
frontend/welcome.html
```

with Live Server.

---

# 12. Main Frontend Pages

## welcome.html

Main landing page of CentreBook.

Use this page as the starting point for the application.

---

## rooms.html

Displays the available rooms/spaces and their current room information.

The page communicates with the backend to retrieve room data.

---

## room.html

Displays details for a selected room.

The room page supports the room usage/check-in workflow and checkout.

---

## history.html

Displays room usage/history information.

---

## logout.html

Used for the logout/check-out workflow.

The page supports the relevant user information required to end a room session.

---

## index.html

Contains the application's QR/admin-related entry functionality.

---

## frontend/admin/

Contains the Admin Dashboard frontend files.

The Admin Dashboard is separate from the normal student/professor room workflow.

---

# 13. Backend Structure

The main Java package is:

```text
com.communitycentre
```

The backend is organized into packages for different responsibilities.

## controller/

Contains REST API controllers.

Controllers receive HTTP requests from the frontend and return responses.

---

## service/

Contains application/business logic.

Services sit between controllers and repositories.

---

## repository/

Contains database access interfaces.

Repositories communicate with the database through Spring Data JPA.

---

## model/

Contains Java entity/model classes used by the application.

---

## config/

Contains application configuration classes.

---

## admin/

Contains the Admin Dashboard backend functionality:

```text
admin/
├── controller/
├── model/
├── repository/
└── service/
```

This keeps the admin-specific backend code separated from the main room and entry functionality.

---

# 14. Database

The database used by the application is:

```text
community_centre
```

The database schema is stored in:

```text
database/schema.sql
```

The database stores the information required by the backend, including room and entry-related information.

The exact tables should be taken from the current `schema.sql` file.

---

# 15. Main Application Flow

The normal application flow is:

```text
welcome.html
      │
      ├── Browse Rooms
      │       │
      │       └── rooms.html
      │               │
      │               └── room.html
      │                       │
      │                       ├── Check In
      │                       │
      │                       └── Check Out
      │
      ├── History
      │       │
      │       └── history.html
      │
      ├── Logout
      │       │
      │       └── logout.html
      │
      └── Admin / QR functionality
              │
              └── index.html / frontend/admin/
```

---

# 16. API / Backend Connection

The frontend communicates with the Spring Boot backend.

The backend base URL is normally:

```text
http://localhost:8080
```

The API base path is:

```text
http://localhost:8080/api
```

The frontend JavaScript files should use this backend address when making API requests.

---

# 17. Existing Room APIs

The project setup uses the following core room endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/rooms` | Get all rooms and current room information |
| GET | `/api/rooms/{id}` | Get a specific room |

Example:

```text
http://localhost:8080/api/rooms
```

---

# 18. Entry / Check-In APIs

The core entry workflow uses:

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/entries` | Create a new room entry |
| PUT | `/api/entries/{id}/exit` | End an active entry / checkout |
| GET | `/api/entries/active` | Get active entries |
| GET | `/api/entries/room/{id}` | Get room history |

Example:

```text
POST http://localhost:8080/api/entries
```

Checkout:

```text
PUT http://localhost:8080/api/entries/{id}/exit
```

---

# 19. QR API

Room QR functionality uses:

```text
GET /api/qr/{id}
```

Example:

```text
http://localhost:8080/api/qr/1
```

The exact QR response is determined by the current backend implementation.

---

# 20. Admin Dashboard

The project contains a dedicated backend admin package:

```text
backend/src/main/java/com/communitycentre/admin/
```

and a frontend admin directory:

```text
frontend/admin/
```

The Admin Dashboard provides administrative room information and usage-related statistics according to the current implementation.

The admin API is handled separately from the normal room-entry APIs.

---

# 21. Testing the Backend

After starting Spring Boot, test the backend using the browser or an API testing tool.

Start with:

```text
http://localhost:8080/api/rooms
```

If the endpoint returns room data, the backend is communicating with the database.

Then test a specific room:

```text
http://localhost:8080/api/rooms/1
```

If these requests work, open the frontend with Live Server.

---

# 22. Testing the Complete Application

Follow this sequence:

### Test 1 – Start MySQL

```bash
net start mysql80
```

### Test 2 – Start Backend

```bash
cd svce-booking\backend
mvn spring-boot:run
```

### Test 3 – Test API

Open:

```text
http://localhost:8080/api/rooms
```

### Test 4 – Start Frontend

Open:

```text
frontend/welcome.html
```

using Live Server.

### Test 5 – Browse Rooms

Open the room list and select a room.

### Test 6 – Check In

Enter the required user information and check in.

### Test 7 – Verify Occupancy

Return to the room list and verify that the room status reflects the active entry.

### Test 8 – Check Out / Logout

Use the appropriate checkout/logout functionality.

### Test 9 – Verify Room Availability

After checkout, verify that the room is available again.

### Test 10 – Test History

Open:

```text
history.html
```

and verify the recorded room activity.

### Test 11 – Test Admin

Open the Admin Dashboard and verify that the dashboard data is loading from the backend.

---

# 23. Common Problems and Solutions

## Problem: `mvn` is not recognized

Check Maven:

```bash
mvn -version
```

If Windows cannot find Maven, install Maven and add its `bin` directory to the system `PATH`.

---

## Problem: `java` is not recognized

Check:

```bash
java -version
```

Install a compatible JDK and configure `JAVA_HOME` / `PATH`.

---

## Problem: MySQL connection failed

Check:

```bash
net start mysql80
```

Then verify:

```text
Database: community_centre
Username: your MySQL username
Password: your MySQL password
Port: 3306
```

Also check:

```text
backend/src/main/resources/application.properties
```

---

## Problem: `mvn spring-boot:run` fails

Run:

```bash
mvn clean
```

Then:

```bash
mvn clean package
```

Read the first actual compilation/configuration error in the terminal.

Do not rely only on the final Maven error line.

---

## Problem: Frontend shows no room data

Check all three:

```text
1. MySQL is running
2. Spring Boot is running
3. Live Server is running
```

Then open:

```text
http://localhost:8080/api/rooms
```

If the API does not return data, fix the backend/database connection first.

---

## Problem: CORS error

If the browser reports a CORS error, check the project's:

```text
backend/src/main/java/com/communitycentre/config/
```

configuration.

The project already contains an `AppConfig.java` configuration file according to the current project structure.

---

## Problem: Port 8080 is already in use

Check which process is using port 8080.

On Windows:

```bash
netstat -ano | findstr :8080
```

Stop the conflicting process if appropriate, or configure the Spring Boot application to use another port.

If the backend port changes, update the frontend API URL accordingly.

---

## Problem: Live Server does not open

Install the VS Code:

```text
Live Server
```

extension.

Then right-click:

```text
frontend/welcome.html
```

and select:

```text
Open with Live Server
```

---

# 24. Development Rules

When modifying this project:

### Backend changes

Java backend code belongs under:

```text
backend/src/main/java/com/communitycentre/
```

### Database changes

SQL changes belong in:

```text
database/schema.sql
```

### Frontend changes

HTML/CSS/JavaScript changes belong under:

```text
frontend/
```

### Admin changes

Admin backend code:

```text
backend/src/main/java/com/communitycentre/admin/
```

Admin frontend code:

```text
frontend/admin/
```

---

# 25. Before Adding a New Feature

For a new feature, check which layer needs to change.

```text
Frontend UI
    ↓
Controller
    ↓
Service
    ↓
Repository
    ↓
Model / Database
```

For example, a feature that stores new data may require:

```text
HTML/JavaScript
      ↓
REST Controller
      ↓
Service
      ↓
Repository
      ↓
Entity/Model
      ↓
MySQL table
```

Do not put database logic directly inside frontend JavaScript.

---

# 26. Project URLs

## Frontend

Normally:

```text
http://127.0.0.1:5500/welcome.html
```

## Backend

Normally:

```text
http://localhost:8080
```

## API

Normally:

```text
http://localhost:8080/api
```

## Room API

```text
http://localhost:8080/api/rooms
```

---

# 27. Quick Start – Copy and Run

If the project has already been configured once, the normal startup procedure is simply:

### Terminal 1 – MySQL

```bash
net start mysql80
```

### Terminal 2 – Backend

```bash
cd svce-booking\backend
mvn spring-boot:run
```

### VS Code

Open:

```text
frontend/welcome.html
```

Right-click:

```text
Open with Live Server
```

Then open:

```text
http://127.0.0.1:5500/welcome.html
```

---

# 28. Shutdown

When finished testing:

### Stop Spring Boot

In the backend terminal press:

```text
Ctrl + C
```

### Stop Live Server

Close the browser or stop Live Server from VS Code.

### MySQL

MySQL can remain running, or it can be stopped when no longer required.

To stop the MySQL service:

```bash
net stop mysql80
```

---

# 29. Final Startup Checklist

Before starting CentreBook, verify:

```text
[ ] Java JDK installed
[ ] Maven installed
[ ] MySQL installed
[ ] VS Code installed
[ ] Live Server extension installed
[ ] community_centre database created
[ ] database/schema.sql applied
[ ] application.properties configured
[ ] MySQL service running
[ ] Spring Boot backend running
[ ] Backend API responding
[ ] Live Server running
[ ] welcome.html opened
```

---

# 30. SVCE CentreBook – System Overview

```text
                         SVCE CENTREBOOK
                               │
                ┌──────────────┼──────────────┐
                │              │              │
             FRONTEND       BACKEND        DATABASE
                │              │              │
          HTML/CSS/JS      Spring Boot      MySQL
                │              │              │
        ┌───────┼───────┐      │              │
        │       │       │      │              │
      Rooms   Room    Admin    │              │
              Entry            │              │
        │       │       │      │              │
        └───────┴───────┴──────┘              │
                        │                      │
                        └──── REST API ────────┘
```

---

# 31. Important Notes

- Start **MySQL before the Spring Boot backend**.
- Start the **backend before testing frontend features that use the database**.
- Use `welcome.html` as the normal frontend starting point.
- Use Live Server instead of opening HTML files directly with `file://`.
- Keep the MySQL password in `application.properties` private.
- If the frontend cannot load data, test the backend API first.
- If the backend cannot start, check the Maven error and database configuration first.
- The `target/` directory is generated by Maven and normally does not need to be edited manually.
- `output.xlsx` is an output file and is not required for the normal Spring Boot + frontend startup.
- `excel.py` is only required for the separate Python/Excel workflow.

---

# 32. Normal Development Workflow

Use this workflow whenever you work on the project:

```text
Open VS Code
    ↓
Open svce-booking
    ↓
Start MySQL
    ↓
Start Spring Boot
    ↓
Test /api/rooms
    ↓
Start Live Server
    ↓
Open welcome.html
    ↓
Test the feature
    ↓
Check browser console
    ↓
Check Spring Boot terminal
    ↓
Check MySQL data if required
```

This is the recommended development and testing sequence for the current SVCE CentreBook project.
