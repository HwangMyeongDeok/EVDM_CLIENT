import type { TestDriveStatus } from "@/types/enums";

export interface TestDrive {
  _id: string;
  customer_id: string;
  variant_id: string;
  dealer_id: string;
  test_drive_date?: string;
  status: TestDriveStatus;
  created_at?: string;
  updated_at?: string;
}
