import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateRandomPassword } from '@/lib/utils';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const newPassword = body.password || generateRandomPassword();

    const success = await db.resetPassword(id, newPassword);

    if (!success) {
      return NextResponse.json(
        { success: false, message: 'Pengguna tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Kata sandi berhasil direset oleh administrator',
      data: {
        newPassword,
      },
    });
  } catch (error) {
    console.error('Error in POST /api/users/[id]/reset-password:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mereset kata sandi' },
      { status: 500 }
    );
  }
}

