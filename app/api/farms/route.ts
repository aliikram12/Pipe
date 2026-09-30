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

    // Farmers only see their own farms
    if (user!.role === 'FARMER') {
      where.farmerId = user!.id;
    }

    if (search) {
      where.OR = [
        { farmName: { contains: search } },
        { location: { contains: search } },
        { cropTypes: { contains: search } },
      ];
    }
    if (status) where.status = status;

    const [total, data] = await Promise.all([
      prisma.farm.count({ where }),
      prisma.farm.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          farmer: { select: { id: true, name: true, email: true } },
          _count: { select: { batches: true } },
        },
      }),
    ]);

    return NextResponse.json({
      data,
      pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch farms' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, errorResponse } = await authenticateRequest(req, ['FARMER', 'SUPER_ADMIN']);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const farm = await prisma.farm.create({
      data: {
        tenantId: user!.tenantId,
        farmerId: user!.id,
        farmName: body.farmName,
        location: body.location,
        latitude: parseFloat(body.latitude),
        longitude: parseFloat(body.longitude),
        totalArea: parseFloat(body.totalArea),
        cropTypes: body.cropTypes,
        status: 'ACTIVE',
      },
    });
    return NextResponse.json(farm, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create farm' }, { status: 500 });
  }
}
