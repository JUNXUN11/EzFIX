import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/solid";
import { Home, Profile, Notifications } from "@/pages/dashboard";
import AdminReport from "./pages/dashboard/report-admin"
import Report from "./pages/dashboard/report";
import CreateReport from "./pages/dashboard/CreateReport";
import { SignIn, SignUp } from "@/pages/auth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import UserHome from "@/pages/dashboard/UserHome"; // Import the new UserHome component


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
        element: (
          <ProtectedRoute requiredRole="admin">
            <Home />
          </ProtectedRoute>
        ),
      },
      {
        icon: <HomeIcon {...icon} />,
        name: "Dashboard",
        path: "/User-home",
        element: (
          <ProtectedRoute>
            <UserHome />
          </ProtectedRoute>
        ),
      },     
      {
        icon: <TableCellsIcon {...icon} />,
        name: "Admin Report",
        path: "/report-admin",
        element: (
          <ProtectedRoute requiredRole="admin">
            <AdminReport />
          </ProtectedRoute>
        ),
      },
      {
        icon: <PencilSquareIcon {...icon} />,
        name: "Create Report",
        path: "/createreport",
        element: (
          <ProtectedRoute requiredRole="user">
            <CreateReport />
          </ProtectedRoute>
        ),
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "My Report",
        path: "/report",
        element: (
          <ProtectedRoute requiredRole="user">
            <Report />
          </ProtectedRoute>
        ),
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "profile",
        path: "/profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "notifications",
        path: "/notifications",
        element: (
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "sign up",
        path: "/sign-up",
        element: <SignUp />,
      },
    ],
  },
];

export default routes;
