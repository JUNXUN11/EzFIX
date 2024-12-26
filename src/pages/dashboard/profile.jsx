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
import ClipLoader from "react-spinners/ClipLoader"; 

export function Profile() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "",
  });
   const [showAlert, setShowAlert] = useState({
      show: false,
      message: '',
      type: 'success',
    });
  const [profilePicture, setProfilePicture] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const showAlertMessage = (message, type = 'success') => {
    setShowAlert({
      show: true,
      message,
      type,
    });
    setTimeout(() => {
      setShowAlert({ show: false, message: '', type: 'success' });
    }, 3000);
  };

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
      }finally {
        setImageLoading(false); // Loading complete
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
      showAlertMessage("File size must be less than 5MB.", "warning");
      return;
    }
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      showAlertMessage("Only JPG and PNG formats are supported.", "warning");
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
      showAlertMessage("Profile picture updated successfully!", "success");
    } catch (error) {
      console.error("Error uploading profile picture:", error.message);
      showAlertMessage(`Error: ${error.message}`,"error");
    }
  };
  
  const handleSave = async () => {
    // Trigger native email validation
    const emailInput = document.querySelector('input[type="email"]');
    if (!emailInput.checkValidity()) {
      showAlertMessage("Please enter a valid email address.","warning");
      return;
    }

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
      showAlertMessage("Profile updated successfully!","success");
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      showAlertMessage("Error updating profile. Please try again.","error");
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

      {showAlert.show && (
        <div
          role="alert"
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            showAlert.type === 'success'
              ? 'bg-green-100 border border-green-400 text-green-700'
              : showAlert.type === 'error'
              ? 'bg-red-100 border border-red-400 text-red-700'
              : 'bg-yellow-100 border border-yellow-400 text-yellow-700'
          }`}
        >
           <div className="flex items-center">
            {showAlert.type === 'success' ? (
              <>
                <CheckIcon className="w-5 h-5 mr-2 text-green-700" />
                <p>{showAlert.message}</p>
              </>
            ) : showAlert.type === 'error' ? (
              <>
                <svg
                  aria-hidden="true"
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <p>{showAlert.message}</p>
              </>
            ) : (
              <>
                <svg
                  aria-hidden="true"
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p>{showAlert.message}</p>
              </>
            )}
          </div>
        </div>
      )}

      <Card className="mx-3 -mt-20 mb-6 lg:mx-4 shadow-lg md:mx-8 xl:mx-12 p-6">
        <CardBody className="p-4 mb-10">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:gap-8">
            <div className="relative">
            {imageLoading ? (
                <div className="flex justify-center items-center h-24 w-24">
                  <ClipLoader size={40} color="#3b82f6" />
                </div>
              ) : (
              <Avatar
                src={profilePicture}
                alt="Profile Picture"
                size="xxl"
                variant="circular"
                className="border-2 border-white shadow-xl"
              />
              )}
              {(
                <label
                  htmlFor="profile-picture-input"
                  className="absolute bottom-0 right-0 bg-black text-white rounded-full p-2 cursor-pointer shadow-lg"
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
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <Typography variant="h6" color="blue-gray">
              Welcome to your profile page! Here you can view and edit your personal information.
            </Typography>
            {!isEditing && (
              <Button
                variant="gradient"
                color="black"
                className="flex items-center gap-2"
                onClick={() => setIsEditing(true)}
              >
                <PencilIcon className="h-4 w-3" />
                Edit Profile
              </Button>
            )}
          </div>

          <div className="mt-6">
            <ProfileInfoCard
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
