import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ticketNumber: string }> }
) {
  try {
    const { ticketNumber } = await params;
    const body = await request.json();

    const { reason, actorName, shouldBlockUser } = body;

    if (!reason) {
      return NextResponse.json(
        { success: false, message: 'Alasan penolakan tiket usil wajib diisi.' },
        { status: 400 }
      );
    }

    const updated = await db.markTicketAsSpam(
      ticketNumber,
      reason,
      actorName || 'Petugas BTIK',
      !!shouldBlockUser
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Tiket tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Tiket ${ticketNumber} berhasil ditolak sebagai laporan usil/spam dan dikeluarkan dari perhitungan SLA.`,
      data: updated,
    });
  } catch (error) {
    console.error('Error in POST /api/tickets/[ticketNumber]/mark-spam:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menandai tiket sebagai spam' },
      { status: 500 }
    );
  }
}

