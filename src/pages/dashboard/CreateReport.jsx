import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Input, Textarea, Button, Typography, Select, Option, Alert, AlertDescription, AlertTitle } from "@material-tailwind/react";
import fs from 'fs';
import path from 'path';

const CreateReport = () => {
  const [reports, setReports] = useState([]);
  const [report, setReport] = useState({
    name: '',
    blockNumber: '',
    roomNumber: '',
    category: '',
    description: ''
  });
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      const loadedReports = await readReportsFromJson();
      setReports(loadedReports);
    };
    fetchReports();
  }, []);

  const readReportsFromJson = async () => {
    const filePath = path.join(__dirname, '..', 'reports.json');

    try {
      const data = await fs.promises.readFile(filePath, 'utf8');
      return JSON.parse(data).reports || [];
    } catch (error) {
      console.error('Error reading reports:', error);
      return [];
    }
  };

  const saveReportsToJson = async (reports) => {
    const filePath = path.join(__dirname, '..', 'reports.json');

    try {
      await fs.promises.writeFile(filePath, JSON.stringify({ reports }, null, 2));
    } catch (error) {
      console.error('Error saving reports:', error);
      throw new Error('Failed to save reports');
    }
  };

  const handleChange = (e) => {
    setReport({
      ...report,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedReports = [...reports, report];
    setReports(updatedReports);

    try {
      await saveReportsToJson(updatedReports);
      setReport({ name: '', blockNumber: '', roomNumber: '', category: '', description: '' });
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000); // Hide the alert after 3 seconds
    } catch (error) {
      console.error('Error saving reports:', error);
    }
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Create A Report
          </Typography>
        </CardHeader>
        <CardBody className="px-6 pt-0 pb-2">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="mb-4">
              <Input
                type="text"
                name="name"
                label="Name"
                value={report.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex gap-4">
              <div className="mb-4 w-1/2">
                <Input
                  type="text"
                  name="blockNumber"
                  label="Block Number"
                  value={report.blockNumber}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-4 w-1/2">
                <Input
                  type="text"
                  name="roomNumber"
                  label="Room Number"
                  value={report.roomNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="mb-4">
              <Select name="category" label="Category" value={report.category} onChange={handleChange} required>
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
              <Textarea
                name="description"
                label="Description"
                value={report.description}
                onChange={handleChange}
                required
              />
            </div>
            <Button
              className="mt-4"
              type="submit"
              variant="gradient"
              color="blue"
              fullWidth
            >
              Submit 
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default CreateReport;