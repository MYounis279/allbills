export interface Bill {
  id: string;
  user_id: string;
  utility_type: 'electricity' | 'gas' | 'water' | 'internet' | 'community';
  reference_number: string;
  provider: string;
  current_amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue';
  created_at: string;
}

export interface PaymentHistory {
  id: string;
  bill_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  transaction_id: string;
}

export interface BillProvider {
  id: string;
  name: string;
  type: 'electricity' | 'water';
}