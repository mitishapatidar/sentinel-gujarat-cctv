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
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    detections = relationship("Detection", back_populates="camera", cascade="all, delete-orphan")


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

    camera = relationship("Camera", back_populates="detections")
    matched_watchlist = relationship("Watchlist", back_populates="detections")

# High performance composite index for tracking queries (plate_number + timestamp)
Index("idx_plate_timestamp", Detection.plate_number, Detection.timestamp)


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
