import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { isPointInsideGeofence } from '@/lib/geo/geofence';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, errorResponse } = await authenticateRequest(req);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { status, receiverName, receiverSignature, notes, deliveryProofUrl } = body;

    const existing = await prisma.shipment.findFirst({
      where: { id: params.id, tenantId: user!.tenantId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (receiverName) updateData.receiverName = receiverName;
    if (receiverSignature) updateData.receiverSignature = receiverSignature;
    if (notes) updateData.notes = notes;
    if (deliveryProofUrl) updateData.deliveryProofUrl = deliveryProofUrl;
    if (status === 'DELIVERED') updateData.actualDelivery = new Date();

    const updated = await prisma.shipment.update({
      where: { id: params.id },
      data: updateData,
      include: {
        batch: { select: { batchNumber: true, produceType: true } },
        vehicle: { select: { vehicleNumber: true } },
        driver: { select: { name: true } },
      },
    });

    // Update batch stage based on shipment status
    if (status) {
      const stageMap: Record<string, string> = {
        IN_TRANSIT: 'IN_TRANSIT',
        ARRIVED: 'COLD_STORAGE',
        DELIVERED: 'DELIVERED',
      };
      if (stageMap[status]) {
        await prisma.produceBatch.update({
          where: { id: existing.batchId },
          data: { currentStage: stageMap[status] },
        });
      }
      if (status === 'DELIVERED') {
        await prisma.vehicle.update({
          where: { id: existing.vehicleId },
          data: { status: 'AVAILABLE' },
        });
      }
    }

    // Audit
    await prisma.auditLog.create({
      data: {
        tenantId: user!.tenantId,
        userId: user!.id,
        action: 'STATUS_CHANGE',
        entity: 'SHIPMENT',
        details: `Shipment ${existing.shipmentNumber} status updated to ${status || 'modified'}`,
      },
    });

    // Geofence check
    if (status === 'NEAR_DESTINATION' || status === 'ARRIVED') {
      await prisma.notification.create({
        data: {
          tenantId: user!.tenantId,
          type: 'GEOFENCE',
          title: `Vehicle ${status === 'NEAR_DESTINATION' ? 'Near Destination' : 'Arrived'}`,
          message: `Shipment ${existing.shipmentNumber} - ${updated.vehicle.vehicleNumber} ${status === 'NEAR_DESTINATION' ? 'approaching' : 'arrived at'} ${existing.destination}`,
          priority: status === 'ARRIVED' ? 'SUCCESS' : 'INFO',
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update shipment status' }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, errorResponse } = await authenticateRequest(req);
  if (errorResponse) return errorResponse;

  try {
    const shipment = await prisma.shipment.findFirst({
      where: { id: params.id, tenantId: user!.tenantId },
      include: {
        batch: {
          include: {
            farm: { select: { farmName: true, location: true } },
            inspections: { orderBy: { createdAt: 'desc' }, take: 1 },
          },
        },
        vehicle: true,
        driver: true,
        gpsLocations: {
          orderBy: { timestamp: 'desc' },
          take: 50,
        },
      },
    });

    if (!shipment) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }

    return NextResponse.json(shipment);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch shipment' }, { status: 500 });
  }
}
