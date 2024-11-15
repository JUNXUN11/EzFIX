// UserHome.js
import React from "react";
import { Typography } from "@material-tailwind/react";
import { StatisticsCard } from "@/widgets/cards";
import { StatisticsChart } from "@/widgets/charts";
import {
  useStatisticsCardsData,
  useStatisticsChartsData,
} from "@/data";
import { ClockIcon } from "@heroicons/react/24/solid";
import { useStatisticsCategoriesData } from "@/data/statistics-categories-data";
import announcementsData from "@/data/announcementdata";

export function UserHome() {
  const statisticsChartsData = useStatisticsChartsData();
  const statisticsCardsData = useStatisticsCardsData();
  const categoriesData = useStatisticsCategoriesData();

  return (
    <div className="mt-12 space-y-12">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Announcements</h2>
        <div className="space-y-4">
          {announcementsData.map((announcement, index) => (
            <div
              key={index}
              className="p-4 bg-blue-50 border-l-4 border-blue-500 shadow-md rounded-md"
            >
              <Typography variant="h6" className="font-semibold text-blue-700">
                {announcement.title}
              </Typography>
              <Typography variant="small" className="text-gray-500">
                {announcement.date}
              </Typography>
              <Typography className="text-gray-800 mt-2">
                {announcement.description}
              </Typography>
            </div>
          ))}
        </div>
      </div>
      <h2 className="text-2xl font-bold text-gray-800">Report Overview</h2>
      <div className="mb-6 grid gap-y-6 gap-x-6 md:grid-cols-3 xl:grid-cols-3">
        {statisticsCardsData.map(({ icon, title, ...rest }) => (
          <StatisticsCard
            key={title}
            {...rest}
            title={title}
            icon={React.createElement(icon, {
              className: "w-6 h-6 text-white",
            })}
          />
        ))}
      </div>
      <h2 className="text-2xl font-bold text-gray-800">Report Categories</h2>
      <div className="mb-6 grid gap-y-4 gap-x-4 grid-cols-1">
        {categoriesData.map(({ color, icon, title, value }, index) => (
          <StatisticsCard
            key={index}
            color={color}
            icon={React.createElement(icon, {
              className: "w-6 h-6 text-white",
            })}
            title={title}
            value={value}
          />
        ))}
      </div>
      <h2 className="text-2xl font-bold text-gray-800">Statistics</h2>
      <div className="mb-6 grid grid-cols-1 gap-y-12 gap-x-6 md:grid-cols-2 xl:grid-cols-2">
        {statisticsChartsData.map((props) => (
          <StatisticsChart
            key={props.title}
            {...props}
            footer={
              <Typography
                variant="small"
                className="flex items-center font-normal text-blue-gray-600"
              >
                <ClockIcon
                  strokeWidth={2}
                  className="h-4 w-4 text-blue-gray-400"
                />
                &nbsp;{props.footer}
              </Typography>
            }
          />
        ))}
      </div>
    </div>
  );
}

export default UserHome;
