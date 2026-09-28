import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateTicketNumber } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const priority = searchParams.get('priority') || undefined;
    const categoryId = searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : undefined;
    const search = searchParams.get('search') || undefined;
    const requesterEmail = searchParams.get('requesterEmail') || undefined;

    const tickets = await db.getTickets({
      status,
      priority,
      categoryId,
      search,
      requesterEmail,
    });

    return NextResponse.json({ success: true, data: tickets });
  } catch (error) {
    console.error('Error in GET /api/tickets:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data tiket' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      title,
      description,
      categoryId,
      priority,
      requesterName,
      requesterEmail,
      requesterRole,
      requesterId,
      requesterPhone,
      locationBuilding,
      locationRoom,
    } = body;

    if (!title || !description || !categoryId || !requesterName || !requesterEmail || !locationBuilding || !locationRoom) {
      return NextResponse.json(
        { success: false, message: 'Mohon lengkapi semua kolom formulir yang wajib diisi.' },
        { status: 400 }
      );
    }

    const ticketNumber = generateTicketNumber();

    const newTicket = await db.createTicket({
      ticketNumber,
      title,
      description,
      categoryId: Number(categoryId),
      priority: priority || 'MEDIUM',
      requesterName,
      requesterEmail,
      requesterRole: requesterRole || 'Mahasiswa',
      requesterId: requesterId || undefined,
      requesterPhone: requesterPhone || undefined,
      locationBuilding,
      locationRoom,
    });

    return NextResponse.json({
      success: true,
      message: `Tiket berhasil dibuat dengan nomor ${ticketNumber}`,
      data: newTicket,
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/tickets:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal membuat tiket baru' },
      { status: 500 }
    );
  }
}

