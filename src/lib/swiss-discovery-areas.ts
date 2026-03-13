export interface SwissDiscoveryArea {
  label: string;
  fallbackCity: string;
  fallbackRegion: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
}

export const SWITZERLAND_CENTER: [number, number] = [46.8182, 8.2275];
export const SWITZERLAND_DEFAULT_ZOOM = 8;

export const SWISS_DISCOVERY_AREAS: SwissDiscoveryArea[] = [
  { label: "Aarau", fallbackCity: "Aarau", fallbackRegion: "AG", latitude: 47.3925, longitude: 8.0442, radiusMeters: 22000 },
  { label: "Altdorf", fallbackCity: "Altdorf", fallbackRegion: "UR", latitude: 46.8804, longitude: 8.6444, radiusMeters: 20000 },
  { label: "Appenzell", fallbackCity: "Appenzell", fallbackRegion: "AI", latitude: 47.3319, longitude: 9.4096, radiusMeters: 18000 },
  { label: "Basel", fallbackCity: "Basel", fallbackRegion: "BS", latitude: 47.5596, longitude: 7.5886, radiusMeters: 25000 },
  { label: "Bellinzona", fallbackCity: "Bellinzona", fallbackRegion: "TI", latitude: 46.1956, longitude: 9.0238, radiusMeters: 22000 },
  { label: "Bern", fallbackCity: "Bern", fallbackRegion: "BE", latitude: 46.948, longitude: 7.4474, radiusMeters: 28000 },
  { label: "Biel/Bienne", fallbackCity: "Biel/Bienne", fallbackRegion: "BE", latitude: 47.1368, longitude: 7.2468, radiusMeters: 22000 },
  { label: "Chur", fallbackCity: "Chur", fallbackRegion: "GR", latitude: 46.8508, longitude: 9.5329, radiusMeters: 22000 },
  { label: "Delémont", fallbackCity: "Delémont", fallbackRegion: "JU", latitude: 47.3647, longitude: 7.3445, radiusMeters: 20000 },
  { label: "Frauenfeld", fallbackCity: "Frauenfeld", fallbackRegion: "TG", latitude: 47.5578, longitude: 8.8989, radiusMeters: 20000 },
  { label: "Fribourg", fallbackCity: "Fribourg", fallbackRegion: "FR", latitude: 46.8065, longitude: 7.1619, radiusMeters: 22000 },
  { label: "Geneva", fallbackCity: "Geneva", fallbackRegion: "GE", latitude: 46.2044, longitude: 6.1432, radiusMeters: 28000 },
  { label: "Glarus", fallbackCity: "Glarus", fallbackRegion: "GL", latitude: 47.0411, longitude: 9.0669, radiusMeters: 18000 },
  { label: "Herisau", fallbackCity: "Herisau", fallbackRegion: "AR", latitude: 47.3861, longitude: 9.2792, radiusMeters: 18000 },
  { label: "Lausanne", fallbackCity: "Lausanne", fallbackRegion: "VD", latitude: 46.5197, longitude: 6.6323, radiusMeters: 28000 },
  { label: "Liestal", fallbackCity: "Liestal", fallbackRegion: "BL", latitude: 47.4866, longitude: 7.7346, radiusMeters: 20000 },
  { label: "Locarno", fallbackCity: "Locarno", fallbackRegion: "TI", latitude: 46.17, longitude: 8.7995, radiusMeters: 18000 },
  { label: "Lucerne", fallbackCity: "Lucerne", fallbackRegion: "LU", latitude: 47.0502, longitude: 8.3093, radiusMeters: 26000 },
  { label: "Neuchâtel", fallbackCity: "Neuchâtel", fallbackRegion: "NE", latitude: 46.9918, longitude: 6.931, radiusMeters: 22000 },
  { label: "Sarnen", fallbackCity: "Sarnen", fallbackRegion: "OW", latitude: 46.8969, longitude: 8.2453, radiusMeters: 18000 },
  { label: "Schaffhausen", fallbackCity: "Schaffhausen", fallbackRegion: "SH", latitude: 47.6973, longitude: 8.6349, radiusMeters: 20000 },
  { label: "Schwyz", fallbackCity: "Schwyz", fallbackRegion: "SZ", latitude: 47.0207, longitude: 8.6522, radiusMeters: 20000 },
  { label: "Sion", fallbackCity: "Sion", fallbackRegion: "VS", latitude: 46.2331, longitude: 7.3606, radiusMeters: 22000 },
  { label: "Solothurn", fallbackCity: "Solothurn", fallbackRegion: "SO", latitude: 47.2088, longitude: 7.537, radiusMeters: 20000 },
  { label: "St. Gallen", fallbackCity: "St. Gallen", fallbackRegion: "SG", latitude: 47.4245, longitude: 9.3767, radiusMeters: 26000 },
  { label: "Stans", fallbackCity: "Stans", fallbackRegion: "NW", latitude: 46.9581, longitude: 8.3661, radiusMeters: 18000 },
  { label: "Thun", fallbackCity: "Thun", fallbackRegion: "BE", latitude: 46.758, longitude: 7.628, radiusMeters: 22000 },
  { label: "Winterthur", fallbackCity: "Winterthur", fallbackRegion: "ZH", latitude: 47.4988, longitude: 8.7241, radiusMeters: 22000 },
  { label: "Zug", fallbackCity: "Zug", fallbackRegion: "ZG", latitude: 47.1662, longitude: 8.5155, radiusMeters: 18000 },
  { label: "Zurich", fallbackCity: "Zurich", fallbackRegion: "ZH", latitude: 47.3769, longitude: 8.5417, radiusMeters: 30000 },
];

export const SWISS_REGION_CODES = [...new Set(SWISS_DISCOVERY_AREAS.map((area) => area.fallbackRegion))].sort();
