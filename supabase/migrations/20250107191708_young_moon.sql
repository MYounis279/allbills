/*
  # Initial Schema Setup for Utility Bill Payment System

  1. New Tables
    - `bills`
      - Stores utility bill information
      - Contains reference numbers, amounts, and status
    - `payment_history`
      - Tracks all bill payments
      - Stores transaction details and payment methods

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create bills table
CREATE TABLE IF NOT EXISTS bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  utility_type text NOT NULL CHECK (utility_type IN ('electricity', 'gas', 'water', 'internet', 'community')),
  reference_number text NOT NULL,
  provider text NOT NULL,
  current_amount decimal(10,2) NOT NULL DEFAULT 0,
  due_date timestamptz NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'paid', 'overdue')) DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, utility_type, reference_number)
);

-- Create payment history table
CREATE TABLE IF NOT EXISTS payment_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id uuid REFERENCES bills(id) NOT NULL,
  amount decimal(10,2) NOT NULL,
  payment_date timestamptz DEFAULT now(),
  payment_method text NOT NULL,
  transaction_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- Create policies for bills table
CREATE POLICY "Users can view their own bills"
  ON bills
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bills"
  ON bills
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bills"
  ON bills
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for payment history table
CREATE POLICY "Users can view their own payment history"
  ON payment_history
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM bills
    WHERE bills.id = payment_history.bill_id
    AND bills.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own payment history"
  ON payment_history
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM bills
    WHERE bills.id = payment_history.bill_id
    AND bills.user_id = auth.uid()
  ));