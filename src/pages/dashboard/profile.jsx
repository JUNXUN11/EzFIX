import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardBody,
  Avatar,
  Typography,
  Tooltip,
  Button,
} from "@material-tailwind/react";
import { PencilIcon } from "@heroicons/react/24/solid";
import { ProfileInfoCard } from "@/widgets/cards";

export function Profile() {
  const { user } = useAuth(); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(false);
    }
  }, [user]);

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
      <div className="relative mt-8 h-72 w-full overflow-hidden rounded-xl bg-[url('/img/background.jpg')] bg-cover	bg-center">
      </div>
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
                  {user.username}
                </Typography>
                <Typography
                  variant="h6"
                  className="font-medium text-blue-gray-600"
                >
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Typography>
                <Typography
                  variant="small"
                  className="font-normal text-blue-gray-500"
                >
                  {user.email}
                </Typography>
              </div>
            </div>
            <div className="w-full flex justify-end">
              <Button
                variant="gradient"
                color="blue"
                className="flex items-center gap-2"
              >
                <PencilIcon className="h-5 w-5" />
                Edit Profile
              </Button>
            </div>
            <ProfileInfoCard
              title="Profile Information"
              description="Welcome to your profile page! Here you can view and edit your personal information."
              details={{
                Username: user.username,
                Email: user.email,
                Role:
                  user.role.charAt(0).toUpperCase() + user.role.slice(1),
              }}
            />
          </div>
        </CardBody>
      </Card>
    </>
  );
}

export default Profile;
