import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest, clearAuthCookies } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { user } = await authenticateRequest(req);

    if (user) {
      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.id,
          action: 'LOGOUT',
          entity: 'USER',
          details: `User ${user.email} logged out`,
          ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        },
      });
    }

    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
    clearAuthCookies(response);
    return response;
  } catch (error) {
    const response = NextResponse.json({ success: true, message: 'Session terminated' });
    clearAuthCookies(response);
    return response;
  }
}
