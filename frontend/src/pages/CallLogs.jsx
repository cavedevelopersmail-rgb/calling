import { useEffect, useState } from 'react';
import { Search, PhoneIncoming, PhoneOutgoing, Filter, Download } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

export const CallLogs = () => {
  const { user } = useAuth();
  const [calls, setCalls] = useState([]);
  const [filteredCalls, setFilteredCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [directionFilter, setDirectionFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchCalls();
    }
  }, [user]);

  useEffect(() => {
    filterCalls();
  }, [calls, searchTerm, statusFilter, directionFilter]);

  const fetchCalls = async () => {
    try {
      const data = await api.calls.getAll();
      setCalls(data.calls || []);
    } catch (error) {
      console.error('Error fetching calls:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCalls = () => {
    let filtered = [...calls];

    if (searchTerm) {
      filtered = filtered.filter(
        (call) =>
          call.to_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          call.from_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          call.agent_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          call.campaign_tag?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((call) => call.call_status === statusFilter);
    }

    if (directionFilter !== 'all') {
      filtered = filtered.filter((call) => call.direction === directionFilter);
    }

    setFilteredCalls(filtered);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const exportToCSV = () => {
    const headers = [
      'Call ID',
      'Direction',
      'From',
      'To',
      'Status',
      'Duration',
      'Cost',
      'Agent',
      'Campaign',
      'Date',
    ];

    const rows = filteredCalls.map((call) => [
      call.call_id || '',
      call.direction || '',
      call.from_number || '',
      call.to_number || '',
      call.call_status || '',
      call.total_duration_seconds || 0,
      call.combined_cost || 0,
      call.agent_name || '',
      call.campaign_tag || '',
      format(new Date(call.created_at), 'yyyy-MM-dd HH:mm:ss'),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `call-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading call logs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Call Logs</h1>
          <p className="mt-2 text-gray-600">View and manage all your call records</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by number, agent, campaign..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="busy">Busy</option>
              <option value="no-answer">No Answer</option>
            </select>
          </div>

          {/* Direction Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={directionFilter}
              onChange={(e) => setDirectionFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Directions</option>
              <option value="inbound">Inbound</option>
              <option value="outbound">Outbound</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredCalls.length} of {calls.length} calls
      </div>

      {/* Calls Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Direction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  From
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCalls.length > 0 ? (
                filteredCalls.map((call) => (
                  <tr key={call.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {call.direction === 'inbound' ? (
                          <PhoneIncoming className="w-4 h-4 text-green-600" />
                        ) : (
                          <PhoneOutgoing className="w-4 h-4 text-blue-600" />
                        )}
                        <span className="text-sm capitalize text-gray-900">{call.direction}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {call.from_number || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {call.to_number || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {call.agent_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          call.call_status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : call.call_status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {call.call_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDuration(call.total_duration_seconds || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${parseFloat(call.combined_cost || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {call.campaign_tag || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(call.created_at), 'MMM dd, yyyy HH:mm')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                    {calls.length === 0
                      ? 'No call logs found. Start by adding some calls!'
                      : 'No calls match your filters. Try adjusting your search criteria.'}
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
