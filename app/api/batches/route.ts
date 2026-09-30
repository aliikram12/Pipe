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
  const stage = searchParams.get('stage') || '';
  const qualityStatus = searchParams.get('qualityStatus') || '';
  const sort = searchParams.get('sort') || 'createdAt';
  const direction = (searchParams.get('direction') || 'desc') as 'asc' | 'desc';

  try {
    const where: any = { tenantId: user!.tenantId };

    if (user!.role === 'FARMER') {
      // Farmers only see batches from their farms
      const farmerFarms = await prisma.farm.findMany({
        where: { tenantId: user!.tenantId, farmerId: user!.id },
        select: { id: true },
      });
      where.farmId = { in: farmerFarms.map((f) => f.id) };
    }

    if (search) {
      where.OR = [
        { batchNumber: { contains: search } },
        { produceType: { contains: search } },
        { variety: { contains: search } },
      ];
    }
    if (stage) where.currentStage = stage;
    if (qualityStatus) where.qualityStatus = qualityStatus;

    const [total, data] = await Promise.all([
      prisma.produceBatch.count({ where }),
      prisma.produceBatch.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { [sort]: direction },
        include: {
          farm: { select: { id: true, farmName: true, location: true } },
          _count: { select: { inspections: true, shipments: true } },
        },
      }),
    ]);

    return NextResponse.json({
      data,
      pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    console.error('Batches error:', error);
    return NextResponse.json({ error: 'Failed to fetch produce batches' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, errorResponse } = await authenticateRequest(req, ['FARMER', 'SUPER_ADMIN']);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const count = await prisma.produceBatch.count({ where: { tenantId: user!.tenantId } });
    const batchNumber = `BATCH-${new Date().getFullYear()}-${String(count + 1001).padStart(4, '0')}`;

    const batch = await prisma.produceBatch.create({
      data: {
        tenantId: user!.tenantId,
        farmId: body.farmId,
        batchNumber,
        produceType: body.produceType,
        variety: body.variety,
        quantity: parseFloat(body.quantity),
        unit: body.unit || 'kg',
        harvestDate: new Date(body.harvestDate),
        expectedShelfLife: parseInt(body.expectedShelfLife),
        currentStage: 'HARVESTED',
        qualityStatus: 'PENDING',
      },
      include: { farm: { select: { farmName: true } } },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: user!.tenantId,
        userId: user!.id,
        action: 'CREATE_BATCH',
        entity: 'BATCH',
        details: `Farmer registered ${batch.quantity}${batch.unit} of ${batch.produceType} (${batch.batchNumber})`,
      },
    });

    return NextResponse.json(batch, { status: 201 });
  } catch (error) {
    console.error('Create batch error:', error);
    return NextResponse.json({ error: 'Failed to create batch' }, { status: 500 });
  }
}
