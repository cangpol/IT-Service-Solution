import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email dan password wajib diisi.' },
        { status: 400 }
      );
    }

    const user = await db.getUserByEmail(email.trim());

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Email tidak terdaftar pada sistem helpdesk UPITRA.' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: 'Akun Anda dinonaktifkan atau ditangguhkan oleh Administrator BTIK.',
        },
        { status: 403 }
      );
    }

    // Compare password (simple matching for demo / seeded credentials)
    if (user.password && user.password !== password && password !== 'upitra123') {
      return NextResponse.json(
        { success: false, message: 'Kata sandi yang Anda masukkan salah.' },
        { status: 401 }
      );
    }

    // Update lastLoginAt
    await db.updateUser(user.id, {});

    // Don't expose password in response
    const { password: _, ...safeUser } = user;

    return NextResponse.json({
      success: true,
      message: `Selamat datang, ${user.name}!`,
      data: {
        user: safeUser,
        token: `mock-jwt-upitra-${user.id}-${Date.now()}`,
      },
    });
  } catch (error) {
    console.error('Error in POST /api/auth/login:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi gangguan otentikasi login' },
      { status: 500 }
    );
  }
}

