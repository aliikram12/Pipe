import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyRefreshToken, signAccessToken, signRefreshToken, setAuthCookies } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    let token: string | undefined;

    try {
      const body = await req.json();
      token = body?.refreshToken;
    } catch {
      // Body might be empty if called via cookie
    }

    if (!token) {
      token = req.cookies.get('agri_refresh_token')?.value;
    }

    if (!token) {
      return NextResponse.json({ error: 'Refresh token is required' }, { status: 400 });
    }

    const decoded = verifyRefreshToken(token);
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

    const newAccessToken = signAccessToken(session);
    const newRefreshToken = signRefreshToken(session);

    const response = NextResponse.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: session,
    });

    setAuthCookies(response, newAccessToken, newRefreshToken);
    return response;
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
