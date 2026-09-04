import urllib.request
import json

def test_api():
    base = "http://localhost:8000"
    
    # Cameras
    req = urllib.request.urlopen(f"{base}/api/cameras")
    cameras = json.loads(req.read().decode())
    print(f"Cameras endpoint: {len(cameras)} cameras returned.")
    assert len(cameras) == 10

    # Watchlist
    req = urllib.request.urlopen(f"{base}/api/watchlist")
    watchlist = json.loads(req.read().decode())
    print(f"Watchlist endpoint: {len(watchlist)} vehicles returned.")
    assert len(watchlist) == 3

    # Trajectory
    req = urllib.request.urlopen(f"{base}/api/track/GJ01AB1234")
    track = json.loads(req.read().decode())
    print(f"Trajectory endpoint (GJ01AB1234): {len(track)} checkpoints returned.")
    for idx, pt in enumerate(track, 1):
        print(f"  Checkpoint {idx}: {pt['camera_name']} ({pt['lat']}, {pt['lng']}) - {pt['timestamp']}")
    assert len(track) == 5

    # Alerts
    req = urllib.request.urlopen(f"{base}/api/alerts")
    alerts = json.loads(req.read().decode())
    print(f"Alerts endpoint: {len(alerts)} alerts returned.")
    assert len(alerts) >= 1

    # Simulate Detection POST
    sim_data = json.dumps({"camera_id": 1, "plate_number": "GJ01-A8-1234"}).encode('utf-8')
    req = urllib.request.Request(
        f"{base}/api/simulate-detection",
        data=sim_data,
        headers={"Content-Type": "application/json"}
    )
    res = urllib.request.urlopen(req)
    sim_res = json.loads(res.read().decode())
    print(f"Simulation response: is_alert={sim_res['is_alert']}, matched={sim_res.get('matched_watchlist', {}).get('plate_number')}, similarity={sim_res.get('similarity')}")
    assert sim_res['is_alert'] is True

    print("\nALL API ENDPOINT INTEGRATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_api()
