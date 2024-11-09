import {
  ClipboardDocumentListIcon,
  CheckIcon,
  ExclamationCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/solid";

export const statisticsCardsData = [
  {
    color: "orange",
    icon: ClipboardDocumentListIcon,
    title: "New Report",
    value: "10",
    footer: {
      color: "text-green-500",
      value: "+55%",
      label: "than last week",
    },
  },
  {
    color: "green",
    icon: CheckIcon,
    title: "Resolved Issues",
    value: "50",
    footer: {
      color: "text-green-500",
      value: "+3%",
      label: "than last month",
    },
  },
  {
    color: "red",
    icon: ExclamationCircleIcon,
    title: "Pending Reports",
    value: "30",
    footer: {
      color: "text-red-500",
      value: "-2%",
      label: "than yesterday",
    },
  },
];

export default statisticsCardsData;
