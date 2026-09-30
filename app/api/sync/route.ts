import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { user, errorResponse } = await authenticateRequest(req);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { items } = body; // Array of { entity, operation, payload }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No sync items provided' }, { status: 400 });
    }

    const results = [];

    for (const item of items) {
      try {
        if (item.entity === 'GPS' && item.operation === 'CREATE') {
          const gps = await prisma.gPSLocation.create({
            data: {
              vehicleId: item.payload.vehicleId,
              shipmentId: item.payload.shipmentId || null,
              latitude: parseFloat(item.payload.latitude),
              longitude: parseFloat(item.payload.longitude),
              speed: parseFloat(item.payload.speed || '0'),
              timestamp: new Date(item.payload.timestamp),
            },
          });
          results.push({ localId: item.localId, success: true, id: gps.id });
        }

        if (item.entity === 'PROOF' && item.operation === 'UPDATE') {
          const updated = await prisma.shipment.update({
            where: { id: item.payload.shipmentId },
            data: {
              status: 'DELIVERED',
              receiverName: item.payload.receiverName,
              receiverSignature: item.payload.signatureBase64,
              notes: item.payload.notes,
              actualDelivery: new Date(item.payload.timestamp),
            },
          });
          results.push({ localId: item.localId, success: true, id: updated.id });
        }

        if (item.entity === 'INSPECTION' && item.operation === 'CREATE') {
          const insp = await prisma.qualityInspection.create({
            data: {
              batchId: item.payload.batchId,
              inspectorId: user!.id,
              temperature: parseFloat(item.payload.temperature),
              humidity: parseFloat(item.payload.humidity),
              grade: item.payload.grade,
              moisture: parseFloat(item.payload.moisture),
              appearance: item.payload.appearance,
              contamination: item.payload.contamination || false,
              notes: item.payload.notes,
              rejectionReason: item.payload.rejectionReason,
              status: item.payload.status,
              inspectionDate: new Date(item.payload.timestamp),
            },
          });
          results.push({ localId: item.localId, success: true, id: insp.id });
        }
      } catch (err: any) {
        results.push({ localId: item.localId, success: false, error: err.message });
      }
    }

    // Audit
    await prisma.auditLog.create({
      data: {
        tenantId: user!.tenantId,
        userId: user!.id,
        action: 'OFFLINE_SYNC',
        entity: 'SYNC',
        details: `Synced ${results.filter((r) => r.success).length}/${items.length} offline operations`,
      },
    });

    return NextResponse.json({
      results,
      synced: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
