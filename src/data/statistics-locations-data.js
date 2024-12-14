import { useEffect, useState } from "react";
import { chartsConfig } from "@/configs";

// API endpoint
const apiEndpoint = "https://theezfixapi.onrender.com/api/v1/reports";

// Hook for fetching and formatting pie chart data
export function useLocationDistributionChart() {
  const [locationDistributionChart, setLocationDistributionChart] = useState({
    type: "pie",
    height: 220,
    series: [],
    options: {
      ...chartsConfig,
      labels: [], // Location labels
      colors: ["#F8B88B", "#AED9F5", "#B9E4C9", "#F7AFAE", "#D3B3E5"],
      legend: { position: "bottom" },
    },
    
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(apiEndpoint);
        const data = await response.json();

        // Aggregate data by location
        const locationCounts = {};
        data.forEach((report) => {
          locationCounts[report.location] = (locationCounts[report.location] || 0) + 1;
        });

        // Update the pie chart state
        setLocationDistributionChart((prevChart) => ({
          ...prevChart,
          series: Object.values(locationCounts),
          options: { ...prevChart.options, labels: Object.keys(locationCounts) },
        }));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

  return locationDistributionChart;
}
