import React, { useState, useEffect } from "react";
import {
  Typography,
  Alert,
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Textarea,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";

export function Announcements() {
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementDescription, setAnnouncementDescription] = useState("");
  const [announcementImage, setAnnouncementImage] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(
        "https://theezfixapi.onrender.com/api/v1/announcements"
      );
      if (response.ok) {
        const data = await response.json();

        // Fetch images for each announcement
        const announcementsWithImages = await Promise.all(
          data.map(async (announcement) => {
            const imageUrl = await fetchImage(announcement.id);
            return { ...announcement, imageUrl };
          })
        );
        setAnnouncements(announcementsWithImages);
      } else {
        throw new Error("Failed to fetch announcements.");
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
      setAlertMessage("Failed to fetch announcements.");
      setAlertType("error");
    }
  };

  const fetchImage = async (id) => {
    try {
      const response = await fetch(
        `https://theezfixapi.onrender.com/api/v1/announcements/${id}/image`
      );
      if (response.ok) {
        const imageBlob = await response.blob();
        return URL.createObjectURL(imageBlob);
      }
    } catch (error) {
      console.error("Error fetching image:", error);
    }
    return "/img/default-placeholder.png"; // Default image
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handlePostAnnouncement = async () => {
    if (!announcementTitle || !announcementDescription || !announcementImage) {
      setAlertMessage("Please fill in all fields!");
      setAlertType("error");
      return;
    }

    const formData = new FormData();
    formData.append("title", announcementTitle);
    formData.append("description", announcementDescription);
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
        setAnnouncementTitle("");
        setAnnouncementDescription("");
        setAnnouncementImage(null);
        fetchAnnouncements(); // Refresh announcements
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

  const confirmDeleteAnnouncement = (id) => {
    setDeleteTargetId(id);
    setShowDeleteDialog(true);
  };

  const handleDeleteAnnouncement = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(
        `https://theezfixapi.onrender.com/api/v1/announcements/${deleteTargetId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setAlertMessage("Announcement deleted successfully!");
        setAlertType("success");
        fetchAnnouncements(); // Refresh announcements
      } else {
        throw new Error("Failed to delete announcement.");
      }
    } catch (error) {
      console.error("Error deleting announcement:", error);
      setAlertMessage("An error occurred while deleting the announcement.");
      setAlertType("error");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="mx-auto my-20 flex max-w-screen-lg flex-col gap-8">
      {/* Toast Message */}
      {alertMessage && (
        <div className="fixed top-4 right-4 z-50">
          <Alert
            color={alertType === "success" ? "green" : "red"}
            onClose={() => setAlertMessage("")}
          >
            {alertMessage}
          </Alert>
        </div>
      )}

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
          <Input
            label="Announcement Title"
            value={announcementTitle}
            onChange={(e) => setAnnouncementTitle(e.target.value)}
          />
          <Textarea
            label="Announcement Description"
            value={announcementDescription}
            onChange={(e) => setAnnouncementDescription(e.target.value)}
          />
          <Input
            label="Upload Image"
            type="file"
            accept=".jpg,.jpeg"
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

      {/* Display Announcements Section */}
      <div className="flex flex-col gap-4">
        <Typography variant="h5" color="blue-gray">
          Announcements
        </Typography>
        {announcements.length === 0 ? (
          <Typography color="blue-gray">No announcements available.</Typography>
        ) : (
          announcements.map((announcement) => (
            <Card key={announcement.id} className="flex flex-row gap-4 p-4">
              <img
                src={announcement.imageUrl}
                alt={announcement.title}
                className="h-24 w-24 object-cover"
              />
              <div className="flex flex-col justify-between flex-1">
                <Typography variant="h6" color="blue-gray">
                  {announcement.title}
                </Typography>
                <Typography color="blue-gray">
                  {announcement.description}
                </Typography>
                <Typography variant="small" color="gray">
                  {new Date(announcement.timestamp).toLocaleString()}
                </Typography>
                <Button
                  color="red"
                  onClick={() => confirmDeleteAnnouncement(announcement.id)}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        handler={() => setShowDeleteDialog(false)}
        animate={{ duration: 0 }}
      >
        <DialogHeader>Confirm Delete</DialogHeader>
        <DialogBody divider>
          Are you sure you want to delete this announcement?
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="blue-gray"
            onClick={() => setShowDeleteDialog(false)}
            className="mr-2"
          >
            Cancel
          </Button>
          <Button
            variant="gradient"
            color="red"
            onClick={handleDeleteAnnouncement}
          >
            Yes, Delete
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default Announcements;
