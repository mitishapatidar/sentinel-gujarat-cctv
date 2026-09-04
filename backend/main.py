import asyncio
import datetime
import json
import random
import re
from typing import List, Optional, Set

from fastapi import FastAPI, Depends, WebSocket, WebSocketDisconnect, HTTPException, Query, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from pydantic import BaseModel, Field, field_validator
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc

from database import get_db, init_db, Camera, Watchlist, Detection, SessionLocal
from anpr_engine import (
    clean_plate_text, 
    match_against_watchlist, 
    generate_synthetic_plate_frame,
    process_frame,
    simulate_mock_video_stream
)

# -----------------------------------------------------------------------------
# Security Middleware: Protection against XSS, Clickjacking, MIME-sniffing
# -----------------------------------------------------------------------------
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none';"
        return response

app = FastAPI(
    title="Gujarat Police SENTINEL CCTV Unified Platform API",
    description="Scalable, heterogeneous CCTV & AI ANPR Command Grid for Gujarat State Police",
    version="2.0.0"
)

# Apply Security Headers
app.add_middleware(SecurityHeadersMiddleware)

# CORS configuration - strict whitelist for localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# -----------------------------------------------------------------------------
# WebSocket Connection Manager with heartbeat and graceful cleanup
# -----------------------------------------------------------------------------
class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)

    async def broadcast(self, message: dict):
        dead_connections = set()
        for connection in list(self.active_connections):
            try:
                await connection.send_text(json.dumps(message))
            except Exception:
                dead_connections.add(connection)
        for dead in dead_connections:
            self.active_connections.discard(dead)

manager = ConnectionManager()

# -----------------------------------------------------------------------------
# Pydantic Schemas with Strict Security Validation
# -----------------------------------------------------------------------------
class CameraSchema(BaseModel):
    id: int
    name: str
    department: str
    lat: float
    lng: float
    stream_url: str
    status: str
    city: Optional[str] = "Ahmedabad"
    recent_alert: bool = False

    class Config:
        from_attributes = True


class WatchlistSchema(BaseModel):
    id: int
    plate_number: str
    vehicle_model: str
    crime_type: str
    alert_level: str
    flagged_date: datetime.datetime

    class Config:
        from_attributes = True


class WatchlistCreate(BaseModel):
    plate_number: str = Field(..., min_length=4, max_length=15, description="Vehicle registration plate")
    vehicle_model: str = Field(..., min_length=2, max_length=100)
    crime_type: str = Field("Wanted Suspect", min_length=2, max_length=100)
    alert_level: str = Field("Critical", pattern="^(Critical|High|Medium)$")

    @field_validator("plate_number")
    def validate_and_clean_plate(cls, v: str) -> str:
        # Sanitize against SQL injection / XSS characters
        cleaned = clean_plate_text(v)
        if len(cleaned) < 4 or not re.match(r'^[A-Z0-9]+$', cleaned):
            raise ValueError("Invalid license plate format. Only alphanumeric characters allowed.")
        return cleaned


class TrajectoryPoint(BaseModel):
    detection_id: int
    camera_id: int
    camera_name: str
    department: str
    lat: float
    lng: float
    plate_number: str
    timestamp: datetime.datetime
    confidence: float
    is_alert: bool


class AlertSchema(BaseModel):
    id: int
    camera_id: int
    camera_name: str
    department: str
    lat: float
    lng: float
    plate_number: str
    timestamp: datetime.datetime
    confidence: float
    crime_type: Optional[str] = None
    vehicle_model: Optional[str] = None
    alert_level: Optional[str] = None
    similarity: Optional[float] = None


class SimulateDetectionRequest(BaseModel):
    camera_id: Optional[int] = None
    plate_number: Optional[str] = None
    confidence: Optional[float] = None


# -----------------------------------------------------------------------------
# App Lifespan & Background Worker
# -----------------------------------------------------------------------------
@app.on_event("startup")
async def startup_event():
    init_db()
    asyncio.create_task(periodic_simulation_loop())


# -----------------------------------------------------------------------------
# REST Endpoints
# -----------------------------------------------------------------------------
@app.get("/")
def read_root():
    return {
        "system": "SENTINEL | Gujarat State CCTV Command Center",
        "status": "OPERATIONAL",
        "supported_cameras": "50+ Statewide Feeds",
        "jurisdiction": "Ahmedabad, Gandhinagar, Surat, Vadodara, Rajkot",
        "security": "Enforced (Strict CORS, CSP, Input Sanitization, WAL Concurrency)"
    }


