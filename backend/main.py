import asyncio
import datetime
import json
import random
import re
import os
import time
import math
import cv2
from typing import List, Optional, Set

from fastapi import FastAPI, Depends, WebSocket, WebSocketDisconnect, HTTPException, Query, Request, Response
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from pydantic import BaseModel, Field, field_validator
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc

from database import get_db, init_db, Camera, Watchlist, Detection, AnomalyAlert, SessionLocal
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
    vendor: Optional[str] = "CP Plus"
    protocol: Optional[str] = "ONVIF Profile T"
    health_status: Optional[str] = "ONLINE"
    fps: Optional[int] = 30
    resolution: Optional[str] = "1080p Full HD"
    last_heartbeat: Optional[datetime.datetime] = None
    tamper_alert: Optional[bool] = False
    recent_alert: bool = False

    class Config:
        from_attributes = True


class CameraHealthSummary(BaseModel):
    total_registered: int
    online_count: int
    tampered_count: int
    offline_count: int
    video_loss_count: int
    uptime_percentage: float
    bandwidth_raw_gbps: float
    bandwidth_edge_mbps: float
    bandwidth_savings_ratio: str
    vendors_distribution: dict
    protocols_distribution: dict


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
    category: Optional[str] = "HOTLIST_VEHICLE"
    details: Optional[str] = None
    action_taken: Optional[str] = None
    status: Optional[str] = "ACTIVE"
    snapshot_url: Optional[str] = None


class AnomalyAlertSchema(BaseModel):
    id: int
    category: str  # 'WRONG_WAY_DRIVING', 'ATM_LOITERING', 'CROWD_SURGE', 'TRAFFIC_VIOLATION'
    title: str
    camera_id: int
    camera_name: Optional[str] = "Field Camera"
    department: Optional[str] = "Police"
    severity: str  # 'CRITICAL', 'HIGH', 'MEDIUM'
    timestamp: datetime.datetime
    target_identifier: str
    details: str
    location_name: str
    city: str
    lat: float
    lng: float
    status: str  # 'ACTIVE', 'DISPATCHED', 'RESOLVED'
    action_taken: str
    snapshot_url: Optional[str] = None


class AnomalySummaryResponse(BaseModel):
    total_active: int
    critical_count: int
    high_count: int
    medium_count: int
    resolved_count: int
    avg_response_time_seconds: int
    by_category: dict


class AnomalyActionRequest(BaseModel):
    anomaly_id: int
    action_type: str  # 'VMS_CAUTION', 'AUDIO_STROBE', 'QRT_MOBILIZE', 'PCR_DISPATCH', 'ECHALLAN_ISSUE', 'RESOLVE'
    officer_badge: Optional[str] = "GP-CID-7809"
    officer_notes: Optional[str] = "Intervention authorized by Command Center Supervisor"


class SimulateDetectionRequest(BaseModel):
    camera_id: Optional[int] = None
    plate_number: Optional[str] = None
    confidence: Optional[float] = None


# -----------------------------------------------------------------------------
# Idea 2: Trail — Forensic Attribute & Plausibility Schemas
# -----------------------------------------------------------------------------
class DetectionAttributeResult(BaseModel):
    id: int
    camera_id: int
    camera_name: str
    city: str
    lat: float
    lng: float
    plate_number: str
    timestamp: datetime.datetime
    confidence: float
    is_alert: bool
    vehicle_color: Optional[str] = "White"
    vehicle_type: Optional[str] = "SUV"
    vehicle_make: Optional[str] = "Hyundai Creta"
    speed_kmh: Optional[float] = 65.0
    heading: Optional[str] = "Northbound"
    snapshot_url: Optional[str] = None


class PlausibilitySegment(BaseModel):
    from_camera_id: int
    from_camera_name: str
    from_city: str
    from_timestamp: datetime.datetime
    to_camera_id: int
    to_camera_name: str
    to_city: str
    to_timestamp: datetime.datetime
    distance_km: float
    duration_minutes: float
    calculated_speed_kmh: float
    is_physically_impossible: bool
    status: str  # 'NORMAL_TRANSIT' | 'EXCESSIVE_SPEED' | 'IMPOSSIBLE_TELEPORTATION'
    anomaly_description: Optional[str] = None


class PlausibilityAnalysisResponse(BaseModel):
    plate_number: str
    vehicle_make: str
    vehicle_color: str
    vehicle_type: str
    total_sightings: int
    plausibility_score: float  # 0.0 to 100.0%
    is_cloned_plate_anomaly: bool
    verdict: str  # 'PLAUSIBLE_SINGLE_TRAJECTORY' | 'CRITICAL_CLONED_PLATE_FRAUD'
    primary_anomaly_reason: Optional[str] = None
    segments: List[PlausibilitySegment]
    sightings: List[DetectionAttributeResult]


