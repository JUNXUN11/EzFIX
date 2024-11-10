import {
  Card,
  CardBody,
  Avatar,
  Typography,
  Tooltip,
} from "@material-tailwind/react";
import {
  PencilIcon,
} from "@heroicons/react/24/solid";
import { ProfileInfoCard, MessageCard } from "@/widgets/cards";

export function Profile() {
  return (
    <>
      <div className="relative mt-8 h-72 w-full overflow-hidden rounded-xl bg-[url('/img/background.jpg')] bg-cover	bg-center">
      </div>
      <Card className="mx-3 -mt-6 mb-6 lg:mx-4 border border-blue-gray-100">
        <CardBody className="p-4">
        <div className="flex flex-col items-left gap-4">
            <div className="flex items-center gap-4">
              <Avatar
                src="/img/bruce-mars.jpeg"
                alt="bruce-mars"
                size="xl"
                variant="rounded"
                className="rounded-lg shadow-lg shadow-blue-gray-500/40"
              />
              <div>
                <Typography variant="h5" color="blue-gray" className="mb-1">
                  EN.SAREF BIN ARDI
                </Typography>
                <Typography
                  variant="small"
                  className="font-normal text-blue-gray-600"
                >
                  Operation Assistant
                </Typography>
              </div>
            </div>
            <ProfileInfoCard
              title="Profile Information"
              description="Hello ! I'm Saref Bin Ardi. Responsible for Maintenance."
              details={{
                "Departmemt": "Maintenance",
                "Staff ID": "KTDI1234",
                mobile: "6012-3345567",
                email: "saref@utm.my",
                location: "Kolej Tun Dr Ismail",
              }}
              className="space-y-1"
              action={
                <Tooltip content="Edit Profile">
                  <PencilIcon className="h-4 w-4 cursor-pointer text-blue-gray-500" />
                </Tooltip>
              }
            />
            <div className="flex flex-col items-left gap-2 border border-blue-gray-100 rounded-lg p-4">
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Duty Schedule
                </Typography>
                <Typography variant="small" className="font-normal text-blue-gray-500">
                  <li>Checks for pending requests.</li>
                  <li>Submit a detailed monthly report to the hostel management.</li>
                </Typography>
                <Typography variant="h6" color="blue-gray" className="mb-2 mt-4">
                  Recent Reports
                </Typography>
                <Typography variant="small" className="font-normal text-blue-gray-500">
                  <li>View recently handled reports</li>
                  <li>View recently added reports</li>
                </Typography>
            </div>
          </div>
        </CardBody>
      </Card>
    </>
  );
}

export default Profile;
