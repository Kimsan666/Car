import React, { useState } from "react";
import { X } from "lucide-react";

const CustomNumberKeypad = ({
  isOpen,
  onClose,
  onConfirm,
  initialValue = 1,
  maxValue = 9999,
  title = "ป้อนจำนวน",
}) => {
  const [value, setValue] = useState(initialValue.toString());

  // Reset value when modal opens with new initialValue
  React.useEffect(() => {
    if (isOpen) {
      setValue(initialValue.toString());
    }
  }, [isOpen, initialValue]);

  const handleNumber = (num) => {
    if (
      value === "0" ||
      (value.length === 1 && value === "1" && initialValue === 1)
    ) {
      // Replace if current value is 0 or initial 1
      setValue(num.toString());
    } else {
      // Append number if under max value
      const newValue = value + num.toString();
      if (parseInt(newValue) <= maxValue) {
        setValue(newValue);
      }
    }
  };

  const handleClear = () => {
    setValue("0");
  };

  const handleBackspace = () => {
    if (value.length > 1) {
      setValue(value.slice(0, -1));
    } else {
      setValue("0");
    }
  };

  const handleConfirm = () => {
    const numValue = parseInt(value) || 0;
    if (numValue > 0 && numValue <= maxValue) {
      onConfirm(numValue);
      onClose();
    }
  };

  const handleQuickAdd = (amount) => {
    const currentNum = parseInt(value) || 0;
    const newValue = currentNum + amount;
    if (newValue <= maxValue) {
      setValue(newValue.toString());
    }
  };

  const handleClose = () => {
    setValue(initialValue.toString());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm mx-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Display */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {parseInt(value).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">
              สูงสุด {maxValue.toLocaleString()} หน่วย
            </div>
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-4 gap-3">
            {/* Row 1 */}
            <button
              onClick={() => handleNumber(7)}
              className="h-14 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-lg transition-colors"
            >
              7
            </button>
            <button
              onClick={() => handleNumber(8)}
              className="h-14 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-lg transition-colors"
            >
              8
            </button>
            <button
              onClick={() => handleNumber(9)}
              className="h-14 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-lg transition-colors"
            >
              9
            </button>
            <button
              onClick={() => handleQuickAdd(200)}
              className="h-14 bg-blue-100 hover:bg-blue-200 rounded-xl font-semibold text-blue-700 text-sm transition-colors"
            >
              +200
            </button>

            {/* Row 2 */}
            <button
              onClick={() => handleNumber(4)}
              className="h-14 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-lg transition-colors"
            >
              4
            </button>
            <button
              onClick={() => handleNumber(5)}
              className="h-14 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-lg transition-colors"
            >
              5
            </button>
            <button
              onClick={() => handleNumber(6)}
              className="h-14 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-lg transition-colors"
            >
              6
            </button>
            <button
              onClick={() => handleQuickAdd(100)}
              className="h-14 bg-blue-100 hover:bg-blue-200 rounded-xl font-semibold text-blue-700 text-sm transition-colors"
            >
              +100
            </button>

            {/* Row 3 */}
            <button
              onClick={() => handleNumber(1)}
              className="h-14 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-lg transition-colors"
            >
              1
            </button>
            <button
              onClick={() => handleNumber(2)}
              className="h-14 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-lg transition-colors"
            >
              2
            </button>
            <button
              onClick={() => handleNumber(3)}
              className="h-14 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-lg transition-colors"
            >
              3
            </button>
            <button
              onClick={() => handleQuickAdd(50)}
              className="h-14 bg-blue-100 hover:bg-blue-200 rounded-xl font-semibold text-blue-700 text-sm transition-colors"
            >
              +50
            </button>

            {/* Row 4 */}
            <button
              onClick={() => handleNumber(0)}
              className="h-14 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-lg transition-colors"
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              className="h-14 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center"
            >
              ⌫
            </button>
            <button
              onClick={handleClear}
              className="h-14 bg-red-100 hover:bg-red-200 rounded-xl font-semibold text-red-700 transition-colors"
            >
              AC
            </button>
            <button
              onClick={() => handleQuickAdd(10)}
              className="h-14 bg-blue-100 hover:bg-blue-200 rounded-xl font-semibold text-blue-700 text-sm transition-colors"
            >
              +10
            </button>
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            disabled={parseInt(value) === 0}
            className={`w-full mt-6 h-12 rounded-xl font-semibold  text-white transition-colors ${
              parseInt(value) === 0
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            ตกลง
          </button>
        </div>
      </div>
    </div>
  );
};

// Demo Component to show how to use it
const DemoApp = () => {
  const [isKeypadOpen, setIsKeypadOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Sample product items
  const [items, setItems] = useState([
    { id: 1, name: "สินค้า A", quantity: 5 },
    { id: 2, name: "สินค้า B", quantity: 12 },
    { id: 3, name: "สินค้า C", quantity: 1 },
  ]);

  const handleQuantityClick = (itemIndex) => {
    setSelectedItem(itemIndex);
    setIsKeypadOpen(true);
  };

  const handleQuantityConfirm = (newQuantity) => {
    setItems((prevItems) =>
      prevItems.map((item, index) =>
        index === selectedItem ? { ...item, quantity: newQuantity } : item
      )
    );
    console.log(`Updated quantity for item ${selectedItem} to ${newQuantity}`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        ตัวอย่างการใช้งาน Custom Number Keypad
      </h1>

      {/* Example Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                สินค้า
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                จำนวน
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                จัดการ
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item, index) => (
              <tr key={item.id}>
                <td className="px-6 py-4 text-sm text-gray-900">{item.name}</td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => handleQuantityClick(index)}
                    className="inline-flex items-center px-3 py-1 rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors font-medium min-w-[60px] justify-center"
                  >
                    {item.quantity}
                  </button>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-sm text-gray-500">
                    คลิกที่จำนวนเพื่อแก้ไข
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Custom Number Keypad */}
      <CustomNumberKeypad
        isOpen={isKeypadOpen}
        onClose={() => setIsKeypadOpen(false)}
        onConfirm={handleQuantityConfirm}
        initialValue={selectedItem !== null ? items[selectedItem]?.quantity : 1}
        maxValue={9999}
        title="ป้อนจำนวนสินค้า"
      />

      {/* Usage Instructions */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">วิธีการใช้งาน:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
          <li>คลิกที่ตัวเลขจำนวนในตาราง</li>
          <li>ใช้ keypad เพื่อป้อนจำนวนใหม่</li>
          <li>
            สามารถใช้ปุ่ม +10, +50, +100, +200 เพื่อเพิ่มจำนวนอย่างรวดเร็ว
          </li>
          <li>กด AC เพื่อล้างค่า หรือ ⌫ เพื่อลบตัวเลขที่ป้อนผิด</li>
          <li>กด "ตกลง" เพื่อยืนยัน</li>
        </ol>
      </div>
    </div>
  );
};

export default CustomNumberKeypad;
