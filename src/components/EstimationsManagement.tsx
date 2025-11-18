import React, { useState } from 'react';
import { X, Clock, User, FileText, Trash2, ShoppingCart, Calendar, DollarSign } from 'lucide-react';
import { Estimation, Customer } from '../types';

interface EstimationsManagementProps {
  estimations: Estimation[];
  onClose: () => void;
  onRecallEstimation: (estimation: Estimation) => void;
  onDeleteEstimation: (id: string) => void;
}

const EstimationsManagement: React.FC<EstimationsManagementProps> = ({
  estimations,
  onClose,
  onRecallEstimation,
  onDeleteEstimation
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'converted' | 'expired'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEstimations = estimations.filter(estimation => {
    const matchesStatus = filterStatus === 'all' || estimation.status === filterStatus;
    const matchesSearch = 
      estimation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estimation.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estimation.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estimation.createdBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'converted': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const isExpired = (estimation: Estimation) => {
    return estimation.expiresAt && new Date() > estimation.expiresAt;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Estimations Management</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by ID, customer, notes, or creator..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="converted">Converted</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </div>

        {/* Estimations List */}
        <div className="flex-1 overflow-y-auto p-6 max-h-[80vh]">
          {filteredEstimations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No estimations found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEstimations.map((estimation) => (
                <div
                  key={estimation.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {estimation.id}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(estimation.status)}`}>
                          {estimation.status}
                        </span>
                        {isExpired(estimation) && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            EXPIRED
                          </span>
                        )}
                      </div>

                                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                         <div className="flex items-center gap-2 text-sm text-gray-600">
                           <User className="w-4 h-4" />
                           <span>{estimation.customer?.name || 'No Customer'}</span>
                         </div>
                         <div className="flex items-center gap-2 text-sm text-gray-600">
                           <Clock className="w-4 h-4" />
                           <span>
                             Created: {formatDate(estimation.createdAt)}
                             {estimation.updatedAt && (
                               <span className="block text-xs text-gray-500">
                                 Updated: {formatDate(estimation.updatedAt)}
                               </span>
                             )}
                           </span>
                         </div>
                         <div className="flex items-center gap-2 text-sm text-gray-600">
                           <Calendar className="w-4 h-4" />
                           <span>Expires: {estimation.expiresAt ? formatDate(estimation.expiresAt) : 'No expiry'}</span>
                         </div>
                         <div className="flex items-center gap-2 text-sm text-gray-600">
                           <DollarSign className="w-4 h-4" />
                           <span>Total: ${estimation.total.toFixed(2)}</span>
                         </div>
                       </div>

                      {estimation.notes && (
                        <p className="text-sm text-gray-600 mb-3">
                          <strong>Notes:</strong> {estimation.notes}
                        </p>
                      )}

                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Items:</h4>
                        <div className="space-y-1">
                          {estimation.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm text-gray-600">
                              <span>
                                {item.product.name}
                                {item.variant && ` (${item.variant.name})`}
                              </span>
                              <span>
                                {item.quantity} × ${(item.product.price + (item.variant?.priceModifier || 0)).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="text-sm text-gray-500">
                        Created by: {estimation.createdBy}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      {estimation.status === 'active' && !isExpired(estimation) && (
                        <button
                          onClick={() => onRecallEstimation(estimation)}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Recall to Cart
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteEstimation(estimation.id)}
                        className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EstimationsManagement; 