@app.get("/api/cameras", response_model=List[CameraSchema])
def get_cameras(
    department: Optional[str] = Query(None, description="Filter by Police, RTO, Civil Supplies"),
    city: Optional[str] = Query(None, description="Filter by city"),
    status: Optional[str] = Query(None, description="Filter by online/offline"),
    db: Session = Depends(get_db)
):
    """
    Returns all registered cameras with current status and geo-coordinates.
    Supports filtering across 50+ statewide feeds.
    """
    query = db.query(Camera)
    if department:
        query = query.filter(Camera.department.ilike(department))
    if city:
        query = query.filter(Camera.city.ilike(city))
    if status:
        query = query.filter(Camera.status == status)

    cameras = query.all()

    # Determine which cameras triggered an alert in the last 60 minutes
    recent_window = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(minutes=60)
    alerted_cam_ids = set(
        det.camera_id for det in db.query(Detection.camera_id)
        .filter(Detection.is_alert == True, Detection.timestamp >= recent_window)
        .all()
    )

    result = []
    for c in cameras:
        result.append(CameraSchema(
            id=c.id,
            name=c.name,
            department=c.department,
            lat=c.lat,
            lng=c.lng,
            stream_url=c.stream_url,
            status=c.status,
            city=c.city,
            recent_alert=(c.id in alerted_cam_ids)
        ))
    return result


@app.get("/api/watchlist", response_model=List[WatchlistSchema])
def get_watchlist(db: Session = Depends(get_db)):
    """Returns all active watchlist suspect vehicles."""
    return db.query(Watchlist).order_by(Watchlist.id.asc()).all()


