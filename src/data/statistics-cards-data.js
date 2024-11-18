import { useState, useEffect } from "react";
import {
  ClipboardDocumentListIcon,
  CheckIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/solid";

// API endpoint
const apiEndpoint = "https://theezfixapi.onrender.com/api/v1/reports";

export function useStatisticsCardsData() {
  const [cardsData, setCardsData] = useState([
    {
      color: "orange",
      icon: ClipboardDocumentListIcon,
      title: "New Report",
      value: "0",
    },
    {
      color: "green",
      icon: CheckIcon,
      title: "Resolved Issues",
      value: "0",
    },
    {
      color: "red",
      icon: ExclamationCircleIcon,
      title: "Pending Reports",
      value: "0",
    },
  ]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(apiEndpoint);
        const data = await response.json();

        // Calculating values
        const newReports = data.filter((report) => report.status === "Pending").length;
        const resolvedReports = data.filter((report) => report.status === "Resolved").length;
        const pendingReports = data.filter((report) => report.status === "In Progress").length;

        setCardsData([
          {
            color: "orange",
            icon: ClipboardDocumentListIcon,
            title: "New Report",
            value: newReports.toString(),
          },
          {
            color: "green",
            icon: CheckIcon,
            title: "Resolved Issues",
            value: resolvedReports.toString(),
          },
          {
            color: "red",
            icon: ExclamationCircleIcon,
            title: "Pending Reports",
            value: pendingReports.toString(),
          },
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

  return cardsData;
}

export default useStatisticsCardsData;
