import React, { useState } from "react";
import {
  Typography,
  Alert,
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Textarea,
} from "@material-tailwind/react";

export function Announcements() {
  const [announcementText, setAnnouncementText] = useState("");
  const [announcementImage, setAnnouncementImage] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");

  const handlePostAnnouncement = async () => {
    if (!announcementText || !announcementImage) {
      setAlertMessage("Please fill in all fields!");
      setAlertType("error");
      return;
    }

    const formData = new FormData();
    formData.append("text", announcementText);
    formData.append("image", announcementImage);

    setIsPosting(true);
    try {
      const response = await fetch(
        "https://theezfixapi.onrender.com/api/v1/announcements",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        setAlertMessage("Announcement posted successfully!");
        setAlertType("success");
        setAnnouncementText("");
        setAnnouncementImage(null);
      } else {
        throw new Error("Failed to post announcement.");
      }
    } catch (error) {
      console.error("Error posting announcement:", error);
      setAlertMessage("An error occurred while posting the announcement.");
      setAlertType("error");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="mx-auto my-20 flex max-w-screen-lg flex-col gap-8">
      {/* Post Announcement Section */}
      <Card>
        <CardHeader
          color="transparent"
          floated={false}
          shadow={false}
          className="m-0 p-4"
        >
          <Typography variant="h5" color="blue-gray">
            Post Announcement
          </Typography>
        </CardHeader>
        <CardBody className="flex flex-col gap-4 p-4">
          {alertMessage && (
            <Alert
              color={alertType === "success" ? "green" : "red"}
              className="mb-4"
            >
              {alertMessage}
            </Alert>
          )}
          <Textarea
            label="Announcement Text"
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
          />
          <Input
            label="Upload Image"
            type="file"
            accept="image/*"
            onChange={(e) => setAnnouncementImage(e.target.files[0])}
          />
          <Button
            color="black"
            onClick={handlePostAnnouncement}
            disabled={isPosting}
          >
            {isPosting ? "Posting..." : "Post Announcement"}
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}

export default Announcements;
