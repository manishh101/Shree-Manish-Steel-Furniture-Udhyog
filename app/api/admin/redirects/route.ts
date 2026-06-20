import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import URLRedirect from '@/models/URLRedirect';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/admin/redirects — list all redirects
export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const redirects = await URLRedirect.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ redirects });
}

// POST /api/admin/redirects — create a redirect
export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { from, to, permanent = true } = await request.json();
  if (!from || !to) {
    return NextResponse.json({ error: '"from" and "to" are required' }, { status: 400 });
  }

  await connectDB();

  // Upsert — update existing redirect or create new one
  const redirect = await URLRedirect.findOneAndUpdate(
    { from },
    { from, to, permanent },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return NextResponse.json({ redirect }, { status: 201 });
}

// DELETE /api/admin/redirects?from=<path> — remove a redirect
export async function DELETE(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const from = request.nextUrl.searchParams.get('from');
  if (!from) {
    return NextResponse.json({ error: '"from" query param is required' }, { status: 400 });
  }

  await connectDB();
  await URLRedirect.deleteOne({ from });
  return NextResponse.json({ success: true });
}
