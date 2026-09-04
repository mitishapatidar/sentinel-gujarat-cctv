export interface CaseCheckpoint {
  cameraId: number;
  cameraName: string;
  department: string;
  lat: number;
  lng: number;
  timestamp: string;
  speedKmH: number;
  snapshotNote: string;
}

export interface TacticalCase {
  id: string;
  firNumber: string;
  title: string;
  category: 'KIDNAPPING' | 'FUGITIVE_ROBBERY' | 'STOLEN_VEHICLE';
  threatLevel: 'CRITICAL_AMBER' | 'HIGH' | 'MEDIUM';
  policeStation: string;
  targetPlate: string;
  vehicleModel: string;
  vehicleColor: string;
  suspectInfo: string;
  victimInfo?: string;
  incidentTime: string;
  lastSightedTime: string;
  lastSightedCamera: string;
  nextProjectedCheckpoint: {
    name: string;
    lat: number;
    lng: number;
    etaMinutes: number;
    barricadeStatus: 'PENDING' | 'DEPLOYED';
  };
  checkpoints: CaseCheckpoint[];
}

export const TACTICAL_CASES: TacticalCase[] = [
  {
    id: 'case-01',
    firNumber: 'FIR #402/2026',
    title: 'Urgent: Child Abduction at Vastrapur Lake Promenade',
    category: 'KIDNAPPING',
    threatLevel: 'CRITICAL_AMBER',
    policeStation: 'Vastrapur Police Station, Ahmedabad',
    targetPlate: 'GJ06XX9999',
    vehicleModel: 'Hyundai Creta SX',
    vehicleColor: 'Flame Red',
    suspectInfo: 'Vikram Rabari (Alias: Vicky), Armed with firearm, fleeing towards Gandhinagar',
    victimInfo: 'Master Aarav Shah, Age 8 (Wearing Navy School Uniform)',
    incidentTime: 'Today 14:15 IST',
    lastSightedTime: '15:24 IST (9 mins ago)',
    lastSightedCamera: 'SP Ring Road - Vaishnodevi Circle',
    nextProjectedCheckpoint: {
      name: 'CH-0 Highway Toll Naka, Gandhinagar Outer Ring',
      lat: 23.2398,
      lng: 72.6412,
      etaMinutes: 6,
      barricadeStatus: 'PENDING',
    },
    checkpoints: [
      {
        cameraId: 19,
        cameraName: 'Vastrapur Lake Junction',
        department: 'Police',
        lat: 23.0367,
        lng: 72.5305,
        timestamp: '14:22 IST',
        speedKmH: 42,
        snapshotNote: 'Vehicle identified fleeing north away from lake',
      },
      {
        cameraId: 2,
        cameraName: 'SG Highway - Pakwan Cross Road',
        department: 'Police',
        lat: 23.0396,
        lng: 72.5126,
        timestamp: '14:48 IST',
        speedKmH: 68,
        snapshotNote: 'Plate matched with 98% AI confidence. High speed maneuver',
      },
      {
        cameraId: 8,
        cameraName: 'SG Highway - Gota Flyover',
        department: 'Police',
        lat: 23.0988,
        lng: 72.5312,
        timestamp: '15:06 IST',
        speedKmH: 74,
        snapshotNote: 'Entering SP Ring Road corridor northwards',
      },
      {
        cameraId: 7,
        cameraName: 'SP Ring Road - Vaishnodevi Circle',
        department: 'Police',
        lat: 23.1311,
        lng: 72.5458,
        timestamp: '15:24 IST',
        speedKmH: 62,
        snapshotNote: 'Confirmed Sighting! Proceeding towards Gandhinagar CH-0',
      },
    ],
  },
  {
    id: 'case-02',
    firNumber: 'FIR #118/2026',
    title: 'Armed Gold Vault Heist & Police Escort Ambush',
    category: 'FUGITIVE_ROBBERY',
    threatLevel: 'CRITICAL_AMBER',
    policeStation: 'Kalupur Police Station, Ahmedabad',
    targetPlate: 'GJ01AB1234',
    vehicleModel: 'Maruti Suzuki Swift ZXi',
    vehicleColor: 'Pearl Arctic White',
    suspectInfo: 'Rameshwar Gang (3 armed fugitives, automatic carbines)',
    incidentTime: 'Today 10:05 IST',
    lastSightedTime: '11:45 IST',
    lastSightedCamera: 'Infocity IT Tower Junction',
    nextProjectedCheckpoint: {
      name: 'Gandhinagar CH-3 Circle Checkpost',
      lat: 23.2156,
      lng: 72.6369,
      etaMinutes: 4,
      barricadeStatus: 'PENDING',
    },
    checkpoints: [
      {
        cameraId: 4,
        cameraName: 'Kalupur Railway Station Circle',
        department: 'Police',
        lat: 23.0232,
        lng: 72.5997,
        timestamp: '10:15 IST',
        speedKmH: 52,
        snapshotNote: 'Getaway vehicle leaving vault vicinity',
      },
      {
        cameraId: 3,
        cameraName: 'Ashram Road - Income Tax Circle',
        department: 'RTO',
        lat: 23.0423,
        lng: 72.5701,
        timestamp: '10:32 IST',
        speedKmH: 60,
        snapshotNote: 'RTO ANPR sensor triggered hit',
      },
      {
        cameraId: 2,
        cameraName: 'SG Highway - Pakwan Cross Road',
        department: 'Police',
        lat: 23.0396,
        lng: 72.5126,
        timestamp: '10:55 IST',
        speedKmH: 71,
        snapshotNote: 'Heading towards Sarkhej-Gandhinagar expressway',
      },
      {
        cameraId: 7,
        cameraName: 'SP Ring Road - Vaishnodevi Circle',
        department: 'Police',
        lat: 23.1311,
        lng: 72.5458,
        timestamp: '11:20 IST',
        speedKmH: 80,
        snapshotNote: 'Crossing Gandhinagar jurisdictional boundary',
      },
      {
        cameraId: 27,
        cameraName: 'Infocity IT Tower Junction',
        department: 'RTO',
        lat: 23.1905,
        lng: 72.6288,
        timestamp: '11:45 IST',
        speedKmH: 55,
        snapshotNote: 'Vehicle slowed down at Infocity traffic signal',
      },
    ],
  },
  {
    id: 'case-03',
    firNumber: 'FIR #205/2026',
    title: 'Fatal Hit-and-Run on Industrial Corridor & Evasion',
    category: 'FUGITIVE_ROBBERY',
    threatLevel: 'HIGH',
    policeStation: 'Narol Industrial Police Station, Ahmedabad',
    targetPlate: 'GJ27CD5678',
    vehicleModel: 'Mahindra Scorpio-N 4x4',
    vehicleColor: 'Stealth Black',
    suspectInfo: 'Driver intoxicated, fled after colliding with 2 motorcyclists on Narol Highway',
    incidentTime: 'Today 12:30 IST',
    lastSightedTime: '13:12 IST',
    lastSightedCamera: 'Bopal - South Bopal Junction',
    nextProjectedCheckpoint: {
      name: 'Sanand GIDC Automobile Corridor Post',
      lat: 22.9812,
      lng: 72.3789,
      etaMinutes: 8,
      barricadeStatus: 'PENDING',
    },
    checkpoints: [
      {
        cameraId: 6,
        cameraName: 'Narol Circle - Industrial Hub',
        department: 'RTO',
        lat: 22.9734,
        lng: 72.5925,
        timestamp: '12:35 IST',
        speedKmH: 85,
        snapshotNote: 'Front bumper damaged, fleeing southwest',
      },
      {
        cameraId: 10,
        cameraName: 'Sarkhej - Sanand Cross Road',
        department: 'RTO',
        lat: 22.9856,
        lng: 72.4934,
        timestamp: '12:54 IST',
        speedKmH: 78,
        snapshotNote: 'Evading toll plaza via service lane',
      },
      {
        cameraId: 16,
        cameraName: 'Bopal - South Bopal Junction',
        department: 'Police',
        lat: 23.0264,
        lng: 72.4645,
        timestamp: '13:12 IST',
        speedKmH: 64,
        snapshotNote: 'Heading towards Sanand manufacturing belt',
      },
    ],
  },
  {
    id: 'case-04',
    firNumber: 'FIR #892/2026',
    title: 'Stolen Luxury SUV / Inter-State Contraband Smuggling',
    category: 'STOLEN_VEHICLE',
    threatLevel: 'MEDIUM',
    policeStation: 'Kamrej Police Station, Surat Rural',
    targetPlate: 'GJ05EF9012',
    vehicleModel: 'Toyota Fortuner Legender',
    vehicleColor: 'Silver Metallic',
    suspectInfo: 'Inter-state vehicle theft syndicate, forged registration documents',
    incidentTime: 'Yesterday 22:00 IST',
    lastSightedTime: '14:02 IST',
    lastSightedCamera: 'Surat - Kamrej Toll Plaza NH-48',
    nextProjectedCheckpoint: {
      name: 'Golden Toll Plaza Vadodara NH-48',
      lat: 22.3689,
      lng: 73.2245,
      etaMinutes: 22,
      barricadeStatus: 'PENDING',
    },
    checkpoints: [
      {
        cameraId: 40,
        cameraName: 'Surat - Ring Road Textile Market',
        department: 'Police',
        lat: 21.1959,
        lng: 72.8302,
        timestamp: '13:20 IST',
        speedKmH: 45,
        snapshotNote: 'Vehicle stolen from textile mall parking',
      },
      {
        cameraId: 41,
        cameraName: 'Surat - Athwa Gate Circle',
        department: 'Police',
        lat: 21.1823,
        lng: 72.8095,
        timestamp: '13:38 IST',
        speedKmH: 50,
        snapshotNote: 'High-speed evasive turn towards highway',
      },
      {
        cameraId: 42,
        cameraName: 'Surat - Kamrej Toll Plaza NH-48',
        department: 'RTO',
        lat: 21.2712,
        lng: 72.9645,
        timestamp: '14:02 IST',
        speedKmH: 92,
        snapshotNote: 'FASTag bypassed, crossed NH-48 toll moving towards Vadodara',
      },
    ],
  },
];
