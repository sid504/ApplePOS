import React, { useState } from 'react';
import { X, Edit, Trash2, Plus } from 'lucide-react';
import { RemovalType } from '../types';

interface RemovalTypeManagementProps {
  removalTypes: RemovalType[];
  onClose: () => void;
  onAddRemovalType: (removalType: Omit<RemovalType, 'id'>) => void;
  onUpdateRemovalType: (id: string, updates: Partial<RemovalType>) => void;
  onDeleteRemovalType: (id: string) => void;
}

const RemovalTypeManagement: React.FC<RemovalTypeManagementProps> = ({
  removalTypes,
  onClose,
  onAddRemovalType,
  onUpdateRemovalType,
  onDeleteRemovalType
}) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    onAddRemovalType({ name: form.name, description: form.description });
    setForm({ name: '', description: '' });
    setShowForm(false);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editForm.name) return;
    onUpdateRemovalType(editingId, { name: editForm.name, description: editForm.description });
    setEditingId(null);
    setEditForm({ name: '', description: '' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Manage Removal Types</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="mb-4">
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 inline mr-1" /> {showForm ? 'Cancel' : 'Add Removal Type'}
            </button>
          </div>
          {showForm && (
            <form onSubmit={handleAdd} className="mb-6 bg-gray-50 p-4 rounded-lg">
              <input
                name="name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Type Name* (e.g., Expired, Stolen)"
                className="border p-2 rounded w-full mb-2"
                required
              />
              <input
                name="description"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Description"
                className="border p-2 rounded w-full mb-2"
              />
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Save</button>
            </form>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2 text-sm font-medium text-gray-900">Name</th>
                  <th className="text-left py-2 px-2 text-sm font-medium text-gray-900">Description</th>
                  <th className="py-2 px-2 text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {removalTypes.map(rt => (
                  <tr key={rt.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-2 text-sm text-gray-900">
                      {editingId === rt.id ? (
                        <input
                          value={editForm.name}
                          onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                          className="border p-1 rounded w-full"
                        />
                      ) : rt.name}
                    </td>
                    <td className="py-2 px-2 text-sm text-gray-600">
                      {editingId === rt.id ? (
                        <input
                          value={editForm.description}
                          onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                          className="border p-1 rounded w-full"
                        />
                      ) : rt.description}
                    </td>
                    <td className="py-2 px-2 text-sm flex gap-2">
                      {editingId === rt.id ? (
                        <>
                          <button onClick={handleEdit} className="text-green-600 hover:text-green-800 text-xs font-medium">Save</button>
                          <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600 text-xs font-medium">Cancel</button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingId(rt.id);
                              setEditForm({ name: rt.name, description: rt.description || '' });
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="w-4 h-4 inline" />
                          </button>
                          <button
                            onClick={() => onDeleteRemovalType(rt.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {removalTypes.length === 0 && (
            <div className="text-center py-8 text-gray-500">No removal types found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RemovalTypeManagement; 