import React from "react";
import {
  Typography,
} from "@material-tailwind/react";
import {
  EllipsisVerticalIcon,
  ArrowUpIcon,
} from "@heroicons/react/24/outline";
import { StatisticsCard } from "@/widgets/cards";
import { StatisticsChart } from "@/widgets/charts";
import {
  statisticsCardsData,
  statisticsChartsData,
} from "@/data";
import { CheckCircleIcon, ClockIcon } from "@heroicons/react/24/solid";
import statisticsCategoriesData from "@/data/statistics-categories-data";

export function Home() {
  return (
    <div className="mt-12">
      
      {/* First Section */}
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Report Overview</h2>
      <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-3 xl:grid-cols-3">
        {statisticsCardsData.map(({ icon, title, footer, ...rest }) => (
          <StatisticsCard
            key={title}
            {...rest}
            title={title}
            icon={React.createElement(icon, {
              className: "w-6 h-6 text-white",
            })}
            footer={
              <Typography className="font-normal text-blue-gray-600">
                <strong className={footer.color}>{footer.value}</strong>
                &nbsp;{footer.label}
              </Typography>
            }
          />
        ))}
      </div>
      
      
      {/* Second Section */}
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Report Categories</h2>
      <div className="mb-12 grid gap-y-4 gap-x-4 grid-cols-1">
        {statisticsCategoriesData.map(({ color, icon, title, value}, index) => (
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
      
      {/* Third Section */}
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Statistics</h2>
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
                <ClockIcon strokeWidth={2} className="h-4 w-4 text-blue-gray-400" />
                &nbsp;{props.footer}
              </Typography>
            }
          />
        ))}
      </div>
      
    </div>
  );
}

export default Home;