@app.post("/api/watchlist", response_model=WatchlistSchema, status_code=201)
def add_to_watchlist(payload: WatchlistCreate, db: Session = Depends(get_db)):
    """
    Add a new suspect license plate to the Gujarat Police Watchlist.
    Includes input sanitization, format validation, and duplicate prevention.
    """
    existing = db.query(Watchlist).filter(Watchlist.plate_number == payload.plate_number).first()
    if existing:
        raise HTTPException(status_code=409, detail=f"Plate {payload.plate_number} is already in the active Watchlist.")

    new_entry = Watchlist(
        plate_number=payload.plate_number,
        vehicle_model=payload.vehicle_model.strip(),
        crime_type=payload.crime_type.strip(),
        alert_level=payload.alert_level,
        flagged_date=datetime.datetime.now(datetime.timezone.utc)
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return new_entry


@app.get("/api/track/{plate_number}", response_model=List[TrajectoryPoint])
def get_vehicle_trajectory(plate_number: str, db: Session = Depends(get_db)):
    """
    Returns chronological movement history for that plate (camera names, lat/lng coordinates, timestamps)
    sorted by time to plot a GIS route.
    """
    clean_search = clean_plate_text(plate_number)
    if not clean_search:
        return []

    # High performance index-backed lookup
    detections = (
        db.query(Detection)
        .options(joinedload(Detection.camera))
        .filter(Detection.plate_number == clean_search)
        .order_by(Detection.timestamp.asc())
        .all()
    )

    # Fallback to fuzzy startswith prefix if exact match count < 1
    if not detections and len(clean_search) >= 6:
        detections = (
            db.query(Detection)
            .options(joinedload(Detection.camera))
            .filter(Detection.plate_number.like(f"{clean_search[:6]}%"))
            .order_by(Detection.timestamp.asc())
            .all()
        )

    trajectory = []
    last_cam_id = None
    for det in detections:
        if det.camera and det.camera.id != last_cam_id:
            last_cam_id = det.camera.id
            trajectory.append(TrajectoryPoint(
                detection_id=det.id,
                camera_id=det.camera.id,
                camera_name=det.camera.name,
                department=det.camera.department,
                lat=det.camera.lat,
                lng=det.camera.lng,
                plate_number=det.plate_number,
                timestamp=det.timestamp,
                confidence=det.confidence,
                is_alert=det.is_alert
            ))

    return trajectory


@app.get("/api/alerts", response_model=List[AlertSchema])
def get_alerts(limit: int = 10, db: Session = Depends(get_db)):
    """Returns latest triggered incident alerts (default: 10 incidents)."""
    detections = (
        db.query(Detection)
        .filter(Detection.is_alert == True)
        .options(joinedload(Detection.camera), joinedload(Detection.matched_watchlist))
        .order_by(desc(Detection.timestamp))
        .limit(max(1, min(limit, 50)))
        .all()
    )

    alerts = []
    for d in detections:
        alerts.append(AlertSchema(
            id=d.id,
            camera_id=d.camera_id,
            camera_name=d.camera.name if d.camera else "Field Camera",
            department=d.camera.department if d.camera else "Police",
            lat=d.camera.lat if d.camera else 23.0225,
            lng=d.camera.lng if d.camera else 72.5714,
            plate_number=d.plate_number,
            timestamp=d.timestamp,
            confidence=d.confidence,
            crime_type=d.matched_watchlist.crime_type if d.matched_watchlist else "Stolen / Suspect",
            vehicle_model=d.matched_watchlist.vehicle_model if d.matched_watchlist else "Identified Vehicle",
            alert_level=d.matched_watchlist.alert_level if d.matched_watchlist else "Critical",
            similarity=0.95
        ))
    return alerts


@app.post("/api/simulate-detection")
async def simulate_detection(req: SimulateDetectionRequest, db: Session = Depends(get_db)):
    """
    Simulates a live ANPR detection on any camera.
    Runs the ANPR fuzzy matching engine against the active Watchlist.
    If match confidence >= 80%, flags an alert and broadcasts via WebSocket.
    """
    cameras = db.query(Camera).all()
    if not cameras:
        raise HTTPException(status_code=400, detail="No registered cameras found")

    camera = None
    if req.camera_id:
        camera = db.query(Camera).filter(Camera.id == req.camera_id).first()
    if not camera:
        camera = random.choice(cameras)

    # Fetch watchlist
    watchlist_records = db.query(Watchlist).all()
    watchlist_dicts = [
        {
            "id": w.id,
            "plate_number": w.plate_number,
            "vehicle_model": w.vehicle_model,
            "crime_type": w.crime_type,
            "alert_level": w.alert_level
        }
        for w in watchlist_records
    ]

    # Process plate
    if req.plate_number:
        plate = clean_plate_text(req.plate_number)
    else:
        # 65% chance of picking a watchlist car or slight OCR typo
        if random.random() < 0.65 and watchlist_dicts:
            target = random.choice(watchlist_dicts)
            raw = target["plate_number"]
            # 30% chance of OCR typo (e.g. '8' for 'B')
            if random.random() < 0.30:
                plate = raw.replace("B", "8", 1) if "B" in raw else f"{raw[:-1]}4"
            else:
                plate = raw
        else:
            plate = f"GJ01{chr(random.randint(65, 90))}{chr(random.randint(65, 90))}{random.randint(1000, 9999)}"

    # Run ANPR processing
    anpr_result = process_frame(None, camera.id, watchlist_dicts)
    is_match, matched_entry, sim = match_against_watchlist(plate, watchlist_dicts, threshold=0.80)

    conf = req.confidence or anpr_result["confidence"]

    # Persist in DB
    det = Detection(
        camera_id=camera.id,
        plate_number=plate,
        timestamp=datetime.datetime.now(datetime.timezone.utc),
        is_alert=is_match,
        confidence=conf,
        matched_watchlist_id=matched_entry["id"] if is_match and matched_entry else None
    )
    db.add(det)
    db.commit()
    db.refresh(det)

    snapshot_data_uri = generate_synthetic_plate_frame(plate, camera.name)

    payload = {
        "event": "HOTLIST_ALERT" if is_match else "DETECTION_PROCESSED",
        "detection_id": det.id,
        "camera_id": camera.id,
        "camera_name": camera.name,
        "department": camera.department,
        "lat": camera.lat,
        "lng": camera.lng,
        "plate_number": plate,
        "confidence": conf,
        "is_alert": is_match,
        "similarity": sim,
        "timestamp": det.timestamp.isoformat(),
        "snapshot": snapshot_data_uri,
        "matched_watchlist": matched_entry if is_match else None
    }

    if is_match:
        await manager.broadcast(payload)

    return payload


@app.get("/api/camera-snapshot/{camera_id}")
def get_camera_snapshot(camera_id: int, db: Session = Depends(get_db)):
    """Generate high-resolution synthetic OpenCV preview frame for any camera."""
    camera = db.query(Camera).filter(Camera.id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")

    recent_det = (
        db.query(Detection)
        .filter(Detection.camera_id == camera_id)
        .order_by(desc(Detection.timestamp))
        .first()
    )
    plate_text = recent_det.plate_number if recent_det else "GJ01AB1234"
    frame_uri = generate_synthetic_plate_frame(plate_text, camera.name)
    return {"camera_id": camera_id, "camera_name": camera.name, "snapshot": frame_uri}


@app.websocket("/ws/alerts")
async def websocket_alerts_endpoint(websocket: WebSocket):
    """
    Broadcasts real-time detection events and red-alert triggers to connected frontend clients.
    """
    await manager.connect(websocket)
    try:
        await websocket.send_text(json.dumps({
            "event": "CONNECTION_ESTABLISHED",
            "message": "Connected to SENTINEL Gujarat Real-Time Command Stream",
            "server_time": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }))
        while True:
            # Keep-alive receive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)


async def periodic_simulation_loop():
    """
    Scalable background worker generating real-time traffic detection events
    across the 50+ camera grid.
    """
    await asyncio.sleep(5)
    while True:
        try:
            await asyncio.sleep(random.randint(12, 20))
            db = SessionLocal()
            try:
                cameras = db.query(Camera).all()
                watchlist_records = db.query(Watchlist).all()
                if cameras and watchlist_records:
                    watchlist_dicts = [
                        {
                            "id": w.id,
                            "plate_number": w.plate_number,
                            "vehicle_model": w.vehicle_model,
                            "crime_type": w.crime_type,
                            "alert_level": w.alert_level
                        }
                        for w in watchlist_records
                    ]

                    # Realistic highway corridors for each target
                    SUSPECT_CORRIDORS = {
                        "GJ01AB1234": [4, 3, 2, 7, 27],
                        "GJ06XX9999": [19, 2, 8, 7, 29],
                        "GJ27CD5678": [6, 10, 16],
                        "GJ05EF9012": [40, 41, 42],
                    }

                    # 35% chance of generating a hotlist vehicle sighting along its corridor
                    if random.random() < 0.35:
                        chosen = random.choice(watchlist_dicts)
                        raw_plate = chosen["plate_number"]
                        corridor_cam_ids = SUSPECT_CORRIDORS.get(raw_plate, [c.id for c in cameras])
                        cam_id = random.choice(corridor_cam_ids)
                        cam = next((c for c in cameras if c.id == cam_id), random.choice(cameras))
                        simulated_plate = raw_plate
                    else:
                        cam = random.choice(cameras)
                        simulated_plate = f"GJ0{random.randint(1, 9)}{chr(random.randint(65, 90))}{chr(random.randint(65, 90))}{random.randint(1000, 9999)}"

                    is_match, matched_item, similarity = match_against_watchlist(simulated_plate, watchlist_dicts, threshold=0.80)
                    conf = round(random.uniform(0.92, 0.99), 2)

                    det = Detection(
                        camera_id=cam.id,
                        plate_number=simulated_plate,
                        timestamp=datetime.datetime.now(datetime.timezone.utc),
                        is_alert=is_match,
                        confidence=conf,
                        matched_watchlist_id=matched_item["id"] if is_match and matched_item else None
                    )
                    db.add(det)
                    db.commit()

                    if is_match and manager.active_connections:
                        snapshot = generate_synthetic_plate_frame(simulated_plate, cam.name)
                        await manager.broadcast({
                            "event": "HOTLIST_ALERT",
                            "detection_id": det.id,
                            "camera_id": cam.id,
                            "camera_name": cam.name,
                            "department": cam.department,
                            "lat": cam.lat,
                            "lng": cam.lng,
                            "plate_number": simulated_plate,
                            "confidence": conf,
                            "is_alert": True,
                            "similarity": similarity,
                            "timestamp": det.timestamp.isoformat(),
                            "snapshot": snapshot,
                            "matched_watchlist": matched_item
                        })
            finally:
                db.close()
        except asyncio.CancelledError:
            break
        except Exception as e:
            print(f"[SIMULATOR] Notice: {e}")
            await asyncio.sleep(5)
