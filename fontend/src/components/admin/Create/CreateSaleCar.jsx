// src/page/admin/Management/CreateSaleCar.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useCarStore from "../../../Store/car-store";
import {
  saveSaleCar, // เปลี่ยนจาก saveCar เป็น saveSaleCar
} from "../../../api/SaleCar";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  ChevronDown,
  Save,
  RotateCcw,
  Car,
  Palette,
  FileText,
  DollarSign,
} from "lucide-react";

const CreateSaleCar = () => {
  const navigate = useNavigate();
  const token = useCarStore((state) => state.token);
  const cars = useCarStore((state) => state.cars);
  const colors = useCarStore((state) => state.colors);

  const getCar = useCarStore((state) => state.getCar);
  const getColor = useCarStore((state) => state.getColor);

  const [form, setForm] = useState({
    carId: "",
    name: "",
    licensePlate: "",
    colorCarId: "",
    vin: "",
    engineNumber: "",
    status: "Available",
    price: "",
    costPrice: "",
  });

  // Search states for dropdowns
  const [carSearch, setCarSearch] = useState("");
  const [colorSearch, setColorSearch] = useState("");

  // Selected states
  const [selectedCar, setSelectedCar] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  // Dropdown visibility states
  const [showCarDropdown, setShowCarDropdown] = useState(false);
  const [showColorDropdown, setShowColorDropdown] = useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCar();
    getColor();
  }, []);

  // Filter functions
  const filteredCars = cars
    .filter((car) => {
      const searchText = carSearch.toLowerCase();
      return (
        car.brandCars?.name?.toLowerCase().includes(searchText) ||
        car.brandAndModels?.modelCar?.toLowerCase().includes(searchText) ||
        car.typecar?.name?.toLowerCase().includes(searchText)
      );
    })
    .slice(0, 10);

  const filteredColors = colors
    .filter((color) =>
      color.name.toLowerCase().includes(colorSearch.toLowerCase())
    )
    .slice(0, 10);

  // Helper function to format number with commas
  const formatNumberWithCommas = (value) => {
    if (!value) return "";
    const numericValue = value.toString().replace(/[^0-9]/g, "");
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Helper function to remove commas from formatted number
  const parseFormattedNumber = (value) => {
    if (!value) return "";
    return value.toString().replace(/,/g, "");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Format price fields with commas
    if (name === "price" || name === "costPrice") {
      const formattedValue = formatNumberWithCommas(value);
      setForm({
        ...form,
        [name]: formattedValue,
      });
    } else {
      setForm({
        ...form,
        [name]: value,
      });
    }
  };

  // Handle dropdown selections
  const handleCarSelect = (car) => {
    setSelectedCar(car);
    const displayName = `${car.brandCars?.name || ''} ${car.brandAndModels?.modelCar || ''} - ${car.typecar?.name || ''}`.trim();
    setCarSearch(displayName);
    setForm({ ...form, carId: car.id });
    setShowCarDropdown(false);
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setColorSearch(color.name);
    setForm({ ...form, colorCarId: color.id });
    setShowColorDropdown(false);
  };

  // Handle input blur events for validation
  const handleCarBlur = () => {
    setTimeout(() => {
      if (carSearch && !selectedCar) {
        setCarSearch("");
        toast.warning("ກາລຸນາເລືອກລົດຈາກລາຍການທີ່ມີຢູ່");
      }
      setShowCarDropdown(false);
    }, 200);
  };

  const handleColorBlur = () => {
    setTimeout(() => {
      if (colorSearch && !selectedColor) {
        setColorSearch("");
        toast.warning("ກາລຸນາເລືອກສີລົດຈາກລາຍການທີ່ມີຢູ່");
      }
      setShowColorDropdown(false);
    }, 200);
  };

  const resetForm = () => {
    setForm({
      carId: "",
      name: "",
      licensePlate: "",
      colorCarId: "",
      vin: "",
      engineNumber: "",
      status: "Available",
      price: "",
      costPrice: "",
    });
    setCarSearch("");
    setColorSearch("");
    setSelectedCar(null);
    setSelectedColor(null);
    setShowCarDropdown(false);
    setShowColorDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!selectedCar) {
      setLoading(false);
      return toast.error("ກາລຸນາເລືອກລົດ");
    }

    if (!form.name.trim()) {
      setLoading(false);
      return toast.error("ກາລຸນາປ້ອນຊື່ລົດ");
    }



    if (!form.price) {
      setLoading(false);
      return toast.error("ກາລຸນາປ້ອນລາຄາຂາຍ");
    }

    if (!form.costPrice) {
      setLoading(false);
      return toast.error("ກາລຸນາປ້ອນລາຄາຕົ້ນທຶນ");
    }

    try {
      // Prepare data for API
      const submitData = {
        ...form,
        carId: parseInt(form.carId),
        colorCarId: form.colorCarId ? parseInt(form.colorCarId) : null,
        price: parseFloat(parseFormattedNumber(form.price)),
        costPrice: parseFloat(parseFormattedNumber(form.costPrice)),
      };

      const res = await saveSaleCar(token, submitData);
      toast.success(res.data.message);
      navigate("/admin/salecars"); // เปลี่ยน route ตามที่เหมาะสม
    } catch (err) {
      console.log(err);
      const errorMsg = err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດ";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 font-['Noto_Sans_Lao']">
      <div className="bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/admin/salecars")}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">ເພີ່ມລົດຂາຍໃໝ່</h1>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Car Selection Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <div className="w-2 h-6 bg-blue-500 rounded mr-3"></div>
                <Car className="h-5 w-5 mr-2" />
                ເລືອກລົດ
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Car Selection */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ເລືອກລົດທີ່ຕ້ອງການຂາຍ *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={carSearch}
                      onChange={(e) => {
                        setCarSearch(e.target.value);
                        setShowCarDropdown(true);
                        if (selectedCar) {
                          setSelectedCar(null);
                          setForm({ ...form, carId: "" });
                        }
                      }}
                      onFocus={() => setShowCarDropdown(true)}
                      onBlur={handleCarBlur}
                      placeholder="ຄົ້ນຫາລົດ..."
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 pr-10 ${
                        selectedCar
                          ? "border-green-300 bg-green-50 focus:ring-green-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                    />
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    {selectedCar && (
                      <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    )}
                  </div>

                  {showCarDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredCars.length > 0 ? (
                        filteredCars.map((car) => (
                          <div
                            key={car.id}
                            onMouseDown={() => handleCarSelect(car)}
                            className="px-3 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                          >
                            <div className="font-medium text-gray-800">
                              {car.brandCars?.name} {car.brandAndModels?.modelCar}
                            </div>
                            <div className="text-sm text-gray-500">
                              {car.typecar?.name} - {car.description?.slice(0, 50)}...
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-gray-500">
                          ບໍ່ພົບລົດທີ່ຄົ້ນຫາ
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Color Selection */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ເລືອກສີລົດ
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={colorSearch}
                      onChange={(e) => {
                        setColorSearch(e.target.value);
                        setShowColorDropdown(true);
                        if (selectedColor) {
                          setSelectedColor(null);
                          setForm({ ...form, colorCarId: "" });
                        }
                      }}
                      onFocus={() => setShowColorDropdown(true)}
                      onBlur={handleColorBlur}
                      placeholder="ຄົ້ນຫາສີລົດ..."
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 pr-10 ${
                        selectedColor
                          ? "border-green-300 bg-green-50 focus:ring-green-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                    />
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    {selectedColor && (
                      <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    )}
                  </div>

                  {showColorDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredColors.length > 0 ? (
                        filteredColors.map((color) => (
                          <div
                            key={color.id}
                            onMouseDown={() => handleColorSelect(color)}
                            className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                          >
                            {color.name}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-gray-500">
                          ບໍ່ພົບສີທີ່ຄົ້ນຫາ
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Basic Information Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <div className="w-2 h-6 bg-indigo-500 rounded mr-3"></div>
                <FileText className="h-5 w-5 mr-2" />
                ຂໍ້ມູນພື້ນຖານ
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ຊື່ລົດ *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="ເຊັ່ນ: Toyota Camry ສີແດງ"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* License Plate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ປ້າຍທະບຽນ *
                  </label>
                  <input
                    type="text"
                    name="licensePlate"
                    value={form.licensePlate}
                    onChange={handleChange}
                    placeholder="ເຊັ່ນ: ນວ 1234"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    
                  />
                </div>

               

                {/* VIN */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ເລກ VIN
                  </label>
                  <input
                    type="text"
                    name="vin"
                    value={form.vin}
                    onChange={handleChange}
                    placeholder="ເລກ VIN (ຖ້າມີ)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Engine Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ເລກເຄື່ອງຈັກ
                  </label>
                  <input
                    type="text"
                    name="engineNumber"
                    value={form.engineNumber}
                    onChange={handleChange}
                    placeholder="ເລກເຄື່ອງຈັກ (ຖ້າມີ)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ສະຖານະ
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Available">ມີຢູ່</option>
                    <option value="Sold">ຂາຍແລ້ວ</option>
                    <option value="Reserved">ຈອງແລ້ວ</option>
                    <option value="Maintenance">ບຳລຸງຮັກສາ</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Price Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <div className="w-2 h-6 bg-green-500 rounded mr-3"></div>
                <DollarSign className="h-5 w-5 mr-2" />
                ລາຄາ
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sale Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ລາຄາຂາຍ (ກີບ) *
                  </label>
                  <input
                    type="text"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="100,000,000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    ລາຄາທີ່ຈະຂາຍໃຫ້ລູກຄ້າ
                  </div>
                </div>

                {/* Cost Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ລາຄາຕົ້ນທຶນ (ກີບ) *
                  </label>
                  <input
                    type="text"
                    name="costPrice"
                    value={form.costPrice}
                    onChange={handleChange}
                    placeholder="80,000,000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    ລາຄາທີ່ຊື້ມາ/ຕົ້ນທຶນທີ່ໃຊ້
                  </div>
                </div>
              </div>

              {/* Profit Calculation */}
              {form.price && form.costPrice && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm font-medium text-blue-800">
                    ກຳໄລຄາດຄະເນ: {formatNumberWithCommas(
                      (parseFormattedNumber(form.price) - parseFormattedNumber(form.costPrice)).toString()
                    )} ກີບ
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    ເປີເຊັນກຳໄລ: {(
                      ((parseFormattedNumber(form.price) - parseFormattedNumber(form.costPrice)) / parseFormattedNumber(form.costPrice)) * 100
                    ).toFixed(2)}%
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={resetForm}
                disabled={loading}
                className="flex items-center space-x-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4" />
                <span>ລ້າງຟອມ</span>
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/salecars")}
                disabled={loading}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                ຍົກເລີກ
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Save className="h-4 w-4" />
                <span>
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                      ກຳລັງບັນທຶກ...
                    </>
                  ) : (
                    "ບັນທຶກລົດຂາຍ"
                  )}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showCarDropdown || showColorDropdown) && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => {
            setShowCarDropdown(false);
            setShowColorDropdown(false);
          }}
        />
      )}
    </div>
  );
};

export default CreateSaleCar;