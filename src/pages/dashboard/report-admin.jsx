import React, { useState, useEffect, useRef } from 'react';
import {ArrowPathIcon, EyeIcon, XMarkIcon, FunnelIcon, MagnifyingGlassIcon, PaperAirplaneIcon } from "@heroicons/react/24/solid";

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
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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

  const predefinedCategories = [
    "electrical",
    "civil",
    "piping",
    "sanitary",
    "pest control"
  ];

  const filterOptions = [
    { value: "", label: "All Damage Types" },
    { value: "electrical", label: "Electrical" },
    { value: "civil", label: "Civil" },
    { value: "piping", label: "Piping" },
    { value: "sanitary", label: "Sanitary" },
    { value: "pest control", label: "Pest Control" },
    { value: "other", label: "Other" }
  ];
  
  const filteredData = () => {
    return sortedData().filter((item) => {
      const matchesSearch = item.location?.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesFilter = true;
      if (filterType) {
        if (filterType === "other") {
          matchesFilter = !predefinedCategories.includes(item.category?.toLowerCase());
        } else {
          matchesFilter = item.category?.toLowerCase() === filterType.toLowerCase();
        }
      }
      
      return matchesSearch && matchesFilter;
    });
  };

  const getDaysSince = (date) => {
    const today = new Date();
    const reportDate = new Date(date);
    const diffInDays = Math.ceil((today - reportDate) / (1000 * 60 * 60 * 24));
    return diffInDays;
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true); 
      setError(null);
      const response = await fetch('https://theezfixapi.onrender.com/api/v1/reports');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Server ERROR!! Failed to load reports');
      }
      
      const data = await response.json();

      if (Array.isArray(data.reports)) {
        setReports(data.reports); 
      } else if (Array.isArray(data)) {
        setReports(data); 
      } else {
        throw new Error('Invalid data format received');
      }
      
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError(error.message || 'Failed to load reports. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
  };

  const handleCloseDetails = () => {
    setSelectedReport(null);
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    // Auto hide after 3 seconds
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleStatusUpdate = async (reportId, newStatus) => {
    setIsUpdating(true);
    setUpdateError(null);
    
    try {
      const id = reportId._id || reportId;
      
      const response = await fetch(`https://theezfixapi.onrender.com/api/v1/reports/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update status');
      }

      await fetchReports();

      setReports(prevReports => {
        const newReports = prevReports.map(report => 
          report._id === reportId ? { ...report, status: newStatus } : report
        );
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
        rejected: "bg-red-100 text-red-800",
        ongoing: "bg-orange-100 text-orange-800",
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
      electrical: "bg-red-100 text-red-800",
      civil: "bg-blue-100 text-blue-800",
      piping: "bg-green-100 text-green-800",
      sanitary: "bg-yellow-100 text-yellow-800",
      "pest control": "bg-orange-100 text-orange-800"
    };
    
    return colors[category.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  const fetchReportImage = async (reportId, fileId) => {
    try {
      const response = await fetch(`https://theezfixapi.onrender.com/api/v1/reports/${reportId}/attachments/${fileId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error fetching image:', error);
      return null;
    }
  };

  const ReportDetailsCard = ({ report, onClose }) => {
    const [currentStatus, setCurrentStatus] = useState(report.status);
    const [images, setImages] = useState([]);
    const [loadingImages, setLoadingImages] = useState(true);
    const [fullScreenImage, setFullScreenImage] = useState(null);
    const [comment, setComment] = useState(report.comment || '');
    const [newComment, setNewComment] = useState('');
    const [isCommenting, setIsCommenting] = useState(false);
    const [commentError, setCommentError] = useState(null);
    const cardRef = useRef(null);

    useEffect(() => {
      setCurrentStatus(report.status);
      setComment(report.comment || '');

      const handleClickOutside = (event) => {
        if (cardRef.current && !cardRef.current.contains(event.target)) {
          onClose();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      
      const loadImages = async () => {
        setLoadingImages(true);
        if (report.attachments && report.attachments.length > 0) {
          const imagePromises = report.attachments.map(fileId => 
            fetchReportImage(report.id, fileId)
          );
          
          const loadedImages = await Promise.all(imagePromises);
          const validImages = loadedImages.filter(img => img !== null);
          setImages(validImages);
        }
        setLoadingImages(false);
      };

      loadImages();

      // Cleanup function to revoke object URLs
      return () => {
        images.forEach(url => URL.revokeObjectURL(url));
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [report.status]);

    const FullScreenImageModal = ({ imageUrl, onClose }) => {
      return (
        <div 
          className="fixed inset-0 z-[100] bg-black bg-opacity-90 flex items-center justify-center p-4 cursor-pointer"
          onClick={onClose}
        >
          <div className="relative max-w-[90%] max-h-[90%]">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 rounded-full p-2 z-50"
            >
              <XMarkIcon className="h-8 w-8 text-white" />
            </button>
            <img 
              src={imageUrl} 
              alt="Full screen attachment" 
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      );
    };

    if (!report) return null;

    const statusOptions = [
      { value: "ongoing", label: "Ongoing" },
      { value: "fixed", label: "Fixed" },
      { value: "rejected", label: "Rejected" },
      { value: "pending", label: "Pending" }
    ];

    const handleChange = (e) => {
      const newStatus = e.target.value;
      handleStatusUpdate(report.id, newStatus);
      setCurrentStatus(newStatus);
    };

    const handleAddComment = async () => {
      if (!newComment.trim()) {
        setCommentError('Comment cannot be empty');
        return;
      }
  
      setIsCommenting(true);
      setCommentError(null);
      
      try {
        const response = await fetch(`https://theezfixapi.onrender.com/api/v1/reports/${report.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ comment: newComment})
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to add comment');
        }

        await fetchReports();
        
        setNewComment('');
        showToast('Comment added successfully', 'success');
  
      } catch (error) {
        console.error('Error adding comment:', error);
        setCommentError(error.message || 'Failed to add comment. Please try again.');
        showToast('Failed to add comment', 'error');
      } finally {
        setIsCommenting(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div 
          ref={cardRef}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
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
                  <p className="text-sm text-gray-500">Title</p>
                  <p className="font-semibold">{report.title}</p>
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

              <div>
                <p className="text-sm text-gray-500 mb-2">Attachments</p>
                {loadingImages ? (
                  <div className="flex justify-center p-4">
                    <div className="animate-spin h-6 w-6 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                  </div>
                ) : images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {images.map((imageUrl, index) => (
                      <div key={index} className="relative aspect-square" onClick={() => setFullScreenImage(imageUrl)}>
                        <img
                          src={imageUrl}
                          alt={`Damage report ${index + 1}`}
                          className="rounded-lg object-cover w-full h-full"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic text-center p-4">
                    No attachments available
                  </p>
                )}
              </div>
              
              {fullScreenImage && (
                <FullScreenImageModal 
                  imageUrl={fullScreenImage} 
                  onClose={() => setFullScreenImage(null)} 
                />
              )}
              
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

              <div className="p-6 border-t">
                <h3 className="text-lg font-semibold mb-4">Comments</h3>
                
                {/* Existing Comment Display */}
                {comment && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <p className="text-gray-700">{comment}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Added on {new Date(report.updatedAt).toLocaleString()}
                    </p>
                  </div>
                )}
                
                {/* New Comment Input */}
                <div className="flex items-start space-x-3">
                  <textarea
                    value={newComment}
                    onChange={(e) => {
                      setNewComment(e.target.value);
                      setCommentError(null);
                    }}
                    placeholder="Add a comment..."
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[100px]"
                    disabled={isCommenting}
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={isCommenting || !newComment.trim()}
                    className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isCommenting ? (
                      <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
                    ) : (
                      <PaperAirplaneIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                
                {/* Error Message */}
                {commentError && (
                  <p className="text-red-500 text-sm mt-2">{commentError}</p>
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
        <div className="animate-spin h-12 w-12 border-4 border-black rounded-full border-t-transparent"></div>
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
        {/* Desktop view */}
        <div className="hidden md:flex mb-8 p-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 rounded-t-lg flex justify-between items-center">
          <h6 className="text-white text-lg font-semibold">
            Reported Damages
          </h6>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search by block"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-40 px-3 py-1.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-sm py-1.5 px-3 border rounded-lg bg-white text-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {filterOptions.map(option => (
                <option 
                  key={option.label} 
                  value={option.value}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="text-gray-700"
                >
                  {option.label}
                </option>
              ))}
            </select>
            <button
              onClick={fetchReports}
              className="flex items-center justify-center p-2 bg-white rounded-lg shadow-sm hover:bg-gray-100 transition-colors"
              title="Refresh Reports"
            >
              <ArrowPathIcon className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <div className="hidden md:block">
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {["Name", "Block No.", "Room No.", "Damage Type", "Title", "Date", "Days Elapsed", "Status", "Actions"].map((el) => (
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
                          {report.title}
                        </p>
                      </td>
                      <td className={className}>
                        <p className="text-sm font-semibold text-gray-600">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className={className}>
                        <p className="text-sm font-semibold text-gray-600">
                          {getDaysSince(report.createdAt)} days
                        </p>
                      </td>
                      <td className={className}>
                        <StatusBadge status={report.status} />
                      </td>
                      <td className={className}>
                        <button
                          onClick={() => handleViewReport(report)}
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
      </div>
      
      {/* Mobile view */}
      <div className="md:hidden bg-white">
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 p-4 rounded-t-lg">
            <div className="flex justify-between items-center mb-4">
              <h6 className="text-white text-lg font-semibold">
                Reported Damages
              </h6>
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="p-2 text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FunnelIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by block"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 text-white placeholder-gray-300"
              />
            </div>
            
            {/* Collapsible Filter */}
            <div className={`transition-all duration-300 ease-in-out ${isFilterOpen ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0 overflow-hidden'}`}>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 mt-2 border rounded-lg bg-white/10 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {filterOptions.map(option => (
                  <option 
                    key={option.label} 
                    value={option.value}
                    className="text-gray-700"
                  >
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                onClick={fetchReports}
                className="mt-4 flex items-center justify-center p-2 bg-white rounded-lg shadow-sm hover:bg-gray-100 transition-colors w-full"
                title="Refresh Reports"
              >
                <ArrowPathIcon className="h-5 w-5 text-gray-700" />
                <span className="ml-2 text-gray-700">Refresh</span>
              </button>
            </div>
          </div>
        {filteredData().map((report) => (
          <div key={report.id} className="p-4 border-b border-gray-400">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-600 font-semibold">
                    {report.reportedBy?.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{report.reportedBy}</p>
                  <p className="text-xs text-gray-500">{new Date(report.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReport(report)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <EyeIcon className="h-4 w-4 text-gray-600" />
              </button>
            </div>
            
            <div className="space-y-2">
              <div>
                <span className="text-xs text-gray-800">Block: {report.location}</span>
              </div>
              <div>
                <span className="text-xs text-gray-800">Room: {report.roomNo}</span>
              </div>
              <div className="flex justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCategoryColor(report.category)}`}>
                  {report.category || 'Other'}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold`}>
                  <StatusBadge status={report.status} />
                </span>
              </div>
              <p className="text-sm text-gray-900 line-clamp-2">{report.description}</p>
            </div>
          </div>
        ))}
      </div>
        
      {selectedReport && (
        <ReportDetailsCard
          report={selectedReport}
          onClose={handleCloseDetails}
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