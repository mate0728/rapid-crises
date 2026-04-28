# 🛡️ CrisisNexus — Rapid Crisis Response Platform
### National Hackathon Edition | Hospitality Emergency Coordination System

---

## 🚨 Problem Statement
Hospitality venues face unpredictable, high-stakes emergencies that demand instantaneous, coordinated reactions. Critical information is often siloed, fracturing communication between distressed guests, on-site staff, and first responders.

## ✅ Our Solution
**CrisisNexus** is a real-time, full-stack emergency response platform that:
- **Instantly detects and broadcasts** emergency alerts via one-click SOS
- **Synchronizes all response units** live over WebSocket
- **Geospatially tracks** incidents on an interactive live map
- **Eliminates siloed communication** with a dedicated crisis comms channel
- **Provides actionable dashboards** for command-center personnel

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    CrisisNexus Platform                    │
├─────────────────────┬──────────────────────────────────────┤
│   Frontend (HTML5)  │         Backend (Node.js)            │
│  ─────────────────  │  ──────────────────────────────────  │
│  Command Center     │  Express REST API (:5000)            │
│  SOS Broadcast      │  Socket.IO WebSocket Server          │
│  Alert Logs         │  NeDB File-based Database            │
│  Live Topography    │  Rate Limiting + Helmet Security     │
│  Response Units     │  Auto-seed Demo Data                 │
│  Crisis Comms       │                                      │
│  System Config      │  /api/alerts  (CRUD + stats)         │
│                     │  /api/personnel (CRUD)               │
│                     │  /api/health                         │
└─────────────────────┴──────────────────────────────────────┘
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js v16+ 
- npm

### 1. Install & Run
```bash
cd backend
npm install
npm start
```

### 2. Open Browser
```
http://localhost:5000
```
That's it. No external database required — NeDB stores data locally in `/data/`.

### 3. Alternative: Use the startup script
```bash
# Linux/Mac
chmod +x start.sh && ./start.sh

# Windows
start.bat
```

---

## 🗂️ Project Structure

```
rapid-crisis-nexus/
├── backend/
│   ├── server.js              ← Express + Socket.IO entry point
│   ├── config/
│   │   ├── db.js              ← NeDB database initializer
│   │   └── seed.js            ← Auto-seeds 8 demo personnel
│   ├── models/
│   │   ├── Alert.js           ← Alert CRUD with timeline tracking
│   │   └── Personnel.js       ← Personnel CRUD
│   ├── controllers/
│   │   ├── alertController.js
│   │   └── personnelController.js
│   ├── routes/
│   │   ├── alertRoutes.js
│   │   └── personnelRoutes.js
│   └── package.json
├── frontend/
│   ├── admin.html             ← Command Center dashboard
│   ├── sos.html               ← SOS Emergency Broadcast
│   ├── alerts.html            ← Alert Logs + filtering + export
│   ├── map.html               ← Live Geospatial Topography (Leaflet)
│   ├── personnel.html         ← Response Units management
│   ├── comms.html             ← Crisis Communications channel
│   ├── settings.html          ← System configuration
│   ├── sidebar.js             ← Shared navigation + Socket.IO client
│   └── style.css              ← Complete dark-theme UI system
├── data/                      ← Auto-created; NeDB .db files
├── start.sh                   ← Linux/Mac startup script
├── start.bat                  ← Windows startup script
└── README.md
```

---

## 🔌 REST API Reference

### Alerts

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/alerts` | List all alerts (filter: `?status=ACTIVE&type=Fire&severity=Critical`) |
| `POST` | `/api/alerts` | Create new alert |
| `GET` | `/api/alerts/stats` | Dashboard statistics + breakdown |
| `GET` | `/api/alerts/:id` | Get single alert |
| `PATCH` | `/api/alerts/:id` | Update status/assign personnel |
| `DELETE` | `/api/alerts/:id` | Delete alert |

### Personnel

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/personnel` | List all personnel (filter: `?status=Available&role=Medical`) |
| `POST` | `/api/personnel` | Add personnel |
| `PATCH` | `/api/personnel/:id` | Update status/zone |
| `DELETE` | `/api/personnel/:id` | Remove personnel |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server health, uptime, connected clients |

---

## 📡 WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `alert:new` | Server → All | New alert broadcasted |
| `alert:critical` | Server → All | Critical/High alert pulse |
| `alert:updated` | Server → All | Alert status changed |
| `alert:resolved` | Server → All | Alert resolved |
| `alert:deleted` | Server → All | Alert removed |
| `personnel:updated` | Server → All | Personnel record changed |
| `comms:message` | Bidirectional | Crisis comms channel message |
| `personnel:location` | Client → Others | Live location update |
| `system:clients` | Server → All | Connected client count |

---

## 🎯 Key Features

### 1. Command Center Dashboard
- Real-time stats: active, responding, resolved incidents
- Live alert feed with auto-refresh
- Incident type breakdown with progress bars
- Quick dispatch panel showing available units
- System health monitoring

### 2. SOS Broadcast
- One-click emergency alert with GPS coordinate capture
- Severity-coded broadcasts (Critical/High/Medium/Low)
- Auto-alerting via WebSocket to all connected screens
- Audio alert for Critical severity (Web Audio API)
- Immutable incident timeline with audit trail

### 3. Alert Logs
- Full filterable history (type, severity, status, search)
- CSV export for post-incident reports
- Timeline viewer per incident
- One-click status escalation (ACTIVE → RESPONDING → CONTAINED → RESOLVED)

### 4. Live Topography
- Dark-themed interactive map (Leaflet + CartoDB)
- Color-coded markers by severity
- Pulsing animation for Critical active incidents
- Auto-fit bounds across all incidents
- Click markers for popup incident details

### 5. Response Units
- Full CRUD for personnel management
- Role-based icons and color coding
- Quick status dropdown (Available/Busy/En Route/Off Duty)
- Zone and contact management
- Live Socket.IO sync across terminals

### 6. Crisis Comms
- Multi-channel radio simulation (All/Fire/Medical/Security/Command)
- Quick broadcast buttons (Evacuation, Fire Dispatch, Medical, Lockdown, All Clear)
- Auto-posts incoming alerts to the channel
- Click available units to hail them directly

---

## 🔒 Security Features
- **Helmet.js** — HTTP security headers
- **CORS** — Cross-origin control
- **Rate Limiting** — 300 req/min per IP
- **Input validation** — All routes validated
- **Error isolation** — Global error handler, no stack leaks

---

## 🚀 Differentiators vs Existing Solutions

| Feature | CrisisNexus | Typical Systems |
|---------|-------------|-----------------|
| Zero-config DB | ✅ NeDB (file-based) | ❌ Requires MongoDB/PostgreSQL setup |
| Real-time sync | ✅ Socket.IO WebSocket | ❌ Polling-based |
| Geospatial map | ✅ Live incident markers | ❌ Static floor plans |
| Audio alerts | ✅ Web Audio API | ❌ None |
| Timeline audit | ✅ Every status change logged | ❌ Basic logging |
| GPS capture | ✅ Auto geolocation | ❌ Manual entry |
| CSV export | ✅ One-click | ❌ Manual |
| Dark-theme UI | ✅ Tactical ops aesthetic | ❌ Generic admin panels |

---

## 👥 Team
Built for the **Rapid Crisis Response Hackathon** — Hospitality Emergency Coordination track.

> *"Every second counts. CrisisNexus eliminates the seconds."*
