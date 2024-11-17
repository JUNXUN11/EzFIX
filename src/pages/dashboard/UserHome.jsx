import React, { useState } from "react";
import { Typography } from "@material-tailwind/react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";
import { announcementsData } from "@/data/announcementdata";
import { Link } from 'react-router-dom';

export function UserHome() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  // Function to open the modal with the clicked image
  const handleImageClick = (imageSrc) => {
    setSelectedImage(imageSrc);
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage("");
  };


  return (
    <div className="mt-12 space-y-12">
      <h2 className="text-2xl font-bold text-gray-800">Latest Announcements</h2>
      <Swiper
        modules={[Navigation, Pagination]}
        navigation
        pagination={{ clickable: true }}
        spaceBetween={20}
        slidesPerView={1}
        className="mt-6"
        style={{ width: "100%", height: "auto" }}
      >
        {announcementsData.map((announcement, index) => (
          <SwiperSlide key={index}>
            <div className="p-6 bg-green-50 shadow-xl rounded-xl flex items-center space-x-6">
              {/* Image */}
              <div className="flex-shrink-0 w-1/3">
                <img
                  src={announcement.image}
                  alt={announcement.title}
                  className="h-48 w-full object-cover rounded-lg cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-110"
                  onClick={() => handleImageClick(announcement.image)} // Open modal on click
                />
              </div>
              {/* Content */}
              <div className="w-2/3">
                <Typography variant="h4" className="font-semibold text-green-700 mb-2">
                  {announcement.title}
                </Typography>
                <Typography variant="small" className="text-gray-500 mb-4">
                  {announcement.date}
                </Typography>
                <Typography className="text-gray-800 text-sm leading-relaxed">
                  {announcement.description}
                </Typography>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-gray-800">Quick Access</h3>
        <div className="grid grid-cols-2 gap-4">
          <Link to="http://localhost:5174/dashboard/createreport" className="bg-green-500 text-white p-4 rounded-lg shadow-md hover:bg-blue-700 transition-colors">
            Create Report
          </Link>
          <Link to="http://localhost:5174/dashboard/notifications" className="bg-green-500 text-white p-4 rounded-lg shadow-md hover:bg-blue-700 transition-colors">
            Notifications
          </Link>
        </div>
      </div>
      
      
      {/* Modal for Image */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={closeModal} // Close modal if clicked outside
        >
          <div className="relative bg-white p-4 rounded-lg max-w-4xl">
            <button
              onClick={closeModal}
              className="absolute top-0 right-0 text-white bg-red-500 rounded-full p-2"
            >
              &times; {/* Close Button */}
            </button>
            <img
              src={selectedImage}
              alt="Enlarged"
              className="max-w-full max-h-[80vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default UserHome;
