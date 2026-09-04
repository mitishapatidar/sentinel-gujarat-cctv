# GUJARAT POLICE "SENTINEL" CCTV & AI ANPR COMMAND CENTER
### Statewide Heterogeneous CCTV Surveillance, AI ANPR & GIS Pursuit Grid

Built for the **Gujarat Police Hackathon**, **SENTINEL** is a high-density, production-grade surveillance command center engineered to integrate **50+ statewide CCTV feeds** (scalable to 80,000 cameras) across **Police**, **RTO**, and **Civil Supplies** departments with real-time AI Automated Number Plate Recognition (ANPR), typo-tolerant fuzzy matching, and GIS vehicle route reconstruction.

---

## Winning Highlights & System Features

### 1. Central GIS Camera Registry (52 Statewide Nodes)
- **52 accurately geo-referenced camera nodes** across 5 key Gujarat cities and expressway corridors:
  * **Ahmedabad (25 cameras)**: SG Highway (ISCON, Pakwan, Gota, Thaltej), Ashram Road Income Tax, Kalupur Railway Station, Kankaria Lake, Narol, Bopal, Riverfront West & East, Vastrapur, Nikol Toll, etc.
  * **Gandhinagar & GIFT City (10 cameras)**: CH-3 Circle, Infocity IT Towers, Mahatma Mandir, GIFT City WTC Gate, GIFT City Bridge, Sector 11 Central Vista, PDPU Crossroads, etc.
  * **Surat (5 cameras)**: Ring Road Textile Market, Athwa Gate, Kamrej Toll Plaza NH-48, Varachha Diamond Hub, Dumas Beach.
  * **Vadodara (4 cameras)**: Sayaji Ganj, Alkapuri, Golden Toll Plaza NH-48, Manjalpur.
  * **Rajkot (3 cameras)**: Kalawad Road, Yagnik Road, Gondal Highway Post.
  * **Strategic Corridors (5 cameras)**: NE-1 Ahmedabad-Vadodara Expressway Tolls, Dholera SIR Gates 1 & 2, Sanand GIDC Automobile Corridor.
- Cross-department integration: **Police (31 nodes)**, **RTO (12 nodes)**, **Civil Supplies (9 nodes)**.
- Centered on Ahmedabad (`23.0225, 72.5714`) with custom SVG radar markers and real-time pulsing alert halos.

### 2. High-Density Command Center UI (45% / 55% Split Layout)
- **Top Bar**:
  * Title: `SENTINEL | Gujarat State CCTV Command Center`
  * Real-time IST digital clock, live WebSocket feed indicator, active camera counter, and hotlist alert badge counter.
- **Top Left (45% Width - 2x2 Live Video Wall)**:
  * 4 simultaneous live CCTV streams with simulated 30 FPS traffic, vehicle bounding boxes, license scanning reticles, and optical scan lines.
  * Department badges (`Police`, `RTO`, `Civil Supplies`), Camera ID (`CAM-01`), and status tags (`ONLINE`).
  * Live camera paging and department filter dropdown to easily inspect any of the 52 cameras.
- **Top Right (55% Width - Full Interactive Leaflet GIS Map)**:
  * Dark CartoDB Dark Matter map centered at Ahmedabad (`23.0225, 72.5714`).
  * Displays all 52 cameras. When a suspect is sighted, the camera flashes a pulsing red radar ring.
  * Directional red glowing polyline trajectory with numbered waypoint badges connecting sighting checkpoints.
- **Bottom Left - Vehicle Search & Route Reconstruction**:
  * Vehicle search box: `"Enter Plate Number e.g. GJ01AB1234"`.
  * `"Reconstruct Route"` button to draw GIS trajectory with timestamps and confidence scores.
  * Quick-select hotlist targets (`GJ01AB1234`, `GJ27CD5678`, `GJ05EF9012`).
  * `"Add to Watchlist"` modal for field officers to enroll new suspect vehicles (`POST /api/watchlist`).
  * Automated ANPR Test Bench to simulate edge detections.
- **Bottom Right - Live Alert Incident Feed**:
  * Real-time WebSocket incident cards with Plate Number, Crime Type (`Stolen`, `Wanted Suspect`), Camera Location, and Timestamp.
  * Web Audio synthesizer siren alert (no external audio assets required).
  * Direct `"Reconstruct Route"` and `"Focus Camera"` shortcuts on each alert card.

### 3. Real-Time ANPR Engine & Typo-Tolerant Fuzzy Matching
- **`process_frame(frame, camera_id)`**:
  * Returns: `detected_plate`, `bounding_box`, `is_watchlist_match`, `confidence`, `matched_watchlist_entry`.
- **Fuzzy String Matching**:
  * Evaluates plate similarity using normalized Levenshtein distance combined with `difflib.SequenceMatcher`.
  * Flags a match when confidence $\ge 80\%$.
  * Successfully matches OCR character confusions (e.g. `GJ01A81234` with `8` instead of `B` matches `GJ01AB1234` with $90\%$ similarity).
- **Computer Vision Fallback**:
  * `simulate_mock_video_stream()` allows testing and running the complete ANPR pipeline without physical GPU or external camera hardware.
  * OpenCV synthetic surveillance frame generator produces realistic frames with HUD timestamps and scanning reticles.

### 4. Security & Scalability Without Compromise
- **Database Scalability**:
  * SQLite WAL (Write-Ahead Logging) mode enabled for high-concurrency read/writes.
  * Composite database index `idx_plate_timestamp` (`plate_number` + `timestamp`) for instant route lookups across tens of thousands of detections.
- **Security Hardening**:
  * Custom **Security Headers Middleware**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, and strict `Content-Security-Policy`.
  * Strict CORS whitelist for `http://localhost:3000`.
  * Input sanitization and Pydantic validation on all endpoints (malicious XSS/SQL injection payloads rejected with HTTP 422).

---

## Automated Test Verification

Run the test suite:
```powershell
cd "c:\gujrat cctv project\backend"
.\venv\Scripts\python.exe test_full_suite.py
```
**Test Results:**
```
Ran 5 tests in 0.113s
OK
[TEST 1] Registered cameras count: 52 (Police: 31, RTO: 12, Civil Supplies: 9)
[TEST 2] Seeded watchlist plates verified + POST /api/watchlist verified
[TEST 2] Malicious XSS payload rejected with HTTP 422 Unprocessable Entity
[TEST 3] process_frame output verified; fuzzy similarity with OCR typo: 90%
[TEST 4] Trajectory reconstructed: 5 checkpoints across 4+ cameras
[TEST 5] Security headers (CSP, nosniff, DENY) verified
```

---

## Instructions to Run the Application

### 1. Start Backend Server
```powershell
cd "c:\gujrat cctv project\backend"

# Run migrations and seed the 52 cameras & watchlist:
.\venv\Scripts\python.exe seed.py

# Start the FastAPI Server on port 8000:
.\venv\Scripts\python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
- **REST API**: `http://localhost:8000`
- **Interactive Swagger Documentation**: `http://localhost:8000/docs`
- **WebSocket Feed**: `ws://localhost:8000/ws/alerts`

### 2. Start Frontend Dashboard
Open a new PowerShell terminal:
```powershell
cd "c:\gujrat cctv project\frontend"

# Start Next.js Development Server:
npm run dev
```
Open **`http://localhost:3000`** in your browser to view the Command Center!
