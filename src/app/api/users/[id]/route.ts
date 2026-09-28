import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await db.getUserById(id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Pengguna tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('Error in GET /api/users/[id]:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil detail pengguna' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.email) {
      const existing = await db.getUserByEmail(body.email.trim());
      if (existing && existing.id !== id) {
        return NextResponse.json(
          { success: false, message: 'Email institusi tersebut sudah digunakan oleh akun lain.' },
          { status: 400 }
        );
      }
    }

    const updated = await db.updateUser(id, {
      name: body.name,
      email: body.email ? body.email.trim() : undefined,
      role: body.role,
      identifier: body.identifier,
      department: body.department,
      phone: body.phone,
      isActive: body.isActive,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Pengguna tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Data pengguna berhasil diperbarui',
      data: updated,
    });
  } catch (error) {
    console.error('Error in PATCH /api/users/[id]:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui pengguna' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await db.deleteUser(id);

    if (!success) {
      return NextResponse.json(
        { success: false, message: 'Pengguna tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Akun pengguna berhasil dihapus dari sistem',
    });
  } catch (error) {
    console.error('Error in DELETE /api/users/[id]:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus pengguna' },
      { status: 500 }
    );
  }
}

