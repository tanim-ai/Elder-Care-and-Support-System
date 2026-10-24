# Dev Log: Elder Care and Support System

A simple diary of what I did, what I learned, and what's next.

---

## 2026-10-25

### Done
- Updated my GitHub profile (name and bio)
- Found out the original database was lost (the repo's `caredirect.sql` is only an admins export)
- Decided to redesign the system and database from scratch
- Designed 16 tables: users, residents, guardians, resident_guardians, kitchen_staff, rooms, room_assignments, medical_records, medications, meals, activity_logs, service_categories, invoices, payments, upgrade_requests, emergency_alerts
- Created `caredirect_full.sql` and imported it into phpMyAdmin
- Chose **Node.js** as the new backend (instead of PHP)
- Installed Node.js and cloned the repo with Git
- Created the `backend` folder and installed `express` and `mysql2`

### Learned
- **npm** = Node Package Manager, a tool that downloads ready-made code
- **express** receives requests from pages and sends answers back
- **mysql2** lets Node.js talk to the MySQL database
- phpMyAdmin is only a visual tool, and the backend doesn't depend on it

- **how server.js works**
- The restaurant idea:** the HTML page is the customer, server.js is the waiter, and the database is the storeroom.

- `require(...)` brings in a package (a tool someone else already built)
- `express` lets the server receive requests and send replies
- `mysql2` lets Node.js talk to the MySQL database
- `const app = express()` creates the server (`app`)
- `mysql.createPool({...})` connects to the database (host, user, password, database name)
- `app.get('/plans', ...)` is a **route**: it says what to do when someone visits `/plans`
- `req` = the request coming in, `res` = the reply going out
- `db.query('SELECT ...')` asks the database for data
- `async` / `await` = wait for the database to answer before continuing
- `res.json(rows)` sends the data back as JSON
- `app.listen(3000, ...)` starts the server on port 3000

**The flow:** browser asks `/plans` → server runs the route → database returns rows → server sends them back

**Mistake I made:** I had `require('mysql')` instead of `require('mysql2/promise')`, so Node couldn't find the package. The name must match exactly what I installed.

**Exercise:** add a `/rooms` route (done / not done yet)

### Next
- [ ] Write `server.js` and test `http://localhost:3000/plans`
- [ ] Build the login feature (all 4 portals depend on it)
- [ ] Move the other PHP features to Node.js one at a time

---

## Project plan

**Portals:** Resident, Guardian, Staff (Kitchen), Admin

**Phase 1 (core):** accounts and roles, resident profiles, rooms, medical care, daily care log, meals, billing, emergency SOS, guardian view

**Phase 2 (later):** appointments, medication reminders, visitor log, staff shifts, donations, reports, activities, feedback

**Usability checklist (Shneiderman's 8 Golden Rules):**
1. Consistency
2. Universal usability (large text, high contrast)
3. Informative feedback
4. Dialogs that give closure
5. Error prevention
6. Easy reversal of actions
7. User in control
8. Low memory load

---

## Template for new entries

### YYYY-MM-DD
**Done:**
**Learned:**
**Problems / questions:**
**Next:**
