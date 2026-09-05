export interface Camera {
  id: number;
  name: string;
  department: 'Police' | 'RTO' | 'Civil Supplies' | string;
  lat: number;
  lng: number;
  stream_url: string;
  status: 'online' | 'offline' | string;
  city?: string;
  vendor?: string;
  protocol?: string;
  health_status?: 'ONLINE' | 'OFFLINE_TIMEOUT' | 'TAMPERED_OCCLUDED' | 'VIDEO_LOSS' | string;
  fps?: number;
  resolution?: string;
  last_heartbeat?: string;
  tamper_alert?: boolean;
  recent_alert?: boolean;
}

export interface CameraHealthSummary {
  total_registered: number;
  online_count: number;
  tampered_count: number;
  offline_count: number;
  video_loss_count: number;
  uptime_percentage: number;
  bandwidth_raw_gbps: number;
  bandwidth_edge_mbps: number;
  bandwidth_savings_ratio: string;
  vendors_distribution: Record<string, number>;
  protocols_distribution: Record<string, number>;
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
  snapshot_url?: string;
  category?: 'WRONG_WAY_DRIVING' | 'ATM_LOITERING' | 'CROWD_SURGE' | 'TRAFFIC_VIOLATION' | 'HOTLIST_VEHICLE' | string;
  details?: string;
  action_taken?: string;
  status?: 'ACTIVE' | 'DISPATCHED' | 'RESOLVED' | string;
}

export type AnomalyCategory = 
  | 'ALL' 
  | 'WRONG_WAY_DRIVING' 
  | 'ATM_LOITERING' 
  | 'CROWD_SURGE' 
  | 'TRAFFIC_VIOLATION' 
  | 'HOTLIST_VEHICLE';

export interface AnomalyAlert {
  id: number;
  category: 'WRONG_WAY_DRIVING' | 'ATM_LOITERING' | 'CROWD_SURGE' | 'TRAFFIC_VIOLATION';
  title: string;
  camera_id: number;
  camera_name: string;
  department: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  timestamp: string;
  target_identifier: string;
  details: string;
  location_name: string;
  city: string;
  lat: number;
  lng: number;
  status: 'ACTIVE' | 'DISPATCHED' | 'RESOLVED';
  action_taken: string;
  snapshot_url?: string;
}

export interface AnomalySummary {
  total_active: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  resolved_count: number;
  avg_response_time_seconds: number;
  by_category: Record<string, number>;
}

export interface DetectionAttribute {
  id: number;
  camera_id: number;
  camera_name: string;
  city: string;
  lat: number;
  lng: number;
  plate_number: string;
  timestamp: string;
  confidence: number;
  is_alert: boolean;
  vehicle_color: string;
  vehicle_type: string;
  vehicle_make: string;
  speed_kmh: number;
  heading: string;
  snapshot_url?: string;
}

export interface PlausibilitySegment {
  from_camera_id: number;
  from_camera_name: string;
  from_city: string;
  from_timestamp: string;
  to_camera_id: number;
  to_camera_name: string;
  to_city: string;
  to_timestamp: string;
  distance_km: number;
  duration_minutes: number;
  calculated_speed_kmh: number;
  is_physically_impossible: boolean;
  status: 'NORMAL_TRANSIT' | 'EXCESSIVE_SPEED' | 'IMPOSSIBLE_TELEPORTATION' | string;
  anomaly_description?: string;
}

export interface PlausibilityResult {
  plate_number: string;
  vehicle_make: string;
  vehicle_color: string;
  vehicle_type: string;
  total_sightings: number;
  plausibility_score: number;
  is_cloned_plate_anomaly: boolean;
  verdict: 'PLAUSIBLE_SINGLE_TRAJECTORY' | 'CRITICAL_CLONED_PLATE_FRAUD' | string;
  primary_anomaly_reason?: string;
  segments: PlausibilitySegment[];
  sightings: DetectionAttribute[];
}

export interface EdgeTriageMetrics {
  camera_count: number;
  raw_bandwidth_gbps: number;
  edge_metadata_bandwidth_mbps: number;
  ondemand_video_bandwidth_mbps: number;
  total_edge_bandwidth_mbps: number;
  bandwidth_reduction_ratio: string;
  bandwidth_saved_percentage: number;
  gswan_backbone_capacity_gbps: number;
  central_gswan_utilization_percent: number;
  edge_gswan_utilization_percent: number;
  central_network_status: string;
  edge_network_status: string;
  edge_appliances_needed_min: number;
  edge_appliances_needed_max: number;
  hardware_accelerator_profiles: {
    accelerator: string;
    compute_tops: string;
    cameras_per_node: string;
    power_draw: string;
    primary_deployment: string;
    models_supported: string;
  }[];
  cost_central_monthly_inr: string;
  cost_edge_monthly_inr: string;
  cost_savings_inr: string;
}
