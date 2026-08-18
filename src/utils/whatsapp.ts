import type { CartItem, Product } from '@/types';
import { formatPrice, getEffectivePrice } from './format';

/** Converts a Kenyan local number (0724361307) into international format (254724361307). */
export function toInternationalFormat(localNumber: string): string {
  const digits = localNumber.replace(/\D/g, '');
  if (digits.startsWith('254')) return digits;
  if (digits.startsWith('0')) return `254${digits.slice(1)}`;
  if (digits.startsWith('7') || digits.startsWith('1')) return `254${digits}`;
  return digits;
}

export const LOLIX_WHATSAPP_NUMBER = toInternationalFormat('0724361307');

function buildWhatsAppUrl(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

interface ProductOrderOptions {
  product: Product;
  size?: string;
  color?: string;
  quantity: number;
  productUrl: string;
}

export function buildProductOrderMessage({
  product,
  size,
  color,
  quantity,
  productUrl,
}: ProductOrderOptions): string {
  const price = getEffectivePrice(product.normal_price, product.offer_price);
  const lines = [
    'Hello Lolix Fashions, I would like to order:',
    '',
    `Product: ${product.name}`,
  ];
  if (size) lines.push(`Size: ${size}`);
  if (color) lines.push(`Color: ${color}`);
  lines.push(`Quantity: ${quantity}`);
  lines.push(`Price: ${formatPrice(price * quantity)}`);
  lines.push('');
  lines.push(`Product link: ${productUrl}`);
  return lines.join('\n');
}

export function getProductWhatsAppLink(options: ProductOrderOptions): string {
  return buildWhatsAppUrl(LOLIX_WHATSAPP_NUMBER, buildProductOrderMessage(options));
}

export function buildCartOrderMessage(items: CartItem[], total: number): string {
  const lines = ['Hello Lolix Fashions, I would like to order the following items:', ''];
  items.forEach((item, index) => {
    const price = getEffectivePrice(item.product.normal_price, item.product.offer_price);
    const variantParts = [item.size_label, item.color_name].filter(Boolean).join(', ');
    lines.push(
      `${index + 1}. ${item.product.name}${variantParts ? ` (${variantParts})` : ''} x${item.quantity} — ${formatPrice(
        price * item.quantity
      )}`
    );
  });
  lines.push('');
  lines.push(`Total: ${formatPrice(total)}`);
  return lines.join('\n');
}

export function getCartWhatsAppLink(items: CartItem[], total: number): string {
  return buildWhatsAppUrl(LOLIX_WHATSAPP_NUMBER, buildCartOrderMessage(items, total));
}

export function buildGeneralInquiryMessage(): string {
  return "Hello Lolix Fashions, I'd like to know more about your products.";
}

export function getGeneralWhatsAppLink(): string {
  return buildWhatsAppUrl(LOLIX_WHATSAPP_NUMBER, buildGeneralInquiryMessage());
}

export function getCheckoutWhatsAppLink(orderNumber: string, items: CartItem[], total: number): string {
  const base = buildCartOrderMessage(items, total);
  const message = `${base}\n\nOrder reference: ${orderNumber}`;
  return buildWhatsAppUrl(LOLIX_WHATSAPP_NUMBER, message);
}
