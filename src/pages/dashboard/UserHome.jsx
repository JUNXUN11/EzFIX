import React, { useState, useEffect } from "react";
import { Typography } from "@material-tailwind/react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { faqData } from "@/data/faqdata";

export function UserHome() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [announcements, setAnnouncements] = useState([]);

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

  const fetchAnnouncementImage = async (id) => {
    try {
      if (!id) {
        throw new Error("Announcement ID is missing");
      }
      const response = await fetch(`https://theezfixapi.onrender.com/api/v1/announcements/${id}/image`);
      if (!response.ok) {
        throw new Error("Failed to fetch image");
      }
      const blob = await response.blob();
      return URL.createObjectURL(blob); // Generate a local URL for the image blob
    } catch (error) {
      console.error("Error fetching announcement image:", error);
      return "/path-to-placeholder.jpg"; // Return placeholder image if fetching fails
    }
  };

  // Fetching announcements and logging imageIds
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch("https://theezfixapi.onrender.com/api/v1/announcements");
        if (response.ok) {
          const data = await response.json();

          // Fetch image for each announcement
          const formattedData = await Promise.all(
            data.map(async (announcement) => {
              const imageUrl = await fetchAnnouncementImage(announcement.id);
              return {
                ...announcement,
                imageUrl, 
              };
            })
          );

          setAnnouncements(formattedData);
          console.log("Fetched Announcements with Images:", formattedData);
        } else {
          console.error("Failed to fetch announcements.");
        }
      } catch (error) {
        console.error("Error fetching announcements:", error);
      }
    };

    fetchAnnouncements();
  }, []);

  return (
    <div className="mt-12 px-4 md:px-8 lg:px-16 w-full">
      <div className="mb-12">
        <h2 className="text-3xl font-semibold text-gray-800 mb-8 transition duration-300">Latest Announcements</h2>
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }} 
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="mt-6"
        >
          {announcements.map((announcement) => (
            <SwiperSlide key={announcement.id}>
              <div className="p-6 bg-white shadow-xl rounded-xl hover:shadow-2xl transition-shadow duration-300">
                <Typography variant="h5" className="font-semibold text-gray-800 mt-4 mb-4">
                  {announcement.title}
                </Typography>
                <div className="relative max-w-md mx-auto">
                  <img
                    src={announcement.imageUrl || "/path-to-placeholder.jpg"} // Use placeholder if imageUrl is null
                    alt={announcement.title}
                    className="h-64 w-full object-cover rounded-lg cursor-pointer transition-transform duration-500 ease-in-out hover:scale-110" // Fixed height to ensure consistency
                    onClick={() => handleImageClick(announcement.imageUrl)}
                  />
                </div>
                <Typography variant="paragraph" className="text-gray-600 mt-2">
                  {announcement.description}
                </Typography>
                <Typography variant="small" className="text-gray-500">
                  {new Date(announcement.timestamp).toLocaleDateString()}
                </Typography>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div>
        <h2 className="text-3xl font-semibold text-gray-800 mb-8">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {faqData.map((faq, index) => (
            <div key={index} className="p-6 bg-gray-50 hover:bg-blue-100 rounded-lg shadow-lg transition-all duration-300">
              <h3 className="text-xl font-semibold text-gray-800">{faq.question}</h3>
              <p className="text-gray-600 mt-2">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 overflow-hidden" // Ensure it fully covers the screen
          onClick={closeModal} 
        >
          <div className="relative bg-white p-8 rounded-lg max-w-4xl">
            <button
              onClick={closeModal}
              className="absolute top-4 right-2 text-red rounded-full p-2"
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
