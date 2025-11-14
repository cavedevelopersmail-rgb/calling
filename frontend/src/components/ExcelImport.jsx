import { useState } from 'react';
import { Upload, AlertCircle, CheckCircle, X, Edit2, Trash2, Plus } from 'lucide-react';
import { api } from '../lib/api';
import { useImport } from '../contexts/ImportContext';
import { format } from 'date-fns';

export const ExcelImport = ({ onDataReady }) => {
  const { setData, setErrors, setStats, importedData, importErrors, importStats } = useImport();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState('add');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [newCallData, setNewCallData] = useState({
    name: '',
    phoneNumber: '',
    scheduledTime: '',
    message: '',
    notes: '',
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
        alert('Please select a valid Excel (.xlsx, .xls) or CSV (.csv) file');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file to upload');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.import.upload(formData);
      
      setData(response.data);
      setStats({
        totalRows: response.totalRows,
        validRows: response.validRows,
      });
      setErrors(response.errors);
      setFile(null);

      // Reset file input
      const fileInput = document.getElementById('file-input');
      if (fileInput) fileInput.value = '';

      if (onDataReady) {
        onDataReady();
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (index, call) => {
    setEditingIndex(index);
    setEditFormData({ ...call });
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null) {
      const updatedData = [...importedData];
      updatedData[editingIndex] = editFormData;
      setData(updatedData);
      setEditingIndex(null);
      setEditFormData({});
    }
  };

  const handleDeleteRow = (index) => {
    if (confirm('Are you sure you want to remove this row?')) {
      const newData = importedData.filter((_, i) => i !== index);
      setData(newData);
    }
  };

  const handleAddNewCall = () => {
    if (!newCallData.phoneNumber || !newCallData.scheduledTime) {
      alert('Phone number and scheduled time are required');
      return;
    }

    const newCall = {
      name: newCallData.name.trim(),
      phoneNumber: newCallData.phoneNumber.trim(),
      scheduledTime: new Date(newCallData.scheduledTime),
      message: newCallData.message.trim(),
      notes: newCallData.notes.trim(),
    };

    setData([...importedData, newCall]);
    setNewCallData({
      name: '',
      phoneNumber: '',
      scheduledTime: '',
      message: '',
      notes: '',
    });
    setShowForm(false);
  };

  const handleSaveAll = async () => {
    if (importedData.length === 0) {
      alert('No data to save');
      return;
    }

    setLoading(true);
    try {
      const response = await api.import.save({
        calls: importedData,
        mode: mode,
      });

      alert(`Successfully saved ${response.data.length} calls`);
      setData([]);
      setErrors([]);
      setStats({ totalRows: 0, validRows: 0 });
      setFile(null);
    } catch (error) {
      console.error('Save error:', error);
      alert(`Save failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Import Scheduled Calls</h2>

        {/* File Upload Section */}
        <div className="space-y-4 mb-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="flex flex-col items-center justify-center">
              <Upload className="w-12 h-12 text-gray-400 mb-2" />
              <p className="text-gray-600 mb-2">Upload an Excel or CSV file</p>
              <input
                id="file-input"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="file-input"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
              >
                Choose File
              </label>
              {file && <p className="mt-2 text-sm text-gray-600">{file.name}</p>}
            </div>
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Uploading...' : 'Upload & Parse File'}
          </button>
        </div>

        {/* Mode Selection */}
        {importedData.length > 0 && (
          <div className="mb-6 pb-6 border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Save Mode:
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="add"
                  checked={mode === 'add'}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-gray-700">Add New Calls</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="update"
                  checked={mode === 'update'}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-gray-700">Update Existing</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Import Stats */}
      {importStats.totalRows > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-gray-600 text-sm">Total Rows</p>
            <p className="text-2xl font-bold text-gray-900">{importStats.totalRows}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-gray-600 text-sm">Valid Rows</p>
            <p className="text-2xl font-bold text-green-600">{importStats.validRows}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-gray-600 text-sm">Invalid Rows</p>
            <p className="text-2xl font-bold text-red-600">
              {importStats.totalRows - importStats.validRows}
            </p>
          </div>
        </div>
      )}

      {/* Error Messages */}
      {importErrors && importErrors.length > 0 && (
        <div className="bg-red-50 rounded-lg border border-red-200 p-4">
          <div className="flex gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="font-semibold text-red-900">Import Errors</p>
          </div>
          <ul className="text-sm text-red-800 space-y-1 ml-7">
            {importErrors.map((err, idx) => (
              <li key={idx}>
                Row {err.row}: {err.error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Data Table & Editing */}
      {importedData.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Imported Data ({importedData.length} records)
            </h3>
          </div>

          {/* Add New Call Form */}
          {showForm && (
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h4 className="font-semibold text-gray-900 mb-4">Add New Call</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={newCallData.name}
                    onChange={(e) =>
                      setNewCallData({ ...newCallData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={newCallData.phoneNumber}
                    onChange={(e) =>
                      setNewCallData({ ...newCallData, phoneNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="+1234567890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scheduled Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={newCallData.scheduledTime}
                    onChange={(e) =>
                      setNewCallData({ ...newCallData, scheduledTime: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <input
                    type="text"
                    value={newCallData.message}
                    onChange={(e) =>
                      setNewCallData({ ...newCallData, message: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Optional message"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={newCallData.notes}
                    onChange={(e) =>
                      setNewCallData({ ...newCallData, notes: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Optional notes"
                    rows="2"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleAddNewCall}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add Call
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">
                    Contact Name
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">
                    Phone Number
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">
                    Scheduled Time
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">
                    Message
                  </th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {importedData.map((call, idx) =>
                  editingIndex === idx ? (
                    <tr key={idx} className="bg-blue-50">
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
                              ? format(new Date(editFormData.scheduledTime), "yyyy-MM-dd'T'HH:mm")
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
                        <textarea
                          value={editFormData.message || ''}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, message: e.target.value })
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                          rows="2"
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={handleSaveEdit}
                            className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingIndex(null)}
                            className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900">{call.name || '-'}</td>
                      <td className="px-6 py-4 text-gray-900">{call.phoneNumber}</td>
                      <td className="px-6 py-4 text-gray-900">
                        {format(new Date(call.scheduledTime), 'MMM dd, yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-xs">
                        {call.message ? call.message.substring(0, 50) + '...' : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleStartEdit(idx, call)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRow(idx)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* Add New Row Button */}
          {!showForm && (
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add New Call Manually
              </button>
            </div>
          )}

          {/* Save Button */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleSaveAll}
              disabled={loading}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors font-semibold"
            >
              {loading ? 'Saving...' : `Save All ${importedData.length} Calls to Database`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
