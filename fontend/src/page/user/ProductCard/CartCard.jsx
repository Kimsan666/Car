import React, { useState } from "react";
import {
  Trash2,
  ShoppingCart,
  Minus,
  Plus,
  Edit2,
  Package2,
  Calendar,
} from "lucide-react";
import useJimStore from "../../kaika-Store/jim-store";
import NumberPadModal from "../NumberPadModal";
import { useNavigate } from "react-router-dom";

const CartCard = () => {
  const navigate = useNavigate();
  const carts = useJimStore((state) => state.carts);
  const actionUpdateQuantity = useJimStore(
    (state) => state.actionUpdateQuantity
  );
  const actionRemoveProduct = useJimStore((state) => state.actionRemoveProduct);
  const getQuantityProduct = useJimStore((state) => state.getQuantityProduct);

  const [activeItem, setActiveItem] = useState(null);
  const [tempQty, setTempQty] = useState(0);

  const totalPrice = carts.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCartCheckout = () => {
    navigate("/user/chackout");
  };

  // ✅ แก้ไข: ส่งทั้ง productId และ expirationDate
  const handleRemoveItem = (productId, expirationDate) => {
    actionRemoveProduct(productId, expirationDate);
  };

  // ✅ แก้ไข: ส่งทั้ง productId และ expirationDate สำหรับ quantity update
  const handleUpdateQuantity = (productId, expirationDate, newQuantity) => {
    actionUpdateQuantity(productId, expirationDate, newQuantity);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";
      
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      return "-";
    }
  };

  // ✅ เพิ่ม: ฟังก์ชันสำหรับคำนวณสีของวันหมดอายุ
  const getExpirationStatus = (dateString) => {
    if (!dateString) return { color: "gray", text: "-" };
    
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
      return { color: "gray", text: "-" };
    }
  };

  // ✅ เพิ่ม: สร้าง unique key สำหรับแต่ละ cart item
  const getUniqueKey = (item, index) => {
    return `${item.id}-${item.expirationDate || 'no-expiry'}-${index}`;
  };

  return (
    <div className="font-phetsarath bg-white rounded-xl shadow-lg p-4 h-full flex flex-col">
      {/* Cart Header */}
      <div className="mb-4 border-b pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <ShoppingCart className="text-blue-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">ກະຕ່າສິນຄ້າ</h1>
          </div>
          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1.5 rounded-full">
            {getQuantityProduct()} ລາຍການ
          </span>
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-grow overflow-hidden">
        {carts.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center border border-dashed border-gray-300 mb-4 h-full flex flex-col items-center justify-center">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <Package2 className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-gray-800 font-semibold mb-2">
              ຍັງບໍ່ມີສິນຄ້າໃນກະຕ່າ
            </p>
            <p className="text-sm text-gray-500">
              ເລືອກສິນຄ້າຈາກລາຍການເພື່ອເພີ່ມເຂົ້າກະຕ່າ
            </p>
          </div>
        ) : (
          <div className="space-y-3 mb-4 max-h-[calc(100vh-320px)] overflow-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {carts.map((item, index) => {
              const expirationStatus = getExpirationStatus(item.expirationDate);
              const uniqueKey = getUniqueKey(item, index);
              
              return (
                <div
                  key={uniqueKey} // ✅ แก้ไข: ใช้ unique key
                  className="bg-white p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200"
                >
                  {/* Item Header with Number Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="bg-blue-50 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2 font-medium">
                        {index + 1}
                      </span>
                      <span className="text-xs text-gray-500">
                        ສາງ: {item.warehouseName || "ລະຫັດ: N/A"}
                      </span>
                    </div>

                    {/* ✅ แก้ไข: ส่งทั้ง productId และ expirationDate */}
                    <button
                      onClick={() => handleRemoveItem(item.id, item.expirationDate)}
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200 p-1.5 rounded-full"
                      title="ລຶບສິນຄ້າ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Item Content */}
                  <div className="flex gap-3">
                    {/* Item Image */}
                    {item.images?.[0]?.url ? (
                      <img
                        src={item.images[0].url}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 flex items-center justify-center rounded-lg flex-shrink-0 text-xs text-gray-500">
                        <Package2 className="w-6 h-6 text-gray-400" />
                      </div>
                    )}

                    {/* Item Details */}
                    <div className="flex-grow">
                      <p className="font-semibold text-gray-800 mb-1 line-clamp-1">
                        {item.name}
                      </p>
                      
                      {/* ✅ ปรับปรุง: แสดงวันหมดอายุด้วยสีและ status */}
                      <div className={`flex items-center text-xs mb-2 ${
                        expirationStatus.color === "red" 
                          ? "text-red-600 font-medium"
                          : expirationStatus.color === "orange"
                          ? "text-orange-600 font-medium"
                          : expirationStatus.color === "yellow"
                          ? "text-yellow-600 font-medium"
                          : "text-gray-500"
                      }`}>
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>ວັນໝົດອາຍຸ: {formatDate(item.expirationDate)}</span>
                        {expirationStatus.text !== formatDate(item.expirationDate) && (
                          <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-gray-100">
                            ({expirationStatus.text})
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center mt-1">
                        <div className="flex items-center border rounded-lg overflow-hidden bg-gray-50">
                          {/* ✅ แก้ไข: ส่งทั้ง productId และ expirationDate */}
                          <button
                            onClick={() => {
                              if (item.quantity > 1) {
                                handleUpdateQuantity(item.id, item.expirationDate, item.quantity - 1);
                              }
                            }}
                            disabled={item.quantity <= 1}
                            className="px-2 py-1 flex items-center justify-center hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>

                          <div
                            onClick={() => {
                              // ✅ แก้ไข: เก็บทั้ง productId และ expirationDate
                              setActiveItem({ id: item.id, expirationDate: item.expirationDate });
                              setTempQty(item.quantity);
                            }}
                            className="w-14 flex items-center justify-center relative group cursor-pointer"
                          >
                            <input
                              type="text"
                              readOnly
                              value={item.quantity}
                              className="w-full text-center bg-transparent py-1 cursor-pointer"
                            />
                            <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-blue-50 transition-opacity">
                              <Edit2 className="w-3 h-3 text-blue-500" />
                            </span>
                          </div>

                          {/* ✅ แก้ไข: ส่งทั้ง productId และ expirationDate */}
                          <button
                            onClick={() => {
                              if (item.quantity < 9999) {
                                handleUpdateQuantity(item.id, item.expirationDate, item.quantity + 1);
                              }
                            }}
                            disabled={item.quantity >= 9999}
                            className="px-2 py-1 flex items-center justify-center hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {item.price && (
                          <div className="ml-auto text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {item.price.toLocaleString()} ₭
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-xs text-gray-500">
                                {(item.price * item.quantity).toLocaleString()} ₭
                                ລວມ
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-auto">
        <div className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-100">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">ຈຳນວນລາຍການ:</span>
            <span className="font-medium text-gray-800">
              {getQuantityProduct()} ລາຍການ
            </span>
          </div>

          {totalPrice > 0 && (
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">ມູນຄ່າລວມ:</span>
              <span className="font-bold text-blue-700 text-lg">
                {totalPrice.toLocaleString()} ₭
              </span>
            </div>
          )}

          <div className="mt-2 pt-2 border-t border-blue-200">
            <p className="text-xs text-gray-500 text-center">
              ກະລຸນາກວດສອບສິນຄ້າຂອງທ່ານກ່ອນດຳເນີນການເບີກສິນຄ້າ
            </p>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          onClick={handleCartCheckout}
          disabled={carts.length === 0}
          className={`w-full py-3 rounded-lg font-medium shadow-md transition-all duration-200 flex items-center justify-center ${
            carts.length === 0
              ? "bg-gray-300 cursor-not-allowed text-gray-500"
              : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white"
          }`}
        >
          {carts.length === 0 ? (
            "ກະຕ່າວ່າງເປົ່າ"
          ) : (
            <>
              <ShoppingCart className="w-4 h-4 mr-2" /> ດຳເນີນການເບີກສິນຄ້າ
            </>
          )}
        </button>
      </div>

      {/* ✅ แก้ไข: Number Pad Modal */}
      {activeItem && (
        <NumberPadModal
          value={tempQty}
          onChange={(val) => setTempQty(val)}
          onClose={() => setActiveItem(null)}
          onSubmit={() => {
            handleUpdateQuantity(activeItem.id, activeItem.expirationDate, tempQty);
            setActiveItem(null);
          }}
        />
      )}
    </div>
  );
};

export default CartCard;