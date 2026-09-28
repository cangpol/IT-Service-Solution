import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ticketNumber: string }> }
) {
  try {
    const { ticketNumber } = await params;
    const body = await request.json();

    const { rating, comment } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: 'Rating harus bernilai antara 1 sampai 5.' },
        { status: 400 }
      );
    }

    const fb = await db.addFeedback(ticketNumber, {
      rating: Number(rating),
      comment,
    });

    if (!fb) {
      return NextResponse.json(
        { success: false, message: 'Tiket tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Terima kasih! Penilaian kepuasan layanan berhasil disimpan.',
      data: fb,
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/tickets/[ticketNumber]/feedback:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menyimpan penilaian feedback' },
      { status: 500 }
    );
  }
}

