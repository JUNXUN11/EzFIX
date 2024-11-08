import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
} from "@heroicons/react/24/solid";

import { Home, Profile, Report, AdminReport, Notifications} from "@/pages/dashboard";
import CreateReport from "@/pages/dashboard/CreateReport";
import { SignIn, SignUp } from "@/pages/auth";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "dashboard",
        path: "/home",
        element: <Home />,
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "Report",
        path: "/report",
        element: <Report />,
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "Admin Report",
        path: "/report-admin",
        element: <AdminReport />,
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "notifications",
        path: "/notifications",
        element: <Notifications />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "Create Report",
        path: "/CreateReport",
        element: <CreateReport />,
      },
    ],
  },
  {
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        icon: <UserCircleIcon {...icon} />,
        name: "profile",
        path: "/profile",
        element: <Profile />,
      },
    ],
  },
];

export default routes;
