import sys
import unittest
import numpy as np
from database import SessionLocal, Camera, Watchlist, Detection
from anpr_engine import clean_plate_text, compute_fuzzy_similarity, match_against_watchlist, process_frame, simulate_mock_video_stream
from fastapi.testclient import TestClient
from main import app

class TestSentinelPlatform(unittest.TestCase):

    def setUp(self):
        self.client = TestClient(app)
        self.db = SessionLocal()

    def tearDown(self):
        self.db.close()

    def test_01_database_camera_scale(self):
        """Verify that at least 50 cameras are registered across Gujarat."""
        count = self.db.query(Camera).count()
        print(f"[TEST 1] Registered cameras count: {count}")
        self.assertGreaterEqual(count, 50, "System must support at least 50 cameras.")

        # Check departments
        police_cams = self.db.query(Camera).filter(Camera.department == "Police").count()
        rto_cams = self.db.query(Camera).filter(Camera.department == "RTO").count()
        civil_cams = self.db.query(Camera).filter(Camera.department == "Civil Supplies").count()
        print(f"[TEST 1] Department breakdown -> Police: {police_cams}, RTO: {rto_cams}, Civil Supplies: {civil_cams}")
        self.assertGreater(police_cams, 0)
        self.assertGreater(rto_cams, 0)
        self.assertGreater(civil_cams, 0)

    def test_02_watchlist_and_post_endpoint(self):
        """Verify seeded watchlist and test POST /api/watchlist with input validation."""
        wl_items = self.db.query(Watchlist).all()
        plates = [w.plate_number for w in wl_items]
        print(f"[TEST 2] Seeded watchlist plates: {plates}")
        self.assertIn("GJ01AB1234", plates)
        self.assertIn("GJ27CD5678", plates)
        self.assertIn("GJ05EF9012", plates)

        # Test POST /api/watchlist
        new_suspect = {
            "plate_number": "GJ06XX9999",
            "vehicle_model": "Red Hyundai Creta",
            "crime_type": "Kidnapping Suspect",
            "alert_level": "Critical"
        }
        res = self.client.post("/api/watchlist", json=new_suspect)
        self.assertIn(res.status_code, [201, 409])
        print(f"[TEST 2] POST /api/watchlist response: {res.status_code}")

        # Security check: Test malicious injection string
        malicious_input = {
            "plate_number": "<script>alert(1)</script>",
            "vehicle_model": "Test",
            "crime_type": "Test",
            "alert_level": "Critical"
        }
        res_sec = self.client.post("/api/watchlist", json=malicious_input)
        self.assertEqual(res_sec.status_code, 422, "Security validation must reject XSS / injection payloads.")
        print("[TEST 2] Malicious payload rejected properly with 422 Unprocessable Entity.")

    def test_03_anpr_process_frame_and_fuzzy_matcher(self):
        """Test process_frame and fuzzy matching >= 80% with OCR typos."""
        dummy_frame = np.zeros((360, 640, 3), dtype=np.uint8)
        result = process_frame(dummy_frame, camera_id=1, watchlist_cache=[
            {"id": 1, "plate_number": "GJ01AB1234", "crime_type": "Stolen", "alert_level": "Critical"}
        ])

        self.assertIn("detected_plate", result)
        self.assertIn("bounding_box", result)
        self.assertIn("is_watchlist_match", result)
        self.assertIn("confidence", result)
        self.assertIn("matched_watchlist_entry", result)
        print(f"[TEST 3] process_frame output: plate={result['detected_plate']}, bbox={result['bounding_box']}, conf={result['confidence']}")

        # Fuzzy match test (Levenshtein + difflib)
        typo_plate = "GJ01A81234" # '8' instead of 'B'
        sim = compute_fuzzy_similarity(typo_plate, "GJ01AB1234")
        print(f"[TEST 3] Fuzzy similarity between '{typo_plate}' and 'GJ01AB1234': {sim}")
        self.assertGreaterEqual(sim, 0.80, "Fuzzy match must achieve >= 80% similarity.")

    def test_04_vehicle_route_reconstruction(self):
        """Verify 5 historical detection records for 'GJ01AB1234' across 4+ cameras."""
        res = self.client.get("/api/track/GJ01AB1234")
        self.assertEqual(res.status_code, 200)
        track = res.json()
        print(f"[TEST 4] Track points for GJ01AB1234: {len(track)}")
        self.assertGreaterEqual(len(track), 5, "Trajectory must contain at least 5 chronological checkpoints.")

        # Check that at least 4 distinct cameras are traversed
        unique_cameras = set(pt["camera_id"] for pt in track)
        print(f"[TEST 4] Traversed cameras: {unique_cameras}")
        self.assertGreaterEqual(len(unique_cameras), 4, "Route must traverse at least 4 different cameras.")

    def test_05_security_headers(self):
        """Verify that security headers (CSP, nosniff, DENY) are enforced."""
        res = self.client.get("/api/cameras")
        self.assertEqual(res.headers.get("X-Content-Type-Options"), "nosniff")
        self.assertEqual(res.headers.get("X-Frame-Options"), "DENY")
        self.assertIn("default-src 'self'", res.headers.get("Content-Security-Policy"))
        print("[TEST 5] Security headers verified successfully.")

if __name__ == "__main__":
    unittest.main()
