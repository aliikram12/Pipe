import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyRefreshToken, signAccessToken, signRefreshToken } from '@/lib/auth';
import { z } from 'zod';

const schema = z.object({ refreshToken: z.string() });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Refresh token is required' }, { status: 400 });
    }

    const decoded = verifyRefreshToken(parsed.data.refreshToken);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid or expired refresh token' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { tenant: { select: { id: true, name: true } } },
    });

    if (!user || user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'User account not found or suspended' }, { status: 401 });
    }

    const session = {
      id: user.id,
      tenantId: user.tenantId,
      name: user.name,
      email: user.email,
      role: user.role as any,
      phone: user.phone,
      avatar: user.avatar,
      tenantName: user.tenant.name,
    };

    return NextResponse.json({
      accessToken: signAccessToken(session),
      refreshToken: signRefreshToken(session),
      user: session,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