class FlagClonedRequest(BaseModel):
    plate_number: str
    reason: str = "Physically impossible multi-city teleportation detected via Road-Graph Plausibility Engine"


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate Great Circle distance between two geo-coordinates in kilometers."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)


# -----------------------------------------------------------------------------
# Idea 3: Edge Triage — Bandwidth Proof & Hardware Topology Schemas
# -----------------------------------------------------------------------------
class EdgeTriageCalculationRequest(BaseModel):
    camera_count: int = Field(80000, ge=1, le=500000)
    raw_bitrate_mbps: float = Field(2.0, ge=0.5, le=20.0)
    edge_metadata_kbps: float = Field(4.0, ge=0.5, le=100.0)
    active_ondemand_streams: int = Field(4, ge=0, le=1000)


class EdgeTriageMetricsResponse(BaseModel):
    camera_count: int
    raw_bandwidth_gbps: float
    edge_metadata_bandwidth_mbps: float
    ondemand_video_bandwidth_mbps: float
    total_edge_bandwidth_mbps: float
    bandwidth_reduction_ratio: str
    bandwidth_saved_percentage: float
    gswan_backbone_capacity_gbps: float
    central_gswan_utilization_percent: float
    edge_gswan_utilization_percent: float
    central_network_status: str
    edge_network_status: str
    edge_appliances_needed_min: int
    edge_appliances_needed_max: int
    hardware_accelerator_profiles: List[dict]
    cost_central_monthly_inr: str
    cost_edge_monthly_inr: str
    cost_savings_inr: str


def compute_edge_triage_metrics(
    camera_count: int = 80000,
    raw_mbps: float = 2.0,
    edge_kbps: float = 4.0,
    ondemand_streams: int = 4
) -> EdgeTriageMetricsResponse:
    # 1. Central Streaming: camera_count * raw_mbps in Gbps
    raw_gbps = round((camera_count * raw_mbps) / 1000.0, 2)

    # 2. SENTINEL Edge Triage: camera_count * edge_kbps in Mbps + ondemand_streams * raw_mbps in Mbps
    edge_meta_mbps = round((camera_count * edge_kbps) / 1000.0, 2)
    ondemand_video_mbps = round(ondemand_streams * raw_mbps, 2)
    total_edge_mbps = round(edge_meta_mbps + ondemand_video_mbps, 2)

    # 3. Ratio & percentage
    raw_total_mbps = camera_count * raw_mbps
    savings_ratio_num = round(raw_total_mbps / max(total_edge_mbps, 0.1), 1)
    savings_pct = round(((raw_total_mbps - total_edge_mbps) / max(raw_total_mbps, 0.1)) * 100.0, 2)

    # 4. GSWAN State WAN Backbone comparison (standard state backbone = 10 Gbps)
    gswan_capacity_gbps = 10.0
    central_util = round((raw_gbps / gswan_capacity_gbps) * 100.0, 1)
    edge_util = round(((total_edge_mbps / 1000.0) / gswan_capacity_gbps) * 100.0, 2)

    # 5. Hardware Nodes Required (8-16 cams per appliance)
    nodes_min = math.ceil(camera_count / 16)
    nodes_max = math.ceil(camera_count / 8)

    # 6. Cost comparison estimates
    central_cost_cr = round((raw_gbps * 0.0887), 2)
    edge_cost_k = round((total_edge_mbps * 26.5), 0)

    hardware_profiles = [
        {
            "accelerator": "NVIDIA Jetson Orin Nano",
            "compute_tops": "40 TOPS INT8",
            "cameras_per_node": "12-16 Cameras @ 1080p 30 FPS",
            "power_draw": "7W - 15W Ultra-Low Power",
            "primary_deployment": "High-Traffic Municipal Junctions & Toll Nakas",
            "models_supported": "YOLOv8s ANPR + ByteTrack + Attribute Extractor"
        },
        {
            "accelerator": "Raspberry Pi 5 + Hailo-8 NPU",
            "compute_tops": "26 TOPS Neural Processing",
            "cameras_per_node": "8-12 Cameras @ 1080p 25 FPS",
            "power_draw": "2.5W NPU / 12W Total System",
            "primary_deployment": "Rural Outposts, Taluka Police Stations, Civil Warehouses",
            "models_supported": "Hailo Model Zoo YOLOV8-M ANPR + License Plate OCR"
        }
    ]

    return EdgeTriageMetricsResponse(
        camera_count=camera_count,
        raw_bandwidth_gbps=raw_gbps,
        edge_metadata_bandwidth_mbps=edge_meta_mbps,
        ondemand_video_bandwidth_mbps=ondemand_video_mbps,
        total_edge_bandwidth_mbps=total_edge_mbps,
        bandwidth_reduction_ratio=f"{int(savings_ratio_num)}x Bandwidth Reduction",
        bandwidth_saved_percentage=savings_pct,
        gswan_backbone_capacity_gbps=gswan_capacity_gbps,
        central_gswan_utilization_percent=central_util,
        edge_gswan_utilization_percent=edge_util,
        central_network_status=f"CRITICAL STATE WAN COLLAPSE ({central_util}% OVERLOAD)",
        edge_network_status=f"OPTIMAL SAFE TRANSIT ({edge_util}% LOAD)",
        edge_appliances_needed_min=nodes_min,
        edge_appliances_needed_max=nodes_max,
        hardware_accelerator_profiles=hardware_profiles,
        cost_central_monthly_inr=f"₹{central_cost_cr} Crore / month",
        cost_edge_monthly_inr=f"₹{int(edge_cost_k):,} / month",
        cost_savings_inr="99.8% Cost Elimination"
    )


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
            vendor=getattr(c, 'vendor', 'CP Plus'),
            protocol=getattr(c, 'protocol', 'ONVIF Profile T'),
            health_status=getattr(c, 'health_status', 'ONLINE'),
            fps=getattr(c, 'fps', 30),
            resolution=getattr(c, 'resolution', '1080p Full HD'),
            last_heartbeat=getattr(c, 'last_heartbeat', None),
            tamper_alert=getattr(c, 'tamper_alert', False),
            recent_alert=(c.id in alerted_cam_ids)
        ))
    return result


@app.get("/api/cameras/health-summary", response_model=CameraHealthSummary)
def get_camera_health_summary(db: Session = Depends(get_db)):
    """
    Returns state-scale CCTV federation audit metrics:
    Uptime, Tamper/Occlusion anomalies, VMS vendor distribution,
    and 80,000-camera Edge Triage bandwidth arithmetic.
    """
    cameras = db.query(Camera).all()
    total = len(cameras)
    online_count = sum(1 for c in cameras if getattr(c, 'health_status', 'ONLINE') == 'ONLINE')
    tampered_count = sum(1 for c in cameras if getattr(c, 'health_status', '') == 'TAMPERED_OCCLUDED')
    offline_count = sum(1 for c in cameras if getattr(c, 'health_status', '') == 'OFFLINE_TIMEOUT')
    video_loss_count = sum(1 for c in cameras if getattr(c, 'health_status', '') == 'VIDEO_LOSS')
    uptime_pct = round((online_count / total * 100) if total > 0 else 98.4, 1)

    vendors_dist = {}
    protocols_dist = {}
    for c in cameras:
        v = getattr(c, 'vendor', 'CP Plus') or 'CP Plus'
        p = getattr(c, 'protocol', 'ONVIF Profile T') or 'ONVIF Profile T'
        vendors_dist[v] = vendors_dist.get(v, 0) + 1
        protocols_dist[p] = protocols_dist.get(p, 0) + 1

    return CameraHealthSummary(
        total_registered=total,
        online_count=online_count,
        tampered_count=tampered_count,
        offline_count=offline_count,
        video_loss_count=video_loss_count,
        uptime_percentage=uptime_pct,
        bandwidth_raw_gbps=160.0,
        bandwidth_edge_mbps=320.0,
        bandwidth_savings_ratio="500x (99.8% saved via Edge Triage)",
        vendors_distribution=vendors_dist,
        protocols_distribution=protocols_dist
    )



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
def get_alerts(
    limit: int = 15,
    category: Optional[str] = Query(None, description="Filter by category"),
    db: Session = Depends(get_db)
):
    """
    Returns latest triggered incident alerts:
    Merges hotlist ANPR hits and multi-modal behavioral anomalies into a single glass pane.
    """
    alerts: List[AlertSchema] = []

    # 1. Hotlist ANPR alerts
    if not category or category.upper() in ["ALL", "HOTLIST_VEHICLE"]:
        detections = (
            db.query(Detection)
            .filter(Detection.is_alert == True)
            .options(joinedload(Detection.camera), joinedload(Detection.matched_watchlist))
            .order_by(desc(Detection.timestamp))
            .limit(limit)
            .all()
        )
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
                similarity=0.95,
                category="HOTLIST_VEHICLE",
                details=f"Identified {d.vehicle_color} {d.vehicle_make} traversing corridor at {d.speed_kmh} km/h",
                action_taken="Track active; downstream checkpoints alerted",
                status="ACTIVE",
                snapshot_url=d.snapshot_url
            ))

    # 2. Behavioral Anomaly alerts
    anom_query = db.query(AnomalyAlert).options(joinedload(AnomalyAlert.camera))
    if category and category.upper() not in ["ALL", "HOTLIST_VEHICLE"]:
        anom_query = anom_query.filter(AnomalyAlert.category.ilike(f"%{category.strip()}%"))

    anomalies = anom_query.order_by(desc(AnomalyAlert.timestamp)).limit(limit).all()
    for a in anomalies:
        cam_name = a.camera.name if a.camera else a.location_name
        dept = a.camera.department if a.camera else "Police"
        alerts.append(AlertSchema(
            id=100000 + a.id,
            camera_id=a.camera_id,
            camera_name=cam_name,
            department=dept,
            lat=a.lat,
            lng=a.lng,
            plate_number=a.target_identifier,
            timestamp=a.timestamp,
            confidence=0.97,
            crime_type=a.title,
            vehicle_model=a.details,
            alert_level=a.severity,
            similarity=0.98,
            category=a.category,
            details=a.details,
            action_taken=a.action_taken,
            status=a.status,
            snapshot_url=a.snapshot_url
        ))

    # Sort merged alerts chronologically descending
    alerts.sort(key=lambda x: x.timestamp, reverse=True)
    return alerts[:limit]


