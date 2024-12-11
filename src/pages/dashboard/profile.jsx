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
import { PencilIcon, CheckIcon } from "@heroicons/react/24/solid";
import { ProfileInfoCard } from "@/widgets/cards";

export function Profile() {
  const { user, setUser } = useAuth(); // Use setUser from AuthContext
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        role: user.role,
      });
      setLoading(false);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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

      // Update global user state
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
      <div className="relative mt-8 h-72 w-full overflow-hidden rounded-xl bg-[url('/img/background.jpg')] bg-cover	bg-center"></div>
      <Card className="mx-3 -mt-20 mb-6 lg:mx-4 shadow-lg">
        <CardBody className="p-4 mb-10">
          <div className="flex flex-col items-start gap-6 ml-10">
            <div className="flex items-center gap-6">
              <Avatar
                src="/img/bruce-mars.jpeg"
                alt=""
                size="xxl"
                variant="circular"
                className="border-4 border-white shadow-xl"
              />
              <div className="flex flex-col items-start">
                <Typography variant="h4" color="blue-gray" className="mb-1">
                  {isEditing ? (
                    <Input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="text-lg"
                    />
                  ) : (
                    user.username
                  )}
                </Typography>
                <Typography
                  variant="h6"
                  className="font-medium text-blue-gray-600"
                >
                  {isEditing ? (
                    <Input
                      type="text"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="text-lg"
                    />
                  ) : (
                    user.role.charAt(0).toUpperCase() + user.role.slice(1)
                  )}
                </Typography>
                <Typography
                  variant="small"
                  className="font-normal text-blue-gray-500"
                >
                  {isEditing ? (
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="text-lg"
                    />
                  ) : (
                    user.email
                  )}
                </Typography>
              </div>
            </div>
            <div className="w-full flex justify-end">
              {isEditing ? (
                <Button
                  variant="gradient"
                  color="green"
                  className="flex items-center gap-2"
                  onClick={handleSave}
                >
                  <CheckIcon className="h-5 w-5" />
                  Save Changes
                </Button>
              ) : (
                <Button
                  variant="gradient"
                  color="blue"
                  className="flex items-center gap-2"
                  onClick={() => setIsEditing(true)}
                >
                  <PencilIcon className="h-5 w-5" />
                  Edit Profile
                </Button>
              )}
            </div>
            <ProfileInfoCard
              title="Profile Information"
              description="Welcome to your profile page! Here you can view and edit your personal information."
              details={formData}
            />
          </div>
        </CardBody>
      </Card>
    </>
  );
}

export default Profile;
