import { useEffect, useState } from 'react';
import { Calendar, Clock, Phone, Plus, X, Edit2, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { format, isBefore, startOfDay } from 'date-fns';

export const ScheduleCall = () => {
  const { user } = useAuth();
  const [scheduledCalls, setScheduledCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCall, setEditingCall] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contact_name: '',
    contact_number: '',
    scheduled_time: '',
    agent_id: '',
    campaign_tag: '',
  });

  useEffect(() => {
    if (user) {
      fetchScheduledCalls();
    }
  }, [user]);

  const fetchScheduledCalls = async () => {
    try {
      const data = await api.scheduledCalls.getAll();
      setScheduledCalls(data.scheduledCalls || []);
    } catch (error) {
      console.error('Error fetching scheduled calls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingCall) {
        await api.scheduledCalls.update(editingCall.id, formData);
      } else {
        await api.scheduledCalls.create(formData);
      }

      setFormData({
        title: '',
        description: '',
        contact_name: '',
        contact_number: '',
        scheduled_time: '',
        agent_id: '',
        campaign_tag: '',
      });
      setShowForm(false);
      setEditingCall(null);
      fetchScheduledCalls();
    } catch (error) {
      console.error('Error saving scheduled call:', error);
      alert('Failed to save scheduled call. Please try again.');
    }
  };

  const handleEdit = (call) => {
    setEditingCall(call);
    setFormData({
      title: call.title,
      description: call.description || '',
      contact_name: call.contact_name,
      contact_number: call.contact_number,
      scheduled_time: format(new Date(call.scheduled_time), "yyyy-MM-dd'T'HH:mm"),
      agent_id: call.agent_id || '',
      campaign_tag: call.campaign_tag || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this scheduled call?')) return;

    try {
      await api.scheduledCalls.delete(id);
      fetchScheduledCalls();
    } catch (error) {
      console.error('Error deleting scheduled call:', error);
      alert('Failed to delete scheduled call. Please try again.');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.scheduledCalls.updateStatus(id, newStatus);
      fetchScheduledCalls();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingCall(null);
    setFormData({
      title: '',
      description: '',
      contact_name: '',
      contact_number: '',
      scheduled_time: '',
      agent_id: '',
      campaign_tag: '',
    });
  };

  const groupedCalls = {
    upcoming: scheduledCalls.filter(
      (call) => call.status === 'pending' && !isBefore(new Date(call.scheduled_time), startOfDay(new Date()))
    ),
    past: scheduledCalls.filter(
      (call) => call.status === 'pending' && isBefore(new Date(call.scheduled_time), startOfDay(new Date()))
    ),
    completed: scheduledCalls.filter((call) => call.status === 'completed'),
    cancelled: scheduledCalls.filter((call) => call.status === 'cancelled'),
  };

  if (loading) {
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
          <h1 className="text-3xl font-bold text-gray-900">Schedule Call</h1>
          <p className="mt-2 text-gray-600">Manage your upcoming and scheduled calls</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Schedule
          </button>
        )}
      </div>

      {/* Schedule Form */}
      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingCall ? 'Edit Scheduled Call' : 'Schedule New Call'}
            </h2>
            <button onClick={cancelForm} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Call Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Follow-up call with client"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.contact_number}
                  onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scheduled Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.scheduled_time}
                  onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Agent ID</label>
                <input
                  type="text"
                  value={formData.agent_id}
                  onChange={(e) => setFormData({ ...formData, agent_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="agent-123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Tag
                </label>
                <input
                  type="text"
                  value={formData.campaign_tag}
                  onChange={(e) => setFormData({ ...formData, campaign_tag: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Q1-2024"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add notes about this call..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingCall ? 'Update' : 'Schedule'} Call
              </button>
              <button
                type="button"
                onClick={cancelForm}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Upcoming Calls */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Upcoming Calls ({groupedCalls.upcoming.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {groupedCalls.upcoming.length > 0 ? (
            groupedCalls.upcoming.map((call) => (
              <div key={call.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{call.title}</h3>
                    {call.description && (
                      <p className="mt-1 text-sm text-gray-600">{call.description}</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{call.contact_name}</span>
                        <span className="text-gray-400">•</span>
                        <span>{call.contact_number}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(call.scheduled_time), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{format(new Date(call.scheduled_time), 'HH:mm')}</span>
                      </div>
                    </div>
                    {call.campaign_tag && (
                      <div className="mt-2">
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          {call.campaign_tag}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleStatusChange(call.id, 'completed')}
                      className="px-3 py-1 text-sm text-green-600 bg-green-50 rounded hover:bg-green-100 transition-colors"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => handleEdit(call)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(call.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-500">
              No upcoming calls scheduled. Click "New Schedule" to add one.
            </div>
          )}
        </div>
      </div>

      {/* Past Due & Completed Calls */}
      {(groupedCalls.past.length > 0 || groupedCalls.completed.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {groupedCalls.past.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Past Due ({groupedCalls.past.length})
                </h2>
              </div>
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {groupedCalls.past.map((call) => (
                  <div key={call.id} className="p-4 hover:bg-gray-50">
                    <h3 className="font-medium text-gray-900">{call.title}</h3>
                    <p className="mt-1 text-sm text-gray-600">{call.contact_name}</p>
                    <p className="mt-1 text-xs text-red-600">
                      {format(new Date(call.scheduled_time), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {groupedCalls.completed.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Completed ({groupedCalls.completed.length})
                </h2>
              </div>
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {groupedCalls.completed.map((call) => (
                  <div key={call.id} className="p-4 hover:bg-gray-50">
                    <h3 className="font-medium text-gray-900">{call.title}</h3>
                    <p className="mt-1 text-sm text-gray-600">{call.contact_name}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {format(new Date(call.scheduled_time), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
