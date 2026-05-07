import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prismaClient from '@/app/api/util';
import { SteadfastService } from '@/lib/steadfast';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Simple admin check based on your existing implementation
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
    }

    const { orderIds } = await request.json();

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ message: 'No order IDs provided' }, { status: 400 });
    }

    const ordersToSync = await prismaClient.order.findMany({
      where: {
        id: { in: orderIds },
        courierProvider: 'Steadfast',
        courierConsignmentId: { not: null }
      }
    });

    let syncedCount = 0;

    // Process sequentially to avoid hitting rate limits easily
    for (const order of ordersToSync) {
      if (!order.courierConsignmentId) continue;
      
      try {
        const statusRes = await SteadfastService.getStatusByCid(order.courierConsignmentId);
        
        if (statusRes.status === 200 || (statusRes as any).status === 'success') {
          const newStatus = SteadfastService.mapStatus(statusRes.delivery_status);
          
          await prismaClient.order.update({
            where: { id: order.id },
            data: {
              status: newStatus,
              courierStatus: statusRes.delivery_status,
              courierLastSyncedAt: new Date(),
              courierStatusRaw: JSON.stringify(statusRes)
            }
          });
          syncedCount++;
        }
      } catch (err) {
        console.error(`Failed to sync order ${order.id}:`, err);
        // Continue to the next order instead of failing the whole batch
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${syncedCount} orders`,
      syncedCount
    });
  } catch (error: unknown) {
    console.error('Order sync error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
