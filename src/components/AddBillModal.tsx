import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface AddBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBillAdded: () => void;
}

const PROVIDERS = [
  { id: 'lesco', name: 'LESCO (Electricity)', type: 'electricity' },
  { id: 'dha', name: 'DHA Water & Sewerage', type: 'water' }
] as const;

export default function AddBillModal({ isOpen, onClose, onBillAdded }: AddBillModalProps) {
  const { user } = useAuth();
  const [provider, setProvider] = useState<typeof PROVIDERS[number]>(PROVIDERS[0]);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const fetchLESCOBill = async () => {
    try {
      // For demo purposes, return mock data
      return {
        Amount: 1500,
        DueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        Status: 'UNPAID'
      };
    } catch (error) {
      console.error('LESCO API Error:', error);
      // Return mock data as fallback
      return {
        Amount: 1500,
        DueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        Status: 'UNPAID'
      };
    }
  };

  const fetchDHABill = async () => {
    try {
      // For demo purposes, return mock data
      return {
        Amount: 2500,
        DueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        Status: 'UNPAID'
      };
    } catch (error) {
      console.error('DHA API Error:', error);
      // Return mock data as fallback
      return {
        Amount: 2500,
        DueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        Status: 'UNPAID'
      };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!user) {
        throw new Error('You must be logged in to add bills');
      }

      const billDetails = provider.id === 'lesco' 
        ? await fetchLESCOBill()
        : await fetchDHABill();
      
      if (!billDetails) {
        throw new Error('Invalid bill details received');
      }

      const { error: supabaseError } = await supabase.from('bills').insert({
        user_id: user.id,
        utility_type: provider.type,
        reference_number: referenceNumber,
        provider: provider.name,
        current_amount: billDetails.Amount || 0,
        due_date: billDetails.DueDate || new Date().toISOString(),
        status: 'pending'
      });

      if (supabaseError) {
        throw new Error('Failed to save bill details. Please try again.');
      }

      onBillAdded();
      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add New Bill</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Provider
            </label>
            <select
              value={provider.id}
              onChange={(e) => setProvider(PROVIDERS.find(p => p.id === e.target.value) || PROVIDERS[0])}
              className="w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              {PROVIDERS.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {provider.id === 'lesco' ? 'Reference Number' : 'Customer Number'}
            </label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder={provider.id === 'lesco' ? '1603000' : '00112020013806'}
              className="w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Add Bill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}