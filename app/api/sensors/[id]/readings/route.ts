import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, errorResponse } = await authenticateRequest(req);
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const hours = parseInt(searchParams.get('hours') || '24');
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  try {
    const sensor = await prisma.ioTSensor.findUnique({
      where: { id: params.id },
      include: {
        coldStorage: {
          include: { warehouse: { select: { tenantId: true, name: true } } },
        },
      },
    });

    if (!sensor || sensor.coldStorage.warehouse.tenantId !== user!.tenantId) {
      return NextResponse.json({ error: 'Sensor not found' }, { status: 404 });
    }

    const readings = await prisma.sensorReading.findMany({
      where: { sensorId: params.id, timestamp: { gte: since } },
      orderBy: { timestamp: 'asc' },
    });

    // Aggregate stats
    const temps = readings.map((r) => r.temperature);
    const humids = readings.map((r) => r.humidity);
    const violations = readings.filter((r) => r.isAlert).length;

    const stats = temps.length > 0
      ? {
          tempMin: Math.min(...temps),
          tempMax: Math.max(...temps),
          tempAvg: temps.reduce((a, b) => a + b, 0) / temps.length,
          humidMin: Math.min(...humids),
          humidMax: Math.max(...humids),
          humidAvg: humids.reduce((a, b) => a + b, 0) / humids.length,
          violations,
          totalReadings: readings.length,
        }
      : null;

    return NextResponse.json({
      sensor: {
        id: sensor.id,
        sensorCode: sensor.sensorCode,
        coldStorageName: sensor.coldStorage.name,
        tempMin: sensor.coldStorage.temperatureMin,
        tempMax: sensor.coldStorage.temperatureMax,
        humidMin: sensor.coldStorage.humidityMin,
        humidMax: sensor.coldStorage.humidityMax,
      },
      readings,
      stats,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sensor readings' }, { status: 500 });
  }
}
