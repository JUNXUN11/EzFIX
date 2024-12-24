import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Spinner,
} from "@material-tailwind/react";
import { EyeIcon, CalendarIcon, MapPinIcon, TrashIcon, XIcon, ChevronLeftIcon, ChevronRightIcon, MessageSquareIcon, VideoIcon, ImageIcon, Maximize, BellIcon} from "lucide-react";

const capitalizeFirstLetter = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};
  
const Report = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [images, setImages] = useState(null);
  const [loadingImages] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [mediaType, setMediaType] = useState({});
  const [lastViewedComments, setLastViewedComments] = useState({});
  const [lastViewedStatus, setLastViewedStatus] = useState({});

  const statusOptions = ["Pending", "Ongoing", "Rejected", "Fixed"];

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    // Load last viewed states from localStorage when component mounts
    const storedComments = localStorage.getItem('lastViewedComments');
    const storedStatus = localStorage.getItem('lastViewedStatus');
    if (storedComments) setLastViewedComments(JSON.parse(storedComments));
    if (storedStatus) setLastViewedStatus(JSON.parse(storedStatus));
  }, []);

  // Update last viewed states when viewing a report
  useEffect(() => {
    if (selectedReport) {
      setLastViewedComments(prev => ({
        ...prev,
        [selectedReport.id]: selectedReport.comment
      }));
      setLastViewedStatus(prev => ({
        ...prev,
        [selectedReport.id]: selectedReport.status
      }));

      // Save to localStorage
      localStorage.setItem('lastViewedComments', JSON.stringify({
        ...lastViewedComments,
        [selectedReport.id]: selectedReport.comment
      }));
      localStorage.setItem('lastViewedStatus', JSON.stringify({
        ...lastViewedStatus,
        [selectedReport.id]: selectedReport.status
      }));
    }
  }, [selectedReport]);

  useEffect(() => {
    const loadMedia = async () => {
      if (reports.length > 0) {
        const mediaPromises = reports.map(report => 
          Promise.all(
            report.attachments.map(async (fileId) => {
              const media = await fetchReportMedia(report.id, fileId);
              return media;
            })
          )
        );
        
        const allLoadedMedia = await Promise.all(mediaPromises);
        const validMedia = allLoadedMedia.map(reportMedia => 
          reportMedia.filter(media => media !== null)
        );
        
        // Create a mapping of report IDs to their media
        const reportMediaMap = reports.reduce((acc, report, index) => {
          acc[report.id] = validMedia[index];
          return acc;
        }, {});
  
        setImages(reportMediaMap);
      }
    };
  
    loadMedia();
  
    return () => {
      // Clean up object URLs if needed
      if (images) {
        Object.values(images).flat().forEach(url => URL.revokeObjectURL(url));
      }
    };
  }, [reports]);

  // Fetch and determine media type
  const fetchReportMedia = async (reportId, fileId) => {
    try {
      const response = await fetch(`https://theezfixapi.onrender.com/api/v1/reports/${reportId}/attachments/${fileId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch media');
      }
      const blob = await response.blob();
      
      // Determine media type
      const type = blob.type.split('/')[0];
      setMediaType(prev => ({
        ...prev,
        [`${reportId}-${fileId}`]: type
      }));
      
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error fetching media:', error);
      return null;
    }
  };

  // Function to render media thumbnail
  const MediaThumbnail = ({ url, type, onClick }) => {
    if (type === 'video') {
      return (
        <div className="relative aspect-square cursor-pointer" onClick={onClick}>
          <video
            className="rounded-lg object-cover w-full h-full"
            preload="metadata"
          >
            <source src={url} />
          </video>
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
            <VideoIcon className="w-8 h-8 text-white" />
          </div>
        </div>
      );
    }

    return (
      <div className="relative aspect-square cursor-pointer" onClick={onClick}>
        <img
          src={url}
          alt="Attachment"
          className="rounded-lg object-cover w-full h-full"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 rounded-lg transition-opacity">
          <ImageIcon className="w-8 h-8 text-white opacity-0 hover:opacity-100" />
        </div>
      </div>
    );
  };

  // Function to render media viewer
  const MediaViewer = ({ url, type, onClose }) => {
    const videoRef = useRef(null);
  
    const toggleFullScreen = async () => {
      if (!document.fullscreenElement) {
        try {
          if (videoRef.current.requestFullscreen) {
            await videoRef.current.requestFullscreen();
          } else if (videoRef.current.webkitRequestFullscreen) {
            await videoRef.current.webkitRequestFullscreen();
          } else if (videoRef.current.msRequestFullscreen) {
            await videoRef.current.msRequestFullscreen();
          }
        } catch (err) {
          console.error('Error attempting to enable fullscreen:', err);
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    };
  
    if (type === 'video') {
      return (
        <div className="relative max-w-4xl max-h-[80vh] mx-auto">
          <video
            ref={videoRef}
            controls
            className="w-full h-full"
            autoPlay
          >
            <source src={url} />
            Your browser does not support the video tag.
          </video>
          <button
            onClick={toggleFullScreen}
            className="absolute top-4 left-4 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
          >
            <Maximize className="w-6 h-6 text-white" />
          </button>
        </div>
      );
    }
    
    return (
      <img
        src={url}
        alt="Attachment"
        className="max-w-full max-h-[80vh] object-contain"
      />
    );
  };
  
  const renderAttachments = () => {
    if (!selectedReport || !images || !images[selectedReport.id]) {
      return (
        <p className="text-sm text-gray-500 italic text-center p-4">
          No attachments available
        </p>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-4">
        {images[selectedReport.id].map((url, index) => (
          <MediaThumbnail
            key={index}
            url={url}
            type={mediaType[`${selectedReport.id}-${selectedReport.attachments[index]}`]}
            onClick={() => {
              setSelectedImage(url);
              setImageIndex(index);
            }}
          />
        ))}
      </div>
    );
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const storedUser = JSON.parse(sessionStorage.getItem("user"));
      if (!storedUser || !storedUser.id) {
        throw new Error("User not logged in or student ID missing.");
      }
      const response = await fetch(
        `https://theezfixapi.onrender.com/api/v1/reports/my-reports?studentId=${storedUser.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch reports. Please try again.");
      }
      const data = await response.json();

      setReports(data);
      setFilteredReports(data); 
    } catch (error) {
      console.error("Error fetching reports:", error);
      setError(error.message || "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  const navigateImage = (direction) => {
    if (!selectedReport || !images || !images[selectedReport.id]) return;
  
    const currentImages = images[selectedReport.id];
    const newIndex = direction === 'next' 
      ? (imageIndex + 1) % currentImages.length
      : (imageIndex - 1 + currentImages.length) % currentImages.length;
  
    setSelectedImage(currentImages[newIndex]);
    setImageIndex(newIndex);
  };

  const filterReports = (status) => {
    if (status === activeFilter) {
      setActiveFilter(null);
      setFilteredReports(reports);
    } else {
      setActiveFilter(status);
      const filtered = reports.filter(report => report.status.toLowerCase() === status.toLowerCase());
      setFilteredReports(filtered);
    }
  };

  const deleteReport = async (reportId) => {
    try {
      setLoading(true);
      const storedUser = JSON.parse(sessionStorage.getItem("user"));
      const response = await fetch(
        `https://theezfixapi.onrender.com/api/v1/reports/${reportId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${storedUser.token}`
          },
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to delete report. Please try again.");
      }
  
      // Update both reports and filteredReports states
      const updatedReports = reports.filter(report => report.id !== reportId);
      setReports(updatedReports);
      
      // If a filter is active, update filteredReports accordingly
      if (activeFilter) {
        const updatedFilteredReports = updatedReports.filter(report => 
          report.status === activeFilter
        );
        setFilteredReports(updatedFilteredReports);
      } else {
        setFilteredReports(updatedReports);
      }
  
      setConfirmDelete(null);
    } catch (error) {
      console.error("Error deleting report:", error);
      setError(error.message || "Failed to delete report.");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      "Electrical": "bg-red-100 text-red-800",
      "Civil": "bg-orange-100 text-orange-800",
      "Piping": "bg-blue-100 text-blue-800",
      "Pest Control": "bg-green-100 text-green-800",
      "Sanitary": "bg-purple-100 text-purple-800",
      "Others": "bg-gray-100 text-gray-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status) => {
    const colors = {
      "Pending": "bg-gray-100 text-gray-800",
      "Rejected": "bg-red-100 text-red-800",
      "On Going": "bg-orange-100 text-orange-800",
      "Fixed": "bg-green-100 text-green-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  // Function to check if there are notifications
  const hasNotifications = (report) => {
    const hasNewComment = report.comment && report.comment !== lastViewedComments[report.id];
    const hasStatusChange = report.status !== lastViewedStatus[report.id];
    return hasNewComment || hasStatusChange;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-12 mb-8">
        <Card>
          <CardBody className="text-center text-red-500">{error}</CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Reports</h1>
        <p className="text-gray-600 mt-2">Track and manage your maintenance reports</p>
      </div>

      {/* Status Filter Buttons */}
      <div className="flex justify-start space-x-2 mb-6">
        {statusOptions.map((status) => (
          <button
            key={status}
            onClick={() => filterReports(status)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
              ${activeFilter === status 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
            `}
          >
            {capitalizeFirstLetter(status)}
          </button>
        ))}
        {activeFilter && (
          <button
            onClick={() => {
              setActiveFilter(null);
              setFilteredReports(reports);
            }}
            className="px-4 py-2 bg-red-200 text-red-700 rounded-full text-sm font-medium hover:bg-red-300"
          >
            Clear Filter
          </button>
        )}
      </div>

      {filteredReports.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="max-w-sm mx-auto">
            <h3 className="text-xl font-semibold text-gray-700">No Reports</h3>
            <p className="text-gray-500 mt-2">You haven't submitted any reports or no reports match the current filter.</p>
          </div>
        </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report) => (
              <Card key={report.id} className="hover:shadow-lg transition-shadow duration-300">
                {/* Notification Badge */}
                {hasNotifications(report) && (
                  <div className="absolute top-2 right-2 z-10">
                    <div className="relative">
                      <BellIcon className="h-6 w-6 text-blue-500" />
                      <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
                    </div>
                  </div>
                )}
                <CardBody className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        {report.title}
                      </h3>
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        <span className="text-sm">{report.location}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        <span className="text-sm">{formatDate(report.createdAt)}</span>
                      </div>
                    </div>
            
                    <div className="flex items-center">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full mr-2"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      {report.status.toLowerCase() === "pending" && (
                        <button
                          onClick={() => setConfirmDelete(report)}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-full"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                    
                  <div className="space-y-2">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(report.category)}`}
                    >
                      {report.category}
                    </span>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ml-2 ${getStatusColor(report.status)}`}
                    >
                      {capitalizeFirstLetter(report.status)}
                    </span>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

    {selectedReport && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="bg-gray-800 text-white p-6">
            <h3 className="text-xl font-semibold">Report Details</h3>
          </CardHeader>
          <CardBody className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Description</label>
              <p className="text-gray-800">{selectedReport.description || "No description provided."}</p>
            </div>

            {console.log('Selected Report:', selectedReport)}
            {selectedReport.comment && selectedReport.comment.trim() && (
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <MessageSquareIcon className="h-5 w-5 mr-2 text-gray-600" />
                <label className="text-sm font-medium text-gray-600">Admin Comment</label>
              </div>
              <p className="text-gray-800 italic">{selectedReport.comment}</p>
            </div>
            )}

            <div>
                <p className="text-sm text-gray-500 mb-2">Attachments</p>
                {loadingImages ? (
                  <div className="flex justify-center p-4">
                    <Spinner className="h-6 w-6" />
                  </div>
              ) : images && images[selectedReport.id] && images[selectedReport.id].length > 0 ? (
                renderAttachments()
              ) : (
                <p className="text-sm text-gray-500 italic text-center p-4">
                  No attachments available
                </p>
              )}
              </div>
            <button
              onClick={() => setSelectedReport(null)}
              className="w-full mt-6 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              Close
            </button>
          </CardBody>
        </Card>
      </div>
    )}
    
    {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-90 p-4"
        >
          <div className="relative max-w-full max-h-full flex items-center">
            {/* Previous Image Button */}
            {selectedReport.attachments.length > 1 && (
              <button 
                onClick={() => navigateImage('prev')}
                className="absolute left-0 z-10 bg-white/20 hover:bg-white/40 rounded-full p-2 m-2"
              >
                <ChevronLeftIcon className="text-white w-8 h-8" />
              </button>
            )}

            {/* Close Button */}
            <button 
              onClick={() => {
                setSelectedImage(null);
                setImageIndex(0);
              }}
              className="absolute top-0 right-0 z-10 bg-white/50 hover:bg-white/70 rounded-full p-3 m-4 shadow-lg"
            >
              <XIcon className="text-black w-6 h-6 stroke-2" />
            </button>

            <MediaViewer
              url={selectedImage}
              type={mediaType[`${selectedReport.id}-${selectedReport.attachments[imageIndex]}`]}
              onClose={() => {
                setSelectedImage(null);
                setImageIndex(0);
              }}
            />

            {/* Next Image Button */}
            {selectedReport.attachments.length > 1 && (
              <button 
                onClick={() => navigateImage('next')}
                className="absolute right-0 z-10 bg-white/20 hover:bg-white/40 rounded-full p-2 m-2"
              >
                <ChevronRightIcon className="text-white w-8 h-8" />
              </button>
            )}

            {/* Image Counter */}
            {selectedReport.attachments.length > 1 && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full mb-4">
                {`${imageIndex + 1} / ${selectedReport.attachments.length}`}
              </div>
            )}
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="bg-gray-800 text-white p-6">
              <h3 className="text-xl font-semibold">Confirm Delete</h3>
            </CardHeader>
            <CardBody className="p-6 space-y-4">
              <p className="text-gray-800">
                Are you sure you want to delete this report? 
                This action cannot be undone.
              </p>
              <div className="flex justify-between space-x-4">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteReport(confirmDelete.id)}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Delete
                </button>
              </div>
            </CardBody>
          </Card>
        </div>  
      )}
    </div>
  );
};

export default Report;