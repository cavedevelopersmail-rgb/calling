import { useState, useEffect } from 'react';
import { ChevronRight, RefreshCw, Trash2, Edit2 } from 'lucide-react';
import { useImport } from '../contexts/ImportContext';
import { api } from '../lib/api';
import { format } from 'date-fns';

export const EditImportData = () => {
  const { importedData, setData } = useImport();
  const [allScheduledCalls, setAllScheduledCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchScheduledCalls();
  }, []);

  const fetchScheduledCalls = async () => {
    try {
      setLoading(true);
      const data = await api.scheduledCalls.getAll();
      setAllScheduledCalls(data);
    } catch (error) {
      console.error('Error fetching scheduled calls:', error);
      alert('Failed to load scheduled calls');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (call) => {
    setEditingId(call._id);
    setEditFormData({ ...call });
  };

  const handleSaveEdit = async () => {
    try {
      setLoading(true);
      await api.scheduledCalls.update(editingId, {
        name: editFormData.name,
        phoneNumber: editFormData.phoneNumber,
        scheduledTime: editFormData.scheduledTime,
        message: editFormData.message,
        notes: editFormData.notes,
      });

      // Refresh the list
      await fetchScheduledCalls();
      setEditingId(null);
      alert('Call updated successfully');
    } catch (error) {
      console.error('Error updating call:', error);
      alert('Failed to update call');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this scheduled call?')) return;

    try {
      setLoading(true);
      await api.scheduledCalls.delete(id);
      await fetchScheduledCalls();
      alert('Call deleted successfully');
    } catch (error) {
      console.error('Error deleting call:', error);
      alert('Failed to delete call');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      setLoading(true);
      await api.scheduledCalls.updateStatus(id, newStatus);
      await fetchScheduledCalls();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const filteredCalls = allScheduledCalls.filter((call) => {
    const matchesSearch =
      call.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.phoneNumber?.includes(searchTerm) ||
      call.message?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || call.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  if (loading && allScheduledCalls.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading scheduled calls...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Imported Data</h1>
          <p className="mt-2 text-gray-600">Manage and edit all scheduled calls in the database</p>
        </div>
        <button
          onClick={fetchScheduledCalls}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Name, phone, or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Filter
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Results
            </label>
            <div className="px-4 py-2 bg-gray-100 rounded-lg text-gray-900 font-semibold">
              {filteredCalls.length} of {allScheduledCalls.length}
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">Name</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">Phone</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">Scheduled</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-right font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCalls.length > 0 ? (
                filteredCalls.map((call) =>
                  editingId === call._id ? (
                    <tr key={call._id} className="bg-blue-50">
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={editFormData.name || ''}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, name: e.target.value })
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="tel"
                          value={editFormData.phoneNumber || ''}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              phoneNumber: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="datetime-local"
                          value={
                            editFormData.scheduledTime
                              ? format(
                                  new Date(editFormData.scheduledTime),
                                  "yyyy-MM-dd'T'HH:mm"
                                )
                              : ''
                          }
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              scheduledTime: new Date(e.target.value),
                            })
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={editFormData.status || 'pending'}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              status: e.target.value,
                            })
                          }
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="failed">Failed</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={handleSaveEdit}
                            disabled={loading}
                            className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:bg-gray-400"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={call._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {call.name || '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{call.phoneNumber}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {format(new Date(call.scheduledTime), 'MMM dd, yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={call.status}
                          onChange={(e) => handleStatusChange(call._id, e.target.value)}
                          disabled={loading}
                          className={`px-2 py-1 rounded text-sm border ${
                            call.status === 'pending'
                              ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                              : call.status === 'completed'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : call.status === 'cancelled'
                              ? 'bg-gray-50 text-gray-700 border-gray-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="failed">Failed</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleStartEdit(call)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(call._id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                            disabled={loading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No scheduled calls found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
