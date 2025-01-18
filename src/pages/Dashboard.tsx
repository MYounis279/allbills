import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw } from 'lucide-react';
import { Bill } from '../types';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import AddBillModal from '../components/AddBillModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddBill, setShowAddBill] = useState(false);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;
      setBills(data || []);
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshBill = async (billId: string) => {
    const bill = bills.find(b => b.id === billId);
    if (!bill) return;

    try {
      // For demo purposes, just refresh the bills list
      fetchBills();
    } catch (error) {
      console.error('Error refreshing bill:', error);
      alert('Failed to refresh bill. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Your Bills</h2>
        <button
          onClick={() => setShowAddBill(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Bill
        </button>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : bills.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No bills added yet. Add your first bill to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {bills.map((bill) => (
            <div
              key={bill.id}
              className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200"
            >
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {bill.utility_type.charAt(0).toUpperCase() + bill.utility_type.slice(1)}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">{bill.provider}</p>
                  </div>
                  <button
                    onClick={() => refreshBill(bill.id)}
                    className="p-2 text-gray-400 hover:text-gray-500"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-semibold text-gray-900">
                    PKR {bill.current_amount.toFixed(2)}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Due {format(new Date(bill.due_date), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div className="mt-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      bill.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : bill.status === 'overdue'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="px-4 py-4 sm:px-6">
                <button
                  onClick={() => navigate(`/bill/${bill.id}`)}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  {bill.status === 'paid' ? 'View Details' : 'Pay Now'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddBillModal
        isOpen={showAddBill}
        onClose={() => setShowAddBill(false)}
        onBillAdded={fetchBills}
      />
    </div>
  );
}