import React from "react";
import { StatisticsChart } from "@/widgets/charts";
import { useStatisticsCardsData, useStatisticsChartsData } from "@/data";
import { useStatisticsCategoriesData } from "@/data/statistics-categories-data";
import useReportTrends from "@/data/report-trends";
import { Pie } from 'react-chartjs-2';  // Import Pie chart component from react-chartjs-2
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js'; // Required to register the necessary chart components

// Register the necessary chart components
ChartJS.register(Title, Tooltip, Legend, ArcElement);

export function Home() {
  const statisticsChartsData = useStatisticsChartsData();
  const statisticsCardsData = useStatisticsCardsData();
  const categoriesData = useStatisticsCategoriesData();
  const { pieChartData } = useReportTrends();

  return (
    <div className="mt-12 grid gap-6 grid-cols-1 lg:grid-cols-2 w-full">
      
      {/* Report Overview Section */}
      <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Report Overview</h2>
        <div className="grid gap-1.5">
          {statisticsCardsData.map(({ color, icon, title, value }) => (
            <div className="flex items-center p-4 rounded-lg shadow hover:bg-gray-100">
              <div className={`p-3 rounded-full bg-${color}-500 text-white`}>
                {React.createElement(icon, { className: "w-6 h-6" })}
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-700">{title}</h3>
                <p className="text-lg font-semibold text-gray-900">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Report Categories Section */}
      <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Report Categories</h2>
        <div className="grid grid-cols-2 gap-8">
          {categoriesData.map(({ color, icon, title, value }) => (
            <div className="flex items-center p-4 rounded-lg shadow hover:bg-gray-100">
              <div className={`p-4 rounded-full bg-${color}-500 text-white`}>
                {React.createElement(icon, { className: "w-6 h-6" })}
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-700">{title}</h3>
                <p className="text-lg font-semibold text-gray-900">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 bg-white shadow-lg rounded-lg lg:col-span-2">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Report Trends</h2>
        <div className="flex items-center justify-between w-full h-48">
          {/* Pie Chart */}
          <div className="w-2/3 h-full">
            <Pie
              data={pieChartData}
              options={{
                plugins: {
                  legend: {
                    position: "right",
                    labels: {
                      font: {
                        size: 14,
                      },
                      boxWidth: 20,
                    },
                  },
                },
                maintainAspectRatio: false, // Flexible layout
              }}
            />
          </div>

          {/* Legend */}
          <div className="w-1/3">
          </div>
        </div>
      </div>

      {/* Statistics Section (Bottom Row, Full width for mobile and grid for desktop) */}
      <div className="p-6 bg-white rounded-lg shadow-lg col-span-1 lg:col-span-2">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Statistics</h2>
        <div className="grid gap-y-6 grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 w-full">
          {statisticsChartsData.map((props) => (
            <div className="w-full max-w-full">
              <StatisticsChart key={props.title} {...props} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
