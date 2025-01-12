import { chartsConfig } from "@/configs";
import { useEffect, useState } from "react";

// API endpoint 
const apiEndpoint = "https://theezfixapi.onrender.com/api/v1/reports";

// Chart configuration and data fetching
export function useStatisticsChartsData() {
  const [weeklyReportSubmissionsChart, setWeeklyReportSubmissionsChart] = useState({
    type: "bar",
    height: 220,
    series: [{ name: "Reports Submitted", data: [] }],
    options: {
      ...chartsConfig,
      colors: "#A020F0",
      plotOptions: { bar: { columnWidth: "16%", borderRadius: 5 } },
      xaxis: { ...chartsConfig.xaxis, categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
    },
  });

  const [weeklyResolutionTrendChart, setWeeklyResolutionTrendChart] = useState({
    type: "line",
    height: 220,
    series: [{ name: "Issues Resolved", data: [] }],
    options: {
      ...chartsConfig,
      colors: ["#0288d1"],
      stroke: { lineCap: "round" },
      markers: { size: 5 },
      xaxis: { ...chartsConfig.xaxis, categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
    },
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(apiEndpoint);
        const data = await response.json();

        // Aggregating data by day of the week
        const reportCountPerDay = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
        const resolutionTrend = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

        data.forEach((report) => {
          // For report submissions, use createdAt
          const submissionDay = new Date(report.createdAt).toLocaleDateString('en-US', {
            weekday: 'short'
          });
          reportCountPerDay[submissionDay] = (reportCountPerDay[submissionDay] || 0) + 1;
        
          // For fixed reports, use updatedAt or fixedAt timestamp
          if (report.status === "fixed") {
            const fixedDay = new Date(report.updatedAt).toLocaleDateString('en-US', {
              weekday: 'short'
            });
            resolutionTrend[fixedDay] = (resolutionTrend[fixedDay] || 0) + 1;
          }
        });

        // Update the chart data
        setWeeklyReportSubmissionsChart((prevChart) => ({
          ...prevChart,
          series: [{ ...prevChart.series[0], data: Object.values(reportCountPerDay) }],
          options: {
            ...prevChart.options,
            yaxis: {
              ...prevChart.options.yaxis,
              labels: {
                formatter: (value) => Math.floor(value),
              },
            },
          },
        }));
        

        setWeeklyResolutionTrendChart((prevChart) => ({
          ...prevChart,
          series: [{ ...prevChart.series[0], data: Object.values(resolutionTrend) }],
          options: {
            ...prevChart.options,
            yaxis: {
              ...prevChart.options.yaxis,
              labels: {
                formatter: (value) => Math.floor(value),
              },
            },
          },
        }));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

  return [
    {
      color: "white",
      title: "Weekly Report Submissions",
      description: "Submission trends over the week",
      chart: weeklyReportSubmissionsChart,
    },
    {
      color: "white",
      title: "Weekly Resolution Trend",
      description: "Issues resolved over the week",
      chart: weeklyResolutionTrendChart,
    },
  ];
}