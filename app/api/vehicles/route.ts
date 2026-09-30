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

  try {
    const where: any = { tenantId: user!.tenantId };
    if (search) {
      where.OR = [
        { vehicleNumber: { contains: search } },
        { type: { contains: search } },
      ];
    }
    if (status) where.status = status;

    const [total, data] = await Promise.all([
      prisma.vehicle.count({ where }),
      prisma.vehicle.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { vehicleNumber: 'asc' },
      }),
    ]);

    return NextResponse.json({
      data,
      pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch vehicles' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, errorResponse } = await authenticateRequest(req, ['SUPER_ADMIN']);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const vehicle = await prisma.vehicle.create({
      data: {
        tenantId: user!.tenantId,
        vehicleNumber: body.vehicleNumber,
        type: body.type,
        capacity: parseFloat(body.capacity),
        refrigerationEnabled: body.refrigerationEnabled ?? true,
        status: 'AVAILABLE',
        currentLatitude: parseFloat(body.currentLatitude || '37.8044'),
        currentLongitude: parseFloat(body.currentLongitude || '-122.2712'),
      },
    });
    return NextResponse.json(vehicle, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create vehicle' }, { status: 500 });
  }
}
