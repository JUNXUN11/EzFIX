import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Spinner,
} from "@material-tailwind/react";
import { EyeIcon, CalendarIcon, MapPinIcon, TrashIcon, XIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

const Report = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [images, setImages] = useState(null);
  const [loadingImages, setLoadingImages] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);

  const statusOptions = ["Pending", "In progress", "Rejected", "Fixed"];

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    const loadImages = async () => {
      if (reports.length > 0) {
        const imagePromises = reports.map(report => 
          Promise.all(
            report.attachments.map(fileId => fetchReportImage(report.id, fileId))
          )
        );
        
        const allLoadedImages = await Promise.all(imagePromises);
        const validImages = allLoadedImages.map(reportImages => 
          reportImages.filter(img => img !== null)
        );
        
        // Create a mapping of report IDs to their images
        const reportImagesMap = reports.reduce((acc, report, index) => {
          acc[report.id] = validImages[index];
          return acc;
        }, {});
  
        setImages(reportImagesMap);
      }
    };
  
    loadImages();
  
    return () => {
      // Clean up object URLs if needed
      if (images) {
        Object.values(images).flat().forEach(url => URL.revokeObjectURL(url));
      }
    };
  }, [reports]);

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

      setReports(prevReports => prevReports.filter(report => report.id !== reportId));
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
      "In progress": "bg-orange-100 text-orange-800",
      "Fixed": "bg-green-100 text-green-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
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
            {status}
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
                      {report.status === "Pending" && (
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
                      {report.status}
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
            <div>
                <p className="text-sm text-gray-500 mb-2">Attachments</p>
                {loadingImages ? (
                  <div className="flex justify-center p-4">
                    <Spinner className="h-6 w-6" />
                  </div>
              ) : images && images[selectedReport.id] && images[selectedReport.id].length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {images[selectedReport.id].map((imageUrl, index) => (
                    <div 
                      key={index} 
                      className="relative aspect-square cursor-pointer"
                      onClick={() => {
                        setSelectedImage(imageUrl);
                        setImageIndex(index);
                      }}
                    >
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
              className="absolute top-0 right-0 z-10 bg-white/20 hover:bg-white/40 rounded-full p-2 m-2"
            >
              <XIcon className="text-white w-8 h-8" />
            </button>

            {/* Main Image */}
            <img
              src={selectedImage}
              alt={`Attachment ${imageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                e.target.src = '/path/to/fallback/image.png';
                console.error(`Failed to load full image: ${selectedImage}`);
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