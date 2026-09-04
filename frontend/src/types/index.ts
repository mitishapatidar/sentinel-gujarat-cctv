export interface Camera {
  id: number;
  name: string;
  department: 'Police' | 'RTO' | 'Civil Supplies' | string;
  lat: number;
  lng: number;
  stream_url: string;
  status: 'online' | 'offline' | string;
  city?: string;
  recent_alert?: boolean;
}

export interface Watchlist {
  id: number;
  plate_number: string;
  vehicle_model: string;
  crime_type: 'Stolen' | 'Wanted Suspect' | string;
  alert_level: 'Critical' | 'High' | 'Medium' | string;
  flagged_date: string;
}

export interface TrajectoryPoint {
  detection_id: number;
  camera_id: number;
  camera_name: string;
  department: string;
  lat: number;
  lng: number;
  plate_number: string;
  timestamp: string;
  confidence: number;
  is_alert: boolean;
}

export interface Alert {
  id: number;
  camera_id: number;
  camera_name: string;
  department: string;
  lat: number;
  lng: number;
  plate_number: string;
  timestamp: string;
  confidence: number;
  crime_type?: string;
  vehicle_model?: string;
  alert_level?: 'Critical' | 'High' | 'Medium' | string;
  similarity?: number;
  snapshot?: string;
}
