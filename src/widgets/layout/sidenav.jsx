import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import { ArrowRightIcon, ArrowLeftIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  Button,
  IconButton,
  Typography,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import { useAuth } from "@/context/AuthContext";

export function Sidenav({ brandImg, brandName, routes }) {
  const [isSidenavOpen, setIsSidenavOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const { user, logout } = useAuth();
  const sidenavRef = useRef(null);
  const toggleButtonRef = useRef(null);

  const sidenavTypes = {
    dark: "bg-gradient-to-br from-gray-800 to-gray-900",
    white: "bg-white shadow-sm",
    transparent: "bg-transparent",
  };

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1280);
      if (window.innerWidth >= 1280) {
        setIsSidenavOpen(true);
      } else {
        setIsSidenavOpen(false);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!isLargeScreen && // Always check outside clicks when not on large screen
        sidenavRef.current && 
        !sidenavRef.current.contains(event.target) &&
        toggleButtonRef.current &&
        !toggleButtonRef.current.contains(event.target)
      ) {
        setIsSidenavOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isLargeScreen]);

  const handleLogout = () => {
    setIsLoggingOut(true);
    setShowLogoutDialog(false);
    logout();
    setIsLoggingOut(false);
  };

  return (
    <>
      <aside
        ref={sidenavRef}
        className={`${sidenavTypes["white"]} fixed inset-y-0 left-0 z-40 w-72 transition-transform duration-300 border-r border-blue-gray-100
          ${isLargeScreen ? "translate-x-0" : isSidenavOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="relative flex flex-col h-full">
          <div className="relative">
            <Link to="#" className="py-6 px-8 text-center">
              <div className="flex items-center gap-4 justify-center">
                <img src={brandImg} alt="Brand Logo" className="h-8" />
                <Typography variant="h6" color="blue-gray">
                  {brandName}
                </Typography>
              </div>
            </Link>
            {/* Only show toggle button when not on large screen */}
            <div 
              ref={toggleButtonRef}
              className={`absolute -right-10 top-1/5 transform -translate-y-1/2 z-50 ${isLargeScreen ? 'hidden' : ''}`}
            >
              <IconButton
                variant="text"
                color="black"
                className="h-20 w-20 rounded-r-full rounded-r-full bg-blue-100 shadow-md hover:bg-gray-100"
                onClick={() => setIsSidenavOpen(!isSidenavOpen)}
              >
                {isSidenavOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </IconButton>
            </div>
          </div>

          <div className="m-4 flex-1 overflow-y-auto">
            {routes
              .filter((route) => route.layout !== "auth")
              .map(({ layout, title, pages }, key) => (
                <ul key={key} className="mb-4 flex flex-col gap-4">
                  {title && (
                    <li className="mx-3.5 mt-4 mb-2">
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-black uppercase opacity-75"
                      >
                        {title}
                      </Typography>
                    </li>
                  )}
                  {pages
                    .filter(({ name }) => {
                      if (name === "Admin Report" && user?.role !== "admin") return false;
                      if (name === "Admin Dashboard" && user?.role !== "admin") return false;
                      if (name === "Announcements" && user?.role !== "admin") return false;
                      if (name === "Dashboard" && user?.role !== "user") return false;
                      if (name === "Create Report" && user?.role !== "user") return false;
                      if (name === "My Report" && user?.role !== "user") return false;
                      return true;
                    })
                    .map(({ icon, name, path }) => (
                      <li key={name}>
                        <NavLink
                          to={`/${layout}${path}`}
                          className={({ isActive }) =>
                            `flex items-center gap-4 px-4 capitalize rounded-lg ${
                              isActive ? "bg-black text-white shadow-md" : "hover:text-blue-gray-700"
                            }`
                          }
                          onClick={() => !isLargeScreen && setIsSidenavOpen(false)}
                        >
                          <Button
                            variant="text"
                            color="blue-gray"
                            className="flex items-center gap-4 w-full text-inherit"
                          >
                            {icon}
                            <Typography
                              color="inherit"
                              className="font-medium capitalize"
                            >
                              {name}
                            </Typography>
                          </Button>
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

      <Dialog
        open={showLogoutDialog}
        handler={() => setShowLogoutDialog(false)}
        animate={{ duration: 0 }}
      >
        <DialogHeader>Confirm Logout</DialogHeader>
        <DialogBody divider>
          Are you sure you want to log out?
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="blue-gray"
            onClick={() => setShowLogoutDialog(false)}
            className="mr-2"
          >
            Cancel
          </Button>
          <Button variant="gradient" color="red" onClick={handleLogout}>
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

export default Sidenav;