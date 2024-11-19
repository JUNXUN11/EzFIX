import React, { useState } from "react";
import { Typography } from "@material-tailwind/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { StatisticsChart } from "@/widgets/charts";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { announcementsData } from "@/data/announcementdata";
import { useStatisticsChartsData } from "@/data";
import { faqData } from "@/data/faqdata";

export function UserHome() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const statisticsChartsData = useStatisticsChartsData();

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
    <div className="mt-12 space-y-12 px-4 md:px-8 lg:px-16 w-full">
      <h2 className="text-3xl font-semibold text-gray-800 mb-8 transition duration-300">Latest Announcements</h2>
      <Swiper
          modules={[Navigation,Pagination,Autoplay]}
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000, disableOnInteraction: false }} // Auto-scroll every 3 seconds
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="mt-6"
        >
          {announcementsData.map((announcement, index) => (
            <SwiperSlide key={index}>
              <div className="p-6 bg-white shadow-xl rounded-xl hover:shadow-2xl transition-shadow duration-300">
                <div className="relative max-w-md mx-auto">
                  <img
                    src={announcement.image}
                    alt={announcement.title}
                    className="h-64 w-full object-cover rounded-lg cursor-pointer transition-transform duration-500 ease-in-out hover:scale-110"
                    onClick={() => handleImageClick(announcement.image)}
                  />
                </div>
                <Typography variant="h5" className="font-semibold text-gray-800 mt-4">
                  {announcement.title}
                </Typography>
                <Typography variant="small" className="text-gray-500">
                  {announcement.date}
                </Typography>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

      
      <h2 className="text-3xl font-semibold text-gray-800 mb-8">Statistics</h2>
      <div className="grid gap-y-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
          {statisticsChartsData.map((props) => (
            <StatisticsChart
              key={props.title}
              {...props}
            />
          ))}
        </div>


      <h2 className="text-3xl font-semibold text-gray-800 mb-8">Frequently Asked Questions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {faqData.map((faq, index) => (
          <div key={index} className="p-6 bg-gray-50 hover:bg-blue-100 rounded-lg shadow-lg transition-all duration-300">
            <h3 className="text-xl font-semibold text-gray-800">{faq.question}</h3>
            <p className="text-gray-600 mt-2">{faq.answer}</p>
          </div>
        ))}
      </div>
      
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={closeModal} // Close modal if clicked outside
        >
          <div className="relative bg-white p-8 rounded-lg max-w-4xl">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white bg-red-500 rounded-full p-2"
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