import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { user, errorResponse } = await authenticateRequest(req);
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const reportType = searchParams.get('type') || 'shipments';
  const tenantId = user!.tenantId;

  try {
    if (reportType === 'shipments') {
      const data = await prisma.shipment.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        include: {
          batch: { select: { batchNumber: true, produceType: true, variety: true } },
          vehicle: { select: { vehicleNumber: true, type: true } },
          driver: { select: { name: true, phone: true } },
        },
      });
      return NextResponse.json({ type: 'shipments', data, generatedAt: new Date().toISOString() });
    }

    if (reportType === 'quality') {
      const data = await prisma.qualityInspection.findMany({
        where: { batch: { tenantId } },
        orderBy: { inspectionDate: 'desc' },
        include: {
          batch: { select: { batchNumber: true, produceType: true, variety: true, quantity: true } },
          inspector: { select: { name: true } },
        },
      });
      return NextResponse.json({ type: 'quality', data, generatedAt: new Date().toISOString() });
    }

    if (reportType === 'cold-chain') {
      const sensors = await prisma.ioTSensor.findMany({
        where: { coldStorage: { warehouse: { tenantId } } },
        include: {
          coldStorage: { include: { warehouse: { select: { name: true } } } },
          readings: {
            where: { timestamp: { gte: new Date(Date.now() - 7 * 24 * 3600000) } },
            orderBy: { timestamp: 'asc' },
          },
        },
      });

      const data = sensors.map((sensor) => {
        const readings = sensor.readings;
        const temps = readings.map((r) => r.temperature);
        const violations = readings.filter((r) => r.isAlert).length;
        return {
          sensorCode: sensor.sensorCode,
          coldStorage: sensor.coldStorage.name,
          warehouse: sensor.coldStorage.warehouse.name,
          tempMin: temps.length ? Math.min(...temps).toFixed(1) : '—',
          tempMax: temps.length ? Math.max(...temps).toFixed(1) : '—',
          tempAvg: temps.length ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1) : '—',
          violations,
          totalReadings: readings.length,
          status: sensor.status,
        };
      });
      return NextResponse.json({ type: 'cold-chain', data, generatedAt: new Date().toISOString() });
    }

    if (reportType === 'financial') {
      const data = await prisma.transaction.findMany({
        where: { tenantId },
        orderBy: { transactionDate: 'desc' },
      });
      const summary = {
        totalSales: data.filter((t) => t.type === 'SALE').reduce((s, t) => s + t.amount, 0),
        totalTransport: data.filter((t) => t.type === 'TRANSPORT_FEE').reduce((s, t) => s + t.amount, 0),
        totalStorage: data.filter((t) => t.type === 'STORAGE_FEE').reduce((s, t) => s + t.amount, 0),
        totalTransactions: data.length,
      };
      return NextResponse.json({ type: 'financial', data, summary, generatedAt: new Date().toISOString() });
    }

    return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
  } catch (error) {
    console.error('Report error:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
