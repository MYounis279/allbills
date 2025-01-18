import React, { useState } from 'react';
import { Calculator } from 'lucide-react';

interface BillBreakdown {
  costOfElectricity: number;
  fcSurcharge: number;
  electricityDuty: number;
  meterRent: number;
  tvFee: number;
  gst: number;
  njSurcharge: number;
  total: number;
}

export default function BillEstimator() {
  const [units, setUnits] = useState<string>('');
  const [breakdown, setBreakdown] = useState<BillBreakdown | null>(null);

  const calculateBill = (units: number): BillBreakdown => {
    const costOfElectricity = units * 16.48; // Base rate per unit
    const fcSurcharge = costOfElectricity * 0.196; // 19.6% of cost of electricity
    const electricityDuty = costOfElectricity * 0.015; // 1.5% of cost of electricity
    const meterRent = 140; // Fixed
    const tvFee = 35; // Fixed
    const baseAmount = costOfElectricity + fcSurcharge + electricityDuty + meterRent + tvFee;
    const gst = baseAmount * 0.18; // 18% GST
    const njSurcharge = 10; // Fixed

    const total = baseAmount + gst + njSurcharge;

    return {
      costOfElectricity: Math.round(costOfElectricity * 100) / 100,
      fcSurcharge: Math.round(fcSurcharge * 100) / 100,
      electricityDuty: Math.round(electricityDuty * 100) / 100,
      meterRent,
      tvFee,
      gst: Math.round(gst * 100) / 100,
      njSurcharge,
      total: Math.round(total * 100) / 100
    };
  };

  const handleEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    const unitsConsumed = parseFloat(units);
    if (isNaN(unitsConsumed) || unitsConsumed < 0) {
      return;
    }
    setBreakdown(calculateBill(unitsConsumed));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex items-center mb-6">
          <Calculator className="w-6 h-6 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">Bill Estimator</h2>
        </div>

        <form onSubmit={handleEstimate} className="mb-6">
          <div className="mb-4">
            <label htmlFor="units" className="block text-sm font-medium text-gray-700">
              Units Consumed
            </label>
            <input
              type="number"
              id="units"
              value={units}
              onChange={(e) => setUnits(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter number of units"
              required
              min="0"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded-md py-2 px-4 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Estimate Bill
          </button>
        </form>

        {breakdown && (
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-semibold mb-4">Bill Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Cost of electricity:</span>
                <span className="font-medium">PKR {breakdown.costOfElectricity}</span>
              </div>
              <div className="flex justify-between">
                <span>F.C Surcharge:</span>
                <span className="font-medium">PKR {breakdown.fcSurcharge}</span>
              </div>
              <div className="flex justify-between">
                <span>Electricity Duty:</span>
                <span className="font-medium">PKR {breakdown.electricityDuty}</span>
              </div>
              <div className="flex justify-between">
                <span>Meter Rent:</span>
                <span className="font-medium">PKR {breakdown.meterRent}</span>
              </div>
              <div className="flex justify-between">
                <span>TV Fee:</span>
                <span className="font-medium">PKR {breakdown.tvFee}</span>
              </div>
              <div className="flex justify-between">
                <span>GST:</span>
                <span className="font-medium">PKR {breakdown.gst}</span>
              </div>
              <div className="flex justify-between">
                <span>N.J Surcharge:</span>
                <span className="font-medium">PKR {breakdown.njSurcharge}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="font-semibold">Total Estimated Bill:</span>
                <span className="font-bold text-blue-600">PKR {breakdown.total}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}