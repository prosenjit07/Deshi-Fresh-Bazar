import { OrderStatus } from '@prisma/client';

export interface SteadfastCreateOrderPayload {
  invoice: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  recipient_email?: string;
  alternative_phone?: string;
  item_description?: string;
  cod_amount: string | number;
  note?: string;
}

export interface SteadfastCreateOrderResponse {
  status: number;
  message: string;
  consignment_id: string;
  tracking_code: string;
  invoice: string;
}

export interface SteadfastStatusResponse {
  status: number;
  delivery_status: string;
}

export class SteadfastService {
  private static get baseUrl() {
    return process.env.STEADFAST_BASE_URL || 'https://portal.packzy.com/api/v1';
  }
  private static get apiKey() {
    return process.env.STEADFAST_API_KEY || '';
  }
  private static get secretKey() {
    return process.env.STEADFAST_SECRET_KEY || '';
  }

  private static getHeaders() {
    return {
      'api-key': this.apiKey,
      'secret-key': this.secretKey,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Maps a SteadFast delivery status to a local OrderStatus.
   */
  public static mapStatus(steadfastStatus: string): OrderStatus {
    const status = steadfastStatus.toLowerCase();
    switch (status) {
      case 'pending':
      case 'in_review':
        return OrderStatus.PROCESSING;
      case 'in_transit':
      case 'dispatched':
        return OrderStatus.SHIPPED;
      case 'delivered':
        return OrderStatus.DELIVERED;
      case 'cancelled':
      case 'returned':
        return OrderStatus.CANCELLED;
      default:
        // Default to processing if unknown status
        return OrderStatus.PROCESSING;
    }
  }

  /**
   * Creates a new courier shipment in SteadFast
   */
  public static async createOrder(payload: SteadfastCreateOrderPayload): Promise<SteadfastCreateOrderResponse> {
    const response = await fetch(`${this.baseUrl}/create_order`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Steadfast API error: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    // Steadfast typically returns 200 inside the payload status even if HTTP is 200
    if (data.status !== 200 && data.status !== 'success') {
      throw new Error(`Steadfast error: ${data.message || JSON.stringify(data)}`);
    }

    return data as SteadfastCreateOrderResponse;
  }

  /**
   * Fetches delivery status using the SteadFast Consignment ID
   */
  public static async getStatusByCid(cid: string): Promise<SteadfastStatusResponse> {
    const response = await fetch(`${this.baseUrl}/status_by_cid/${cid}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Steadfast API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data as SteadfastStatusResponse;
  }
  
  /**
   * Fetches delivery status using the local invoice
   */
  public static async getTrackingByInvoice(invoice: string): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/trackings_by_invoice/${invoice}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Steadfast API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Gets the merchant's current balance
   */
  public static async getBalance(): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/get_balance`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Steadfast API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }
}
