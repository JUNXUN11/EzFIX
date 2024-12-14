import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardBody,
  Avatar,
  Typography,
  Button,
  Input,
} from "@material-tailwind/react";
import { PencilIcon, CheckIcon, CameraIcon } from "@heroicons/react/24/solid";
import { ProfileInfoCard } from "@/widgets/cards";

export function Profile() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "",
  });
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const response = await fetch(
          `https://theezfixapi.onrender.com/api/v1/users/${user.id}/profile-image`,
          { method: "GET" }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch profile picture.");
        }

        const imageBlob = await response.blob();
        const imageUrl = URL.createObjectURL(imageBlob);
        setProfilePicture(imageUrl); // Set the profile picture URL
      } catch (error) {
        console.error("Error fetching profile picture:", error.message);
        setProfilePicture("/img/default-avatar.png"); // Set a default image on error
      }
    };

    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        role: user.role,
      });
      fetchProfilePicture();
      setLoading(false);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB.");
      return;
    }
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      alert("Only JPG and PNG formats are supported.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        `https://theezfixapi.onrender.com/api/v1/users/${user.id}/profile-image`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      setProfilePicture(updatedUser.file); // Update with the new image URL
      alert("Profile picture updated successfully!");
    } catch (error) {
      console.error("Error uploading profile picture:", error.message);
      alert(`Error: ${error.message}`);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(
        `https://theezfixapi.onrender.com/api/v1/users/${user.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update profile.");
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      alert("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      alert("Error updating profile. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Typography variant="h5" color="blue-gray">
          Loading Profile...
        </Typography>
      </div>
    );
  }

  return (
    <>
      <div className="relative mt-8 h-72 w-full overflow-hidden rounded-xl bg-[url('/img/background.jpg')] bg-cover bg-center"></div>
      <Card className="mx-3 -mt-20 mb-6 lg:mx-4 shadow-lg md:mx-8 xl:mx-12 p-6">
        <CardBody className="p-4 mb-10">
          <div className="flex flex-col items-start gap-6 ml-10 md:flex-row md:items-center md:gap-8">
            <div className="relative">
              <Avatar
                src={profilePicture}
                alt="Profile Picture"
                size="xxl"
                variant="circular"
                className="border-2 border-white shadow-xl"
              />
              {isEditing && (
                <label
                  htmlFor="profile-picture-input"
                  className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 cursor-pointer shadow-lg"
                >
                  <CameraIcon className="h-5 w-5" />
                </label>
              )}
              <input
                id="profile-picture-input"
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="hidden"
              />
            </div>
            <div className="flex flex-col items-start mt-4 md:mt-0">
              <Typography variant="h4" color="blue-gray" className="mb-1">
                {user.username}
              </Typography>
              <div className="flex items-center gap-4">
                <Typography
                  variant="h6"
                  className="font-medium text-blue-gray-600"
                >
                  {formData.role}
                </Typography>
                {!isEditing && (
                  <Button
                    variant="gradient"
                    color="black"
                    className="ml-auto flex items-center gap-2"
                    onClick={() => setIsEditing(true)}
                  >
                    <PencilIcon className="h-4 w-3" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <ProfileInfoCard
              title="Profile Information"
              description="Welcome to your profile page! Here you can view and edit your personal information."
              details={{
                Username: formData.username,
                Email: formData.email,
                Role: formData.role,
              }}
            />
          </div>

          {isEditing && (
            <div className="mt-6">
              <Typography variant="h5" className="mb-4 text-blue-gray-700">
                Edit Profile Information
              </Typography>
              <div className="flex flex-col gap-6">
                <Input
                  type="text"
                  name="username"
                  label="Username"
                  value={formData.username}
                  onChange={handleInputChange}
                />
                <Input
                  type="email"
                  name="email"
                  label="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                <div className="flex justify-end gap-4 mt-4">
                  <Button
                    variant="outlined"
                    color="red"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="gradient"
                    color="green"
                    className="flex items-center gap-2"
                    onClick={handleSave}
                  >
                    <CheckIcon className="h-5 w-5" />
                    <span>Save Changes</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </>
  );
}

export default Profile;
