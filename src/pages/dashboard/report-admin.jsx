import React, { useState, useEffect } from 'react';
import { EyeIcon, XMarkIcon } from "@heroicons/react/24/solid";

const Toast = ({ message, type, onClose }) => {
  return (
    <div className={`fixed bottom-4 right-4 z-50 rounded-lg shadow-lg p-4 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white flex items-center gap-2`}>
      <span>{message}</span>
      <button onClick={onClose} className="hover:opacity-80">
        <XMarkIcon className="h-5 w-5" />
      </button>
    </div>
  );
};

const AdminReport = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [filterType, setFilterType] = useState("");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const handleSort = (key) => {
    // Convert key to match the actual data properties
    const keyMap = {
      'name': 'reportedBy',
      'blockno': 'location',
      'roomno': 'roomNo',
      'damagetype': 'category',
      'date': 'createdAt'
    };
    
    const sortKey = keyMap[key.toLowerCase()] || key.toLowerCase();
    
    let direction = "asc";
    if (sortConfig.key === sortKey && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key: sortKey, direction });
  };

  const sortedData = () => {
    if (!reports.length) return [];
    
    let sortableItems = [...reports];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // Handle dates
        if (sortConfig.key === 'createdAt') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        } else {
          // Convert to lowercase strings for other fields
          aValue = String(aValue || '').toLowerCase();
          bValue = String(bValue || '').toLowerCase();
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  };

  const filteredData = () => {
    return sortedData().filter((item) => {
      const matchesSearch = item.reportedBy?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = !filterType || item.category?.toLowerCase() === filterType.toLowerCase();
      return matchesSearch && matchesFilter;
    });
  };

  useEffect(() => {
    fetchReports();
    
    const intervalId = setInterval(() => {
      fetchReports();
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch(' https://theezfixapi.onrender.com/api/v1/reports');
      if (!response.ok) {
        throw new Error('Server ERROR!! Failed to load reports');
      }
      const data = await response.json();
      setReports(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Failed to load reports. Please try again later.');
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    // Auto hide after 3 seconds
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleStatusUpdate = async (reportId, newStatus) => {
    console.log('Updating report:', reportId, 'with status:', newStatus);
    setIsUpdating(true);
    setUpdateError(null);
    
    try {
      const response = await fetch(`https://theezfixapi.onrender.com/api/v1/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      const updatedReport = await response.json();
      console.log('Response from server:', updatedReport);

      setReports(prevReports => {
        const newReports = prevReports.map(report => 
          report._id === reportId ? { ...report, status: newStatus } : report
        );
        console.log('Updated reports:', newReports); // Add this
        return newReports;
      });

      if (selectedReport?.id === reportId) {
        setSelectedReport(currentReport => ({
          ...currentReport,
          status: newStatus,
          updatedAt: new Date().toISOString() // Update the timestamp
        }));
      }

      showToast('Status updated successfully', 'success');

    } catch (error) {
      console.error('Error updating status:', error);
      setUpdateError('Failed to update status. Please try again.');
      showToast('Failed to update status', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const StatusBadge = React.memo(({ status }) => {
    const getStatusColor = (status) => {
      const colors = {
        fixed: "bg-green-100 text-green-800",
        "not fixed": "bg-red-100 text-red-800",
        "in progress": "bg-orange-100 text-orange-800",
        pending: "bg-gray-100 text-gray-800"
      };
      return colors[status?.toLowerCase()] || colors.pending;
    };

    const formatStatus = (status) => {
      if (!status) return 'Pending';
      
      // Split by spaces and capitalize each word
      return status
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };
  
    return (
      <span 
        key={`status-${status}`} 
        className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}
      >
        {formatStatus(status)}
      </span>
    );
  });

  const getCategoryColor = (category) => {
    if (!category) return "bg-gray-100 text-gray-800";
    
    const colors = {
      "electrical damage": "bg-red-100 text-red-800",
      "civil damage": "bg-blue-100 text-blue-800",
      piping: "bg-green-100 text-green-800",
      sanitary: "bg-yellow-100 text-yellow-800",
      "pest control": "bg-orange-100 text-orange-800"
    };
    
    return colors[category.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  const ReportDetailsCard = ({ report, onClose }) => {
    const [currentStatus, setCurrentStatus] = useState(report.status);

    useEffect(() => {
      setCurrentStatus(report.status);
    }, [report.status]);

    if (!report) return null;

    const statusOptions = [
      { value: "in progress", label: "In Progress" },
      { value: "fixed", label: "Fixed" },
      { value: "not fixed", label: "Not Fixed" },
      { value: "pending", label: "Pending" }
    ];

    const handleChange = (e) => {
      const newStatus = e.target.value;
      handleStatusUpdate(report.id, newStatus);
      setCurrentStatus(newStatus);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-bold text-gray-900">Report Details</h2>
              <button 
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xl font-semibold text-gray-600">
                    {report.reportedBy?.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{report.reportedBy}</h3>
                  <p className="text-sm text-gray-500">
                    Reported on {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Block Number</p>
                  <p className="font-semibold">{report.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Room Number</p>
                  <p className="font-semibold">{report.roomNo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Damage Type</p>
                  <p className="font-semibold">{report.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Current Status</p>
                  <StatusBadge status={currentStatus} />
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Description</p>
                <p className="bg-gray-50 p-4 rounded-lg">{report.description}</p>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-500 mb-3">Update Status</p>
                <div className="flex flex-col gap-2">
                <select
                  value={currentStatus || 'pending'}
                  onChange={handleChange}
                  disabled={isUpdating}
                  className="w-full px-4 py-2 border rounded-lg bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {statusOptions.map((option) => (
                    <option 
                      key={option.value} 
                      value={option.value}
                      disabled={option.value === currentStatus}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
                  {isUpdating && (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                    </div>
                  )}
                </div>
                {updateError && (
                  <p className="text-red-500 text-sm mt-2">{updateError}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-12 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-center text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="mt-12 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-center text-gray-600 text-lg font-semibold">
            No reports submitted yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <div className="bg-white rounded-lg shadow-md">
      <div className="mb-8 p-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 rounded-t-lg flex justify-between items-center">
          <h6 className="text-white text-lg font-semibold">
            Reported Damages
          </h6>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search by name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-40 px-3 py-1.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-sm py-1.5 px-3 border rounded-lg bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Damage Types</option>
              <option value="electrical damage">Electrical</option>
              <option value="civil damage">Civil</option>
              <option value="piping">Piping</option>
              <option value="sanitary">Sanitary</option>
              <option value="pest control">Pest Control</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["Name", "Block No.", "Room No.", "Damage Type", "Description", "Date", "Status", "Actions"].map((el) => (
                  <th
                    key={el}
                    className="border-b border-gray-200 py-3 px-5 text-left cursor-pointer"
                    onClick={() => handleSort(el.toLowerCase().replace(/[. ]/g, ""))}
                  >
                    <span className="text-xs font-bold uppercase text-gray-600">
                      {el}
                      {sortConfig.key === el.toLowerCase().replace(/[. ]/g, "") && (
                        <span>{sortConfig.direction === "asc" ? " ▲" : " ▼"}</span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData().map((report, index) => {
                const className = `py-3 px-5 ${
                  index === reports.length - 1 ? "" : "border-b border-gray-200"
                }`;

                return (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className={className}>
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-600 font-semibold">
                            {report.reportedBy?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {report.reportedBy}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className={className}>
                      <p className="text-sm font-semibold text-gray-600">
                        {report.location}
                      </p>
                    </td>
                    <td className={className}>
                      <p className="text-sm font-semibold text-gray-600">
                        {report.roomNo}
                      </p>
                    </td>
                    <td className={className}>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCategoryColor(report.category)}`}>
                        {report.category || 'Other'}
                      </span>
                    </td>
                    <td className={className}>
                      <p className="text-sm font-semibold text-gray-600">
                        {report.description}
                      </p>
                    </td>
                    <td className={className}>
                      <p className="text-sm font-semibold text-gray-600">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className={className}>
                      <StatusBadge status={report.status} />
                    </td>
                    <td className={className}>
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <EyeIcon className="h-4 w-4 text-gray-600" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedReport && (
        <ReportDetailsCard
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}
    </div>
  );
};

export default AdminReport;