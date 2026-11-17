import { BugoHazardZone, HazardCategory, HazardRiskLevel } from '../types';

export const BUGO_MAP_CENTER = { lat: 8.5089, lng: 124.7568 };

export const BUGO_MAP_BOUNDS = {
  north: 8.538,
  south: 8.478,
  west: 124.728,
  east: 124.792
};

export interface HazardCategoryStyle {
  label: string;
  shortDesc: string;
  pinBg: string;
  pinBorder: string;
  pinGlyph: string;
  circleFill: string;
  circleStroke: string;
  badgeClass: string;
  dotClass: string;
}

export const HAZARD_CATEGORY_META: Record<HazardCategory, HazardCategoryStyle> = {
  Flood: {
    label: 'Flood',
    shortDesc: 'Low-lying river & coastal overflow',
    pinBg: '#2563eb',
    pinBorder: '#1d4ed8',
    pinGlyph: 'F',
    circleFill: '#3b82f6',
    circleStroke: '#1d4ed8',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
    dotClass: 'bg-blue-600'
  },
  Landslide: {
    label: 'Landslide',
    shortDesc: 'Steep slopes & soil erosion risk',
    pinBg: '#d97706',
    pinBorder: '#b45309',
    pinGlyph: 'L',
    circleFill: '#f59e0b',
    circleStroke: '#b45309',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    dotClass: 'bg-amber-600'
  },
  Earthquake: {
    label: 'Earthquake',
    shortDesc: 'Fault line & ground shaking zone',
    pinBg: '#7c3aed',
    pinBorder: '#6d28d9',
    pinGlyph: 'E',
    circleFill: '#8b5cf6',
    circleStroke: '#6d28d9',
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
    dotClass: 'bg-purple-600'
  },
  Fire: {
    label: 'Fire',
    shortDesc: 'Dense housing & industrial fire risk',
    pinBg: '#dc2626',
    pinBorder: '#b91c1c',
    pinGlyph: 'R',
    circleFill: '#ef4444',
    circleStroke: '#b91c1c',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
    dotClass: 'bg-red-600'
  },
  Other: {
    label: 'Other Hazard',
    shortDesc: 'Storm surge, drainage, or local hazard',
    pinBg: '#0d9488',
    pinBorder: '#0f766e',
    pinGlyph: 'H',
    circleFill: '#14b8a6',
    circleStroke: '#0f766e',
    badgeClass: 'bg-teal-50 text-teal-800 border-teal-200',
    dotClass: 'bg-teal-600'
  }
};

export const RISK_LEVEL_BADGES: Record<HazardRiskLevel, string> = {
  Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Moderate: 'bg-amber-50 text-amber-700 border-amber-200',
  High: 'bg-rose-50 text-rose-700 border-rose-200'
};

export const DEFAULT_BUGO_HAZARD_ZONES: BugoHazardZone[] = [
  {
    id: 'hz-bugo-flood-1',
    name: 'Zone 1 Riverside Flood Basin',
    disasterType: 'Flood',
    riskLevel: 'High',
    purok: 'Zone 1 - Centro Riverside',
    lat: 8.5112,
    lng: 124.7535,
    radiusMeters: 220,
    description: 'Riverbank overflow area during heavy monsoon rain.',
    affectedHouseholdsEst: 140,
    updatedAt: '2026-11-01'
  },
  {
    id: 'hz-bugo-coastal-2',
    name: 'Zone 9 Bayside Coastal Surge Belt',
    disasterType: 'Flood',
    riskLevel: 'Moderate',
    purok: 'Zone 9 - Bayside Coastal',
    lat: 8.5162,
    lng: 124.7524,
    radiusMeters: 200,
    description: 'High-tide and storm-drainage backflow area near Macajalar Bay.',
    affectedHouseholdsEst: 95,
    updatedAt: '2026-11-01'
  },
  {
    id: 'hz-bugo-landslide-3',
    name: 'Upper Bugo Hills Slope Zone',
    disasterType: 'Landslide',
    riskLevel: 'High',
    purok: 'Zone 6 - Upper Bugo Hills',
    lat: 8.4978,
    lng: 124.7642,
    radiusMeters: 260,
    description: 'Steep hillside terrain prone to soil saturation and mudslides.',
    affectedHouseholdsEst: 80,
    updatedAt: '2026-11-01'
  },
  {
    id: 'hz-bugo-quake-4',
    name: 'Suntingcahon Valley Seismic Fault Sector',
    disasterType: 'Earthquake',
    riskLevel: 'Moderate',
    purok: 'Zone 3 - Suntingcahon Valley',
    lat: 8.5045,
    lng: 124.7601,
    radiusMeters: 240,
    description: 'Soft alluvial ground with heightened shaking sensitivity.',
    affectedHouseholdsEst: 110,
    updatedAt: '2026-11-01'
  },
  {
    id: 'hz-bugo-fire-5',
    name: 'Lower Bugo Public Market Fire Zone',
    disasterType: 'Fire',
    riskLevel: 'High',
    purok: 'Zone 5 - Lower Bugo Market',
    lat: 8.5094,
    lng: 124.7575,
    radiusMeters: 160,
    description: 'High-density market stalls and narrow residential alleys.',
    affectedHouseholdsEst: 125,
    updatedAt: '2026-11-01'
  }
];
