import React, { useState, useEffect } from 'react';
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
      const response = await fetch('http://localhost:8080/api/v1/reports');
      if (!response.ok) {
        throw new Error('Server ERROR!! Failed to load reports');
      }
      const data = await response.json();
      console.log("Fetched reports:", data);
      setReports(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Failed to load reports. Please try again later.');
      setLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'electrical-damage': 'red',
      'civil-damage': 'orange',
      'piping': 'blue',
      'pest-control': 'green',
      'sanitary': 'purple',
      'others': 'gray'
    };
    return colors[category] || 'gray';
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
          <CardBody className="text-center text-red-500">
            {error}
          </CardBody>
        </Card>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="mt-12 mb-8">
        <Card>
          <CardBody className="text-center">
            <Typography variant="h6" color="gray">
              No reports submitted yet.
            </Typography>
          </CardBody>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'yellow',
      'in-progress': 'blue',
      'completed': 'green',
      'rejected': 'red'
    };
    return colors[status] || 'gray';
  };

  const formatCategory = (category) => {
    if (!category) return "Unknown Category";
    return category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
      <CardHeader variant="gradient" color="gray" className="mb-8 p-6 flex justify-between items-center">
          <Typography variant="h6" color="white">
            My Report
          </Typography>
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
                  {["Date", "Name", "Location", "Category", "Status", "Actions"].map((header) => (
                    <th key={header} className="border-b border-blue-gray-50 py-3 px-6 text-left">
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
                {reports.map(({ id, name, blockNumber, roomNumber, category, status, dateSubmitted, description }, index) => {
                  console.log("Category:", category);
                  const isLast = index === reports.length - 1;
                  const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

                  return (
                    <tr key={id}>
                      <td className={classes}>
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {dateSubmitted}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {name}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          Block {blockNumber} - {roomNumber}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Chip
                          variant="gradient"
                          color={getCategoryColor(category)}
                          value={formatCategory(category)}
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
                          <IconButton variant="text" color="blue-gray" onClick={() => setSelectedReport(reports[index])}>
                            <EyeIcon className="h-4 w-4" />
                          </IconButton>
                        </Tooltip>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>

      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Card className="w-96">
            <CardHeader variant="gradient" color="black" className="mb-4 p-6">
              <Typography variant="h6" color="white">
                Report Details
              </Typography>
            </CardHeader>
            <CardBody className="flex flex-col gap-4">
              <div>
                <Typography variant="small" color="blue-gray" className="font-medium">
                  Submitted by
                </Typography>
                <Typography>{selectedReport.name}</Typography>
              </div>
              <div>
                <Typography variant="small" color="blue-gray" className="font-medium">
                  Location
                </Typography>
                <Typography>Block {selectedReport.blockNumber} - {selectedReport.roomNumber}</Typography>
              </div>
              <div>
                <Typography variant="small" color="blue-gray" className="font-medium">
                  Category
                </Typography>
                <Chip
                  variant="gradient"
                  color={getCategoryColor(selectedReport.category)}
                  value={formatCategory(selectedReport.category)}
                  className="py-0.5 px-2 text-[11px] font-medium"
                />
              </div>
              <div>
                <Typography variant="small" color="blue-gray" className="font-medium">
                  Description
                </Typography>
                <Typography>{selectedReport.description}</Typography>
              </div>
              <div>
                <Typography variant="small" color="blue-gray" className="font-medium">
                  Status
                </Typography>
                <Chip
                  variant="gradient"
                  color={getStatusColor(selectedReport.status)}
                  value={selectedReport.status}
                  className="py-0.5 px-2 text-[11px] font-medium capitalize"
                />
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
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