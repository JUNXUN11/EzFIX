import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Spinner,
} from "@material-tailwind/react";
import { EyeIcon, CalendarIcon, MapPinIcon } from "lucide-react";

const Report = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

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
    } catch (error) {
      console.error("Error fetching reports:", error);
      setError(error.message || "Failed to load reports.");
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
      "Pending": "bg-yellow-100 text-yellow-800",
      "In progress": "bg-blue-100 text-blue-800",
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

      {reports.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="max-w-sm mx-auto">
            <h3 className="text-xl font-semibold text-gray-700">No Reports Yet</h3>
            <p className="text-gray-500 mt-2">You haven't submitted any reports yet.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
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
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
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
              <label className="text-sm font-medium text-gray-500">Attachment</label>
              {selectedReport.attachment ? (
                <img
                  src={selectedReport.attachment}
                  alt="Attachment"
                  className="w-full h-auto rounded-lg mt-2"
                />
              ) : (
                <p className="text-gray-800">No attachment available.</p>
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
    )};
    </div>
  );
};

export default Report;