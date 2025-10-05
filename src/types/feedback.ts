import type { FeedbackStatus, FeedbackType } from "@/types/enums";

export interface Feedback {
  _id: string;
  customer_id: string;
  dealer_id: string;
  variant_id?: string;
  feedback_type: FeedbackType;
  description?: string;
  status: FeedbackStatus;
  created_at?: string;
  updated_at?: string;
}
