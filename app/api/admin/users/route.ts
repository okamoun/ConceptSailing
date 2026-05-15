import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { getApps } from 'firebase-admin/app';
import type { AdminPermission, UserRole } from '@/lib/userManagement';

function adminDb() {
  return getFirestore(getApps()[0]);
}

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return false;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const snap = await adminDb().collection('users').doc(decoded.uid).get();
    return snap.exists && snap.data()?.role === 'admin';
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const snap = await adminDb().collection('users').get();
  const users = snap.docs.map(d => d.data());
  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json() as {
    email: string;
    password: string;
    role: UserRole;
    permissions: AdminPermission[];
    reviewToken?: string;
  };

  if (!body.email || !body.password || !body.role) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const userRecord = await adminAuth.createUser({
    email: body.email,
    password: body.password,
  });

  const now = Timestamp.now();
  const profile = {
    uid: userRecord.uid,
    email: body.email,
    role: body.role,
    permissions: body.role === 'admin' ? (body.permissions ?? []) : [],
    ...(body.reviewToken ? { reviewToken: body.reviewToken } : {}),
    createdAt: now,
    updatedAt: now,
  };

  await adminDb().collection('users').doc(userRecord.uid).set(profile);

  return NextResponse.json({ uid: userRecord.uid }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json() as {
    uid: string;
    role?: UserRole;
    permissions?: AdminPermission[];
    reviewToken?: string;
  };

  if (!body.uid) {
    return NextResponse.json({ error: 'Missing uid' }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updatedAt: Timestamp.now() };
  if (body.role !== undefined) updates.role = body.role;
  if (body.permissions !== undefined) updates.permissions = body.permissions;
  if (body.reviewToken !== undefined) updates.reviewToken = body.reviewToken;

  await adminDb().collection('users').doc(body.uid).update(updates);

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const uid = req.nextUrl.searchParams.get('uid');
  if (!uid) return NextResponse.json({ error: 'Missing uid' }, { status: 400 });

  await Promise.all([
    adminAuth.deleteUser(uid),
    adminDb().collection('users').doc(uid).delete(),
  ]);

  return NextResponse.json({ ok: true });
}
