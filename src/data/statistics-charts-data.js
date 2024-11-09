import { chartsConfig } from "@/configs";

const weeklyReportSubmissionsChart = {
  type: "bar",
  height: 220,
  series: [
    {
      name: "Reports Submitted",
      data: [30, 45, 20, 50, 60, 40, 70],
    },
  ],
  options: {
    ...chartsConfig,
    colors: "#A020F0",
    plotOptions: {
      bar: {
        columnWidth: "16%",
        borderRadius: 5,
      },
    },
    xaxis: {
      ...chartsConfig.xaxis,
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
  },
};

const weeklyResolutionTrendChart = {
  type: "line",
  height: 220,
  series: [
    {
      name: "Issues Resolved",
      data: [10, 20, 35, 50, 40, 60, 80],
    },
  ],
  options: {
    ...chartsConfig,
    colors: ["#0288d1"],
    stroke: {
      lineCap: "round",
    },
    markers: {
      size: 5,
    },
    xaxis: {
      ...chartsConfig.xaxis,
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
  },
};

export const statisticsChartsData = [
  {
    color: "white",
    title: "Weekly Report Submissions",
    description: "Submission trends over the week",
    footer: "updated 2 days ago",
    chart: weeklyReportSubmissionsChart,
  },
  {
    color: "white",
    title: "Weekly Resolution Trend",
    description: "Issues resolved over the week",
    footer: "updated 4 min ago",
    chart: weeklyResolutionTrendChart,
  },
];

export default statisticsChartsData;
