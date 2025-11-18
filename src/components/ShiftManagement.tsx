import React, { useState } from 'react';
import { X, Clock, DollarSign, Calculator, User, Calendar } from 'lucide-react';
import { Shift, Transaction } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface ShiftManagementProps {
  shifts: Shift[];
  transactions: Transaction[];
  onClose: () => void;
  onStartShift: (startingCash: number) => void;
  onEndShift: (shiftId: string, endingCash: number, notes?: string) => void;
}

const ShiftManagement: React.FC<ShiftManagementProps> = ({
  shifts,
  transactions,
  onClose,
  onStartShift,
  onEndShift
}) => {
  const { user } = useAuth();
  const [startingCash, setStartingCash] = useState('200.00');
  const [endingCash, setEndingCash] = useState('');
  const [shiftNotes, setShiftNotes] = useState('');
  const [showEndShift, setShowEndShift] = useState(false);

  const activeShift = shifts.find(shift => shift.status === 'active' && shift.userId === user?.id);
  const userShifts = shifts.filter(shift => shift.userId === user?.id).slice(0, 10);

  const getShiftTransactions = (shift: Shift) => {
    return transactions.filter(transaction => 
      transaction.timestamp >= shift.startTime &&
      (!shift.endTime || transaction.timestamp <= shift.endTime) &&
      transaction.cashier === shift.userName
    );
  };

  const calculateShiftStats = (shift: Shift) => {
    const shiftTransactions = getShiftTransactions(shift);
    const totalSales = shiftTransactions.reduce((sum, t) => sum + t.total, 0);
    const cashSales = shiftTransactions
      .filter(t => t.paymentMethod.some(p => p.type === 'cash'))
      .reduce((sum, t) => sum + t.paymentMethod
        .filter(p => p.type === 'cash')
        .reduce((cashSum, p) => cashSum + p.amount, 0), 0);
    
    return {
      totalSales,
      cashSales,
      transactionCount: shiftTransactions.length,
      expectedCash: shift.startingCash + cashSales
    };
  };

  const handleStartShift = () => {
    onStartShift(parseFloat(startingCash));
    setStartingCash('200.00');
  };

  const handleEndShift = () => {
    if (activeShift) {
      onEndShift(activeShift.id, parseFloat(endingCash), shiftNotes);
      setEndingCash('');
      setShiftNotes('');
      setShowEndShift(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-900">Shift Management</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Current Shift Status */}
          <div className="mb-6">
            {activeShift ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">Active Shift</h3>
                    <p className="text-green-600">
                      Started at {activeShift.startTime.toLocaleTimeString()} on {activeShift.startTime.toLocaleDateString()}
                    </p>
                    <p className="text-green-600">Starting Cash: ${activeShift.startingCash.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => setShowEndShift(true)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    End Shift
                  </button>
                </div>
                
                {/* Current Shift Stats */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(() => {
                    const stats = calculateShiftStats(activeShift);
                    return (
                      <>
                        <div className="bg-white rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-gray-600">Total Sales</span>
                          </div>
                          <span className="text-lg font-bold text-gray-900">${stats.totalSales.toFixed(2)}</span>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <Calculator className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-gray-600">Cash Sales</span>
                          </div>
                          <span className="text-lg font-bold text-gray-900">${stats.cashSales.toFixed(2)}</span>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-purple-600" />
                            <span className="text-sm text-gray-600">Transactions</span>
                          </div>
                          <span className="text-lg font-bold text-gray-900">{stats.transactionCount}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">No Active Shift</h3>
                    <p className="text-gray-600">Start a new shift to begin processing transactions</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Starting Cash
                      </label>
                      <input
                        type="number"
                        value={startingCash}
                        onChange={(e) => setStartingCash(e.target.value)}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <button
                      onClick={handleStartShift}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Start Shift
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Shift History */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Shift History</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-900">Date</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-900">Duration</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-900">Starting Cash</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-900">Ending Cash</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-900">Sales</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-900">Transactions</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {userShifts.map(shift => {
                    const stats = calculateShiftStats(shift);
                    const duration = shift.endTime 
                      ? Math.round((shift.endTime.getTime() - shift.startTime.getTime()) / (1000 * 60 * 60 * 100)) / 100
                      : 0;
                    
                    return (
                      <tr key={shift.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-2 text-sm text-gray-900">
                          {shift.startTime.toLocaleDateString()}
                        </td>
                        <td className="py-3 px-2 text-sm text-gray-600">
                          {shift.status === 'active' ? 'Active' : `${duration}h`}
                        </td>
                        <td className="py-3 px-2 text-sm text-gray-600">
                          ${shift.startingCash.toFixed(2)}
                        </td>
                        <td className="py-3 px-2 text-sm text-gray-600">
                          {shift.endingCash ? `$${shift.endingCash.toFixed(2)}` : '-'}
                        </td>
                        <td className="py-3 px-2 text-sm font-medium text-gray-900">
                          ${stats.totalSales.toFixed(2)}
                        </td>
                        <td className="py-3 px-2 text-sm text-gray-600">
                          {stats.transactionCount}
                        </td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            shift.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {shift.status === 'active' ? 'Active' : 'Closed'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* End Shift Modal */}
        {showEndShift && activeShift && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">End Shift</h3>
                  <button
                    onClick={() => setShowEndShift(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Shift Summary</h4>
                    {(() => {
                      const stats = calculateShiftStats(activeShift);
                      return (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Starting Cash:</span>
                            <span>${activeShift.startingCash.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Cash Sales:</span>
                            <span>${stats.cashSales.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span className="text-gray-900">Expected Cash:</span>
                            <span>${stats.expectedCash.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Sales:</span>
                            <span>${stats.totalSales.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Transactions:</span>
                            <span>{stats.transactionCount}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Actual Ending Cash *
                    </label>
                    <input
                      type="number"
                      value={endingCash}
                      onChange={(e) => setEndingCash(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      step="0.01"
                      min="0"
                      placeholder="Count cash drawer"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={shiftNotes}
                      onChange={(e) => setShiftNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Any issues or notes about the shift..."
                    />
                  </div>

                  {endingCash && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-600">Cash Difference:</span>
                        <span className={`font-medium ${
                          Math.abs(parseFloat(endingCash) - calculateShiftStats(activeShift).expectedCash) < 0.01
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          ${(parseFloat(endingCash) - calculateShiftStats(activeShift).expectedCash).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setShowEndShift(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEndShift}
                    disabled={!endingCash}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-400"
                  >
                    End Shift
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShiftManagement;