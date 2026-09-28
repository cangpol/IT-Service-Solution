import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const analytics = await db.getAnalytics();
    return NextResponse.json({ success: true, data: analytics });
  } catch (error) {
    console.error('Error in GET /api/analytics:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data analitik' },
      { status: 500 }
    );
  }
}

