import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLocation, Link } from "react-router-dom";
import {
  Navbar,
  Typography,
  Breadcrumbs,
  Avatar,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
} from "@material-tailwind/react";
import { useMaterialTailwindController } from "@/context";
import { LogOut, User } from "lucide-react";

export function DashboardNavbar() {
  const [controller] = useMaterialTailwindController();
  const { fixedNavbar } = controller;
  const { pathname } = useLocation();
  const [layout, page] = pathname.split("/").filter((el) => el !== "");
  const { user, loading, logout } = useAuth();
  const [username, setUsername] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const fetchProfilePicture = async () => {
    try {
      const response = await fetch(
        `https://theezfixapi.onrender.com/api/v1/users/${user.id}/profile-image`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch profile picture.");
      }

      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);
      setProfilePicture(imageUrl);
    } catch (error) {
      console.error("Error fetching profile picture:", error.message);
      setProfilePicture("https://cdn-icons-png.flaticon.com/512/5951/5951752.png");
    }
  };

  useEffect(() => {
    if (user) {
      setUsername(user.username || "User");
      if (!user.profilePicture) {
        fetchProfilePicture();
      } else {
        setProfilePicture(user.profilePicture);
      }
    } else {
      setUsername("User");
      setProfilePicture("https://cdn-icons-png.flaticon.com/512/5951/5951752.png");
    }
  }, [user]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setShowLogoutDialog(false);
    setIsDropdownOpen(false);
    await logout();
    setIsLoggingOut(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={50} color="#123abc" loading={loading} />
      </div>
    );
  }

  return (
    <>
      <Navbar
        color={fixedNavbar ? "white" : "transparent"}
        className={`rounded-xl transition-all ${
          fixedNavbar
            ? "sticky top-4 z-40 py-3 shadow-md shadow-blue-gray-500/5"
            : "px-0 py-1"
        }`}
        fullWidth
        blurred={fixedNavbar}
      >
        <div className="flex flex-row items-center justify-between">
          <div className="capitalize flex items-center">
            <Breadcrumbs
              className={`bg-transparent p-0 transition-all ${
                fixedNavbar ? "mt-1" : ""
              }`}
            >
              <Link to={`/${layout}`}>
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-normal opacity-50 transition-all hover:text-blue-500 hover:opacity-100"
                >
                  {layout}
                </Typography>
              </Link>
              <Typography
                variant="small"
                color="blue-gray"
                className="font-normal"
              >
                {page}
              </Typography>
            </Breadcrumbs>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 focus:outline-none"
              >
                <Avatar
                  src={profilePicture}
                  alt={`${username}'s profile picture`}
                  size="xs"
                  variant="circular"
                  className="cursor-pointer"
                />
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-normal"
                >
                  {username}
                </Typography>
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <Link
                    to="/dashboard/profile"
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setShowLogoutDialog(true);
                      setIsDropdownOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    disabled={isLoggingOut}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Navbar>

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
          <Button 
            variant="gradient" 
            color="red" 
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            Yes, Logout
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}

DashboardNavbar.displayName = "/src/widgets/layout/dashboard-navbar.jsx";

export default DashboardNavbar;