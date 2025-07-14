import React from "react";
import { useNavigate } from "react-router-dom";

const CarCard = ({ item }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/user/shopproduct/${item.id}`);
  };
  
  return (
    <div className="border rounded-xl shadow-md p-2 sm:p-3 bg-white hover:shadow-lg transition-shadow duration-200 w-full">
      <button
        onClick={handleClick}
        className="w-full text-left focus:outline-none"
      >
        {/* Product Image - Responsive height */}
        <div className="rounded-lg overflow-hidden h-32 sm:h-36 md:h-40 lg:h-44">
          {item.images && item.images.length > 0 ? (
            <img
              src={item.images[0].url}
              alt={item.name}
              className="w-full h-full object-cover transform transition-transform duration-200 hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
              ไม่มีรูปภาพ
            </div>
          )}
        </div>

        {/* Product Info - Improved spacing and responsive text */}
        <div className="mt-2 sm:mt-3 space-y-1">
          <h2 className="text-sm sm:text-base font-semibold text-gray-800 truncate">
            {item.name}
          </h2>
          <span className="text-xs sm:text-sm text-gray-500 line-clamp-2 h-8 sm:h-10">
            {item.location}
          </span>
          <span className="text-xs sm:text-sm text-gray-500 line-clamp-2 sm:h-10">
            {item.contact}
          </span>
          
        </div>
      </button>
    </div>
  );
};

export default CarCard;