# -----------------------------------------------------------------------------
# Multi-Modal Behavioral Anomaly Detection Endpoints
# -----------------------------------------------------------------------------
@app.get("/api/anomalies", response_model=List[AnomalyAlertSchema])
def get_anomalies(
    category: Optional[str] = Query(None, description="Filter: WRONG_WAY_DRIVING, ATM_LOITERING, CROWD_SURGE, TRAFFIC_VIOLATION"),
    severity: Optional[str] = Query(None, description="Filter: CRITICAL, HIGH, MEDIUM"),
    city: Optional[str] = Query(None, description="Filter by city"),
    status: Optional[str] = Query(None, description="Filter: ACTIVE, DISPATCHED, RESOLVED"),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(AnomalyAlert).options(joinedload(AnomalyAlert.camera))
    if category and category.upper() != "ALL":
        query = query.filter(AnomalyAlert.category.ilike(f"%{category.strip()}%"))
    if severity and severity.upper() != "ALL":
        query = query.filter(AnomalyAlert.severity == severity.upper())
    if city and city.upper() != "ALL":
        query = query.filter(AnomalyAlert.city.ilike(f"%{city.strip()}%"))
    if status and status.upper() != "ALL":
        query = query.filter(AnomalyAlert.status == status.upper())

    anomalies = query.order_by(desc(AnomalyAlert.timestamp)).limit(limit).all()
    results = []
    for a in anomalies:
        cam_name = a.camera.name if a.camera else a.location_name
        dept = a.camera.department if a.camera else "Police"
        results.append(AnomalyAlertSchema(
            id=a.id,
            category=a.category,
            title=a.title,
            camera_id=a.camera_id,
            camera_name=cam_name,
            department=dept,
            severity=a.severity,
            timestamp=a.timestamp,
            target_identifier=a.target_identifier,
            details=a.details,
            location_name=a.location_name,
            city=a.city,
            lat=a.lat,
            lng=a.lng,
            status=a.status,
            action_taken=a.action_taken,
            snapshot_url=a.snapshot_url
        ))
    return results


@app.get("/api/anomalies/summary", response_model=AnomalySummaryResponse)
def get_anomalies_summary(db: Session = Depends(get_db)):
    all_anomalies = db.query(AnomalyAlert).all()
    active_items = [a for a in all_anomalies if a.status != 'RESOLVED']
    critical_count = sum(1 for a in active_items if a.severity == 'CRITICAL')
    high_count = sum(1 for a in active_items if a.severity == 'HIGH')
    medium_count = sum(1 for a in active_items if a.severity == 'MEDIUM')
    resolved_count = sum(1 for a in all_anomalies if a.status == 'RESOLVED')

    by_cat = {
        "WRONG_WAY_DRIVING": sum(1 for a in all_anomalies if a.category == "WRONG_WAY_DRIVING"),
        "ATM_LOITERING": sum(1 for a in all_anomalies if a.category == "ATM_LOITERING"),
        "CROWD_SURGE": sum(1 for a in all_anomalies if a.category == "CROWD_SURGE"),
        "TRAFFIC_VIOLATION": sum(1 for a in all_anomalies if a.category == "TRAFFIC_VIOLATION")
    }

    return AnomalySummaryResponse(
        total_active=len(active_items),
        critical_count=critical_count,
        high_count=high_count,
        medium_count=medium_count,
        resolved_count=resolved_count,
        avg_response_time_seconds=142,
        by_category=by_cat
    )


@app.post("/api/anomalies/dispatch")
def dispatch_anomaly_action(req: AnomalyActionRequest, db: Session = Depends(get_db)):
    anomaly = db.query(AnomalyAlert).filter(AnomalyAlert.id == req.anomaly_id).first()
    if not anomaly:
        raise HTTPException(status_code=404, detail="Anomaly alert not found")

    action_map = {
        "VMS_CAUTION": "Highway Overhead VMS Caution Activated: 'WRONG WAY DETECTED - PROCEED WITH EXTREME CAUTION'",
        "AUDIO_STROBE": "110dB Audio Strobe Alarm & Red Siren Strobe Triggered at ATM Vestibule",
        "QRT_MOBILIZE": "Quick Response Team (QRT) Unit Mobilized with Anti-Riot Gear",
        "PCR_DISPATCH": "Nearest PCR Patrol Unit Dispatched (Priority 1 Tactical Response)",
        "ECHALLAN_ISSUE": "Automated e-Challan Generated & Dispatched to Registered Owner via VAHAN SMS",
        "RESOLVE": "Incident marked Resolved and archived into eGujCop Daily Incident Diary"
    }

    chosen_action = action_map.get(req.action_type, f"Officer Action: {req.action_type}")
    anomaly.action_taken = f"[{req.officer_badge}] {chosen_action} ({req.officer_notes})"
    if req.action_type == "RESOLVE":
        anomaly.status = "RESOLVED"
    else:
        anomaly.status = "DISPATCHED"

    db.commit()
    db.refresh(anomaly)
    return {
        "success": True,
        "anomaly_id": anomaly.id,
        "status": anomaly.status,
        "action_taken": anomaly.action_taken,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }


@app.post("/api/anomalies/resolve")
def resolve_anomaly(req: AnomalyActionRequest, db: Session = Depends(get_db)):
    anomaly = db.query(AnomalyAlert).filter(AnomalyAlert.id == req.anomaly_id).first()
    if not anomaly:
        raise HTTPException(status_code=404, detail="Anomaly alert not found")
    anomaly.status = "RESOLVED"
    anomaly.action_taken = f"[{req.officer_badge}] Incident Closed: {req.officer_notes}"
    db.commit()
    return {"success": True, "anomaly_id": anomaly.id, "status": "RESOLVED"}


# -----------------------------------------------------------------------------
# Idea 2: Trail — Multi-Attribute Search & Road-Graph Plausibility Endpoints
# -----------------------------------------------------------------------------
@app.get("/api/trail/search", response_model=List[DetectionAttributeResult])
def search_trail_detections(
    color: Optional[str] = Query(None, description="Vehicle color (e.g. White, Black, Red)"),
    vehicle_type: Optional[str] = Query(None, description="Body type (e.g. SUV, Sedan, Hatchback, Truck)"),
    make_model: Optional[str] = Query(None, description="Make or Model (e.g. Creta, Swift, Scorpio)"),
    plate_pattern: Optional[str] = Query(None, description="Partial plate or wildcard pattern"),
    city: Optional[str] = Query(None, description="Jurisdiction city"),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Idea 2: Multi-Attribute Forensic Search Engine.
    Filters camera detections across physical vehicle attributes and partial plate patterns.
    """
    query = db.query(Detection).options(joinedload(Detection.camera))

    if color and color.upper() != "ALL":
        query = query.filter(Detection.vehicle_color.ilike(f"%{color.strip()}%"))

    if vehicle_type and vehicle_type.upper() != "ALL":
        query = query.filter(Detection.vehicle_type.ilike(f"%{vehicle_type.strip()}%"))

    if make_model and make_model.upper() != "ALL":
        query = query.filter(Detection.vehicle_make.ilike(f"%{make_model.strip()}%"))

    if plate_pattern and plate_pattern.strip():
        pat = plate_pattern.strip().upper().replace("*", "%").replace("?", "_")
        if not ("%" in pat or "_" in pat):
            pat = f"%{pat}%"
        query = query.filter(Detection.plate_number.like(pat))

    if city and city.upper() != "ALL":
        query = query.join(Camera).filter(Camera.city.ilike(f"%{city.strip()}%"))

    detections = query.order_by(desc(Detection.timestamp)).limit(limit).all()

    results = []
    for d in detections:
        cam_name = d.camera.name if d.camera else "Field Camera"
        cam_city = d.camera.city if d.camera and d.camera.city else "Gujarat"
        lat = d.camera.lat if d.camera else 23.0225
        lng = d.camera.lng if d.camera else 72.5714

        results.append(DetectionAttributeResult(
            id=d.id,
            camera_id=d.camera_id,
            camera_name=cam_name,
            city=cam_city,
            lat=lat,
            lng=lng,
            plate_number=d.plate_number,
            timestamp=d.timestamp,
            confidence=d.confidence,
            is_alert=d.is_alert,
            vehicle_color=d.vehicle_color or "White",
            vehicle_type=d.vehicle_type or "SUV",
            vehicle_make=d.vehicle_make or "Hyundai Creta",
            speed_kmh=d.speed_kmh or 65.0,
            heading=d.heading or "Northbound",
            snapshot_url=d.snapshot_url
        ))

    return results


@app.get("/api/trail/plausibility/{plate_number}", response_model=PlausibilityAnalysisResponse)
def analyze_trajectory_plausibility(plate_number: str, db: Session = Depends(get_db)):
    """
    Idea 2: Road-Graph Physical Plausibility & Cloned Plate Detection Engine.
    Evaluates kinematic trajectory feasibility between camera sightings using Haversine distances & velocities.
    Flags impossible teleportation (speed > 180 km/h or instant inter-city jumps) indicating cloned plates.
    """
    clean_plate = clean_plate_text(plate_number)
    if not clean_plate:
        raise HTTPException(status_code=400, detail="Valid license plate is required")

    detections = (
        db.query(Detection)
        .options(joinedload(Detection.camera))
        .filter(Detection.plate_number == clean_plate)
        .order_by(Detection.timestamp.asc())
        .all()
    )

    if not detections:
        # Fallback to wildcard prefix search if plate not exact
        detections = (
            db.query(Detection)
            .options(joinedload(Detection.camera))
            .filter(Detection.plate_number.like(f"{clean_plate[:6]}%"))
            .order_by(Detection.timestamp.asc())
            .all()
        )

    if not detections:
        raise HTTPException(status_code=404, detail=f"No sightings recorded for vehicle plate {clean_plate}")

    sightings = []
    for d in detections:
        sightings.append(DetectionAttributeResult(
            id=d.id,
            camera_id=d.camera_id,
            camera_name=d.camera.name if d.camera else "Field Camera",
            city=d.camera.city if d.camera and d.camera.city else "Gujarat",
            lat=d.camera.lat if d.camera else 23.0225,
            lng=d.camera.lng if d.camera else 72.5714,
            plate_number=d.plate_number,
            timestamp=d.timestamp,
            confidence=d.confidence,
            is_alert=d.is_alert,
            vehicle_color=d.vehicle_color or "White",
            vehicle_type=d.vehicle_type or "SUV",
            vehicle_make=d.vehicle_make or "Identified Vehicle",
            speed_kmh=d.speed_kmh or 65.0,
            heading=d.heading or "Northbound",
            snapshot_url=d.snapshot_url
        ))

    segments: List[PlausibilitySegment] = []
    is_cloned_plate = False
    primary_anomaly = None
    plausibility_score = 98.5

    for i in range(len(sightings) - 1):
        s1 = sightings[i]
        s2 = sightings[i + 1]

        dist_km = haversine_km(s1.lat, s1.lng, s2.lat, s2.lng)
        time_diff_sec = max(abs((s2.timestamp - s1.timestamp).total_seconds()), 1.0)
        time_diff_mins = round(time_diff_sec / 60.0, 1)
        time_diff_hrs = time_diff_sec / 3600.0

        calculated_speed = round(dist_km / time_diff_hrs, 1) if time_diff_hrs > 0 else 0.0

        is_impossible = False
        status = "NORMAL_TRANSIT"
        anomaly_desc = None

        # Teleportation Anomaly Logic:
        # 1. Calculated transit speed exceeds 180 km/h
        # 2. Inter-city distance > 100 km covered in < 35 minutes
        if calculated_speed > 180.0 or (dist_km > 100.0 and time_diff_mins < 35.0):
            is_impossible = True
            is_cloned_plate = True
            status = "IMPOSSIBLE_TELEPORTATION"
            anomaly_desc = (
                f"PHYSICAL IMPOSSIBILITY: {dist_km} km between {s1.city} ({s1.camera_name}) and {s2.city} ({s2.camera_name}) "
                f"covered in {time_diff_mins} mins (Implied Speed: {calculated_speed} km/h). "
                f"Physically impossible for a single vehicle; indicates duplicate/cloned license plate on multiple chassis."
            )
            if not primary_anomaly:
                primary_anomaly = anomaly_desc
            plausibility_score = min(plausibility_score, 14.0)
        elif calculated_speed > 130.0:
            status = "EXCESSIVE_SPEED"
            anomaly_desc = f"Excessive velocity ({calculated_speed} km/h) recorded on state transit corridor."
            plausibility_score -= 12.0

        segments.append(PlausibilitySegment(
            from_camera_id=s1.camera_id,
            from_camera_name=s1.camera_name,
            from_city=s1.city,
            from_timestamp=s1.timestamp,
            to_camera_id=s2.camera_id,
            to_camera_name=s2.camera_name,
            to_city=s2.city,
            to_timestamp=s2.timestamp,
            distance_km=dist_km,
            duration_minutes=time_diff_mins,
            calculated_speed_kmh=calculated_speed,
            is_physically_impossible=is_impossible,
            status=status,
            anomaly_description=anomaly_desc
        ))

    plausibility_score = max(min(round(plausibility_score, 1), 99.5), 12.0)
    verdict = "CRITICAL_CLONED_PLATE_FRAUD" if is_cloned_plate else "PLAUSIBLE_SINGLE_TRAJECTORY"

    sample_v = sightings[0]
    return PlausibilityAnalysisResponse(
        plate_number=clean_plate,
        vehicle_make=sample_v.vehicle_make or "Identified Vehicle",
        vehicle_color=sample_v.vehicle_color or "White",
        vehicle_type=sample_v.vehicle_type or "SUV",
        total_sightings=len(sightings),
        plausibility_score=plausibility_score,
        is_cloned_plate_anomaly=is_cloned_plate,
        verdict=verdict,
        primary_anomaly_reason=primary_anomaly,
        segments=segments,
        sightings=sightings
    )


@app.post("/api/trail/flag-cloned", status_code=200)
async def flag_cloned_plate(req: FlagClonedRequest, db: Session = Depends(get_db)):
    """
    Action endpoint: Flags a plate as an active Cloned Plate Fraud in CCTNS & Gujarat Police State Watchlist.
    Broadcasts high-priority alert across connected tactical consoles.
    """
    clean_p = clean_plate_text(req.plate_number)
    existing = db.query(Watchlist).filter(Watchlist.plate_number == clean_p).first()
    if existing:
        existing.alert_level = "Critical"
        existing.crime_type = "CLONED PLATE FRAUD - MULTIPLE VEHICLES ACTIVE"
        db.commit()
    else:
        new_wl = Watchlist(
            plate_number=clean_p,
            vehicle_model="Cloned Plate Target",
            crime_type="CLONED PLATE FRAUD - MULTIPLE VEHICLES ACTIVE",
            alert_level="Critical",
            flagged_date=datetime.datetime.now(datetime.timezone.utc)
        )
        db.add(new_wl)
        db.commit()

    if manager.active_connections:
        await manager.broadcast({
            "event": "CLONED_PLATE_ALERT",
            "plate_number": clean_p,
            "reason": req.reason,
            "alert_level": "Critical",
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
        })

    return {
        "status": "FLAGGED",
        "plate_number": clean_p,
        "message": f"License plate {clean_p} has been registered in Gujarat Police CCTNS Hotlist as CLONED PLATE FRAUD."
    }


# -----------------------------------------------------------------------------
# Idea 3: Edge Triage — 80,000 Camera Bandwidth Proof & Calculator Endpoints
# -----------------------------------------------------------------------------
@app.get("/api/edge-triage/metrics", response_model=EdgeTriageMetricsResponse)
def get_edge_triage_metrics(
    camera_count: int = Query(80000, ge=1, le=500000, description="Projected camera grid scale"),
    ondemand_streams: int = Query(4, ge=0, le=1000, description="Active on-demand video wall streams")
):
    """
    Idea 3: Engineering Proof Endpoint.
    Demonstrates mathematical bandwidth reduction (160 Gbps Central vs 320 Mbps Edge)
    and validates GSWAN State WAN resilience.
    """
    return compute_edge_triage_metrics(
        camera_count=camera_count,
        raw_mbps=2.0,
        edge_kbps=4.0,
        ondemand_streams=ondemand_streams
    )


@app.post("/api/edge-triage/calculate", response_model=EdgeTriageMetricsResponse)
def calculate_custom_edge_triage(req: EdgeTriageCalculationRequest):
    """
    Interactive calculator allowing evaluators to simulate arbitrary camera counts,
    stream bitrates, and edge metadata payloads.
    """
    return compute_edge_triage_metrics(
        camera_count=req.camera_count,
        raw_mbps=req.raw_bitrate_mbps,
        edge_kbps=req.edge_metadata_kbps,
        ondemand_streams=req.active_ondemand_streams
    )


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


VIDEO_FEEDS = {
    1: "videos/yt_cam_1.mp4",
    2: "videos/yt_cam_2.mp4",
    3: "videos/yt_cam_3.mp4",
    4: "videos/yt_cam_4.mp4",
}

@app.get("/api/stream/{feed_id}")
async def stream_cctv_feed(feed_id: int, request: Request):
    """
    Continuous 30 FPS MJPEG surveillance stream for browser video wall.
    Streams the downloaded YouTube CCTV feeds with automatic seamless looping.
    """
    rel_path = VIDEO_FEEDS.get(feed_id, "videos/yt_cam_1.mp4")
    video_path = os.path.join(os.path.dirname(__file__), rel_path)
    if not os.path.exists(video_path):
        video_path = os.path.join(os.getcwd(), rel_path)

    async def iter_frames():
        cap = cv2.VideoCapture(video_path)
        try:
            while True:
                if await request.is_disconnected():
                    break
                ret, frame = cap.read()
                if not ret:
                    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                    ret, frame = cap.read()
                    if not ret:
                        break
                h, w = frame.shape[:2]
                if w > 640 or h > 360:
                    frame = cv2.resize(frame, (640, 360))
                _, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 75])
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
                await asyncio.sleep(0.033)
        except (asyncio.CancelledError, GeneratorExit):
            pass
        finally:
            cap.release()

    return StreamingResponse(iter_frames(), media_type="multipart/x-mixed-replace; boundary=frame")


@app.get("/api/video/{feed_id}")
def get_camera_video(feed_id: int):
    """Returns static MP4 file for HTML5 video element."""
    rel_path = VIDEO_FEEDS.get(feed_id, "videos/cam_1_iscon.mp4")
    video_path = os.path.join(os.path.dirname(__file__), rel_path)
    if not os.path.exists(video_path):
        video_path = os.path.join(os.getcwd(), rel_path)
    if not os.path.exists(video_path):
        raise HTTPException(status_code=404, detail="Video file not found")
    return FileResponse(video_path, media_type="video/mp4")


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
                        "DA07CLX": [2, 1, 7],
                        "EY09VWS": [1, 2, 8],
                        "MH46T7527": [3, 4, 14],
                        "MH04EE1980": [7, 8, 2],
                    }

                    # 35% chance of generating a hotlist vehicle sighting along its corridor (excluding forensic demo cases)
                    active_sim_targets = [w for w in watchlist_dicts if w["plate_number"] not in ["GJ01AB1234", "GJ06XX9999"]]
                    if random.random() < 0.35 and active_sim_targets:
                        chosen = random.choice(active_sim_targets)
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

                    vehicle_color = "White"
                    vehicle_type = "Sedan"
                    vehicle_make = "Unknown"
                    if matched_item:
                        vm = matched_item.get("vehicle_model", "")
                        parts = vm.split()
                        if len(parts) >= 2:
                            vehicle_color = parts[0]
                            vehicle_make = " ".join(parts[1:])
                            vehicle_type = "SUV" if any(s in vm for s in ["Scorpio", "Creta", "Fortuner", "SUV"]) else "Sedan"

                    det = Detection(
                        camera_id=cam.id,
                        plate_number=simulated_plate,
                        timestamp=datetime.datetime.now(datetime.timezone.utc),
                        is_alert=is_match,
                        confidence=conf,
                        matched_watchlist_id=matched_item["id"] if is_match and matched_item else None,
                        vehicle_color=vehicle_color,
                        vehicle_type=vehicle_type,
                        vehicle_make=vehicle_make,
                        speed_kmh=round(random.uniform(50.0, 85.0), 1),
                        heading=random.choice(["Northbound", "Southbound", "Eastbound", "Westbound"]),
                        snapshot_url="/snapshots/swift_white.jpg"
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
