import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { user, errorResponse } = await authenticateRequest(req);
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const pageSize = Math.min(100, parseInt(searchParams.get('pageSize') || '20'));
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const sort = searchParams.get('sort') || 'createdAt';
  const direction = (searchParams.get('direction') || 'desc') as 'asc' | 'desc';

  try {
    const where: any = { tenantId: user!.tenantId };

    // Transporters only see their own shipments
    if (user!.role === 'TRANSPORTER') {
      const driver = await prisma.driver.findFirst({
        where: { tenantId: user!.tenantId, phone: user!.phone || '' },
      });
      if (driver) where.driverId = driver.id;
    }

    if (search) {
      where.OR = [
        { shipmentNumber: { contains: search } },
        { source: { contains: search } },
        { destination: { contains: search } },
      ];
    }
    if (status) where.status = status;

    const [total, data] = await Promise.all([
      prisma.shipment.count({ where }),
      prisma.shipment.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { [sort]: direction },
        include: {
          batch: { select: { batchNumber: true, produceType: true, variety: true } },
          vehicle: { select: { vehicleNumber: true, type: true } },
          driver: { select: { name: true, phone: true } },
        },
      }),
    ]);

    return NextResponse.json({
      data,
      pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch shipments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, errorResponse } = await authenticateRequest(req, ['SUPER_ADMIN', 'FARMER', 'WAREHOUSE_ADMIN']);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const count = await prisma.shipment.count({ where: { tenantId: user!.tenantId } });
    const shipmentNumber = `SHP-${new Date().getFullYear()}-${String(count + 501).padStart(4, '0')}`;

    const shipment = await prisma.shipment.create({
      data: {
        tenantId: user!.tenantId,
        shipmentNumber,
        batchId: body.batchId,
        vehicleId: body.vehicleId,
        driverId: body.driverId,
        source: body.source,
        sourceLat: body.sourceLat ? parseFloat(body.sourceLat) : null,
        sourceLng: body.sourceLng ? parseFloat(body.sourceLng) : null,
        destination: body.destination,
        destinationLat: body.destinationLat ? parseFloat(body.destinationLat) : null,
        destinationLng: body.destinationLng ? parseFloat(body.destinationLng) : null,
        status: 'PLANNED',
        expectedDelivery: new Date(body.expectedDelivery),
        quantity: parseFloat(body.quantity),
        notes: body.notes,
      },
      include: {
        batch: { select: { batchNumber: true, produceType: true } },
        vehicle: { select: { vehicleNumber: true } },
        driver: { select: { name: true } },
      },
    });

    // Update vehicle status
    await prisma.vehicle.update({ where: { id: body.vehicleId }, data: { status: 'IN_TRANSIT' } });

    // Update batch stage
    await prisma.produceBatch.update({
      where: { id: body.batchId },
      data: { currentStage: 'IN_TRANSIT' },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        tenantId: user!.tenantId,
        type: 'SHIPMENT',
        title: 'New Shipment Created',
        message: `${shipmentNumber}: ${shipment.batch.produceType} dispatched to ${shipment.destination}`,
        priority: 'INFO',
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: user!.tenantId,
        userId: user!.id,
        action: 'DISPATCH_SHIPMENT',
        entity: 'SHIPMENT',
        details: `Shipment ${shipmentNumber} created for vehicle ${shipment.vehicle.vehicleNumber}`,
      },
    });

    return NextResponse.json(shipment, { status: 201 });
  } catch (error) {
    console.error('Create shipment error:', error);
    return NextResponse.json({ error: 'Failed to create shipment' }, { status: 500 });
  }
}
