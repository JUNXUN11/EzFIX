import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Chip,
  Spinner,
  Tooltip,
  IconButton,
} from "@material-tailwind/react";
import { EyeIcon } from "@heroicons/react/24/solid";

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
      "Electrical Damage": "red",
      "Civil Damage": "orange",
      "Piping": "blue",
      "Pest Control": "green",
      "Sanitary": "purple",
      "Others": "gray",
    };
    return colors[category] || "gray";
  };

  const getStatusColor = (status) => {
    const colors = {
      "pending": "yellow",
      "in progress": "blue",
      "completed": "green",
      "rejected": "red",
    };
    return colors[status.toLowerCase()] || "gray";
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
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader
          variant="gradient"
          color="gray"
          className="mb-8 p-6 flex justify-between items-center"
        >
          <Typography variant="h6" color="white">
            My Reports
          </Typography>*+
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          {reports.length === 0 ? (
            <div className="flex justify-center items-center p-6">
              <Typography variant="h6" color="blue-gray">
                No reports submitted yet
              </Typography>
            </div>
          ) : (
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {[
                    "Date",
                    "Title",
                    "Location",
                    "Category",
                    "Status",
                    "Actions",
                  ].map((header) => (
                    <th
                      key={header}
                      className="border-b border-blue-gray-50 py-3 px-6 text-left"
                    >
                      <Typography
                        variant="small"
                        className="text-[11px] font-medium uppercase text-blue-gray-400"
                      >
                        {header}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.map(
                  (
                    {
                      id,
                      title,
                      location,
                      category,
                      status,
                      createdAt,
                    },
                    index
                  ) => {
                    const isLast = index === reports.length - 1;
                    const classes = isLast
                      ? "p-4"
                      : "p-4 border-b border-blue-gray-50";

                    return (
                      <tr key={id}>
                        <td className={classes}>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {formatDate(createdAt)}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {title}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {location}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Chip
                            variant="gradient"
                            color={getCategoryColor(category)}
                            value={category}
                            className="py-0.5 px-2 text-[11px] font-medium"
                          />
                        </td>
                        <td className={classes}>
                          <Chip
                            variant="gradient"
                            color={getStatusColor(status)}
                            value={status}
                            className="py-0.5 px-2 text-[11px] font-medium capitalize"
                          />
                        </td>
                        <td className={classes}>
                          <Tooltip content="View Details">
                            <IconButton
                              variant="text"
                              color="blue-gray"
                              onClick={() => setSelectedReport(reports[index])}
                            >
                              <EyeIcon className="h-4 w-4" />
                            </IconButton>
                          </Tooltip>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>

    {selectedReport && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <Card className="w-[24rem]">
      <CardHeader
        variant="gradient"
        color="gray"
        className="p-4 flex items-center justify-between"
      >
        <Typography variant="h6" color="white">
          Report Details
        </Typography>
      </CardHeader>
      <CardBody className="flex flex-col gap-4 px-6 py-4">
        <div className="flex flex-col">
          <Typography
            variant="small"
            color="gray"
            className="font-medium text-sm"
          >
            Title
          </Typography>
          <Typography className="text-md text-blue-gray-700 font-semibold">
            {selectedReport.title}
          </Typography>
        </div>
        <div className="flex flex-col">
          <Typography
            variant="small"
            color="gray"
            className="font-medium text-sm"
          >
            Location
          </Typography>
          <Typography className="text-md text-blue-gray-700 font-semibold">
            {selectedReport.location}
          </Typography>
        </div>
        <div className="flex flex-col">
          <Typography
            variant="small"
            color="gray"
            className="font-medium text-sm"
          >
            Category
          </Typography>
          <Chip
            variant="gradient"
            color={getCategoryColor(selectedReport.category)}
            value={selectedReport.category}
            className="py-1 px-2 text-sm font-medium w-fit"
          />
        </div>
        <div className="flex flex-col">
          <Typography
            variant="small"
            color="gray"
            className="font-medium text-sm"
          >
            Status
          </Typography>
          <Chip
            variant="gradient"
            color={getStatusColor(selectedReport.status)}
            value={selectedReport.status}
            className="py-1 px-2 text-sm font-medium capitalize w-fit"
          />
        </div>
        <div className="flex flex-col">
          <Typography
            variant="small"
            color="gray"
            className="font-medium text-sm"
          >
            Created At
          </Typography>
          <Typography className="text-md text-blue-gray-700 font-semibold">
            {formatDate(selectedReport.createdAt)}
          </Typography>
        </div>
        <button
          onClick={() => setSelectedReport(null)}
          className="mt-4 w-full bg-gray-500 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75"
        >
          Close
        </button>
      </CardBody>
    </Card>
  </div>
)}

    </div>
  );
};

export default Report;
