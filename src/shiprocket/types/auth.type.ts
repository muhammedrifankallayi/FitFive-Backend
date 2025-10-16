

export interface AuthRequest {
 email: string;
 password: string;
}

export interface AuthResponse{
  company_id: number;
  created_at: string; // ISO date string
  email: string;
  first_name: string;
  id: number;
  last_name: string;
  token: string;
}
