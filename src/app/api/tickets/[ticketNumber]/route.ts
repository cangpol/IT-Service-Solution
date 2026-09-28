import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ ticketNumber: string }> }
) {
  try {
    const { ticketNumber } = await params;
    const ticket = await db.getTicketByNumber(ticketNumber);

    if (!ticket) {
      return NextResponse.json(
        { success: false, message: `Tiket dengan nomor ${ticketNumber} tidak ditemukan` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: ticket });
  } catch (error) {
    console.error('Error in GET /api/tickets/[ticketNumber]:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil detail tiket' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ ticketNumber: string }> }
) {
  try {
    const { ticketNumber } = await params;
    const body = await request.json();

    const updated = await db.updateTicketStatus(ticketNumber, {
      status: body.status,
      priority: body.priority,
      assignedToId: body.assignedToId,
      actorName: body.actorName,
      note: body.note,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Tiket tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Status tiket berhasil diperbarui',
      data: updated,
    });
  } catch (error) {
    console.error('Error in PATCH /api/tickets/[ticketNumber]:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui status tiket' },
      { status: 500 }
    );
  }
}

