import React, { useState } from 'react';
import { Card, CardHeader, CardBody, Input, Textarea, Button, Typography, Select, Option } from "@material-tailwind/react";
import axios from 'axios';

const CreateReport = () => {
  const [report, setReport] = useState({
    studentId: '',          // Changed from 'name' to 'studentId'
    location: '',            // Changed from 'blockNumber' to 'location'
    roomNo: '',              // Changed from 'roomNumber' to 'roomNo'
    category: '',
    description: ''
  });

  const [showAlert, setShowAlert] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  const API_URL = 'https://theezfixapi.onrender.com/api/v1/reports';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReport(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelect = (value) => {
    setReport(prev => ({
      ...prev,
      category: value
    }));
  };

  const showAlertMessage = (message, type = 'success') => {
    setShowAlert({
      show: true,
      message,
      type
    });
    setTimeout(() => {
      setShowAlert({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(API_URL, report);
      console.log('Response:', response);
      showAlertMessage('Report created successfully!');
      setReport({
        studentId: '',
        location: '',
        roomNo: '',
        category: '',
        description: ''
      });
    } catch (error) {
      console.error('Error creating report:', error);
      showAlertMessage(
        'Error creating report. Please ensure the server is running.',
        'error'
      );
    }
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12 relative">
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
              <svg aria-hidden="true" className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            ) : (
              <svg aria-hidden="true" className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
            )}
            <p>{showAlert.message}</p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Create A Report
          </Typography>
        </CardHeader>
        <CardBody className="px-6 pt-0 pb-2">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="mb-4">
              <label htmlFor="studentId" className="sr-only">Student ID</label>
              <Input
                id="studentId"
                type="text"
                name="studentId"
                label="Student ID"
                value={report.studentId}
                onChange={handleChange}
                required
                aria-label="Student ID"
              />
            </div>
            <div className="flex gap-4">
              <div className="mb-4 w-1/2">
                <label htmlFor="location" className="sr-only">Location</label>
                <Input
                  id="location"
                  type="text"
                  name="location"
                  label="Block Number"
                  value={report.location}
                  onChange={handleChange}
                  required
                  aria-label="Location"
                />
              </div>
              <div className="mb-4 w-1/2">
                <label htmlFor="roomNo" className="sr-only">Room Number</label>
                <Input
                  id="roomNo"
                  type="text"
                  name="roomNo"
                  label="Room Number"
                  value={report.roomNo}
                  onChange={handleChange}
                  required
                  aria-label="Room Number"
                />
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="category" className="sr-only">Category</label>
              <Select 
                id="category"
                name="category" 
                label="Category" 
                value={report.category} 
                onChange={handleSelect}
                required
                aria-label="Category"
              >
                <Option value="">Select a Category</Option>
                <Option value="electrical-damage">Electrical Damage</Option>
                <Option value="civil-damage">Civil Damage</Option>
                <Option value="piping">Piping</Option>
                <Option value="pest-control">Pest Control</Option>
                <Option value="sanitary">Sanitary</Option>
                <Option value="others">Others</Option>
              </Select>
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="sr-only">Description</label>
              <Textarea
                id="description"
                name="description"
                label="Description"
                value={report.description}
                onChange={handleChange}
                required
                aria-label="Description"
              />
            </div>
            <Button
              className="mt-4"
              type="submit"
              variant="gradient"
              color="black"
              fullWidth
              aria-label="Submit Report"
            >
              Submit Report
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default CreateReport;
