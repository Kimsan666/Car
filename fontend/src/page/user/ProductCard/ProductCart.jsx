import React, { use, useState } from "react";
import {
  ShoppingCart,
  Package,
  Tag,
  AlertCircle,
  Star,
  Truck,
  Layers,
  Check,
  XCircle,
  Calendar,
} from "lucide-react";
import useCarStore from "../../../Store/car-store";


const ProductCart = ({  }) => {
  const salecars = useCarStore((state) => state.salecars);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState("success"); // "success" or "error"
  const [feedbackMessage, setFeedbackMessage] = useState("");
  
  console.log("ProductCart item:", item);
  if (!item || !item.product) {
    return (
      <div className="border border-red-200 bg-red-50 rounded-lg p-2 flex items-center justify-center w-full">
        <AlertCircle className="w-3 h-3 text-red-500 mr-1" />
        <span className="text-red-500 text-xs">ຂໍ້ມູນສິນຄ້າບໍ່ຖືກຕ້ອງ</span>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "ບໍ່ມີວັນໝົດອາຍຸ";
    try {
      const date = new Date(dateString);
      // ตรวจสอบว่าเป็น Invalid Date หรือไม่
      if (isNaN(date.getTime())) return "ບໍ່ມີວັນໝົດອາຍຸ";
      
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      return "ບໍ່ມີວັນໝົດອາຍຸ";
    }
  };

  // ✅ เพิ่ม: ฟังก์ชันสำหรับคำนวณสีของวันหมดอายุ
  const getExpirationStatus = (dateString) => {
    if (!dateString) return { color: "gray", text: "ບໍ່ມີວັນໝົດອາຍຸ" };
    
    try {
      const expirationDate = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      expirationDate.setHours(0, 0, 0, 0);

      const diffTime = expirationDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return { color: "red", text: "ໝົດອາຍຸແລ້ວ" };
      if (diffDays === 0) return { color: "red", text: "ໝົດອາຍຸວັນນີ້" };
      if (diffDays <= 3) return { color: "red", text: `ເຫຼືອ ${diffDays} ວັນ` };
      if (diffDays <= 7) return { color: "orange", text: `ເຫຼືອ ${diffDays} ວັນ` };
      if (diffDays <= 30) return { color: "yellow", text: `ເຫຼືອ ${diffDays} ວັນ` };
      
      return { color: "green", text: `ເຫຼືອ ${diffDays} ວັນ` };
    } catch (error) {
      return { color: "gray", text: "ບໍ່ມີວັນໝົດອາຍຸ" };
    }
  };

  const product = sale;
  const actionAdtoCart = useCarStore((state) => state.actionAdtoCart);
  // const currentWarehouseId = useCarStore((state) => state.currentWarehouseId);


  const isLowStock = item.totalQuantity === 0;
  const isLimitedStock = item.totalQuantity > 0 && item.totalQuantity < 5;
  
  // ✅ เช็คว่าสินค้าตัวนี้ (รวม expiration date) อยู่ใน cart หรือไม่
  const isThisVariantInCart = isProductWithExpirationInCart?.(product.id, item.expirationDate) || false;
  // ✅ เช็คว่าสินค้าตัวนี้ (ไม่สนใจ expiration date) มีใน cart หรือไม่
  const hasOtherVariantsInCart = isProductInCart?.(product.id) || false;

  const expirationStatus = getExpirationStatus(item.expirationDate);

  const handleCardClick = async (e) => {
    e.preventDefault();

    // ถ้าสินค้าหมดหรือกำลังเพิ่ม ไม่ให้ทำงาน
    if (isLowStock || addingToCart) return;

    setAddingToCart(true);

    // If we have items in cart from a different warehouse, show warning
    if (
      currentWarehouseId !== null &&
      currentWarehouseId !== item.warehouse?.id &&
      currentWarehouseId !== undefined
    ) {
      setFeedbackType("error");
      setFeedbackMessage("ມີສິນຄ້າຈາກຄັງສິນຄ້າອື່ນໃນກະຕ່າແລ້ວ");
      setShowFeedback(true);

      setTimeout(() => {
        setAddingToCart(false);
        setShowFeedback(false);
      }, 2000);

      return;
    }

    // Try to add to cart
    const success = await actionAdtoCart(item);

    if (success) {
      setFeedbackType("success");
      setFeedbackMessage("ເພີ່ມເຂົ້າກະຕ່າແລ້ວ");
    } else {
      // Could be already in cart or other error
      setFeedbackType("error");
      setFeedbackMessage("ສິນຄ້ານີ້ມີວັນໝົດອາຍຸດຽວກັນໃນກະຕ່າແລ້ວ");
    }

    // Show feedback message
    setShowFeedback(true);

    // Reset states after animation
    setTimeout(() => {
      setAddingToCart(false);
      setShowFeedback(false);
    }, 1500);
  };

  return (
    <div className="w-full h-full">
      <div 
        onClick={handleCardClick}
        className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 h-full flex flex-col overflow-hidden border relative ${
          isThisVariantInCart
            ? "border-green-400 bg-green-50" // ✅ สีเขียวถ้าตัวนี้อยู่ใน cart
            : hasOtherVariantsInCart
            ? "border-blue-400 bg-blue-50" // ✅ สีฟ้าถ้าสินค้าเดียวกัน (ต่าง expiration date) อยู่ใน cart
            : isLowStock 
            ? "border-gray-300 cursor-not-allowed opacity-60" 
            : addingToCart 
            ? "border-yellow-400 cursor-wait" 
            : "border-gray-500 cursor-pointer hover:border-blue-300"
        }`}
      >
        {/* ✅ เพิ่ม: แสดงสถานะใน cart */}
        {isThisVariantInCart && (
          <div className="absolute top-1 left-1 bg-green-500 text-white rounded-full p-1 z-10">
            <Check className="w-3 h-3" />
          </div>
        )}
        
        {hasOtherVariantsInCart && !isThisVariantInCart && (
          <div className="absolute top-1 left-1 bg-blue-500 text-white rounded-full p-1 z-10">
            <Layers className="w-3 h-3" />
          </div>
        )}

        {/* Feedback Notification - Conditionally rendered */}
        {showFeedback && (
          <div
            className={`absolute top-1 right-1 left-1 z-20 ${
              feedbackType === "success"
                ? "bg-green-50 border border-green-100"
                : "bg-red-50 border border-red-100"
            } rounded-md py-1 px-1 flex items-center animate-fadeInOut`}
          >
            {feedbackType === "success" ? (
              <Check className="w-2 h-2 text-green-500 mr-0.5" />
            ) : (
              <XCircle className="w-2 h-2 text-red-500 mr-0.5" />
            )}
            <span
              className={
                feedbackType === "success"
                  ? "text-green-600 text-xs"
                  : "text-red-600 text-xs"
              }
            >
              {feedbackMessage}
            </span>
          </div>
        )}

        {/* Adding to cart overlay */}
        {addingToCart && (
          <div className="absolute inset-0 bg-blue-50 bg-opacity-75 flex items-center justify-center z-15">
            <div className="flex items-center gap-1 text-blue-600">
              <ShoppingCart className="w-3 h-3 animate-bounce" />
              <span className="text-xs font-medium">ກຳລັງເພີ່ມ...</span>
            </div>
          </div>
        )}

        {/* Product Image */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          {product?.images?.length > 0 ? (
            <img
              src={product.images[0].url}
              alt={product.name}
              className="w-full h-full object-contain transform transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center text-gray-400">
              <Package className="w-6 h-6 mb-1" />
              <span className="text-xs">ບໍ່ມີຮູບ</span>
            </div>
          )}

          {/* Stock indicator */}
          <div
            className={`absolute top-1 right-1 px-1.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200 ${
              isLowStock
                ? "bg-red-500 text-white"
                : isLimitedStock
                ? "bg-amber-400 text-amber-800"
                : "bg-green-500 text-white"
            }`}
          >
            {isLowStock ? "ໝົດ" : isLimitedStock ? "ເຫຼືອໜ້ອຍ" : "ມີສິນຄ້າ"}
          </div>

          {/* ✅ เพิ่ม: แสดงสถานะวันหมดอายุ */}
          {item.expirationDate && (
            <div className={`absolute bottom-1 left-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${
              expirationStatus.color === "red" 
                ? "bg-red-500 text-white"
                : expirationStatus.color === "orange"
                ? "bg-orange-500 text-white"
                : expirationStatus.color === "yellow"
                ? "bg-yellow-400 text-yellow-800"
                : "bg-green-500 text-white"
            }`}>
              <Calendar className="w-2 h-2 inline mr-0.5" />
              {expirationStatus.text}
            </div>
          )}

          {/* Optional: Highlight Popular Products */}
          {product.isPopular && (
            <div className="absolute bottom-1 right-1 bg-amber-400 text-amber-800 rounded-full p-0.5">
              <Star className="w-2.5 h-2.5 fill-current" />
            </div>
          )}
        </div>

        {/* Product Content */}
        <div className="p-1.5 flex-grow flex flex-col">
          {/* Product Category/Tags - Optional */}
          {product.category && (
            <div className="mb-1 flex items-center">
              <Tag className="w-2.5 h-2.5 text-blue-500 mr-0.5" />
              <span className="text-xs text-blue-600 truncate">
                {product.category}
              </span>
            </div>
          )}

          {/* Product Name */}
          <h3 className={`font-medium text-xs mb-0.5 line-clamp-2 transition-colors leading-tight ${
            isThisVariantInCart
              ? "text-green-800"
              : hasOtherVariantsInCart
              ? "text-blue-800"
              : "text-gray-800 hover:text-blue-600"
          }`}>
            {product.name}
            {/* ✅ เพิ่ม: แสดงจำนวนใน cart ถ้ามี */}
            {hasOtherVariantsInCart && (
              <span className="ml-1 text-xs text-blue-600 font-bold">
                (ມີໃນກະຕ່າ)
              </span>
            )}
          </h3>

          {/* Price (if available) */}
          {product.price && (
            <div className="mt-1 text-xs font-semibold text-red-600">
              {product.price.toLocaleString()} ₭
            </div>
          )}

          {/* Stock and Warehouse Info */}
          <div className="flex flex-col mt-1 text-xs text-gray-500 gap-0.5">
            <span>ສິນຄ້າໃນຄັງ: {item.totalQuantity}</span>
            <span>ສິນຄ້າທີ່ຈອງ: {item.reservedQuantity}</span>
          </div>
          
          {/* ✅ ปรับปรุง: Expiration Date with better styling */}
          <div className={`flex items-center mt-1 text-xs ${
            expirationStatus.color === "red" 
              ? "text-red-600 font-medium"
              : expirationStatus.color === "orange"
              ? "text-orange-600 font-medium"
              : expirationStatus.color === "yellow"
              ? "text-yellow-600 font-medium"
              : "text-gray-500"
          }`}>
            <Calendar className="w-2.5 h-2.5 mr-0.5" />
            <span className="truncate">{formatDate(item.expirationDate)}</span>
          </div>

          {/* Always show warehouse info */}
          <div className="mt-1 flex items-center text-xs">
            <Truck className="w-2.5 h-2.5 text-gray-500 mr-0.5" />
            <span className="bg-gray-100 rounded px-1 text-gray-600 truncate text-xs">
              {item.warehouse?.name || "ສາງຫຼັກ"}
            </span>
          </div>

          {/* ✅ ปรับปรุง: Status indicator at bottom */}
          <div className="mt-auto pt-1.5">
            {isLowStock ? (
              <div className="text-center text-xs text-red-500 font-medium">
                ສິນຄ້າໝົດ
              </div>
            ) : isThisVariantInCart ? (
              <div className="text-center text-xs text-green-600 font-medium">
                ຢູ່ໃນກະຕ່າແລ້ວ
              </div>
            ) : hasOtherVariantsInCart ? (
              <div className="text-center text-xs text-blue-600 font-medium">
                ຄລິກເພື່ອເພີ່ມລໍາ ໝົດອາຍຸນີ້
              </div>
            ) : (
              <div className="text-center text-xs text-blue-500 font-medium">
                ຄລິກເພື່ອເພີ່ມເຂົ້າກະຕ່າ
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCart;