import sys
from anpr_engine import normalize_plate, calculate_similarity, match_against_watchlist
from database import SessionLocal, Camera, Watchlist, Detection

def run_tests():
    print("--- 1. Testing Plate Normalization ---")
    raw = "gj-01 ab 1234"
    cleaned = normalize_plate(raw)
    assert cleaned == "GJ01AB1234", f"Expected GJ01AB1234, got {cleaned}"
    print(f"PASS: normalize_plate('{raw}') -> '{cleaned}'")

    print("\n--- 2. Testing Levenshtein Fuzzy Matching ---")
    # Test OCR typo: 'B' mistaken for '8'
    typo_plate = "GJ01A81234"
    sim = calculate_similarity(typo_plate, "GJ01AB1234")
    print(f"Similarity between '{typo_plate}' and 'GJ01AB1234': {sim:.2f}")
    assert sim >= 0.80, f"Expected >= 0.80, got {sim}"
    print("PASS: Typo 'GJ01A81234' matches with >= 80% similarity")

    watchlist = [
        {"id": 1, "plate_number": "GJ01AB1234", "crime_type": "Armed Robbery"}
    ]
    is_match, item, match_sim = match_against_watchlist(typo_plate, watchlist, threshold=0.80)
    assert is_match is True
    assert item["plate_number"] == "GJ01AB1234"
    print(f"PASS: match_against_watchlist recognized {item['plate_number']} with similarity {match_sim}")

    print("\n--- 3. Testing Database Query ---")
    db = SessionLocal()
    try:
        cam_count = db.query(Camera).count()
        wl_count = db.query(Watchlist).count()
        det_count = db.query(Detection).count()
        print(f"Cameras in DB: {cam_count}")
        print(f"Watchlist in DB: {wl_count}")
        print(f"Detections in DB: {det_count}")
        assert cam_count == 10, f"Expected 10 cameras, got {cam_count}"
        assert wl_count == 3, f"Expected 3 watchlist items, got {wl_count}"
        assert det_count >= 7, f"Expected >= 7 detections, got {det_count}"
        print("PASS: Database verified successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    run_tests()
