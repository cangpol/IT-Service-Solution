import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ticketNumber: string }> }
) {
  try {
    const { ticketNumber } = await params;
    const body = await request.json();

    const { senderName, senderRole, message, isInternal } = body;

    if (!senderName || !message) {
      return NextResponse.json(
        { success: false, message: 'Nama pengirim dan pesan wajib diisi.' },
        { status: 400 }
      );
    }

    const newMsg = await db.addMessage(ticketNumber, {
      senderName,
      senderRole: senderRole || 'Civitas',
      message,
      isInternal: !!isInternal,
    });

    if (!newMsg) {
      return NextResponse.json(
        { success: false, message: 'Tiket tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Pesan berhasil dikirim',
      data: newMsg,
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/tickets/[ticketNumber]/messages:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengirim pesan' },
      { status: 500 }
    );
  }
}

