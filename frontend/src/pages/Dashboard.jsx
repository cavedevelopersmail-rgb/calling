import { useEffect, useState } from 'react';
import { Phone, Clock, DollarSign, TrendingUp, PhoneIncoming, PhoneOutgoing } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { format, subDays, startOfDay } from 'date-fns';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCalls: 0,
    totalDuration: 0,
    totalCost: 0,
    avgDuration: 0,
  });
  const [callsByDay, setCallsByDay] = useState([]);
  const [callsByStatus, setCallsByStatus] = useState([]);
  const [callsByType, setCallsByType] = useState([]);
  const [recentCalls, setRecentCalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const data = await api.calls.getAll();
      const calls = data.calls || [];

      if (calls && calls.length > 0) {
        const totalCalls = calls.length;
        const totalDuration = calls.reduce((sum, call) => sum + (call.total_duration_seconds || 0), 0);
        const totalCost = calls.reduce((sum, call) => sum + parseFloat(call.combined_cost || 0), 0);
        const avgDuration = totalDuration / totalCalls;

        setStats({ totalCalls, totalDuration, totalCost, avgDuration });

        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = startOfDay(subDays(new Date(), 6 - i));
          return {
            date: format(date, 'MMM dd'),
            calls: 0,
            cost: 0,
          };
        });

        calls.forEach(call => {
          const callDate = format(startOfDay(new Date(call.created_at)), 'MMM dd');
          const dayData = last7Days.find(d => d.date === callDate);
          if (dayData) {
            dayData.calls += 1;
            dayData.cost += parseFloat(call.combined_cost || 0);
          }
        });

        setCallsByDay(last7Days);

        const statusGroups = calls.reduce((acc, call) => {
          const status = call.call_status || 'unknown';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});

        setCallsByStatus(
          Object.entries(statusGroups).map(([name, value]) => ({ name, value }))
        );

        const typeGroups = calls.reduce((acc, call) => {
          const type = call.direction || 'unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {});

        setCallsByType(
          Object.entries(typeGroups).map(([name, value]) => ({ name, value }))
        );

        setRecentCalls(calls.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Overview of your call activity and performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Calls</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalCalls}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Phone className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Duration</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{formatDuration(stats.totalDuration)}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cost</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">${stats.totalCost.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Duration</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{formatDuration(Math.floor(stats.avgDuration))}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Calls Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={callsByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="calls" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Cost Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={callsByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="cost" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Calls by Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={callsByStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {callsByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Call Direction</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={callsByType}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {callsByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Calls */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Calls</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Direction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
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
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentCalls.length > 0 ? (
                recentCalls.map((call) => (
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
                      {call.to_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        {call.call_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDuration(call.total_duration_seconds)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${parseFloat(call.combined_cost || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(call.created_at), 'MMM dd, yyyy HH:mm')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No call logs found. Start by adding some calls!
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
