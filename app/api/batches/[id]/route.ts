import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, errorResponse } = await authenticateRequest(req);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();

    // Verify batch belongs to tenant
    const existing = await prisma.produceBatch.findFirst({
      where: { id: params.id, tenantId: user!.tenantId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    const updated = await prisma.produceBatch.update({
      where: { id: params.id },
      data: {
        ...(body.currentStage && { currentStage: body.currentStage }),
        ...(body.qualityStatus && { qualityStatus: body.qualityStatus }),
        ...(body.quantity && { quantity: parseFloat(body.quantity) }),
      },
      include: { farm: { select: { farmName: true } } },
    });

    if (body.currentStage) {
      await prisma.auditLog.create({
        data: {
          tenantId: user!.tenantId,
          userId: user!.id,
          action: 'STATUS_CHANGE',
          entity: 'BATCH',
          details: `Batch ${existing.batchNumber} moved from ${existing.currentStage} to ${body.currentStage}`,
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update batch' }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, errorResponse } = await authenticateRequest(req);
  if (errorResponse) return errorResponse;

  try {
    const batch = await prisma.produceBatch.findFirst({
      where: { id: params.id, tenantId: user!.tenantId },
      include: {
        farm: { select: { id: true, farmName: true, location: true, farmer: { select: { name: true } } } },
        inspections: {
          orderBy: { createdAt: 'desc' },
          include: { inspector: { select: { name: true } } },
        },
        shipments: {
          orderBy: { createdAt: 'desc' },
          include: {
            vehicle: { select: { vehicleNumber: true, type: true } },
            driver: { select: { name: true } },
          },
        },
      },
    });

    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    return NextResponse.json(batch);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch batch' }, { status: 500 });
  }
}
