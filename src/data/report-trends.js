// report-trends.js
import { useState, useEffect } from "react";

const apiEndpoint = "https://theezfixapi.onrender.com/api/v1/reports"

export function useReportTrends() {
  const [reportsData, setReportsData] = useState([]);
  const [locationData, setLocationData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch report data from backend API
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(apiEndpoint);
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        setReportsData(data);
        aggregateLocationData(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Aggregate location data for pie chart
  const aggregateLocationData = (data) => {
    const locations = data.reduce((acc, report) => {
      const location = report.location;
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {});

    setLocationData(locations);
  };

  // Prepare data for Pie Chart
  const pieChartData = {
    labels: Object.keys(locationData),
    datasets: [
      {
        label: "Reports by Location",
        data: Object.values(locationData),
        backgroundColor: ["#FF5733", "#33FF57", "#3357FF", "#FF33A6", "#FFC300", "#C70039", "#581845"], // Colors for segments
        borderWidth: 1,
      },
    ],
  };

  return { reportsData, locationData, pieChartData, loading, error };
}

export default useReportTrends;
