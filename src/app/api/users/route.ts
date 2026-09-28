import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || undefined;
    const isActive = searchParams.get('isActive') !== null ? searchParams.get('isActive') === 'true' : undefined;
    const search = searchParams.get('search') || undefined;

    const users = await db.getUsers({ role, isActive, search });
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error('Error in GET /api/users:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data pengguna' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, role, identifier, department, phone, password } = body;

    if (!name || !email || !role) {
      return NextResponse.json(
        { success: false, message: 'Nama, email, dan peran wajib diisi.' },
        { status: 400 }
      );
    }

    // Check email uniqueness
    const existing = await db.getUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Email sudah terdaftar pada sistem.' },
        { status: 409 }
      );
    }

    const newUser = await db.createUser({
      name,
      email,
      password: password || 'upitra123',
      role,
      identifier,
      department,
      phone,
    });

    return NextResponse.json({
      success: true,
      message: 'Pengguna baru berhasil didaftarkan',
      data: newUser,
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/users:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menambahkan pengguna' },
      { status: 500 }
    );
  }
}

