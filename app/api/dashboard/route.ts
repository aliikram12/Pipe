import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { user, errorResponse } = await authenticateRequest(req);
  if (errorResponse) return errorResponse;

  try {
    const tenantId = user!.tenantId;

    // Run all queries in parallel for performance
    const [
      totalBatches,
      deliveredBatches,
      inTransitShipments,
      totalShipments,
      activeVehicles,
      totalOrders,
      deliveredOrders,
      pendingOrders,
      totalRevenue,
      alertingColdStorages,
      totalWarehouses,
      recentNotifications,
      sensorAlerts,
      pendingInspections,
    ] = await Promise.all([
      prisma.produceBatch.count({ where: { tenantId } }),
      prisma.produceBatch.count({ where: { tenantId, currentStage: 'DELIVERED' } }),
      prisma.shipment.count({ where: { tenantId, status: 'IN_TRANSIT' } }),
      prisma.shipment.count({ where: { tenantId } }),
      prisma.vehicle.count({ where: { tenantId, status: 'IN_TRANSIT' } }),
      prisma.order.count({ where: { tenantId } }),
      prisma.order.count({ where: { tenantId, status: 'DELIVERED' } }),
      prisma.order.count({ where: { tenantId, status: 'PENDING' } }),
      prisma.transaction.aggregate({
        where: { tenantId, type: 'SALE', status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.coldStorage.count({
        where: { warehouse: { tenantId }, status: 'ALERT' },
      }),
      prisma.warehouse.count({ where: { tenantId } }),
      prisma.notification.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: {
          id: true, type: true, title: true, message: true, priority: true, read: true, createdAt: true,
        },
      }),
      prisma.sensorReading.count({
        where: {
          isAlert: true,
          timestamp: { gte: new Date(Date.now() - 24 * 3600000) },
          sensor: { coldStorage: { warehouse: { tenantId } } },
        },
      }),
      prisma.produceBatch.count({
        where: { tenantId, qualityStatus: 'PENDING' },
      }),
    ]);

    // Produce volume by type
    const batchesByType = await prisma.produceBatch.groupBy({
      by: ['produceType'],
      where: { tenantId },
      _sum: { quantity: true },
      _count: { id: true },
    });

    // Shipment status distribution
    const shipmentsByStatus = await prisma.shipment.groupBy({
      by: ['status'],
      where: { tenantId },
      _count: { id: true },
    });

    // Recent shipments
    const recentShipments = await prisma.shipment.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        batch: { select: { produceType: true, variety: true } },
        vehicle: { select: { vehicleNumber: true } },
        driver: { select: { name: true } },
      },
    });

    // Batches by pipeline stage (for the stage progression widget)
    const batchesByStageRaw = await prisma.produceBatch.groupBy({
      by: ['currentStage'],
      where: { tenantId },
      _count: { id: true },
    });
    const batchesByStage = Object.fromEntries(
      batchesByStageRaw.map((b) => [b.currentStage, b._count.id])
    );

    return NextResponse.json({
      // Convenience aliases for the frontend KPI cards
      batchesCount: totalBatches,
      activeShipmentsCount: inTransitShipments,
      batchesByStage,

      kpis: {
        totalBatches,
        deliveredBatches,
        inTransitShipments,
        totalShipments,
        activeVehicles,
        totalOrders,
        deliveredOrders,
        pendingOrders,
        totalRevenue: totalRevenue._sum.amount || 0,
        alertingColdStorages,
        totalWarehouses,
        sensorAlerts,
        pendingInspections,
        deliveryRate: totalShipments > 0
          ? Math.round((deliveredBatches / totalShipments) * 100)
          : 0,
      },
      charts: {
        batchesByType: batchesByType.map((b) => ({
          name: b.produceType,
          quantity: b._sum.quantity || 0,
          count: b._count.id,
        })),
        shipmentsByStatus: shipmentsByStatus.map((s) => ({
          status: s.status,
          count: s._count.id,
        })),
      },
      recentShipments,
      recentNotifications,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Failed to load dashboard data' }, { status: 500 });
  }
}
