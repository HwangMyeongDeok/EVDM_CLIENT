export type PromotionApplicableTo = 'ALL' | 'DEALER' | 'VARIANT' | 'CUSTOMER';
export type PromotionStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'DRAFT';

export interface IPromotion {
  promotion_id: number;
  dealer_id?: number | null;
  dealer?: {
    dealer_id: number;
    name: string;
  };
  variant_id?: number | null;
  variant?: {
    variant_id: number;
    version: string;
    color: string;
  };
  code: string;
  description?: string | null;
  discount_amount?: number | null;
  discount_percentage?: number | null;
  usage_limit: number;
  times_used: number;
  applicable_to: PromotionApplicableTo;
  status: PromotionStatus;
  start_date?: string | null; 
  end_date?: string | null;   
  created_at: string;          
  updated_at?: string | null;  
}
