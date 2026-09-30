import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { z } from 'zod';

export async function GET(req: NextRequest) {
  const { user, errorResponse } = await authenticateRequest(req);
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const warehouseId = searchParams.get('warehouseId');

  try {
    const where: any = {};
    if (warehouseId) {
      where.coldStorage = { warehouse: { id: warehouseId, tenantId: user!.tenantId } };
    } else {
      where.coldStorage = { warehouse: { tenantId: user!.tenantId } };
    }

    const sensors = await prisma.ioTSensor.findMany({
      where,
      include: {
        coldStorage: {
          include: {
            warehouse: { select: { id: true, name: true } },
          },
        },
        readings: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
      orderBy: { sensorCode: 'asc' },
    });

    return NextResponse.json(sensors);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sensors' }, { status: 500 });
  }
}

const readingSchema = z.object({
  sensorId: z.string(),
  temperature: z.number(),
  humidity: z.number(),
});

export async function POST(req: NextRequest) {
  // IoT endpoint – allow authenticated or internal calls
  const { user, errorResponse } = await authenticateRequest(req);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const parsed = readingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation error', issues: parsed.error.flatten() }, { status: 400 });
    }

    const sensor = await prisma.ioTSensor.findUnique({
      where: { id: parsed.data.sensorId },
      include: { coldStorage: true },
    });

    if (!sensor) {
      return NextResponse.json({ error: 'Sensor not found' }, { status: 404 });
    }

    const { temperature, humidity } = parsed.data;
    const cs = sensor.coldStorage;

    // Determine if threshold violated
    let isAlert = false;
    let alertReason: string | null = null;

    if (temperature > cs.temperatureMax) {
      isAlert = true;
      alertReason = `High Temperature: ${temperature.toFixed(1)}°C exceeds max ${cs.temperatureMax.toFixed(1)}°C`;
    } else if (temperature < cs.temperatureMin) {
      isAlert = true;
      alertReason = `Low Temperature: ${temperature.toFixed(1)}°C below min ${cs.temperatureMin.toFixed(1)}°C`;
    }
    if (humidity > cs.humidityMax || humidity < cs.humidityMin) {
      isAlert = true;
      alertReason = (alertReason ? alertReason + '; ' : '') +
        `Humidity out of range: ${humidity.toFixed(0)}% (${cs.humidityMin}–${cs.humidityMax}%)`;
    }

    // Save reading
    const reading = await prisma.sensorReading.create({
      data: {
        sensorId: sensor.id,
        temperature,
        humidity,
        isAlert,
        alertReason,
        timestamp: new Date(),
      },
    });

    // Update sensor metadata
    const newSensorStatus = isAlert ? 'ALERT' : 'ONLINE';
    await prisma.ioTSensor.update({
      where: { id: sensor.id },
      data: { lastReading: new Date(), status: newSensorStatus },
    });

    // If alert, update cold storage status and create notification
    if (isAlert) {
      await prisma.coldStorage.update({
        where: { id: cs.id },
        data: { status: 'ALERT' },
      });

      // Find tenant ID via warehouse
      const warehouse = await prisma.warehouse.findUnique({
        where: { id: cs.warehouseId },
      });

      if (warehouse) {
        await prisma.notification.create({
          data: {
            tenantId: warehouse.tenantId,
            type: 'TEMPERATURE',
            title: isAlert && temperature > cs.temperatureMax
              ? '🚨 Critical Temperature Alert'
              : '⚠️ Temperature Warning',
            message: `${sensor.sensorCode} in ${cs.name}: ${alertReason}`,
            priority: temperature > cs.temperatureMax + 2 || temperature < cs.temperatureMin - 2
              ? 'CRITICAL'
              : 'WARNING',
          },
        });
      }

      await prisma.auditLog.create({
        data: {
          tenantId: warehouse?.tenantId || 'unknown',
          userId: user!.id,
          action: 'TEMP_ALERT',
          entity: 'SENSOR',
          details: `${sensor.sensorCode}: ${alertReason}`,
        },
      });
    }

    return NextResponse.json({ reading, isAlert, alertReason });
  } catch (error) {
    console.error('Sensor reading error:', error);
    return NextResponse.json({ error: 'Failed to record sensor reading' }, { status: 500 });
  }
}
