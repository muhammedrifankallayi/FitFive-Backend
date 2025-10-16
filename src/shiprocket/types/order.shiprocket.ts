export interface OrderItem {
  name: string; // required: product name
  sku: string;  // required: unique product SKU
  units: string; // required: quantity of units
  selling_price: string; // required: price per unit
  discount?: string; // optional: discount applied
  tax?: string; // optional: tax amount
  hsn?: string; // optional: HSN code
}

export interface ShiprocketOrder {
  order_id: string; // required: unique order ID
  order_date: string; // required: date of order creation (YYYY-MM-DD HH:MM)
  pickup_location: string; // required: pickup location ID or code
  channel_id?: string; // optional but recommended for channel specific orders
  comment?: string; // optional: any comment about the order

  // Billing details - required
  billing_customer_name: string; 
  billing_last_name?: string; // optional
  billing_address: string; 
  billing_address_2?: string; // optional
  billing_city: string; 
  billing_pincode: string; 
  billing_state: string; 
  billing_country: string; 
  billing_email: string; 
  billing_phone: string; 
  billing_alternate_phone?: string; // optional

  // Shipping details
  shipping_is_billing: number; // required: 1 if same as billing, 0 otherwise
  shipping_customer_name?: string; 
  shipping_last_name?: string; 
  shipping_address?: string; 
  shipping_address_2?: string; 
  shipping_city?: string; 
  shipping_pincode?: string; 
  shipping_country?: string; 
  shipping_state?: string; 
  shipping_email?: string; 
  shipping_phone?: string; 

  // Order items
  order_items: OrderItem[]; // required: array of ordered products

  // Payment & charges
  payment_method: string; // required: e.g., COD, Prepaid
  shipping_charges?: string; 
  giftwrap_charges?: string; 
  transaction_charges?: string; 
  total_discount?: string; 
  sub_total: string; // required: total amount before charges

  // Package dimensions
  length: string; // required
  breadth: string; // required
  height: string; // required
  weight: string; // required
}


export interface ShiprocketOrderResponse {
  order_id: number;
  shipment_id: number;
  status: string;
  status_code: number;
}
