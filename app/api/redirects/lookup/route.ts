/**
 * Internal API: Look up a URL redirect by its "from" path.
 * Called by middleware.ts to resolve 301/302 redirects.
 * Not authenticated — only used internally (from middleware).
 */
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import URLRedirect from '@/models/URLRedirect';

export async function GET(request: NextRequest) {
  const from = request.nextUrl.searchParams.get('from');
  if (!from) {
    return NextResponse.json({ redirect: null });
  }

  try {
    await connectDB();
    const redirect = await URLRedirect.findOne({ from }).select('to permanent').lean();
    return NextResponse.json({ redirect: redirect ?? null });
  } catch {
    return NextResponse.json({ redirect: null });
  }
}
