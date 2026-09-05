import datetime
from database import SessionLocal, init_db, Camera, Watchlist, Detection, AnomalyAlert, Base, engine

def seed_database():
    Base.metadata.drop_all(bind=engine)
    init_db()
    db = SessionLocal()

    try:
        # Clear existing data cleanly
        db.query(AnomalyAlert).delete()
        db.query(Detection).delete()
        db.query(Watchlist).delete()
        db.query(Camera).delete()
        db.commit()

        print("[INFO] Seeding 52 Cameras across Gujarat (Ahmedabad, Gandhinagar, Surat, Vadodara, Rajkot, Highways)...")
        cameras_data = [
            # AHMEDABAD (1 - 25)
            {"id": 1, "name": "SG Highway - ISCON Cross Road", "department": "Police", "lat": 23.0276, "lng": 72.5074, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_ahd_01", "status": "online", "city": "Ahmedabad"},
            {"id": 2, "name": "SG Highway - Pakwan Cross Road", "department": "Police", "lat": 23.0396, "lng": 72.5126, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_ahd_02", "status": "online", "city": "Ahmedabad"},
            {"id": 3, "name": "Ashram Road - Income Tax Circle", "department": "RTO", "lat": 23.0423, "lng": 72.5701, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_ahd_03", "status": "online", "city": "Ahmedabad"},
            {"id": 4, "name": "Kalupur Railway Station Circle", "department": "Police", "lat": 23.0232, "lng": 72.5997, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_ahd_04", "status": "online", "city": "Ahmedabad"},
            {"id": 5, "name": "Maninagar - Kankaria Lake Gate 3", "department": "Civil Supplies", "lat": 23.0063, "lng": 72.6026, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_ahd_05", "status": "online", "city": "Ahmedabad"},
            {"id": 6, "name": "Narol Circle - Industrial Hub", "department": "RTO", "lat": 22.9734, "lng": 72.5925, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_ahd_06", "status": "online", "city": "Ahmedabad"},
            {"id": 7, "name": "SP Ring Road - Vaishnodevi Circle", "department": "Police", "lat": 23.1311, "lng": 72.5458, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_ahd_07", "status": "online", "city": "Ahmedabad"},
            {"id": 8, "name": "SG Highway - Gota Flyover", "department": "Police", "lat": 23.0988, "lng": 72.5312, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_ahd_08", "status": "online", "city": "Ahmedabad"},
            {"id": 9, "name": "CG Road - Stadium Cross Road", "department": "Police", "lat": 23.0375, "lng": 72.5601, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_ahd_09", "status": "online", "city": "Ahmedabad"},
            {"id": 10, "name": "Sarkhej - Sanand Cross Road", "department": "RTO", "lat": 22.9856, "lng": 72.4934, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_ahd_10", "status": "online", "city": "Ahmedabad"},
            {"id": 11, "name": "Paldi Cross Road", "department": "Civil Supplies", "lat": 23.0135, "lng": 72.5624, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_ahd_11", "status": "online", "city": "Ahmedabad"},
            {"id": 12, "name": "Ellis Bridge - Town Hall", "department": "Police", "lat": 23.0238, "lng": 72.5695, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_ahd_12", "status": "online", "city": "Ahmedabad"},
            {"id": 13, "name": "Sabarmati Riverfront - West Promenade", "department": "Police", "lat": 23.0498, "lng": 72.5789, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_ahd_13", "status": "online", "city": "Ahmedabad"},
            {"id": 14, "name": "Sabarmati Riverfront - East Promenade", "department": "Police", "lat": 23.0475, "lng": 72.5855, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_ahd_14", "status": "online", "city": "Ahmedabad"},
            {"id": 15, "name": "Chandkheda - Visat Circle", "department": "RTO", "lat": 23.1095, "lng": 72.5835, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_ahd_15", "status": "online", "city": "Ahmedabad"},
            {"id": 16, "name": "Bopal - South Bopal Junction", "department": "Police", "lat": 23.0264, "lng": 72.4645, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_ahd_16", "status": "online", "city": "Ahmedabad"},
            {"id": 17, "name": "Thaltej Cross Road - SG Highway", "department": "Police", "lat": 23.0532, "lng": 72.5178, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_ahd_17", "status": "online", "city": "Ahmedabad"},
            {"id": 18, "name": "Shivranjani Cross Road", "department": "Civil Supplies", "lat": 23.0251, "lng": 72.5298, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_ahd_18", "status": "online", "city": "Ahmedabad"},
            {"id": 19, "name": "Vastrapur Lake Junction", "department": "Police", "lat": 23.0367, "lng": 72.5305, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_ahd_19", "status": "online", "city": "Ahmedabad"},
            {"id": 20, "name": "Odhav Ring Road Circle", "department": "RTO", "lat": 23.0312, "lng": 72.6685, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_ahd_20", "status": "online", "city": "Ahmedabad"},
            {"id": 21, "name": "Nikol Toll Plaza Checkpoint", "department": "Police", "lat": 23.0543, "lng": 72.6789, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_ahd_21", "status": "online", "city": "Ahmedabad"},
            {"id": 22, "name": "Naroda - Galaxy Cinema Crossroads", "department": "Police", "lat": 23.0694, "lng": 72.6512, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_ahd_22", "status": "online", "city": "Ahmedabad"},
            {"id": 23, "name": "Danilimda Cross Road", "department": "Civil Supplies", "lat": 22.9985, "lng": 72.5812, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_ahd_23", "status": "online", "city": "Ahmedabad"},
            {"id": 24, "name": "Memnagar - Subhash Chowk", "department": "Police", "lat": 23.0512, "lng": 72.5412, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_ahd_24", "status": "online", "city": "Ahmedabad"},
            {"id": 25, "name": "Nehrunagar Circle", "department": "RTO", "lat": 23.0189, "lng": 72.5432, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_ahd_25", "status": "online", "city": "Ahmedabad"},

            # GANDHINAGAR & GIFT CITY (26 - 35)
            {"id": 26, "name": "Gandhinagar - CH-3 Circle", "department": "Police", "lat": 23.2156, "lng": 72.6369, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_gdn_26", "status": "online", "city": "Gandhinagar"},
            {"id": 27, "name": "Infocity IT Tower Junction", "department": "RTO", "lat": 23.1905, "lng": 72.6288, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_gdn_27", "status": "online", "city": "Gandhinagar"},
            {"id": 28, "name": "Mahatma Mandir Convention Center", "department": "Civil Supplies", "lat": 23.2307, "lng": 72.6612, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_gdn_28", "status": "online", "city": "Gandhinagar"},
            {"id": 29, "name": "GIFT City - World Trade Center Gate", "department": "Police", "lat": 23.1612, "lng": 72.6845, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_gdn_29", "status": "online", "city": "Gandhinagar"},
            {"id": 30, "name": "GIFT City - Bridge Checkpost", "department": "Police", "lat": 23.1554, "lng": 72.6789, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_gdn_30", "status": "online", "city": "Gandhinagar"},
            {"id": 31, "name": "Gandhinagar - Sector 11 Central Vista", "department": "Police", "lat": 23.2245, "lng": 72.6543, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_gdn_31", "status": "online", "city": "Gandhinagar"},
            {"id": 32, "name": "Gandhinagar - CH-0 Circle", "department": "RTO", "lat": 23.2398, "lng": 72.6412, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_gdn_32", "status": "online", "city": "Gandhinagar"},
            {"id": 33, "name": "PDPU University Crossroad", "department": "Civil Supplies", "lat": 23.1589, "lng": 72.6612, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_gdn_33", "status": "online", "city": "Gandhinagar"},
            {"id": 34, "name": "Kudasan High Street Junction", "department": "Police", "lat": 23.1812, "lng": 72.6345, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_gdn_34", "status": "online", "city": "Gandhinagar"},
            {"id": 35, "name": "Bhaijipura Crossroads - NH-8", "department": "Police", "lat": 23.1723, "lng": 72.6421, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_gdn_35", "status": "online", "city": "Gandhinagar"},

            # VADODARA, SURAT, RAJKOT & STRATEGIC HIGHWAYS (36 - 52)
            {"id": 36, "name": "Vadodara - Sayaji Ganj Circle", "department": "Police", "lat": 22.3105, "lng": 73.1812, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_vad_36", "status": "online", "city": "Vadodara"},
            {"id": 37, "name": "Vadodara - Alkapuri Crossroad", "department": "Police", "lat": 22.3089, "lng": 73.1723, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_vad_37", "status": "online", "city": "Vadodara"},
            {"id": 38, "name": "Vadodara - Golden Toll Plaza NH-48", "department": "RTO", "lat": 22.3689, "lng": 73.2245, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_vad_38", "status": "online", "city": "Vadodara"},
            {"id": 39, "name": "Vadodara - Manjalpur Flyover", "department": "Civil Supplies", "lat": 22.2745, "lng": 73.1956, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_vad_39", "status": "online", "city": "Vadodara"},
            {"id": 40, "name": "Surat - Ring Road Textile Market", "department": "Police", "lat": 21.1959, "lng": 72.8302, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_sur_40", "status": "online", "city": "Surat"},
            {"id": 41, "name": "Surat - Athwa Gate Circle", "department": "Police", "lat": 21.1823, "lng": 72.8095, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_sur_41", "status": "online", "city": "Surat"},
            {"id": 42, "name": "Surat - Kamrej Toll Plaza NH-48", "department": "RTO", "lat": 21.2712, "lng": 72.9645, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_sur_42", "status": "online", "city": "Surat"},
            {"id": 43, "name": "Surat - Varachha Diamond Hub", "department": "Police", "lat": 21.2189, "lng": 72.8598, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_sur_43", "status": "online", "city": "Surat"},
            {"id": 44, "name": "Surat - Dumas Beach Intersection", "department": "Civil Supplies", "lat": 21.1089, "lng": 72.7156, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_sur_44", "status": "online", "city": "Surat"},
            {"id": 45, "name": "Rajkot - Kalawad Road Circle", "department": "Police", "lat": 22.2845, "lng": 70.7689, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_raj_45", "status": "online", "city": "Rajkot"},
            {"id": 46, "name": "Rajkot - Yagnik Road Junction", "department": "Police", "lat": 22.2985, "lng": 70.7956, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_raj_46", "status": "online", "city": "Rajkot"},
            {"id": 47, "name": "Rajkot - Gondal Road Highway Post", "department": "RTO", "lat": 22.2512, "lng": 70.7989, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_raj_47", "status": "online", "city": "Rajkot"},
            {"id": 48, "name": "NE-1 Expressway Toll - Vadodara Portal", "department": "Police", "lat": 22.3512, "lng": 73.1845, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_exp_48", "status": "online", "city": "Vadodara"},
            {"id": 49, "name": "NE-1 Expressway Toll - Ahmedabad Portal", "department": "Police", "lat": 22.9512, "lng": 72.6245, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_exp_49", "status": "online", "city": "Ahmedabad"},
            {"id": 50, "name": "Dholera SIR Corridor Checkpost Gate 1", "department": "Civil Supplies", "lat": 22.2412, "lng": 72.1956, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_dho_50", "status": "online", "city": "Dholera"},
            {"id": 51, "name": "Dholera Special Investment Region Gate 2", "department": "Police", "lat": 22.2289, "lng": 72.1812, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_dho_51", "status": "online", "city": "Dholera"},
            {"id": 52, "name": "Sanand GIDC Automobile Corridor Post", "department": "RTO", "lat": 22.9812, "lng": 72.3789, "stream_url": "rtsp://live.cctv.gujarat.gov.in/feed/cam_san_52", "status": "online", "city": "Ahmedabad"}
        ]

        VENDORS = ["Hikvision DarkFighter", "CP Plus Intelli-Vision", "Milestone XProtect", "Genetec Omnicast", "Axis Q-Series", "Honeywell MAXPRO", "Dahua Starlight"]
        PROTOCOLS = ["ONVIF Profile T", "Hikvision ISAPI", "Milestone REST API", "RTSP H.265", "Genetec Media Gateway", "WebRTC WHEP"]

        for idx, cam in enumerate(cameras_data):
            cam_id = cam["id"]
            cam["vendor"] = VENDORS[(cam_id - 1) % len(VENDORS)]
            cam["protocol"] = PROTOCOLS[(cam_id - 1) % len(PROTOCOLS)]
            cam["fps"] = 30 if cam_id % 3 != 0 else 25
            cam["resolution"] = "1080p Full HD" if cam_id % 4 != 0 else "4K Ultra HD"
            cam["last_heartbeat"] = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(seconds=(cam_id * 7) % 60)

            # Specific realistic health anomalies:
            if cam_id in [9, 23]:
                cam["health_status"] = "TAMPERED_OCCLUDED"
                cam["tamper_alert"] = True
                cam["status"] = "online"  # Still pinging over network, but video lens is occluded/spray painted!
            elif cam_id in [28, 44]:
                cam["health_status"] = "OFFLINE_TIMEOUT"
                cam["tamper_alert"] = False
                cam["status"] = "offline"
            elif cam_id == 39:
                cam["health_status"] = "VIDEO_LOSS"
                cam["tamper_alert"] = False
                cam["status"] = "offline"
            else:
                cam["health_status"] = "ONLINE"
                cam["tamper_alert"] = False
                cam["status"] = "online"

            db.add(Camera(**cam))
        db.commit()

        print("[INFO] Seeding Watchlist Vehicles as requested...")
        watchlist_data = [
            {
                "id": 1,
                "plate_number": "GJ01AB1234",
                "vehicle_model": "White Maruti Suzuki Swift",
                "crime_type": "Stolen",
                "alert_level": "Critical",
                "flagged_date": datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=1)
            },
            {
                "id": 2,
                "plate_number": "GJ27CD5678",
                "vehicle_model": "Black Mahindra Scorpio-N",
                "crime_type": "Wanted Suspect",
                "alert_level": "Critical",
                "flagged_date": datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=14)
            },
            {
                "id": 3,
                "plate_number": "GJ05EF9012",
                "vehicle_model": "Silver Toyota Fortuner",
                "crime_type": "Wanted Suspect",
                "alert_level": "High",
                "flagged_date": datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=2)
            },
            {
                "id": 4,
                "plate_number": "GJ06XX9999",
                "vehicle_model": "Red Hyundai Creta SX",
                "crime_type": "Kidnapping Suspect",
                "alert_level": "Critical",
                "flagged_date": datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=2)
            },
            {
                "id": 5,
                "plate_number": "DA07CLX",
                "vehicle_model": "Silver Mazda 3 Sedan",
                "crime_type": "Stolen / Lost Vehicle",
                "alert_level": "Critical",
                "flagged_date": datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=6)
            },
            {
                "id": 6,
                "plate_number": "EY09VWS",
                "vehicle_model": "Silver Nissan Primastar Van",
                "crime_type": "Stolen Cargo Delivery Van",
                "alert_level": "High",
                "flagged_date": datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=10)
            },
            {
                "id": 7,
                "plate_number": "MH46T7527",
                "vehicle_model": "White Maruti Ertiga VXi",
                "crime_type": "Missing / Lost Taxi (Inter-State)",
                "alert_level": "High",
                "flagged_date": datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=1)
            },
            {
                "id": 8,
                "plate_number": "MH04EE1980",
                "vehicle_model": "Red Hatchback",
                "crime_type": "Hit-and-Run Suspect",
                "alert_level": "Critical",
                "flagged_date": datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=5)
            }
        ]

        for wl in watchlist_data:
            db.add(Watchlist(**wl))
        db.commit()

        print("[INFO] Seeding clean, chronological route detections with vehicle forensic attributes...")
        now = datetime.datetime.now(datetime.timezone.utc)
        detections_data = [
            # 1. GJ01AB1234 (Kalupur Heist route -> Gandhinagar Infocity + CLONED Teleportation to Surat)
            {
                "camera_id": 4, "plate_number": "GJ01AB1234", "timestamp": now - datetime.timedelta(minutes=105),
                "is_alert": True, "confidence": 0.97, "matched_watchlist_id": 1,
                "vehicle_color": "White", "vehicle_type": "Hatchback", "vehicle_make": "Maruti Swift",
                "speed_kmh": 48.5, "heading": "Westbound", "snapshot_url": "/snapshots/swift_white.jpg"
            },
            {
                "camera_id": 3, "plate_number": "GJ01AB1234", "timestamp": now - datetime.timedelta(minutes=80),
                "is_alert": True, "confidence": 0.95, "matched_watchlist_id": 1,
                "vehicle_color": "White", "vehicle_type": "Hatchback", "vehicle_make": "Maruti Swift",
                "speed_kmh": 58.0, "heading": "Northbound", "snapshot_url": "/snapshots/swift_white.jpg"
            },
            {
                "camera_id": 2, "plate_number": "GJ01AB1234", "timestamp": now - datetime.timedelta(minutes=52),
                "is_alert": True, "confidence": 0.98, "matched_watchlist_id": 1,
                "vehicle_color": "White", "vehicle_type": "Hatchback", "vehicle_make": "Maruti Swift",
                "speed_kmh": 68.2, "heading": "Northbound", "snapshot_url": "/snapshots/swift_white.jpg"
            },
            {
                "camera_id": 7, "plate_number": "GJ01AB1234", "timestamp": now - datetime.timedelta(minutes=28),
                "is_alert": True, "confidence": 0.96, "matched_watchlist_id": 1,
                "vehicle_color": "White", "vehicle_type": "Hatchback", "vehicle_make": "Maruti Swift",
                "speed_kmh": 74.0, "heading": "Northbound", "snapshot_url": "/snapshots/swift_white.jpg"
            },
            {
                "camera_id": 27, "plate_number": "GJ01AB1234", "timestamp": now - datetime.timedelta(minutes=8),
                "is_alert": True, "confidence": 0.99, "matched_watchlist_id": 1,
                "vehicle_color": "White", "vehicle_type": "Hatchback", "vehicle_make": "Maruti Swift",
                "speed_kmh": 82.5, "heading": "Eastbound", "snapshot_url": "/snapshots/swift_white.jpg"
            },
            # --- TELEPORTATION ANOMALY SIGHTING FOR GJ01AB1234 (Surat Ring Road 260km away just 10 mins after Vaishnodevi!) ---
            {
                "camera_id": 40, "plate_number": "GJ01AB1234", "timestamp": now - datetime.timedelta(minutes=18),
                "is_alert": True, "confidence": 0.98, "matched_watchlist_id": 1,
                "vehicle_color": "White", "vehicle_type": "Sedan", "vehicle_make": "Maruti Dzire",
                "speed_kmh": 55.0, "heading": "Southbound", "snapshot_url": "/snapshots/dzire_white.jpg"
            },

            # 2. GJ06XX9999 (Amber Alert Kidnapping: Vastrapur -> Pakwan -> Gota -> Vaishnodevi -> Gandhinagar)
            {
                "camera_id": 19, "plate_number": "GJ06XX9999", "timestamp": now - datetime.timedelta(minutes=55),
                "is_alert": True, "confidence": 0.96, "matched_watchlist_id": 4,
                "vehicle_color": "Red", "vehicle_type": "SUV", "vehicle_make": "Hyundai Creta",
                "speed_kmh": 52.0, "heading": "Westbound", "snapshot_url": "/snapshots/creta_red.jpg"
            },
            {
                "camera_id": 2, "plate_number": "GJ06XX9999", "timestamp": now - datetime.timedelta(minutes=38),
                "is_alert": True, "confidence": 0.99, "matched_watchlist_id": 4,
                "vehicle_color": "Red", "vehicle_type": "SUV", "vehicle_make": "Hyundai Creta",
                "speed_kmh": 66.5, "heading": "Northbound", "snapshot_url": "/snapshots/creta_red.jpg"
            },
            {
                "camera_id": 8, "plate_number": "GJ06XX9999", "timestamp": now - datetime.timedelta(minutes=22),
                "is_alert": True, "confidence": 0.97, "matched_watchlist_id": 4,
                "vehicle_color": "Red", "vehicle_type": "SUV", "vehicle_make": "Hyundai Creta",
                "speed_kmh": 73.0, "heading": "Northbound", "snapshot_url": "/snapshots/creta_red.jpg"
            },
            {
                "camera_id": 7, "plate_number": "GJ06XX9999", "timestamp": now - datetime.timedelta(minutes=9),
                "is_alert": True, "confidence": 0.98, "matched_watchlist_id": 4,
                "vehicle_color": "Red", "vehicle_type": "SUV", "vehicle_make": "Hyundai Creta",
                "speed_kmh": 78.4, "heading": "Northbound", "snapshot_url": "/snapshots/creta_red.jpg"
            },
            {
                "camera_id": 29, "plate_number": "GJ06XX9999", "timestamp": now - datetime.timedelta(minutes=2),
                "is_alert": True, "confidence": 0.98, "matched_watchlist_id": 4,
                "vehicle_color": "Red", "vehicle_type": "SUV", "vehicle_make": "Hyundai Creta",
                "speed_kmh": 62.0, "heading": "Northbound", "snapshot_url": "/snapshots/creta_red.jpg"
            },

            # 3. GJ27CD5678 (Hit-and-Run Scorpio: Narol -> Sarkhej -> South Bopal)
            {
                "camera_id": 6, "plate_number": "GJ27CD5678", "timestamp": now - datetime.timedelta(minutes=45),
                "is_alert": True, "confidence": 0.95, "matched_watchlist_id": 2,
                "vehicle_color": "Black", "vehicle_type": "SUV", "vehicle_make": "Mahindra Scorpio",
                "speed_kmh": 69.0, "heading": "Westbound", "snapshot_url": "/snapshots/scorpio_black.jpg"
            },
            {
                "camera_id": 10, "plate_number": "GJ27CD5678", "timestamp": now - datetime.timedelta(minutes=26),
                "is_alert": True, "confidence": 0.94, "matched_watchlist_id": 2,
                "vehicle_color": "Black", "vehicle_type": "SUV", "vehicle_make": "Mahindra Scorpio",
                "speed_kmh": 74.5, "heading": "Northbound", "snapshot_url": "/snapshots/scorpio_black.jpg"
            },
            {
                "camera_id": 16, "plate_number": "GJ27CD5678", "timestamp": now - datetime.timedelta(minutes=10),
                "is_alert": True, "confidence": 0.96, "matched_watchlist_id": 2,
                "vehicle_color": "Black", "vehicle_type": "SUV", "vehicle_make": "Mahindra Scorpio",
                "speed_kmh": 78.0, "heading": "Westbound", "snapshot_url": "/snapshots/scorpio_black.jpg"
            },

            # 4. GJ05EF9012 (Stolen Fortuner: Surat Textile -> Athwa Gate -> Kamrej Toll NH-48)
            {
                "camera_id": 40, "plate_number": "GJ05EF9012", "timestamp": now - datetime.timedelta(minutes=60),
                "is_alert": True, "confidence": 0.92, "matched_watchlist_id": 3,
                "vehicle_color": "White", "vehicle_type": "SUV", "vehicle_make": "Toyota Fortuner",
                "speed_kmh": 62.0, "heading": "Southbound", "snapshot_url": "/snapshots/fortuner_white.jpg"
            },
            {
                "camera_id": 41, "plate_number": "GJ05EF9012", "timestamp": now - datetime.timedelta(minutes=35),
                "is_alert": True, "confidence": 0.94, "matched_watchlist_id": 3,
                "vehicle_color": "White", "vehicle_type": "SUV", "vehicle_make": "Toyota Fortuner",
                "speed_kmh": 70.0, "heading": "Eastbound", "snapshot_url": "/snapshots/fortuner_white.jpg"
            },
            {
                "camera_id": 42, "plate_number": "GJ05EF9012", "timestamp": now - datetime.timedelta(minutes=12),
                "is_alert": True, "confidence": 0.97, "matched_watchlist_id": 3,
                "vehicle_color": "White", "vehicle_type": "SUV", "vehicle_make": "Toyota Fortuner",
                "speed_kmh": 85.0, "heading": "Eastbound", "snapshot_url": "/snapshots/fortuner_white.jpg"
            },

            # 5. DA07CLX (YouTube Cam 2: Stolen Silver Mazda on SG Highway)
            {
                "camera_id": 1, "plate_number": "DA07CLX", "timestamp": now - datetime.timedelta(minutes=32),
                "is_alert": True, "confidence": 0.96, "matched_watchlist_id": 5,
                "vehicle_color": "Silver", "vehicle_type": "Sedan", "vehicle_make": "Mazda 3",
                "speed_kmh": 68.0, "heading": "Northbound", "snapshot_url": "/snapshots/mazda_silver.jpg"
            },
            {
                "camera_id": 2, "plate_number": "DA07CLX", "timestamp": now - datetime.timedelta(minutes=14),
                "is_alert": True, "confidence": 0.98, "matched_watchlist_id": 5,
                "vehicle_color": "Silver", "vehicle_type": "Sedan", "vehicle_make": "Mazda 3",
                "speed_kmh": 71.5, "heading": "Northbound", "snapshot_url": "/snapshots/mazda_silver.jpg"
            },
            {
                "camera_id": 7, "plate_number": "DA07CLX", "timestamp": now - datetime.timedelta(minutes=4),
                "is_alert": True, "confidence": 0.97, "matched_watchlist_id": 5,
                "vehicle_color": "Silver", "vehicle_type": "Sedan", "vehicle_make": "Mazda 3",
                "speed_kmh": 75.0, "heading": "Northbound", "snapshot_url": "/snapshots/mazda_silver.jpg"
            },

            # 6. EY09VWS (YouTube Cam 2: Stolen Nissan Delivery Van)
            {
                "camera_id": 1, "plate_number": "EY09VWS", "timestamp": now - datetime.timedelta(minutes=24),
                "is_alert": True, "confidence": 0.95, "matched_watchlist_id": 6,
                "vehicle_color": "Silver", "vehicle_type": "Truck", "vehicle_make": "Nissan Primastar",
                "speed_kmh": 54.0, "heading": "Northbound", "snapshot_url": "/snapshots/nissan_van.jpg"
            },
            {
                "camera_id": 8, "plate_number": "EY09VWS", "timestamp": now - datetime.timedelta(minutes=7),
                "is_alert": True, "confidence": 0.97, "matched_watchlist_id": 6,
                "vehicle_color": "Silver", "vehicle_type": "Truck", "vehicle_make": "Nissan Primastar",
                "speed_kmh": 58.0, "heading": "Northbound", "snapshot_url": "/snapshots/nissan_van.jpg"
            },

            # 7. MH46T7527 (YouTube Cam 3: Missing Inter-State Ertiga Taxi)
            {
                "camera_id": 3, "plate_number": "MH46T7527", "timestamp": now - datetime.timedelta(minutes=40),
                "is_alert": True, "confidence": 0.94, "matched_watchlist_id": 7,
                "vehicle_color": "White", "vehicle_type": "SUV", "vehicle_make": "Maruti Ertiga",
                "speed_kmh": 50.0, "heading": "Northbound", "snapshot_url": "/snapshots/ertiga_white.jpg"
            },
            {
                "camera_id": 14, "plate_number": "MH46T7527", "timestamp": now - datetime.timedelta(minutes=18),
                "is_alert": True, "confidence": 0.96, "matched_watchlist_id": 7,
                "vehicle_color": "White", "vehicle_type": "SUV", "vehicle_make": "Maruti Ertiga",
                "speed_kmh": 55.0, "heading": "Eastbound", "snapshot_url": "/snapshots/ertiga_white.jpg"
            },
            {
                "camera_id": 4, "plate_number": "MH46T7527", "timestamp": now - datetime.timedelta(minutes=5),
                "is_alert": True, "confidence": 0.98, "matched_watchlist_id": 7,
                "vehicle_color": "White", "vehicle_type": "SUV", "vehicle_make": "Maruti Ertiga",
                "speed_kmh": 58.5, "heading": "Eastbound", "snapshot_url": "/snapshots/ertiga_white.jpg"
            },

            # 8. MH04EE1980 (YouTube Cam 3: Red Hatchback Hit-and-Run)
            {
                "camera_id": 7, "plate_number": "MH04EE1980", "timestamp": now - datetime.timedelta(minutes=22),
                "is_alert": True, "confidence": 0.95, "matched_watchlist_id": 8,
                "vehicle_color": "Red", "vehicle_type": "Hatchback", "vehicle_make": "Hyundai i20",
                "speed_kmh": 64.0, "heading": "Southbound", "snapshot_url": "/snapshots/i20_red.jpg"
            },
            {
                "camera_id": 2, "plate_number": "MH04EE1980", "timestamp": now - datetime.timedelta(minutes=9),
                "is_alert": True, "confidence": 0.96, "matched_watchlist_id": 8,
                "vehicle_color": "Red", "vehicle_type": "Hatchback", "vehicle_make": "Hyundai i20",
                "speed_kmh": 67.0, "heading": "Southbound", "snapshot_url": "/snapshots/i20_red.jpg"
            },

            # 9. Additional statewide background vehicles for attribute search
            {
                "camera_id": 33, "plate_number": "GJ03BV8821", "timestamp": now - datetime.timedelta(minutes=48),
                "is_alert": False, "confidence": 0.96, "matched_watchlist_id": None,
                "vehicle_color": "Blue", "vehicle_type": "Sedan", "vehicle_make": "Honda City",
                "speed_kmh": 61.0, "heading": "Northbound", "snapshot_url": "/snapshots/city_blue.jpg"
            },
            {
                "camera_id": 48, "plate_number": "GJ03TR4410", "timestamp": now - datetime.timedelta(minutes=30),
                "is_alert": False, "confidence": 0.94, "matched_watchlist_id": None,
                "vehicle_color": "Black", "vehicle_type": "SUV", "vehicle_make": "Tata Harrier",
                "speed_kmh": 72.0, "heading": "Westbound", "snapshot_url": "/snapshots/harrier_black.jpg"
            },
            {
                "camera_id": 45, "plate_number": "GJ06TR9901", "timestamp": now - datetime.timedelta(minutes=15),
                "is_alert": False, "confidence": 0.95, "matched_watchlist_id": None,
                "vehicle_color": "White", "vehicle_type": "Truck", "vehicle_make": "Ashok Leyland",
                "speed_kmh": 45.0, "heading": "Southbound", "snapshot_url": "/snapshots/truck_white.jpg"
            },
            {
                "camera_id": 18, "plate_number": "GJ01MC2022", "timestamp": now - datetime.timedelta(minutes=12),
                "is_alert": False, "confidence": 0.93, "matched_watchlist_id": None,
                "vehicle_color": "Black", "vehicle_type": "Motorcycle", "vehicle_make": "Royal Enfield Classic",
                "speed_kmh": 42.0, "heading": "Eastbound", "snapshot_url": "/snapshots/bullet_black.jpg"
            },
        ]

        for det in detections_data:
            db.add(Detection(**det))
        db.commit()

        print("[INFO] Seeding Multi-Modal Anomaly Alerts across Gujarat...")
        anomaly_alerts_data = [
            # 1. WRONG-WAY DRIVING (Expressways & Flyovers)
            {
                "category": "WRONG_WAY_DRIVING",
                "title": "Wrong-Way Vehicle on NE-1 Expressway Entry Ramp",
                "camera_id": 45,
                "severity": "CRITICAL",
                "timestamp": now - datetime.timedelta(minutes=4),
                "target_identifier": "GJ06-EF-8190 (White Mahindra Bolero)",
                "details": "Optical flow vectors confirm vehicle travelling Southbound on designated Northbound exit ramp at 58 km/h. Severe collision hazard.",
                "location_name": "NE-1 National Expressway - Vadodara North Entry",
                "city": "Vadodara",
                "lat": 22.3072,
                "lng": 73.1812,
                "status": "ACTIVE",
                "action_taken": "Overhead VMS Caution 'WRONG WAY DETECTED' triggered; Toll barrier 2km downstream signaled",
                "snapshot_url": "/snapshots/wrong_way_ne1.jpg"
            },
            {
                "category": "WRONG_WAY_DRIVING",
                "title": "Counter-Flow Vehicle on Gota Flyover Down-Ramp",
                "camera_id": 8,
                "severity": "CRITICAL",
                "timestamp": now - datetime.timedelta(minutes=16),
                "target_identifier": "GJ01-TG-4412 (Yellow CNG Auto-Rickshaw)",
                "details": "Three-wheeler proceeding against traffic flow on one-way bridge flyover decline at 36 km/h. Blind spot hazard.",
                "location_name": "SG Highway - Gota Flyover Incline",
                "city": "Ahmedabad",
                "lat": 23.0905,
                "lng": 72.5312,
                "status": "ACTIVE",
                "action_taken": "PCR Unit 04 dispatched to intercept ramp entrance",
                "snapshot_url": "/snapshots/wrong_way_gota.jpg"
            },

            # 2. AFTER-HOURS ATM LOITERING (01:00 AM - 05:00 AM, Dwell > 5 mins within 3m)
            {
                "category": "ATM_LOITERING",
                "title": "Suspicious After-Hours ATM Loitering (Dwell: 7m 42s)",
                "camera_id": 15,
                "severity": "HIGH",
                "timestamp": now - datetime.timedelta(minutes=11),
                "target_identifier": "Person #P-812 (Black Hooded Jacket, Occluded Face)",
                "details": "Subject loitering 1.4m from ATM cash dispenser for 462 seconds between 01:00 AM - 05:00 AM window. Repeated cash slot tampering checks without card insertion.",
                "location_name": "SBI E-Lobby 24/7 ATM - C.G. Road Commercial Center",
                "city": "Ahmedabad",
                "lat": 23.0360,
                "lng": 72.5601,
                "status": "ACTIVE",
                "action_taken": "Automated 110dB Audio Strobe primed; Navrangpura Night PCR alerted",
                "snapshot_url": "/snapshots/atm_loiter_cg.jpg"
            },
            {
                "category": "ATM_LOITERING",
                "title": "Two Individuals Hovering at ATM Vestibule (Dwell: 6m 20s)",
                "camera_id": 41,
                "severity": "HIGH",
                "timestamp": now - datetime.timedelta(minutes=28),
                "target_identifier": "Group #P-903 (Two Individuals with Concealed Tools)",
                "details": "Subjects lingering 2.1m outside ATM vestibule corner for 380 seconds at 03:14 AM. Suspicious surveillance of approaching pedestrians.",
                "location_name": "Bank of Baroda 24/7 ATM - Athwa Gate Ring Road",
                "city": "Surat",
                "lat": 21.1764,
                "lng": 72.8091,
                "status": "ACTIVE",
                "action_taken": "Surat Sector 2 Night Patrol Van dispatched",
                "snapshot_url": "/snapshots/atm_loiter_surat.jpg"
            },

            # 3. CROWD SURGE / SUDDEN DISPERSAL (Panic Signature & Velocity Jump)
            {
                "category": "CROWD_SURGE",
                "title": "Sudden Crowd Panic Dispersal & Surge Signature",
                "camera_id": 5,
                "severity": "CRITICAL",
                "timestamp": now - datetime.timedelta(minutes=7),
                "target_identifier": "Cluster #CS-104 (~78 Persons)",
                "details": "Crowd velocity jumped abruptly from 0.8 m/s to 4.1 m/s (Δv = 3.3 m/s) in omnidirectional dispersal pattern. High probability of violent altercation or stampede outbreak.",
                "location_name": "Kalupur Central Railway Station Concourse",
                "city": "Ahmedabad",
                "lat": 23.0270,
                "lng": 72.5980,
                "status": "ACTIVE",
                "action_taken": "Railway Police Force (RPF) & Kalupur Chowki QRT mobilized for perimeter containment",
                "snapshot_url": "/snapshots/crowd_surge_kalupur.jpg"
            },
            {
                "category": "CROWD_SURGE",
                "title": "Night Market Crowd Compression & Violent Skirmish",
                "camera_id": 17,
                "severity": "HIGH",
                "timestamp": now - datetime.timedelta(minutes=35),
                "target_identifier": "Cluster #CS-208 (~115 Persons)",
                "details": "Localized crowd entropy surge with density collapse from 4.2 persons/m² to peripheral flight. Brawl signature verified by multi-point keypoint tracking.",
                "location_name": "Manek Chowk Heritage Food Plaza",
                "city": "Ahmedabad",
                "lat": 23.0245,
                "lng": 72.5895,
                "status": "DISPATCHED",
                "action_taken": "PCR Van 12 on-site; situation de-escalated and logged",
                "snapshot_url": "/snapshots/crowd_manek.jpg"
            },

            # 4. TRAFFIC VIOLATIONS (Triple Riding & No Helmet)
            {
                "category": "TRAFFIC_VIOLATION",
                "title": "Triple Riding on Two-Wheeler + Zero Helmets (0/3)",
                "camera_id": 2,
                "severity": "MEDIUM",
                "timestamp": now - datetime.timedelta(minutes=13),
                "target_identifier": "GJ01-MX-7809 (Black Honda Activa)",
                "details": "3 occupants detected on single 2-wheeler chassis. 0 helmets detected. Vehicle speeding through intersection at 46 km/h.",
                "location_name": "SG Highway - Pakwan Cross Road",
                "city": "Ahmedabad",
                "lat": 23.0396,
                "lng": 72.5126,
                "status": "ACTIVE",
                "action_taken": "Automated e-Challan #ECH-GJ-2026-8819 (₹1,500 fine) generated via RTO VAHAN gateway",
                "snapshot_url": "/snapshots/activa_triple.jpg"
            },
            {
                "category": "TRAFFIC_VIOLATION",
                "title": "Triple Riding + Rider Without Helmet (2/3)",
                "camera_id": 3,
                "severity": "MEDIUM",
                "timestamp": now - datetime.timedelta(minutes=42),
                "target_identifier": "GJ27-AK-5521 (Red Hero Splendor)",
                "details": "3 occupants detected on motorcycle. Pillion riders lacking mandatory safety headgear. Speed: 41 km/h.",
                "location_name": "Ashram Road - Metro Flyover Junction",
                "city": "Ahmedabad",
                "lat": 23.0338,
                "lng": 72.5714,
                "status": "ACTIVE",
                "action_taken": "Automated e-Challan #ECH-GJ-2026-8820 queued with photographic evidence",
                "snapshot_url": "/snapshots/splendor_triple.jpg"
            },
        ]

        for anom in anomaly_alerts_data:
            db.add(AnomalyAlert(**anom))
        db.commit()

        print("[SUCCESS] Database seeded successfully:")
        print(f" - {len(cameras_data)} Cameras (Scale: 52 cameras statewide across Police, RTO, Civil Supplies)")
        print(f" - {len(watchlist_data)} Watchlist Entries ('GJ01AB1234', 'GJ27CD5678', 'GJ05EF9012')")
        print(f" - {len(detections_data)} Detections (including 5-point trajectory for 'GJ01AB1234' across 4+ cameras)")
        print(f" - {len(anomaly_alerts_data)} Multi-Modal Anomaly Incidents (Wrong-Way, ATM Loiter, Crowd Surge, Traffic Violations)")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Seeding failed: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
