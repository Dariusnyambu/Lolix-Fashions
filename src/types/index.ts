export type UserRole = 'customer' | 'admin' | 'staff';
export type ProductCondition = 'new' | 'thrift_premium' | 'thrift_standard';
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'ready_for_delivery'
  | 'shipped'
  | 'delivered'
  | 'cancelled';
export type PaymentStatus = 'pending' | 'awaiting_payment' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'cod' | 'whatsapp' | 'mpesa';
export type DiscountType = 'percentage' | 'fixed_amount';
export type ReviewStatus = 'pending' | 'approved' | 'hidden';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  display_order: number;
  is_active: boolean;
}

export interface Size {
  id: string;
  label: string;
  size_group: string;
  display_order: number;
}

export interface Color {
  id: string;
  name: string;
  hex_code: string | null;
}

export interface Badge {
  id: string;
  label: string;
  bg_color: string;
  text_color: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  display_order: number;
  alt_text: string | null;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size_id: string | null;
  color_id: string | null;
  stock_quantity: number;
  size?: Size | null;
  color?: Color | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  subcategory_id: string | null;
  brand: string | null;
  sku: string | null;
  condition: ProductCondition;
  normal_price: number;
  offer_price: number | null;
  stock_quantity: number;
  track_inventory: boolean;
  is_sold_out: boolean;
  weight_kg: number | null;
  dimensions: string | null;
  is_featured: boolean;
  is_available: boolean;
  tags: string[];
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;

  // joined/derived
  images?: ProductImage[];
  variants?: ProductVariant[];
  badges?: Badge[];
  category?: Category | null;
}

export interface Offer {
  id: string;
  title: string;
  description: string | null;
  discount_type: DiscountType;
  discount_value: number;
  starts_at: string;
  ends_at: string | null;
  is_active: boolean;
}

export interface Banner {
  id: string;
  image_url: string;
  heading: string | null;
  subtitle: string | null;
  cta_label: string | null;
  cta_link: string | null;
  display_order: number;
  is_active: boolean;
}

export interface DeliveryMethod {
  id: string;
  name: string;
  description: string | null;
  price: number;
  is_active: boolean;
  display_order: number;
}

export interface CartItem {
  id: string;
  product: Product;
  variant?: ProductVariant | null;
  size_label?: string | null;
  color_name?: string | null;
  quantity: number;
}

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  county: string;
  town: string;
  delivery_location: string | null;
  instructions: string | null;
  is_default: boolean;
}

export interface OrderItem {
  id: string;
  product_id: string | null;
  product_name: string;
  size_label: string | null;
  color_name: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  delivery_method_id: string | null;
  county: string | null;
  town: string | null;
  delivery_location: string | null;
  delivery_instructions: string | null;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  created_at: string;
  items?: OrderItem[];
}

export interface Review {
  id: string;
  product_id: string;
  customer_name: string;
  rating: number;
  comment: string | null;
  status: ReviewStatus;
  created_at: string;
}

export interface Settings {
  business_name: string;
  logo_url: string | null;
  phone: string;
  whatsapp_number: string;
  tiktok_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  business_description: string | null;
  currency: string;
  seo_default_title: string | null;
  seo_default_description: string | null;
}

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
}
