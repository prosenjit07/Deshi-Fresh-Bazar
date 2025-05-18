import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to verify JWT token
async function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded as { id: string };
  } catch (error) {
    return null;
  }
}

// Get user profile
export async function GET(request: Request) {
  try {
    // Get token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'Not authorized, no token' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { message: 'Not authorized, token failed' },
        { status: 401 }
      );
    }

    // Get user data
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

// Update user profile
export async function PUT(request: Request) {
  try {
    // Get token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'Not authorized, no token' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { message: 'Not authorized, token failed' },
        { status: 401 }
      );
    }

    const { name, email, password } = await request.json();

    // Get current user data
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.id)
      .single();

    if (fetchError || !user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    // Update user
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', decoded.id)
      .select('id, name, email')
      .single();

    if (updateError) {
      return NextResponse.json(
        { message: updateError.message },
        { status: 400 }
      );
    }

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
} 