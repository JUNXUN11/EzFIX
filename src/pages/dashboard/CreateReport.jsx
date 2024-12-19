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
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from '@material-tailwind/react';
import axios from 'axios';

const CreateReport = () => {
  const [report, setReport] = useState({
    studentId: '',
    reportedBy: '',
    title: '',
    location: '',
    roomNo: '',
    category: '',
    description: '',
    attachments: [], 
  });

  const [showAlert, setShowAlert] = useState({
    show: false,
    message: '',
    type: 'success',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [openConfrimDialog, setOpenConfirmDialog] = useState(false);

  const API_URL = 'https://theezfixapi.onrender.com/api/v1/reports';

  const refreshUserData = () => {
    const storedStudent = JSON.parse(sessionStorage.getItem('user'));
    if (storedStudent) {
      setReport(prev => ({
        ...prev,
        studentId: storedStudent.id,
        reportedBy: storedStudent.username,
      }));
    }
  };

  useEffect(() => {
    refreshUserData();
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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const updatedAttachements = [...report.attachments, ...files];
    setReport((prev) => ({
      ...prev,
      attachments: updatedAttachements,
    }));
  };

  const handleRemoveAttachment = (indexToRemove) => {
    setReport((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, index) => index !== indexToRemove),
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

  const handleSubmitConfirm = async () => {
    setOpenConfirmDialog(false);
    setIsLoading(true);

    const formData = new FormData();
    formData.append('studentId', report.studentId);
    formData.append('title', report.title);
    formData.append('location', report.location);
    formData.append('roomNo', parseInt(report.roomNo, 10));
    formData.append('category', report.category);
    formData.append('description', report.description);
    formData.append('status', 'pending');
    formData.append('assignedTo', ''); 
    formData.append('reportedBy', report.reportedBy || JSON.parse(sessionStorage.getItem('user'))?.username); 
    formData.append('technicianNo', ''); 
    formData.append('isDuplicate', false);
    formData.append('duplicateOf', ''); 

    // Append files
    if (report.attachments && report.attachments.length > 0) {
      report.attachments.forEach((file) => {
        formData.append('attachments', file);
      });
    }

    try {
      const response = await axios.post(API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
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
        attachments: [],
      });

      // Reset the file input 
      if (document.getElementById('attachments')) {
        document.getElementById('attachments').value = ''; // Clear the file input
      }
      
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setOpenConfirmDialog(true);
  }

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Dialog
        open={openConfrimDialog}
        handler={handleCloseConfirmDialog}
        size="sm"
      >
        <DialogHeader>Confirm Report Submission</DialogHeader>
        <DialogBody>
          Are you sure you want to submit this report? 
          Please review the details before confirming:
          <div className="mt-4 bg-gray-100 p-4 rounded-lg">
            <p><strong>Title:</strong> {report.title}</p>
            <p><strong>Location:</strong> {report.location}</p>
            <p><strong>Room Number:</strong> {report.roomNo}</p>
            <p><strong>Category:</strong> {report.category}</p>
            <p><strong>Description:</strong> {report.description}</p>
            {report.attachments && report.attachments.length > 0 && (
              <p>
                <strong>Attachments:</strong> {report.attachments.length} file(s)
              </p>
            )}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={handleCloseConfirmDialog}
            className="mr-2"
          >
            Cancel
          </Button>
          <Button 
            variant="gradient" 
            color="green" 
            onClick={handleSubmitConfirm}
          >
            Confirm
          </Button>
        </DialogFooter>
      </Dialog>

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
                  d="M10 18a8 8 0 100-16 8 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
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
            Create Report
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
                label="Block Number (e.g., MA1)"
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
              <Option value="Civil">Civil</Option>
              <Option value="Piping">Piping</Option>
              <Option value="Pest Control">Pest Control</Option>
              <Option value="Sanitary">Sanitary</Option>
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
            <div>
              <label
                htmlFor="attachments"
                className="block text-sm font-medium text-gray-700"
              >
                Attachments (Optional)
              </label>
              <input
                type="file"
                id="attachments"
                name="attachments"
                multiple
                accept=".jpg,.jpeg,.png,.mp4,.avi,.mov"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
              />
              {report.attachments && report.attachments.length > 0 && (
                <div className="mt-2">
                  <Typography variant="small" color="gray" className="font-normal">
                    Selected Files:
                  </Typography>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {report.attachments.map((file, index) => (
                      <li key={index} className="flex items-center justify-between">
                        <span>{file.name}</span>
                        <Button
                          variant="text"
                          color="red"
                          size="sm"
                          onClick={() => handleRemoveAttachment(index)}
                        >
                          Remove
                        </Button>
                    </li>
                   ))}
                  </ul>                             
                </div>
              )}
            </div>
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