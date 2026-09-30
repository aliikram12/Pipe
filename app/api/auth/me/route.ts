import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { user, errorResponse } = await authenticateRequest(req);
  if (errorResponse || !user) {
    return errorResponse || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch fresh user data from DB
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      avatar: true,
      status: true,
      tenantId: true,
      tenant: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
    },
  });

  if (!dbUser || dbUser.status !== 'ACTIVE') {
    return NextResponse.json({ error: 'Account inactive or not found' }, { status: 403 });
  }

  return NextResponse.json({
    user: {
      id: dbUser.id,
      tenantId: dbUser.tenantId,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      phone: dbUser.phone,
      avatar: dbUser.avatar,
      tenantName: dbUser.tenant.name,
    },
  });
}
