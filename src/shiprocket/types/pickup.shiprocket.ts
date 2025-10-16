export  interface PickupAddressCreate {
  pickup_location: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  address_2: string;
  city: string;
  state: string;
  country: string;
  pin_code: string;
}


 export interface AddressCreateResponse {
  success: boolean;
  address: PickupAddress;
  pickup_id: number;
  company_name: string;
  full_name: string;
}

export interface AddressListResponse {
 data: ShippingDataList;
}

interface PickupAddress {
  company_id: number;
  pickup_code: string;
  address: string;
  address_2: string;
  address_type: string | null;
  city: string;
  state: string;
  country: string;
  gstin: string | null;
  pin_code: string;
  phone: string;
  email: string;
  name: string;
  alternate_phone: string | null;
  lat: number | null;
  long: number | null;
  status: number;
  phone_verified: number;
  rto_address_id: number;
  extra_info: string;
  updated_at: string;
  created_at: string;
  id: number;
}


interface ShippingDataList {
  shipping_address: ShippingAddress[];
  allow_more: string;
  is_blackbox_seller: boolean;
  company_name: string;
  recent_addresses: any[]; // Could be typed if you have a structure for recent addresses
}

interface ShippingAddress {
  id: number;
  pickup_location: string;
  address_type: string | null;
  address: string;
  address_2: string;
  updated_address: boolean;
  old_address: string;
  old_address2: string;
  tag: string;
  tag_value: string;
  instruction: string;
  city: string;
  state: string;
  country: string;
  pin_code: string;
  email: string;
  is_first_mile_pickup: number;
  phone: string;
  name: string;
  company_id: number;
  gstin: string | null;
  vendor_name: string | null;
  status: number;
  phone_verified: number;
  lat: string;
  long: string;
  open_time: string | null;
  close_time: string | null;
  warehouse_code: string | null;
  alternate_phone: string;
  rto_address_id: number;
  lat_long_status: number;
  new: number;
  associated_rto_address: string | null;
  is_primary_location: number;
}