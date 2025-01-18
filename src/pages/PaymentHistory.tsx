import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PaymentHistory as PaymentHistoryType } from '../types';
import { format } from 'date-fns';
import { Receipt } from 'lucide-react';

export default function PaymentHistory() {
  const [payments, setPayments] = useState<PaymentHistoryType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_history')
        .select(`
          *,
          bills (
            utility_type,
            provider,
            reference_number
          )
        `)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payment history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
        <Receipt className="w-6 h-6 text-gray-400" />
      </div>

      {payments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No payment history available</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {payments.map((payment) => (
              <li key={payment.id} className="px-4 py-6 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="text-lg font-semibold text-gray-900">
                      ${payment.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(payment.payment_date), 'MMM dd, yyyy')}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {payment.bills.utility_type.charAt(0).toUpperCase() + 
                       payment.bills.utility_type.slice(1)} - {payment.bills.provider}
                    </p>
                    <p className="text-sm text-gray-500">
                      Ref: {payment.bills.reference_number}
                    </p>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {payment.payment_method}
                    </span>
                    <p className="text-sm text-gray-500 mt-2">
                      Transaction ID: {payment.transaction_id}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}