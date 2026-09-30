import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { UserRole, UserSession } from './types';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'agrisupply-production-jwt-access-secret-key-xyz-2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'agrisupply-production-jwt-refresh-secret-key-xyz-2026';

export const ROLE_DASHBOARDS: Record<UserRole, string> = {
  SUPER_ADMIN: '/dashboard/admin',
  FARMER: '/dashboard/farmer',
  TRANSPORTER: '/dashboard/transporter',
  WAREHOUSE_ADMIN: '/dashboard/warehouse',
  RETAILER: '/dashboard/retailer',
};

export function signAccessToken(user: UserSession): string {
  return jwt.sign(
    {
      id: user.id,
      tenantId: user.tenantId,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantName: user.tenantName,
    },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
}

export function signRefreshToken(user: UserSession): string {
  return jwt.sign(
    { id: user.id, role: user.role },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyAccessToken(token: string): UserSession | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      id: decoded.id,
      tenantId: decoded.tenantId,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role as UserRole,
      tenantName: decoded.tenantName,
    };
  } catch (err) {
    return null;
  }
}

export function verifyRefreshToken(token: string): { id: string; role: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as any;
    return { id: decoded.id, role: decoded.role };
  } catch {
    return null;
  }
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function extractTokenFromHeader(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  const cookieToken = req.cookies.get('agri_access_token')?.value;
  return cookieToken || null;
}

export function setAuthCookies(res: NextResponse, accessToken: string, refreshToken: string) {
  res.cookies.set('agri_access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 1 day
  });

  res.cookies.set('agri_refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export function clearAuthCookies(res: NextResponse) {
  res.cookies.set('agri_access_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  res.cookies.set('agri_refresh_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export async function authenticateRequest(
  req: NextRequest,
  allowedRoles?: UserRole[]
): Promise<{ user: UserSession | null; errorResponse: NextResponse | null }> {
  const token = extractTokenFromHeader(req);
  if (!token) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: 'Unauthorized: Authentication token required' },
        { status: 401 }
      ),
    };
  }

  const user = verifyAccessToken(token);
  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: 'Unauthorized: Token expired or invalid' },
        { status: 401 }
      ),
    };
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: `Forbidden: Access restricted to roles [${allowedRoles.join(', ')}]` },
        { status: 403 }
      ),
    };
  }

  return { user, errorResponse: null };
}
