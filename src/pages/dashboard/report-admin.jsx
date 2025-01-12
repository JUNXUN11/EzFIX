import React, { useState, useEffect, useRef } from 'react';
import {ArrowPathIcon, EyeIcon, XMarkIcon, FunnelIcon, MagnifyingGlassIcon, PaperAirplaneIcon, PlayIcon, FlagIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

const LoadingSpinner = () => (
    <div className="animate-spin h-8 w-8 border-4 border-black border-t-transparent rounded-full"></div>
);

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
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const handleFlagUpdate = async (reportId, isPriority) => {
    setIsUpdating(true);
    setUpdateError(null);
    
    try {
      const id = reportId._id || reportId;
      
      const response = await fetch(`https://theezfixapi.onrender.com/api/v1/reports/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priority: isPriority })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update flag status');
      }

      // Update reports state with the new flag status
      setReports(prevReports => {
        const newReports = prevReports.map(report => 
          report._id === reportId ? { ...report, priority: isPriority } : report
        );
        
        // Sort reports to move flagged ones to the top
        return [...newReports].sort((a, b) => {
          if (a.priority === b.priority) return 0;
          return a.priority ? -1 : 1;
        });
      });

      if (selectedReport?.id === reportId) {
        setSelectedReport(currentReport => ({
          ...currentReport,
          priority: isPriority
        }));
      }

      showToast(isPriority ? 'Report flagged as priority' : 'Priority flag removed', 'success');

    } catch (error) {
      console.error('Error updating flag status:', error);
      setUpdateError('Failed to update flag status. Please try again.');
      showToast('Failed to update flag status', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSort = (key) => {
    // Convert key to match the actual data properties
    const keyMap = {
      'name': 'reportedBy',
      'blockno': 'location',
      'roomno': 'roomNo',
      'damagetype': 'category',
      'dayselapsed': 'daysSince',
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
    
    let sortableItems = [...reports].map(item => ({
      ...item, 
      daysSince: getDaysSince(item.createdAt)
    }));

    sortableItems.sort((a, b) => {
      if (a.priority === b.priority) {
        // If flag status is the same, apply the regular sorting
        if (sortConfig.key) {
          let aValue = a[sortConfig.key];
          let bValue = b[sortConfig.key];
          
          if (sortConfig.key === 'createdAt') {
            aValue = new Date(aValue).getTime();
            bValue = new Date(bValue).getTime();
          } else {
            aValue = String(aValue || '').toLowerCase();
            bValue = String(bValue || '').toLowerCase();
          }
          
          if (aValue < bValue) {
            return sortConfig.direction === "asc" ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === "asc" ? 1 : -1;
          }
        }
        return 0;
      }
      // Flagged items always come first
      return a.priority ? -1 : 1;
    });
    
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

  const handleEntriesPerPageChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing entries per page
  };

  // Add pagination calculations
  const getPaginatedData = () => {
    const filteredReports = filteredData();
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    return filteredReports.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredData().length / entriesPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Component for pagination controls
  const PaginationControls = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust startPage if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
        <div className="flex items-center">
          <span className="text-sm text-gray-700 mr-4">
            Rows per page:
            <select
              value={entriesPerPage}
              onChange={handleEntriesPerPageChange}
              className="ml-2 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </span>
          <span className="text-sm text-gray-700">
            Showing {((currentPage - 1) * entriesPerPage) + 1} to {Math.min(currentPage * entriesPerPage, filteredData().length)} of {filteredData().length} entries
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          
          {startPage > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  currentPage === 1
                    ? 'bg-blue-500 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                1
              </button>
              {startPage > 2 && (
                <span className="px-2 py-1 text-gray-500">...</span>
              )}
            </>
          )}
          
          {pageNumbers.map(number => (
            <button
              key={number}
              onClick={() => handlePageChange(number)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                currentPage === number
                  ? 'bg-blue-500 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {number}
            </button>
          ))}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <span className="px-2 py-1 text-gray-500">...</span>
              )}
              <button
                onClick={() => handlePageChange(totalPages)}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  currentPage === totalPages
                    ? 'bg-blue-500 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {totalPages}
              </button>
            </>
          )}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  };

  const ReportDetailsCard = ({ report, onClose }) => {
    const [currentStatus, setCurrentStatus] = useState(report.status);
    const [mediaFiles, setMediaFiles] = useState({ images: [], videos: [] });
    const [isLoadingMedia, setIsLoadingMedia] = useState(true);
    const [fullScreenMedia, setFullScreenMedia] = useState(null);
    const [comment, setComment] = useState(report.comment || '');
    const [newComment, setNewComment] = useState('');
    const [isCommenting, setIsCommenting] = useState(false);
    const [commentError, setCommentError] = useState(null);
    const [loadingStates, setLoadingStates] = useState({});
    const [isPriority, setIsPriority] = useState(report.priority || false);
    const cardRef = useRef(null);

    useEffect(() => {
      setCurrentStatus(report.status);
      setComment(report.comment || '');
      setIsPriority(report.priority || false);

      const handleClickOutside = (event) => {
        if (cardRef.current && !cardRef.current.contains(event.target)) {
          onClose();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      
      const loadMediaFiles = async () => {
        setIsLoadingMedia(true);
        const newMediaFiles = { images: [], videos: [] };
        
        if (report.attachments && Array.isArray(report.attachments)) {
          // Initialize loading states for each attachment
          const initialLoadingStates = {};
          report.attachments.forEach(fileId => {
            initialLoadingStates[fileId] = true;
          });
          setLoadingStates(initialLoadingStates);
  
          for (const fileId of report.attachments) {
            try {
              const response = await fetch(`https://theezfixapi.onrender.com/api/v1/reports/${report.id}/attachments/${fileId}`);
              if (!response.ok) {
                throw new Error(`Failed to fetch media for ID: ${fileId}`);
              }
              
              const blob = await response.blob();
              const url = URL.createObjectURL(blob);
              const type = blob.type.startsWith('video/') ? 'video' : 'image';
              
              if (type === 'image') {
                newMediaFiles.images.push({ url, id: fileId });
              } else {
                newMediaFiles.videos.push({ url, id: fileId });
              }
            } catch (error) {
              console.error(`Error loading attachment ${fileId}:`, error);
            } finally {
              setLoadingStates(prev => ({ ...prev, [fileId]: false }));
            }
          }
  
          setMediaFiles(newMediaFiles);
        }
        setIsLoadingMedia(false);
      };
  
      loadMediaFiles();
  
      return () => {
        // Cleanup object URLs
        [...(mediaFiles.images || []), ...(mediaFiles.videos || [])].forEach(file => {
          if (file?.url) {
            URL.revokeObjectURL(file.url);
          }
        });
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [report.id, report.attachments, report.priority]);
  
    const handleFlagToggle = () => {
      handleFlagUpdate(report.id, !isPriority);
      setIsPriority(!isPriority);
    };

    const VideoPreview = ({ video, onClick, isLoading }) => {
      const videoRef = useRef(null);
      const [thumbnail, setThumbnail] = useState('');
    
      useEffect(() => {
        const generateThumbnail = () => {
          const videoElement = videoRef.current;
          if (videoElement) {
            videoElement.currentTime = 0.1;
            videoElement.addEventListener('loadeddata', () => {
              const canvas = document.createElement('canvas');
              canvas.width = videoElement.videoWidth;
              canvas.height = videoElement.videoHeight;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
              setThumbnail(canvas.toDataURL());
            }, { once: true });
          }
        };
    
        if (!isLoading) {
          generateThumbnail();
        }
      }, [video.url, isLoading]);
    
      if (isLoading) {
        return (
          <div className="aspect-video rounded-lg bg-gray-100 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        );
      }
    
      return (
        <div 
          className="group relative aspect-video rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
          onClick={onClick}
        >
          <video ref={videoRef} src={video.url} className="hidden" preload="metadata" />
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${thumbnail || '/api/placeholder/640/360'})` }}
          />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-all flex flex-col items-center justify-center">
            <div className="transform group-hover:scale-110 transition-all duration-200">
              <div className="rounded-full bg-white/90 p-4">
                <PlayIcon className="h-8 w-8 text-gray-900" />
              </div>
            </div>
            <span className="text-white text-sm mt-3 opacity-0 group-hover:opacity-100 transition-all font-medium">
              Click to play video
            </span>
          </div>
        </div>
      );
    };

    const ImagePreview = ({ image, onClick, isLoading }) => {
      if (isLoading) {
        return (
          <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        );
      }
    
      return (
        <div 
          className="relative aspect-square cursor-pointer group rounded-lg overflow-hidden"
          onClick={onClick}
        >
          <img
            src={image.url}
            alt="Report attachment"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity">
            <div className="absolute inset-0 flex items-center justify-center">
              <EyeIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      );
    };

    const FullScreenMediaModal = ({ mediaUrl, type, onClose }) => (
      <div 
        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="relative max-w-[90%] max-h-[90vh]">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute -top-12 right-0 bg-white/10 hover:bg-white/20 rounded-full p-2 z-50 transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-white" />
          </button>
          {type === 'video' ? (
            <video 
              src={mediaUrl}
              controls
              autoPlay
              className="max-w-full max-h-[90vh] rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img 
              src={mediaUrl} 
              alt="Full screen media"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      </div>
    );  

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
            < div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900">Report Details</h2>
                <button
                  onClick={handleFlagToggle}
                  className={`p-2 rounded-full transition-colors ${
                    isPriority 
                      ? 'bg-red-100 text-red-900 hover:bg-red-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={isPriority ? "Remove priority flag" : "Flag as priority"}
                >
                  <FlagIcon className="h-5 w-5" />
                </button>
              </div>
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
                <p className="text-sm text-gray-500 mb-4">
                  Attachments ({(mediaFiles.images.length + mediaFiles.videos.length)} total)
                </p>
                {isLoadingMedia ? (
                  <div className="flex justify-center p-8">
                    <LoadingSpinner />
                  </div>
                ) : (mediaFiles.images.length > 0 || mediaFiles.videos.length > 0) ? (
                  <div className="space-y-6">
                    {mediaFiles.videos.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          Videos ({mediaFiles.videos.length})
                        </h4>
                        <div className="grid grid-cols-1 gap-4">
                          {mediaFiles.videos.map((video) => (
                            <VideoPreview
                              key={`video-${video.id}`}
                              video={video}
                              onClick={() => setFullScreenMedia({ url: video.url, type: 'video' })}
                              isLoading={loadingStates[video.id]}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {mediaFiles.images.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          Images ({mediaFiles.images.length})
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          {mediaFiles.images.map((image) => (
                            <ImagePreview
                              key={`image-${image.id}`}
                              image={image}
                              onClick={() => setFullScreenMedia({ url: image.url, type: 'image' })}
                              isLoading={loadingStates[image.id]}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 px-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">
                      No attachments available
                    </p>
                  </div>
                )}
              </div>

              {fullScreenMedia && (
                <FullScreenMediaModal 
                  mediaUrl={fullScreenMedia.url}
                  type={fullScreenMedia.type}
                  onClose={() => setFullScreenMedia(null)}
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
                      <LoadingSpinner />
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
                      <LoadingSpinner />
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
        <LoadingSpinner />
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

  const tableHeaders = ["Name", "Block No.", "Room No.", "Damage Type", "Title", "Date", "Days Elapsed", "Status", "Actions"];

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      {/* Desktop view */}
      <div className="bg-white rounded-lg shadow-md">
        {/* Desktop header */}
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

        <div className="md:hidden bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 p-4 rounded-t-lg">
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

        
        <div className="hidden md:block">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {tableHeaders.map((el) => (
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
              {getPaginatedData().map((report, index) => {
                const className = `py-3 px-5 ${
                  index === getPaginatedData().length - 1 ? "" : "border-b border-gray-200"
                }`;
                return (
                  <tr key={report.id} className={`hover:bg-gray-50 ${report.priority ? 'bg-red-50' : ''}`}>
                    <td className={className}>
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-600 font-semibold">
                            {report.reportedBy?.charAt(0)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
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
      
        {/* Mobile view */}
        <div className="md:hidden">
          {getPaginatedData().map((report) => (
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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleViewReport(report)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <EyeIcon className="h-4 w-4 text-gray-600" />
                </button>
              </div>
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
        
        <PaginationControls />
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