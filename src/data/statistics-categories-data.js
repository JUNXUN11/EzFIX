import { useState, useEffect } from "react";
import {
  BoltIcon,
  BugAntIcon,
  WrenchIcon,
  HomeIcon,
  EllipsisHorizontalCircleIcon
} from "@heroicons/react/24/solid";

const apiEndpoint = "https://theezfixapi.onrender.com/api/v1/reports";

export function useStatisticsCategoriesData() {
  const [categoriesData, setCategoriesData] = useState([
    {
      color: "gray",
      icon: BoltIcon,
      title: "Electrical",
      value: "0",
    },
    {
      color: "gray",
      icon: BugAntIcon,
      title: "Pest Control",
      value: "0",
    },
    {
      color: "gray",
      icon: WrenchIcon,
      title: "Piping",
      value: "0",
    },
    {
      color: "gray",
      icon: HomeIcon,
      title: "Sanitary",
      value: "0",
    },
    {
      color: "gray",
      icon: EllipsisHorizontalCircleIcon,
      title: "Others",
      value: "0",
    },
  ]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(apiEndpoint);
        const data = await response.json();

        // Filter data by category and count occurrences
        const electricalCount = data.filter((report) => report.category === "Electrical Damage").length;
        const pestControlCount = data.filter((report) => report.category === "Pest Control").length;
        const pipingCount = data.filter((report) => report.category === "Piping").length;
        const sanitaryCount = data.filter((report) => report.category === "Sanitary").length;
        const otherCount = data.filter((report) => 
          !["Electrical Damage", "Pest Control", "Piping", "Sanitary"].includes(report.category)
        ).length;

        // Update the state with fetched data
        setCategoriesData([
          {
            color: "gray",
            icon: BoltIcon,
            title: "Electrical",
            value: electricalCount.toString(),
          },
          {
            color: "gray",
            icon: BugAntIcon,
            title: "Pest Control",
            value: pestControlCount.toString(),
          },
          {
            color: "gray",
            icon: WrenchIcon,
            title: "Piping",
            value: pipingCount.toString(),
          },
          {
            color: "gray",
            icon: HomeIcon,
            title: "Sanitary",
            value: sanitaryCount.toString(),
          },
          {
            color: "gray",
            icon: EllipsisHorizontalCircleIcon,
            title: "Others",
            value: otherCount.toString(),
          },
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

  return categoriesData;
}

export default useStatisticsCategoriesData;
