import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

DATABASE_URL = "sqlite:///./sentinel.db"

# Scalable connection pool for SQLite with WAL (Write-Ahead Logging) mode enabled
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Camera(Base):
    __tablename__ = "cameras"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    department = Column(String(50), nullable=False, index=True)  # 'Police', 'RTO', 'Civil Supplies'
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    stream_url = Column(String(255), nullable=False)
    status = Column(String(20), default="online", index=True)     # 'online', 'offline'
    city = Column(String(50), default="Ahmedabad", index=True)    # 'Ahmedabad', 'Gandhinagar', 'Surat', 'Vadodara', 'Rajkot'
    vendor = Column(String(50), default="CP Plus", index=True)    # 'Hikvision', 'CP Plus', 'Milestone XProtect', 'Genetec', 'Dahua', 'Axis'
    protocol = Column(String(50), default="ONVIF Profile T", index=True) # 'ONVIF Profile T', 'Milestone REST API', 'Hikvision ISAPI', 'RTSP H.265'
    health_status = Column(String(30), default="ONLINE", index=True) # 'ONLINE', 'OFFLINE_TIMEOUT', 'TAMPERED_OCCLUDED', 'VIDEO_LOSS'
    fps = Column(Integer, default=30)
    resolution = Column(String(30), default="1080p Full HD")
    last_heartbeat = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    tamper_alert = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    detections = relationship("Detection", back_populates="camera", cascade="all, delete-orphan")
    anomaly_alerts = relationship("AnomalyAlert", back_populates="camera", cascade="all, delete-orphan")


class Watchlist(Base):
    __tablename__ = "watchlist"

    id = Column(Integer, primary_key=True, index=True)
    plate_number = Column(String(20), unique=True, nullable=False, index=True)
    vehicle_model = Column(String(100), nullable=False)
    crime_type = Column(String(100), nullable=False)             # 'Stolen', 'Wanted Suspect', etc.
    alert_level = Column(String(20), default="Critical")         # 'High', 'Critical'
    flagged_date = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    detections = relationship("Detection", back_populates="matched_watchlist")


class Detection(Base):
    __tablename__ = "detections"

    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(Integer, ForeignKey("cameras.id"), nullable=False, index=True)
    plate_number = Column(String(20), nullable=False, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), index=True)
    is_alert = Column(Boolean, default=False, index=True)
    confidence = Column(Float, default=0.95)
    matched_watchlist_id = Column(Integer, ForeignKey("watchlist.id"), nullable=True)

    # Idea 2: Vehicle Forensic Attributes & Plausibility
    vehicle_color = Column(String(30), default="White", index=True) # 'White', 'Black', 'Silver', 'Red', 'Blue', 'Grey'
    vehicle_type = Column(String(30), default="SUV", index=True)     # 'SUV', 'Sedan', 'Hatchback', 'Truck', 'Motorcycle'
    vehicle_make = Column(String(60), default="Hyundai Creta", index=True) # 'Hyundai Creta', 'Maruti Swift', 'Mahindra Scorpio', etc.
    speed_kmh = Column(Float, default=65.0)
    heading = Column(String(20), default="Northbound")
    snapshot_url = Column(String(255), nullable=True)

    camera = relationship("Camera", back_populates="detections")
    matched_watchlist = relationship("Watchlist", back_populates="detections")

# High performance composite index for tracking queries (plate_number + timestamp)
Index("idx_plate_timestamp", Detection.plate_number, Detection.timestamp)


class AnomalyAlert(Base):
    __tablename__ = "anomaly_alerts"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(50), nullable=False, index=True) # 'WRONG_WAY_DRIVING', 'ATM_LOITERING', 'CROWD_SURGE', 'TRAFFIC_VIOLATION'
    title = Column(String(200), nullable=False)
    camera_id = Column(Integer, ForeignKey("cameras.id"), nullable=False, index=True)
    severity = Column(String(20), default="HIGH", index=True) # 'CRITICAL', 'HIGH', 'MEDIUM'
    timestamp = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), index=True)
    target_identifier = Column(String(100), default="Unknown Target") # e.g. "GJ01-DW-4902", "Person #P-812", "Cluster #C-44"
    details = Column(String(500), default="") # JSON/structured metrics
    location_name = Column(String(150), default="Gujarat Traffic Node")
    city = Column(String(50), default="Ahmedabad", index=True)
    lat = Column(Float, default=23.0225)
    lng = Column(Float, default=72.5714)
    status = Column(String(30), default="ACTIVE", index=True) # 'ACTIVE', 'DISPATCHED', 'RESOLVED'
    action_taken = Column(String(255), default="Pending Officer Intervention")
    snapshot_url = Column(String(255), nullable=True)

    camera = relationship("Camera", back_populates="anomaly_alerts")

Index("idx_anomaly_category_status", AnomalyAlert.category, AnomalyAlert.status)
Index("idx_anomaly_timestamp", AnomalyAlert.timestamp)


def init_db():
    Base.metadata.create_all(bind=engine)
    # Enable SQLite WAL mode for higher concurrency and ACID durability
    with engine.connect() as conn:
        conn.exec_driver_sql("PRAGMA journal_mode=WAL;")
        conn.exec_driver_sql("PRAGMA synchronous=NORMAL;")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
