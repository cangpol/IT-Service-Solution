import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const categories = await db.getCategories();
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error in GET /api/categories:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil kategori layanan' },
      { status: 500 }
    );
  }
}

