import React, { useState } from 'react';
import { X, FileText } from 'lucide-react';

interface EstimationModalProps {
  onClose: () => void;
  onCreateEstimation: (notes?: string) => void;
  isUpdating?: boolean;
}

const EstimationModal: React.FC<EstimationModalProps> = ({
  onClose,
  onCreateEstimation,
  isUpdating = false
}) => {
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateEstimation(notes.trim() || undefined);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {isUpdating ? 'Update Estimation' : 'Create Estimation'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this estimation..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 flex items-center justify-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>{isUpdating ? 'Update Estimation' : 'Create Estimation'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EstimationModal; 