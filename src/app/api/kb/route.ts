import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;

    const articles = await db.getKnowledgeArticles(search, category);
    return NextResponse.json({ success: true, data: articles });
  } catch (error) {
    console.error('Error in GET /api/kb:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data knowledge base' },
      { status: 500 }
    );
  }
}

