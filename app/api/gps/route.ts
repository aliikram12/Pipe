import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { isPointInsideGeofence } from '@/lib/geo/geofence';

export async function POST(req: NextRequest) {
  const { user, errorResponse } = await authenticateRequest(req);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { shipmentId, vehicleId, latitude, longitude, speed } = body;

    // Record GPS point
    const location = await prisma.gPSLocation.create({
      data: {
        shipmentId: shipmentId || null,
        vehicleId,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        speed: parseFloat(speed || '0'),
        timestamp: new Date(),
      },
    });

    // Update vehicle position
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        currentLatitude: parseFloat(latitude),
        currentLongitude: parseFloat(longitude),
        lastGpsUpdate: new Date(),
      },
    });

    // Check geofences
    const geofences = await prisma.geofence.findMany({
      where: { tenantId: user!.tenantId, status: 'ACTIVE' },
    });

    const triggeredGeofences = [];
    for (const gf of geofences) {
      const { inside, distanceMeters } = isPointInsideGeofence(
        { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
        { latitude: gf.latitude, longitude: gf.longitude },
        gf.radius
      );

      if (inside) {
        triggeredGeofences.push(gf);

        // Create geofence notification
        await prisma.notification.create({
          data: {
            tenantId: user!.tenantId,
            type: 'GEOFENCE',
            title: `Vehicle Entered: ${gf.name}`,
            message: `Vehicle entered geofence "${gf.name}" (${Math.round(distanceMeters)}m from center). Shipment ${shipmentId ? `#${shipmentId.slice(-6)}` : 'tracking'} active.`,
            priority: 'INFO',
          },
        });

        // If destination geofence, update shipment to NEAR_DESTINATION
        if (shipmentId && gf.type === 'WAREHOUSE') {
          const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });
          if (shipment && shipment.status === 'IN_TRANSIT') {
            await prisma.shipment.update({
              where: { id: shipmentId },
              data: { status: 'NEAR_DESTINATION' },
            });
          }
        }
      }
    }

    return NextResponse.json({
      location,
      triggeredGeofences: triggeredGeofences.map((g) => g.name),
    });
  } catch (error) {
    console.error('GPS update error:', error);
    return NextResponse.json({ error: 'Failed to record GPS location' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { user, errorResponse } = await authenticateRequest(req);
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const vehicleId = searchParams.get('vehicleId');
  const shipmentId = searchParams.get('shipmentId');
  const limit = parseInt(searchParams.get('limit') || '100');

  try {
    const where: any = {};
    if (vehicleId) where.vehicleId = vehicleId;
    if (shipmentId) where.shipmentId = shipmentId;

    const locations = await prisma.gPSLocation.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return NextResponse.json(locations.reverse());
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch GPS history' }, { status: 500 });
  }
}
