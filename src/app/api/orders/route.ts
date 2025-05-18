import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
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

// Types for order data
interface OrderItem {
  id: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
  totalPrice: number;
  selectedPackage?: string;
}

interface OrderData {
  fullName: string;
  email?: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string;
}

// Create new order
export async function POST(request: Request) {
  try {
    // Get token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    // Get user ID if logged in
    let userId: string | null = null;
    if (token) {
      const decoded = await verifyToken(token);
      if (decoded) {
        userId = decoded.id;
      }
    }

    const orderData: OrderData = await request.json();

    // Validate required fields
    if (!orderData.fullName || !orderData.phone || !orderData.address || 
        !orderData.city || !orderData.postalCode || !orderData.items || 
        orderData.items.length === 0) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Start a Supabase transaction
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          user_id: userId,
          customer_name: orderData.fullName,
          customer_email: orderData.email,
          customer_phone: orderData.phone,
          shipping_address: orderData.address,
          shipping_city: orderData.city,
          shipping_postal_code: orderData.postalCode,
          shipping_country: orderData.country,
          subtotal: orderData.subtotal,
          shipping_cost: orderData.shipping,
          total_amount: orderData.total,
          payment_method: orderData.paymentMethod,
          status: 'pending', // Initial order status
        },
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert order items
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      product_image: item.image,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.totalPrice,
      package_type: item.selectedPackage,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Return the created order with its items
    const { data: completeOrder, error: fetchError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', order.id)
      .single();

    if (fetchError) throw fetchError;

    return NextResponse.json(completeOrder);
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

// Get orders (for authenticated users)
export async function GET(request: Request) {
  try {
    // Get token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'Not authorized' },
        { status: 401 }
      );
    }

    // Verify token and get user ID
    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { message: 'Not authorized' },
        { status: 401 }
      );
    }

    // Get orders for the user
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('user_id', decoded.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
} 