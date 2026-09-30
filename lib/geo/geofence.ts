// Geofencing and Geolocation Calculation Utilities

export interface Coordinate {
  latitude: number;
  longitude: number;
}

/**
 * Calculates distance in meters between two coordinates using the Haversine formula
 */
export function calculateDistanceMeters(coord1: Coordinate, coord2: Coordinate): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (coord1.latitude * Math.PI) / 180;
  const phi2 = (coord2.latitude * Math.PI) / 180;
  const deltaPhi = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const deltaLambda = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Checks if a point is within a circular geofence
 */
export function isPointInsideGeofence(
  point: Coordinate,
  geofenceCenter: Coordinate,
  radiusMeters: number
): { inside: boolean; distanceMeters: number } {
  const distance = calculateDistanceMeters(point, geofenceCenter);
  return {
    inside: distance <= radiusMeters,
    distanceMeters: distance,
  };
}

/**
 * Generates an array of interpolated waypoints between start and end
 */
export function interpolateRoute(start: Coordinate, end: Coordinate, steps: number = 30): Coordinate[] {
  const waypoints: Coordinate[] = [];
  for (let i = 0; i <= steps; i++) {
    const fraction = i / steps;
    // Add subtle curvature to simulate road routing rather than pure straight flight
    const lat = start.latitude + (end.latitude - start.latitude) * fraction;
    const lng = start.longitude + (end.longitude - start.longitude) * fraction;
    // Slight jitter/curve offset perpendicular to trajectory
    const curveOffset = Math.sin(fraction * Math.PI) * 0.008;
    waypoints.push({
      latitude: Number((lat + curveOffset).toFixed(6)),
      longitude: Number((lng + curveOffset * 0.5).toFixed(6)),
    });
  }
  return waypoints;
}
