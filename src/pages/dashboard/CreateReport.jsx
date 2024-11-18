import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Textarea,
  Button,
  Typography,
  Select,
  Option,
} from '@material-tailwind/react';
import axios from 'axios';

const CreateReport = () => {
  const [report, setReport] = useState({
    studentId: '',
    title: '',
    location: '',
    roomNo: '',
    category: '',
    description: '',
    attachments: null,
  });

  const [showAlert, setShowAlert] = useState({
    show: false,
    message: '',
    type: 'success',
  });
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = 'https://theezfixapi.onrender.com/api/v1/reports';

  useEffect(() => {
    const storedStudent = JSON.parse(sessionStorage.getItem('user'));
    if (storedStudent) {
      setReport((prev) => ({
        ...prev,
        studentId: storedStudent.id,
      }));
    } else {
      console.error('No student ID found in sessionStorage.');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReport((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelect = (value) => {
    setReport((prev) => ({
      ...prev,
      category: value,
    }));
  };

  const showAlertMessage = (message, type = 'success') => {
    setShowAlert({
      show: true,
      message,
      type,
    });
    setTimeout(() => {
      setShowAlert({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const dataToSend = {
      ...report,
      roomNo: parseInt(report.roomNo, 10),
      status: 'Pending',
      assignedTo: null,
      reportedBy: null,
      technicianNo: null,
      isDuplicate: false,
      duplicateOf: null,
      attachments: report.attachments || null,
    };

    try {
      const response = await axios.post(API_URL, dataToSend, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      showAlertMessage('Report created successfully!');
      setReport({
        studentId: report.studentId,
        title: '',
        location: '',
        roomNo: '',
        category: '',
        description: '',
        attachments: null,
      });
    } catch (error) {
      console.error('Error creating report:', error);
      showAlertMessage(
        `Error creating report: ${error.response?.data?.message || 'Unknown error'}`,
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-gray-50 to-gray-100">
      {showAlert.show && (
        <div
          role="alert"
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            showAlert.type === 'success'
              ? 'bg-green-100 border border-green-400 text-green-700'
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}
        >
          <div className="flex items-center">
            {showAlert.type === 'success' ? (
              <svg
                aria-hidden="true"
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                aria-hidden="true"
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <p>{showAlert.message}</p>
          </div>
        </div>
      )}

      <Card className="w-full max-w-4xl shadow-lg">
        <CardHeader
          variant="gradient"
          color="gray"
          className="p-6 text-center"
        >
          <Typography
            variant="h5"
            color="white" className="text-center"
          >
            Create a New Report
          </Typography>
        </CardHeader>
        <CardBody className="px-8 pb-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <Input
              id="title"
              type="text"
              name="title"
              label="Title"
              value={report.title}
              onChange={handleChange}
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="location"
                type="text"
                name="location"
                label="Location (e.g., Building A)"
                value={report.location}
                onChange={handleChange}
                required
              />
              <Input
                id="roomNo"
                type="number"
                name="roomNo"
                label="Room Number"
                value={report.roomNo}
                onChange={handleChange}
                required
              />
            </div>
            <Select
              id="category"
              name="category"
              label="Category"
              value={report.category}
              onChange={handleSelect}
              required
            >
              <Option value="">Select a Category</Option>
              <Option value="Electrical">Electrical</Option>
              <Option value="Pest Control">Pest Control</Option>
              <Option value="Piping">Piping</Option>
              <Option value="Sanitary">Sanitary</Option>
              <Option value="Civil">Plumbing</Option>
              <Option value="Furniture">Electrical</Option>
              <Option value="Other">Other</Option>
            </Select>
            <Textarea
              id="description"
              name="description"
              label="Description"
              value={report.description}
              onChange={handleChange}
              required
            />
            <Input
              id="attachments"
              type="text"
              name="attachments"
              label="Attachments"
              value={report.attachments ? report.attachments.join(', ') : ''}
              onChange={(e) =>
                setReport((prev) => ({
                  ...prev,
                  attachments: e.target.value
                    ? e.target.value.split(',').map((url) => url.trim())
                    : null,
                }))
              }
            />
            <Button
              type="submit"
              variant="gradient"
              color="black"
              fullWidth
              disabled={isLoading}
              className="relative flex items-center justify-center gap-2"
            >
              {isLoading && (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}
              {isLoading ? 'Submitting...' : 'Submit Report'}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default CreateReport;
