import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLocation, Link } from "react-router-dom";
import {
  Navbar,
  Typography,
  Breadcrumbs,
  Avatar,
} from "@material-tailwind/react";
import { useMaterialTailwindController} from "@/context";

export function DashboardNavbar() {
  const [controller] = useMaterialTailwindController();
  const { fixedNavbar }= controller;
  const { pathname } = useLocation();
  const [layout, page] = pathname.split("/").filter((el) => el !== "");
  const { user, loading } = useAuth();
  const [username, setUsername] = useState("");
  const [profilePicture, setProfilePicture] = useState("");

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
        fetchProfilePicture(); // Your method to fetch the picture if not available in user data
      } else {
        setProfilePicture(user.profilePicture);
      }
    } else {
      setUsername("User");
      setProfilePicture("https://cdn-icons-png.flaticon.com/512/5951/5951752.png");
    }
  }, [user]);


  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <ClipLoader size={50} color="#123abc" loading={loading} />
      </div>
    );
  }

  return (
        <Navbar
      color={fixedNavbar ? "white" : "transparent"}
      className={`rounded-xl transition-all ${fixedNavbar ? "sticky top-4 z-40 py-3 shadow-md shadow-blue-gray-500/5" : "px-0 py-1"}`}
      fullWidth
      blurred={fixedNavbar}
    >
      <div className="flex flex-row items-center justify-between">
        <div className="capitalize flex items-center">
          <Breadcrumbs className={`bg-transparent p-0 transition-all ${fixedNavbar ? "mt-1" : ""}`}>
            <Link to={`/${layout}`}>
              <Typography variant="small" color="blue-gray" className="font-normal opacity-50 transition-all hover:text-blue-500 hover:opacity-100">
                {layout}
              </Typography>
            </Link>
            <Typography variant="small" color="blue-gray" className="font-normal">
              {page}
            </Typography>
          </Breadcrumbs>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Avatar src={profilePicture} alt={`${username}'s profile picture`} size="xs" variant="circular" />
            <Typography variant="small" color="blue-gray" className="font-normal">
              {username}
            </Typography>
          </div>
        </div>
      </div>
    </Navbar>
  );
}

DashboardNavbar.displayName = "/src/widgets/layout/dashboard-navbar.jsx";

export default DashboardNavbar;
