/**
 * Internal API: Increment the hit counter for a redirect.
 * Called by middleware.ts in a fire-and-forget fashion.
 */
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import URLRedirect from '@/models/URLRedirect';

export async function POST(request: NextRequest) {
  try {
    const { from } = await request.json();
    if (!from) return NextResponse.json({ ok: false });

    await connectDB();
    await URLRedirect.updateOne(
      { from },
      { $inc: { hits: 1 }, $set: { lastHit: new Date() } }
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
