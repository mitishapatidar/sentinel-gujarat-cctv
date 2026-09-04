import datetime
from database import SessionLocal, init_db, Camera, Watchlist, Detection, Base, engine

def seed_database():
    Base.metadata.drop_all(bind=engine)
    init_db()
    db = SessionLocal()

    try:
        # Clear existing data cleanly
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

        for cam in cameras_data:
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
            }
        ]

        for wl in watchlist_data:
            db.add(Watchlist(**wl))
        db.commit()

        print("[INFO] Seeding 5 Historical Detection Records for 'GJ01AB1234' across 4+ cameras...")
        now = datetime.datetime.now(datetime.timezone.utc)
        # 5 chronological detection logs across cameras: 4 -> 3 -> 2 -> 7 -> 27 (Infocity)
        detections_data = [
            {
                "camera_id": 4,  # Kalupur Railway Station
                "plate_number": "GJ01AB1234",
                "timestamp": now - datetime.timedelta(minutes=105),
                "is_alert": True,
                "confidence": 0.97,
                "matched_watchlist_id": 1
            },
            {
                "camera_id": 3,  # Ashram Road - Income Tax Circle
                "plate_number": "GJ01AB1234",
                "timestamp": now - datetime.timedelta(minutes=80),
                "is_alert": True,
                "confidence": 0.95,
                "matched_watchlist_id": 1
            },
            {
                "camera_id": 2,  # SG Highway - Pakwan Cross Road
                "plate_number": "GJ01AB1234",
                "timestamp": now - datetime.timedelta(minutes=52),
                "is_alert": True,
                "confidence": 0.98,
                "matched_watchlist_id": 1
            },
            {
                "camera_id": 7,  # SP Ring Road - Vaishnodevi Circle
                "plate_number": "GJ01AB1234",
                "timestamp": now - datetime.timedelta(minutes=28),
                "is_alert": True,
                "confidence": 0.96,
                "matched_watchlist_id": 1
            },
            {
                "camera_id": 27, # Infocity IT Tower Junction
                "plate_number": "GJ01AB1234",
                "timestamp": now - datetime.timedelta(minutes=8),
                "is_alert": True,
                "confidence": 0.99,
                "matched_watchlist_id": 1
            },
            # Detections for other watchlist targets
            {
                "camera_id": 6,  # Narol Circle
                "plate_number": "GJ27CD5678",
                "timestamp": now - datetime.timedelta(minutes=18),
                "is_alert": True,
                "confidence": 0.94,
                "matched_watchlist_id": 2
            },
            {
                "camera_id": 42, # Surat Kamrej Toll Plaza
                "plate_number": "GJ05EF9012",
                "timestamp": now - datetime.timedelta(minutes=5),
                "is_alert": True,
                "confidence": 0.93,
                "matched_watchlist_id": 3
            }
        ]

        for det in detections_data:
            db.add(Detection(**det))
        db.commit()

        print("[SUCCESS] Database seeded successfully:")
        print(f" - {len(cameras_data)} Cameras (Scale: 52 cameras statewide across Police, RTO, Civil Supplies)")
        print(f" - {len(watchlist_data)} Watchlist Entries ('GJ01AB1234', 'GJ27CD5678', 'GJ05EF9012')")
        print(f" - {len(detections_data)} Detections (including 5-point trajectory for 'GJ01AB1234' across 4+ cameras)")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Seeding failed: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
