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

    // Retailers see only their orders
    if (user!.role === 'RETAILER') {
      where.retailerId = user!.id;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { shippingAddress: { contains: search } },
      ];
    }
    if (status) where.status = status;

    const [total, data] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          retailer: { select: { id: true, name: true, email: true } },
          items: {
            include: {
              produceBatch: { select: { batchNumber: true, produceType: true, variety: true } },
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      data,
      pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, errorResponse } = await authenticateRequest(req, ['RETAILER', 'SUPER_ADMIN']);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const count = await prisma.order.count({ where: { tenantId: user!.tenantId } });
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(count + 1001).padStart(5, '0')}`;

    const items = body.items as { produceBatchId: string; quantity: number; unitPrice: number }[];
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const tax = subtotal * 0.0825;
    const total = subtotal + tax;

    const order = await prisma.order.create({
      data: {
        tenantId: user!.tenantId,
        retailerId: user!.id,
        orderNumber,
        status: 'PENDING',
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        totalAmount: parseFloat(total.toFixed(2)),
        deliveryDate: new Date(body.deliveryDate),
        shippingAddress: body.shippingAddress,
        notes: body.notes,
        items: {
          create: items.map((item) => ({
            produceBatchId: item.produceBatchId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: parseFloat((item.quantity * item.unitPrice).toFixed(2)),
          })),
        },
      },
      include: {
        items: {
          include: { produceBatch: { select: { batchNumber: true, produceType: true } } },
        },
      },
    });

    // Auto-create invoice
    await prisma.invoice.create({
      data: {
        tenantId: user!.tenantId,
        invoiceNumber: `INV-${new Date().getFullYear()}-${String(count + 1001).padStart(4, '0')}`,
        orderId: order.id,
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        status: 'ISSUED',
        dueDate: new Date(Date.now() + 14 * 24 * 3600 * 1000),
      },
    });

    // Notification
    await prisma.notification.create({
      data: {
        tenantId: user!.tenantId,
        type: 'ORDER',
        title: 'New Order Received',
        message: `Order ${orderNumber} placed by ${user!.name} for $${total.toFixed(2)}`,
        priority: 'INFO',
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: user!.tenantId,
        userId: user!.id,
        action: 'ORDER_CREATED',
        entity: 'ORDER',
        details: `Retailer ${user!.name} placed order ${orderNumber} ($${total.toFixed(2)})`,
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
