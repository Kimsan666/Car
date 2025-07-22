// src/page/admin/Management/EditSaleCar.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useCarStore from "../../../Store/car-store";
import {
  updateSaleCar,
  readSaleCar,
} from "../../../api/SaleCar"; // ໃຊ້ API ຈາກໄຟລ์ Car.js
import { toast } from "react-toastify";
import {
  ArrowLeft,
  ChevronDown,
  Save,
  RotateCcw,
  Car,
  FileText,
  DollarSign,
  Edit3,
} from "lucide-react";

const EditSaleCar = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // ໃດ້ ID ຈາກ URL
  const token = useCarStore((state) => state.token);
  const cars = useCarStore((state) => state.cars);
  const colors = useCarStore((state) => state.colors);

  const getCar = useCarStore((state) => state.getCar);
  const getColor = useCarStore((state) => state.getColor);

  const [form, setForm] = useState({
    carId: "",
    name: "",
    licensePlate: "",
    year: "",
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
  const [initialLoading, setInitialLoading] = useState(true);

  // ໂຫຼດຂໍ້ມູນເບື້ອງຕົ້ນ
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([getCar(), getColor()]);
      } catch (error) {
        console.error("Error loading initial data:", error);
        toast.error("ບໍ່ສາມາດໂຫຼດຂໍ້ມູນເບື້ອງຕົ້ນໄດ້");
      }
    };
    
    loadInitialData();
  }, [getCar, getColor]);

  // ໂຫຼດຂໍ້ມູນລົດຂາຍທີ່ຕ້ອງການແກ້ໄຂ
  useEffect(() => {
    const loadSaleCarData = async () => {
      if (!id || !token) return;
      
      try {
        setInitialLoading(true);
        const response = await readSaleCar(token, id);
        const saleCarData = response.data;

        // ຕັ້ງຄ່າຂໍ້ມູນໃນຟອມ
        setForm({
          carId: saleCarData.carId?.toString() || "",
          name: saleCarData.name || "",
          licensePlate: saleCarData.licensePlate || "",
          year: saleCarData.year?.toString() || "",
          colorCarId: saleCarData.colorCarId?.toString() || "",
          vin: saleCarData.vin || "",
          engineNumber: saleCarData.engineNumber || "",
          status: saleCarData.status || "Available",
          price: saleCarData.price ? formatNumberWithCommas(saleCarData.price.toString()) : "",
          costPrice: saleCarData.costPrice ? formatNumberWithCommas(saleCarData.costPrice.toString()) : "",
        });

        // ຕັ້ງຄ່າລົດທີ່ເລືອກ
        if (saleCarData.car && cars.length > 0) {
          const selectedCarData = cars.find(car => car.id === saleCarData.carId);
          if (selectedCarData) {
            setSelectedCar(selectedCarData);
            const displayName = `${selectedCarData.brandCars?.name || ''} ${selectedCarData.brandAndModels?.modelCar || ''} - ${selectedCarData.typecar?.name || ''}`.trim();
            setCarSearch(displayName);
          }
        }

        // ຕັ້ງຄ່າສີທີ່ເລືອກ
        if (saleCarData.colorCar && colors.length > 0) {
          const selectedColorData = colors.find(color => color.id === saleCarData.colorCarId);
          if (selectedColorData) {
            setSelectedColor(selectedColorData);
            setColorSearch(selectedColorData.name);
          }
        }

      } catch (error) {
        console.error("Error loading sale car data:", error);
        toast.error("ບໍ່ສາມາດໂຫຼດຂໍ້ມູນລົດຂາຍໄດ້");
        navigate("/admin/salecars");
      } finally {
        setInitialLoading(false);
      }
    };

    if (cars.length > 0 && colors.length > 0) {
      loadSaleCarData();
    }
  }, [id, token, cars, colors, navigate]);

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
      setForm(prev => ({
        ...prev,
        [name]: formattedValue,
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle dropdown selections
  const handleCarSelect = (car) => {
    setSelectedCar(car);
    const displayName = `${car.brandCars?.name || ''} ${car.brandAndModels?.modelCar || ''} - ${car.typecar?.name || ''}`.trim();
    setCarSearch(displayName);
    setForm(prev => ({ ...prev, carId: car.id.toString() }));
    setShowCarDropdown(false);
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setColorSearch(color.name);
    setForm(prev => ({ ...prev, colorCarId: color.id.toString() }));
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
    // Reset ໃຫ້ກັບຄືນຄ່າເດີມ
    window.location.reload();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!selectedCar) {
        toast.error("ກາລຸນາເລືອກລົດ");
        return;
      }

      if (!form.name.trim()) {
        toast.error("ກາລຸນາປ້ອນຊື່ລົດ");
        return;
      }

     

      if (!form.price) {
        toast.error("ກາລຸນາປ້ອນລາຄາຂາຍ");
        return;
      }

      if (!form.costPrice) {
        toast.error("ກາລຸນາປ້ອນລາຄາຕົ້ນທຶນ");
        return;
      }

      // Prepare data for API
      const submitData = {
        carId: parseInt(form.carId),
        name: form.name.trim(),
        licensePlate: form.licensePlate.trim(),
        year: form.year ? parseInt(form.year) : null,
        colorCarId: form.colorCarId ? parseInt(form.colorCarId) : null,
        vin: form.vin?.trim() || null,
        engineNumber: form.engineNumber?.trim() || null,
        status: form.status,
        price: parseFloat(parseFormattedNumber(form.price)),
        costPrice: parseFloat(parseFormattedNumber(form.costPrice)),
      };

      // ກວດສອບວ່າ price ແລະ costPrice ເປັນເລກຫຼືບໍ່
      if (isNaN(submitData.price) || submitData.price <= 0) {
        toast.error("ລາຄາຂາຍຕ້ອງເປັນຕົວເລກແລະມີຄ່າໃຫຍ່ກວ່າ 0");
        return;
      }

      if (isNaN(submitData.costPrice) || submitData.costPrice <= 0) {
        toast.error("ລາຄາຕົ້ນທຶນຕ້ອງເປັນຕົວເລກແລະມີຄ່າໃຫຍ່ກວ່າ 0");
        return;
      }

      const res = await updateSaleCar(token, id, submitData);
      
      if (res && res.data) {
        toast.success(res.data.message || "ອັບເດດສຳເລັດ");
        navigate("/admin/salecars");
      } else {
        toast.success("ອັບເດດສຳເລັດ");
        navigate("/admin/salecars");
      }
    } catch (err) {
      console.error("Error updating sale car:", err);
      
      // ຈັດການ error ໃຫ້ດີຂຶ້ນ
      if (err.response) {
        // Server response error
        const errorMsg = err.response.data?.message || 
                        err.response.data?.error || 
                        `ເກີດຂໍ້ຜິດພາດ: ${err.response.status}`;
        toast.error(errorMsg);
      } else if (err.request) {
        // Network error
        toast.error("ບໍ່ສາມາດເຊື່ອມຕໍ່ກັບເຊີເວີ");
      } else {
        // Other error
        toast.error("ເກີດຂໍ້ຜິດພາດທີ່ບໍ່ຄາດຄິດ");
      }
    } finally {
      setLoading(false);
    }
  };

  // ຄິດໄລ່ກຳໄລ
  const calculateProfit = () => {
    if (form.price && form.costPrice) {
      const price = parseFloat(parseFormattedNumber(form.price));
      const cost = parseFloat(parseFormattedNumber(form.costPrice));
      if (!isNaN(price) && !isNaN(cost)) {
        return {
          profit: price - cost,
          percentage: ((price - cost) / cost) * 100
        };
      }
    }
    return { profit: 0, percentage: 0 };
  };

  const { profit, percentage } = calculateProfit();

  // ສະແດງ loading ໃນຂະນະໂຫຼດຂໍ້ມູນເບື້ອງຕົ້ນ
  if (initialLoading) {
    return (
      <div className="container mx-auto p-4 font-['Noto_Sans_Lao']">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-4"></div>
            <span className="text-lg">ກຳລັງໂຫຼດຂໍ້ມູນ...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 font-['Noto_Sans_Lao']">
      <div className="bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-orange-50 to-yellow-50">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/admin/salecars")}
              className="text-gray-600 hover:text-gray-800 transition-colors"
              type="button"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <Edit3 className="h-6 w-6 text-orange-600" />
            <h1 className="text-2xl font-bold text-gray-800">ແກ້ໄຂລົດຂາຍ</h1>
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
                          setForm(prev => ({ ...prev, carId: "" }));
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
                      autoComplete="off"
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
                          setForm(prev => ({ ...prev, colorCarId: "" }));
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
                      autoComplete="off"
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

                {/* Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ປີ
                  </label>
                  <input
                    type="number"
                    name="year"
                    value={form.year}
                    onChange={handleChange}
                    placeholder="2020"
                    min="1900"
                    max="2030"
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
              {form.price && form.costPrice && profit !== 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className={`text-sm font-medium ${profit > 0 ? 'text-blue-800' : 'text-red-800'}`}>
                    ກຳໄລຄາດຄະເນ: {formatNumberWithCommas(profit.toString())} ກີບ
                  </div>
                  <div className={`text-xs mt-1 ${profit > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    ເປີເຊັນກຳໄລ: {percentage.toFixed(2)}%
                  </div>
                  {profit < 0 && (
                    <div className="text-xs text-red-600 mt-1">
                      ⚠️ ລາຄາຂາຍຕ່ຳກວ່າຕົ້ນທຶນ
                    </div>
                  )}
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
                <span>ລີເຊັດ</span>
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
                className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-yellow-600 hover:from-orange-600 hover:to-yellow-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Save className="h-4 w-4" />
                <span>
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                      ກຳລັງອັບເດດ...
                    </>
                  ) : (
                    "ອັບເດດລົດຂາຍ"
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

export default EditSaleCar;