import { useState } from "react";
import PropTypes from "prop-types";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  Button,
  IconButton,
  Typography,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";
import { useAuth } from "@/context/AuthContext"; 

export function Sidenav({ brandImg, brandName, routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavColor, sidenavType, openSidenav } = controller;
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const sidenavTypes = {
    dark: "bg-gradient-to-br from-gray-800 to-gray-900",
    white: "bg-white shadow-sm",
    transparent: "bg-transparent",
  };

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      localStorage.clear();
      navigate("/auth/sign-in");
      return;
    }

    setIsLoggingOut(true);
    try {
      const response = await fetch("https://theezfixapi.onrender.com/api/v1/users/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${refreshToken}`
        },
      });

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      if (response.ok) {
        navigate("/auth/sign-in");
      } else {
        console.error("Logout failed on server but proceeding with local logout");
        navigate("/auth/sign-in");
      }
    } catch (error) {
      console.error("Logout failed: ", error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      navigate("/auth/sign-in");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <aside
        className={`${sidenavTypes[sidenavType]} ${
          openSidenav ? "translate-x-0" : "-translate-x-80"
        } fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-xl transition-transform duration-300 xl:translate-x-0 border border-blue-gray-100`}
      >
        <div className="relative flex flex-col h-full">
          {/* Header */}
          <div>
            <Link to="/" className="py-6 px-8 text-center">
              <Typography
                variant="h6"
                color={sidenavType === "dark" ? "white" : "blue-gray"}
              >
                {brandName}
              </Typography>
            </Link>
            <IconButton
              variant="text"
              color="white"
              size="sm"
              ripple={false}
              className="absolute right-0 top-0 grid rounded-br-none rounded-tl-none xl:hidden"
              onClick={() => setOpenSidenav(dispatch, false)}
            >
              <XMarkIcon strokeWidth={2.5} className="h-5 w-5 text-white" />
            </IconButton>
          </div>

          {/* Navigation Links */}
          <div className="m-4 flex-1 overflow-y-auto">
            {routes
              .filter((route) => route.layout !== "auth") // Filter out "auth" routes
              .map(({ layout, title, pages }, key) => (
                <ul key={key} className="mb-4 flex flex-col gap-1">
                  {title && (
                    <li className="mx-3.5 mt-4 mb-2">
                      <Typography
                        variant="small"
                        color={sidenavType === "dark" ? "white" : "blue-gray"}
                        className="font-black uppercase opacity-75"
                      >
                        {title}
                      </Typography>
                    </li>
                  )}
                {pages
                .filter(({ name }) => {
                  if (name === "Admin Report" && user?.role !== "admin") return false;
                  if (name === "Create Report" && user?.role !== "user") return false;
                  if (name === "Report" && user?.role !== "user") return false;
                  return true;
                })
                .map(({ icon, name, path }) => (
                  <li key={name}>
                    <NavLink to={`/${layout}${path}`}>
                      {({ isActive }) => (
                        <Button
                          variant={isActive ? "gradient" : "text"}
                          color={
                            isActive
                              ? sidenavColor
                              : sidenavType === "dark"
                              ? "white"
                              : "blue-gray"
                          }
                          className="flex items-center gap-4 px-4 capitalize"
                          fullWidth
                        >
                          {icon}
                          <Typography color="inherit" className="font-medium capitalize">
                            {name}
                          </Typography>
                        </Button>
                      )}
                    </NavLink>
                  </li>
                ))}
                </ul>
              ))}
          </div>
          <div className="p-4">
            <Button
              variant="gradient"
              color="red"
              fullWidth
              onClick={() => setShowLogoutDialog(true)}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>
      </aside>

      <Dialog open={showLogoutDialog} handler={() => setShowLogoutDialog(false)} animate={{ duration: 0 }}>
        <DialogHeader>Confirm Logout</DialogHeader>
        <DialogBody divider>
          Are you sure you want to log out?
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="blue-gray" onClick={() => setShowLogoutDialog(false)} className="mr-2">
            Cancel
          </Button>
          <Button variant="gradient" color="red" onClick={() => { setShowLogoutDialog(false); handleLogout(); }}>
            Yes, Logout
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}

Sidenav.defaultProps = {
  brandImg: "/img/ezfixlogo.png",
  brandName: "EzFIX",
};

Sidenav.propTypes = {
  brandImg: PropTypes.string,
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Sidenav.displayName = "/src/widgets/layout/sidenav.jsx";

export default Sidenav;
