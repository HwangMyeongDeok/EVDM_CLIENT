import type { UserRole } from "@/types/enums";

export interface User {
  _id: string; 
  email: string;
  password: string;
  role: UserRole;
  dealer_id?: string; 
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}
