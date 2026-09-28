import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const statuses = await db.getServiceStatuses();
    return NextResponse.json({ success: true, data: statuses });
  } catch (error) {
    console.error('Error in GET /api/system-status:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil status sistem' },
      { status: 500 }
    );
  }
}

