import { supabase } from '@/lib/supabase';
import type { CartItem, PaymentMethod } from '@/types';

export interface CheckoutDetails {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  county: string;
  town: string;
  deliveryLocation?: string;
  deliveryInstructions?: string;
  deliveryMethodId?: string;
  paymentMethod: PaymentMethod;
}

export interface PlaceOrderResult {
  order_id: string;
  order_number: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
}

export async function placeOrder(items: CartItem[], details: CheckoutDetails): Promise<PlaceOrderResult> {
  const payload = {
    customer_name: details.customerName,
    customer_phone: details.customerPhone,
    customer_email: details.customerEmail ?? '',
    county: details.county,
    town: details.town,
    delivery_location: details.deliveryLocation ?? '',
    delivery_instructions: details.deliveryInstructions ?? '',
    delivery_method_id: details.deliveryMethodId ?? '',
    payment_method: details.paymentMethod,
    items: items.map((item) => ({
      product_id: item.product.id,
      variant_id: item.variant?.id ?? '',
      quantity: item.quantity,
      size_label: item.size_label ?? '',
      color_name: item.color_name ?? '',
    })),
  };

  const { data, error } = await supabase.rpc('place_order', { payload });
  if (error) throw error;
  return data as PlaceOrderResult;
}
