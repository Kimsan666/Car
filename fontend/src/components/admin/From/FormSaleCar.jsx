// src/page/admin/Management/SaleCar.jsx
import React, { useState, useEffect } from "react";
import useCarStore from "../../../Store/car-store";
import { removeSaleCar } from "../../../api/SaleCar"; // ແກ້ไຂ import ໃຫ້ຖືກຕ້ອງ
import { toast } from "react-toastify";
import {
  Trash,
  Edit,
  Search,
  ChevronDown,
  X,
  Eye,
  Plus,
  Filter,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Car,
  DollarSign,
  Calendar,
  Palette,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const FormSaleCar = () => {
  const token = useCarStore((state) => state.token);
  const brands = useCarStore((state) => state.brands) || [];
  const colors = useCarStore((state) => state.colors) || [];
  const types = useCarStore((state) => state.types) || [];
  const brandAndModels = useCarStore((state) => state.brandAndModels) || [];
  const saleCars = useCarStore((state) => state.salecars) || [];
  const navigate = useNavigate();

  const getBrand = useCarStore((state) => state.getBrand);
  const getColor = useCarStore((state) => state.getColor);
  const getType = useCarStore((state) => state.getType);
  const getBrandAndModel = useCarStore((state) => state.getBrandAndModel);
  const getSaleCars = useCarStore((state) => state.getSaleCars);

  // Search states
  const [searchTerm, setSearchTerm] = useState("");

  // Filter states
  const [filterBrandSearch, setFilterBrandSearch] = useState("");
  const [filterModelSearch, setFilterModelSearch] = useState("");
  const [filterColorSearch, setFilterColorSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedFilterBrand, setSelectedFilterBrand] = useState(null);
  const [selectedFilterModel, setSelectedFilterModel] = useState(null);
  const [selectedFilterColor, setSelectedFilterColor] = useState(null);

  // Dropdown visibility states
  const [showFilterBrandDropdown, setShowFilterBrandDropdown] = useState(false);
  const [showFilterModelDropdown, setShowFilterModelDropdown] = useState(false);
  const [showFilterColorDropdown, setShowFilterColorDropdown] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  // Price range filter
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          getBrand(),
          getColor(),
          getType(),
          getBrandAndModel(),
          getSaleCars(),
        ]);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [getBrand, getColor, getType, getBrandAndModel, getSaleCars]);

  // ສ້າງລາຍການແບຣນຈາກ SaleCar ທີ່ມີຢູ່ຈິງ (ບໍ່ຊ້ຳກັນ)
  const availableBrandsFromSaleCars = React.useMemo(() => {
    const brandsSet = new Set();
    const uniqueBrands = [];
    
    saleCars.forEach(saleCar => {
      if (saleCar.car?.brandCars) {
        const brandKey = saleCar.car.brandCars.id;
        if (!brandsSet.has(brandKey)) {
          brandsSet.add(brandKey);
          uniqueBrands.push(saleCar.car.brandCars);
        }
      }
    });
    
    return uniqueBrands.sort((a, b) => a.name.localeCompare(b.name));
  }, [saleCars]);

  // ສ້າງລາຍການລຸ້ນຈາກ SaleCar ທີ່ມີຢູ່ຈິງ (ກັ່ນຟອງຕາມແບຣນທີ່ເລືອກ)
  const availableModelsFromSaleCars = React.useMemo(() => {
    const modelsSet = new Set();
    const uniqueModels = [];
    
    saleCars.forEach(saleCar => {
      if (saleCar.car?.brandAndModels) {
        // ຖ້າເລືອກແບຣນແລ້ວ, ກັ່ນຕອງລຸ້ນທີ່ຕົງກັບແບຣນນັ້ນເທົ່ານັ້ນ
        if (selectedFilterBrand) {
          if (saleCar.car.brandCarsId === selectedFilterBrand.id || 
              saleCar.car.brandCars?.id === selectedFilterBrand.id) {
            const modelKey = saleCar.car.brandAndModels.id;
            if (!modelsSet.has(modelKey)) {
              modelsSet.add(modelKey);
              uniqueModels.push(saleCar.car.brandAndModels);
            }
          }
        } else {
          // ຖ້າບໍ່ໄດ້ເລືອກແບຣນ, ສະແດງລຸ້ນທັງໝົດ
          const modelKey = saleCar.car.brandAndModels.id;
          if (!modelsSet.has(modelKey)) {
            modelsSet.add(modelKey);
            uniqueModels.push(saleCar.car.brandAndModels);
          }
        }
      }
    });
    
    return uniqueModels.sort((a, b) => a.modelCar.localeCompare(b.modelCar));
  }, [saleCars, selectedFilterBrand]);

  // ສ້າງລາຍການສີຈາກ SaleCar ທີ່ມີຢູ່ຈິງ (ບໍ່ຊ້ຳກັນ)
  const availableColorsFromSaleCars = React.useMemo(() => {
    const colorsSet = new Set();
    const uniqueColors = [];
    
    saleCars.forEach(saleCar => {
      if (saleCar.colorCar) {
        const colorKey = saleCar.colorCar.id;
        if (!colorsSet.has(colorKey)) {
          colorsSet.add(colorKey);
          uniqueColors.push(saleCar.colorCar);
        }
      }
    });
    
    return uniqueColors.sort((a, b) => a.name.localeCompare(b.name));
  }, [saleCars]);

  // Debug log ເພື່ອກວດສອບ structure ຂໍ້ມູນ
  useEffect(() => {
    if (saleCars.length > 0) {
      console.log("SaleCars sample data:", saleCars[0]);
      console.log("Available brands from SaleCars:", availableBrandsFromSaleCars);
      console.log("Available models from SaleCars:", availableModelsFromSaleCars);
      console.log("Available colors from SaleCars:", availableColorsFromSaleCars);
    }
  }, [saleCars, availableBrandsFromSaleCars, availableModelsFromSaleCars, availableColorsFromSaleCars]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    selectedFilterBrand,
    selectedFilterModel,
    selectedFilterColor,
    filterStatus,
    priceRange,
  ]);

  // Filter functions for search dropdowns - ໃຊ້ແບຣນຈາກ SaleCar ແທນ
  const filteredFilterBrands = availableBrandsFromSaleCars
    .filter((brand) =>
      brand.name.toLowerCase().includes(filterBrandSearch.toLowerCase())
    )
    .slice(0, 10);

  const filteredFilterColors = availableColorsFromSaleCars
    .filter((color) =>
      color.name.toLowerCase().includes(filterColorSearch.toLowerCase())
    )
    .slice(0, 10);

  // Filter models based on selected filter brand
  const filteredFilterModels = availableModelsFromSaleCars
    .filter((model) =>
      model.modelCar.toLowerCase().includes(filterModelSearch.toLowerCase())
    )
    .slice(0, 10);

  // Helper function to format number with commas
  const formatNumberWithCommas = (value) => {
    if (!value) return "";
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Helper function to parse formatted number
  const parseFormattedNumber = (value) => {
    if (!value) return 0;
    return parseFloat(value.toString().replace(/,/g, ""));
  };

  // Enhanced car filtering logic - ແກ้ໄຂການຄົ້ນຫາແບຣນ
  const filteredSaleCars = saleCars.filter((saleCar) => {
    // General search filter
    const matchesSearch =
      !searchTerm ||
      saleCar.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      saleCar.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      saleCar.car?.brandCars?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      saleCar.car?.brandAndModels?.modelCar
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      saleCar.colorCar?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      saleCar.car?.typecar?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      saleCar.vin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      saleCar.engineNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    // ແກ້ໄຂ Brand filter - ໃຊ້ຂໍ້ມູນຈາກ saleCar.car.brandCars
    const matchesBrand =
      !selectedFilterBrand ||
      (saleCar.car?.brandCars?.id === selectedFilterBrand.id) ||
      (saleCar.car?.brandCarsId === selectedFilterBrand.id);

    // ແກ້ໄຂ Model filter - ໃຊ້ຂໍ້ມູນຈາກ saleCar.car.brandAndModels
    const matchesModel =
      !selectedFilterModel ||
      (saleCar.car?.brandAndModels?.id === selectedFilterModel.id) ||
      (saleCar.car?.brandAndModelsId === selectedFilterModel.id);

    // Color filter
    const matchesColor =
      !selectedFilterColor || 
      (saleCar.colorCar?.id === selectedFilterColor.id) ||
      (saleCar.colorCarId === selectedFilterColor.id);

    // Status filter
    const matchesStatus = !filterStatus || saleCar.status === filterStatus;

    // Price range filter
    const price = saleCar.price || 0;
    const minPrice = priceRange.min ? parseFormattedNumber(priceRange.min) : 0;
    const maxPrice = priceRange.max ? parseFormattedNumber(priceRange.max) : Infinity;
    const matchesPriceRange = price >= minPrice && price <= maxPrice;

    return (
      matchesSearch &&
      matchesBrand &&
      matchesModel &&
      matchesColor &&
      matchesStatus &&
      matchesPriceRange
    );
  });

  // Pagination calculations
  const totalItems = filteredSaleCars.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSaleCars = filteredSaleCars.slice(startIndex, endIndex);

  // Items per page options
  const itemsPerPageOptions = [10, 20, 30, 40, 50];

  // Status options
  const statusOptions = [
    { value: "", label: "ທັງໝົດ" },
    { value: "Available", label: "ມີຢູ່" },
    { value: "Sold", label: "ຂາຍແລ້ວ" },
    { value: "Reserved", label: "ຈອງແລ້ວ" },
    { value: "Maintenance", label: "ບຳລຸງຮັກສາ" },
  ];

  // Handle filter selections - ແກ້ໄຂການເລືອກແບຣນ
  const handleFilterBrandSelect = (brand) => {
    setSelectedFilterBrand(brand);
    setFilterBrandSearch(brand.name);
    setShowFilterBrandDropdown(false);
    // Reset model when brand changes
    setSelectedFilterModel(null);
    setFilterModelSearch("");
  };

  const handleFilterModelSelect = (model) => {
    setSelectedFilterModel(model);
    setFilterModelSearch(model.modelCar);
    setShowFilterModelDropdown(false);
  };

  const handleFilterColorSelect = (color) => {
    setSelectedFilterColor(color);
    setFilterColorSearch(color.name);
    setShowFilterColorDropdown(false);
  };

  // Handle dropdown blur events
  const handleFilterBrandBlur = () => {
    setTimeout(() => {
      if (filterBrandSearch && !selectedFilterBrand) {
        setFilterBrandSearch("");
      }
      setShowFilterBrandDropdown(false);
    }, 200);
  };

  const handleFilterModelBlur = () => {
    setTimeout(() => {
      if (filterModelSearch && !selectedFilterModel) {
        setFilterModelSearch("");
      }
      setShowFilterModelDropdown(false);
    }, 200);
  };

  const handleFilterColorBlur = () => {
    setTimeout(() => {
      if (filterColorSearch && !selectedFilterColor) {
        setFilterColorSearch("");
      }
      setShowFilterColorDropdown(false);
    }, 200);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setFilterBrandSearch("");
    setFilterModelSearch("");
    setFilterColorSearch("");
    setFilterStatus("");
    setSelectedFilterBrand(null);
    setSelectedFilterModel(null);
    setSelectedFilterColor(null);
    setPriceRange({ min: "", max: "" });
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (items) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);

      if (currentPage <= 3) {
        endPage = Math.min(maxVisiblePages, totalPages);
      }
      if (currentPage >= totalPages - 2) {
        startPage = Math.max(1, totalPages - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchTerm ||
    selectedFilterBrand ||
    selectedFilterModel ||
    selectedFilterColor ||
    filterStatus ||
    priceRange.min ||
    priceRange.max;

  // Statistics calculations
  const totalSaleCars = saleCars.length;
  const availableCars = saleCars.filter(
    (car) => car.status === "Available"
  ).length;
  const soldCars = saleCars.filter((car) => car.status === "Sold").length;
  const reservedCars = saleCars.filter(
    (car) => car.status === "Reserved"
  ).length;

  const handleDelete = async (id) => {
    if (window.confirm("ທ່ານແນ່ໃຈບໍ່ທີ່ຈະລົບລົດຂາຍນີ້?")) {
      try {
        const res = await removeSaleCar(token, id);
        toast.success(res.data?.message || "ລົບສຳເລັດ");
        getSaleCars(); // Reload data
      } catch (err) {
        console.error("Delete error:", err);
        const errorMsg = err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດ";
        toast.error(errorMsg);
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 font-['Noto_Sans_Lao']">
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 font-['Noto_Sans_Lao']">
      <div className="bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">ຈັດການລົດຂາຍ</h1>
              <p className="text-sm text-gray-600">
                ຈັດການລົດທີ່ພ້ອມຂາຍຂອງຮ້ານ
              </p>
            </div>

            <Link
              to="/admin/salecar/create"
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              <span>ເພີ່ມລົດຂາຍໃໝ່</span>
            </Link>
          </div>
        </div>

        <div className="p-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">ລົດທັງໝົດ</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {totalSaleCars}
                  </p>
                </div>
                <div className="p-2 bg-blue-200 rounded-lg">
                  <Car className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">ມີຢູ່</p>
                  <p className="text-2xl font-bold text-green-700">
                    {availableCars}
                  </p>
                </div>
                <div className="p-2 bg-green-200 rounded-lg">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">ຂາຍແລ້ວ</p>
                  <p className="text-2xl font-bold text-red-700">{soldCars}</p>
                </div>
                <div className="p-2 bg-red-200 rounded-lg">
                  <DollarSign className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">ຈອງແລ້ວ</p>
                  <p className="text-2xl font-bold text-yellow-700">
                    {reservedCars}
                  </p>
                </div>
                <div className="p-2 bg-yellow-200 rounded-lg">
                  <Calendar className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ຄົ້ນຫາທົ່ວໄປ (ຊື່, ປ້າຍທະບຽນ...)"
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>ລ້າງການຄົ້ນຫາ</span>
                </button>
              )}
            </div>

            {/* Advanced Filters */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="h-4 w-4 text-gray-600" />
                <h3 className="text-sm font-medium text-gray-700">
                  ການກັ່ນຕອງແບບລະອຽດ
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {/* Brand Filter - ແກ້ໄຂແລ້ວ */}
                <div className="relative">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    ແບຣນ
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={filterBrandSearch}
                      onChange={(e) => {
                        setFilterBrandSearch(e.target.value);
                        setShowFilterBrandDropdown(true);
                        // Clear selection if user types
                        if (selectedFilterBrand && e.target.value !== selectedFilterBrand.name) {
                          setSelectedFilterBrand(null);
                        }
                      }}
                      onFocus={() => setShowFilterBrandDropdown(true)}
                      onBlur={handleFilterBrandBlur}
                      placeholder="ເລືອກແບຣນ..."
                      className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-10 ${
                        selectedFilterBrand
                          ? "border-green-300 bg-green-50"
                          : "border-gray-300"
                      }`}
                      autoComplete="off"
                    />
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    {selectedFilterBrand && (
                      <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    )}
                  </div>

                  {showFilterBrandDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                      {filteredFilterBrands.length > 0 ? (
                        filteredFilterBrands.map((brand) => (
                          <div
                            key={brand.id}
                            onMouseDown={() => handleFilterBrandSelect(brand)}
                            className={`px-3 py-2 text-sm hover:bg-emerald-50 cursor-pointer border-b last:border-b-0 ${
                              selectedFilterBrand?.id === brand.id
                                ? "bg-emerald-100 text-emerald-800"
                                : ""
                            }`}
                          >
                            <div className="font-medium">{brand.name}</div>
                            <div className="text-xs text-gray-500">
                              {saleCars.filter(sc => sc.car?.brandCars?.id === brand.id).length} ຄັນ
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">
                          ບໍ່ພົບແບຣນທີ່ຄົ້ນຫາ
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Model Filter - ແກ້ໄຂແລ້ວ */}
                <div className="relative">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    ລຸ້ນ
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={filterModelSearch}
                      onChange={(e) => {
                        setFilterModelSearch(e.target.value);
                        setShowFilterModelDropdown(true);
                        // Clear selection if user types
                        if (selectedFilterModel && e.target.value !== selectedFilterModel.modelCar) {
                          setSelectedFilterModel(null);
                        }
                      }}
                      onFocus={() => setShowFilterModelDropdown(true)}
                      onBlur={handleFilterModelBlur}
                      placeholder={
                        selectedFilterBrand ? "ເລືອກລຸ້ນ..." : "ເລືອກແບຣນກ່ອນ"
                      }
                      disabled={!selectedFilterBrand}
                      className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-10 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                        selectedFilterModel
                          ? "border-green-300 bg-green-50"
                          : "border-gray-300"
                      }`}
                      autoComplete="off"
                    />
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    {selectedFilterModel && (
                      <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    )}
                  </div>

                  {showFilterModelDropdown && selectedFilterBrand && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                      {filteredFilterModels.length > 0 ? (
                        filteredFilterModels.map((model) => (
                          <div
                            key={model.id}
                            onMouseDown={() => handleFilterModelSelect(model)}
                            className={`px-3 py-2 text-sm hover:bg-emerald-50 cursor-pointer border-b last:border-b-0 ${
                              selectedFilterModel?.id === model.id
                                ? "bg-emerald-100 text-emerald-800"
                                : ""
                            }`}
                          >
                            {model.modelCar}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">
                          ບໍ່ພົບລຸ້ນທີ່ຄົ້ນຫາ
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Color Filter - ແກ້ໄຂແລ້ວ */}
                <div className="relative">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    ສີລົດ
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={filterColorSearch}
                      onChange={(e) => {
                        setFilterColorSearch(e.target.value);
                        setShowFilterColorDropdown(true);
                        // Clear selection if user types
                        if (selectedFilterColor && e.target.value !== selectedFilterColor.name) {
                          setSelectedFilterColor(null);
                        }
                      }}
                      onFocus={() => setShowFilterColorDropdown(true)}
                      onBlur={handleFilterColorBlur}
                      placeholder="ເລືອກສີລົດ..."
                      className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-10 ${
                        selectedFilterColor
                          ? "border-green-300 bg-green-50"
                          : "border-gray-300"
                      }`}
                      autoComplete="off"
                    />
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    {selectedFilterColor && (
                      <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    )}
                  </div>

                  {showFilterColorDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                      {filteredFilterColors.length > 0 ? (
                        filteredFilterColors.map((color) => (
                          <div
                            key={color.id}
                            onMouseDown={() => handleFilterColorSelect(color)}
                            className={`px-3 py-2 text-sm hover:bg-emerald-50 cursor-pointer border-b last:border-b-0 ${
                              selectedFilterColor?.id === color.id
                                ? "bg-emerald-100 text-emerald-800"
                                : ""
                            }`}
                          >
                            <div className="font-medium">{color.name}</div>
                            <div className="text-xs text-gray-500">
                              {saleCars.filter(sc => sc.colorCar?.id === color.id).length} ຄັນ
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">
                          ບໍ່ພົບສີທີ່ຄົ້ນຫາ
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    ສະຖານະ
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    ລາຄາຕ່ຳສຸດ
                  </label>
                  <input
                    type="text"
                    value={priceRange.min}
                    onChange={(e) => {
                      const value = formatNumberWithCommas(e.target.value);
                      setPriceRange({ ...priceRange, min: value });
                    }}
                    placeholder="0"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    ລາຄາສູງສຸດ
                  </label>
                  <input
                    type="text"
                    value={priceRange.max}
                    onChange={(e) => {
                      const value = formatNumberWithCommas(e.target.value);
                      setPriceRange({ ...priceRange, max: value });
                    }}
                    placeholder="∞"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-gray-600">
                      ການກັ່ນຕອງທີ່ເປີດໃຊ້:
                    </span>

                    {searchTerm && (
                      <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        ຄົ້ນຫາ: "{searchTerm}"
                        <button
                          onClick={() => setSearchTerm("")}
                          className="hover:text-blue-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}

                    {selectedFilterBrand && (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        ແບຣນ: {selectedFilterBrand.name}
                        <button
                          onClick={() => {
                            setSelectedFilterBrand(null);
                            setFilterBrandSearch("");
                            setSelectedFilterModel(null);
                            setFilterModelSearch("");
                          }}
                          className="hover:text-green-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}

                    {selectedFilterModel && (
                      <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                        ລຸ້ນ: {selectedFilterModel.modelCar}
                        <button
                          onClick={() => {
                            setSelectedFilterModel(null);
                            setFilterModelSearch("");
                          }}
                          className="hover:text-purple-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}

                    {selectedFilterColor && (
                      <span className="inline-flex items-center gap-1 bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded">
                        ສີ: {selectedFilterColor.name}
                        <button
                          onClick={() => {
                            setSelectedFilterColor(null);
                            setFilterColorSearch("");
                          }}
                          className="hover:text-pink-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}

                    {filterStatus && (
                      <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                        ສະຖານະ:{" "}
                        {
                          statusOptions.find((s) => s.value === filterStatus)
                            ?.label
                        }
                        <button
                          onClick={() => setFilterStatus("")}
                          className="hover:text-orange-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}

                    {(priceRange.min || priceRange.max) && (
                      <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">
                        ລາຄາ: {priceRange.min || "0"} - {priceRange.max || "∞"}
                        <button
                          onClick={() => setPriceRange({ min: "", max: "" })}
                          className="hover:text-indigo-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Results Counter */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2 text-sm inline-block">
                  <span className="text-emerald-600 font-medium">
                    ຜົນການຄົ້ນຫາ: {filteredSaleCars.length} ຄັນ
                  </span>
                  <span className="text-xs text-gray-600 ml-2">
                    (ສະແດງ {startIndex + 1}-{Math.min(endIndex, totalItems)} ຈາກ{" "}
                    {totalItems})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ລຳດັບ
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ຮູບພາບ
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ຊື່ລົດ
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ປ້າຍທະບຽນ
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ແບຣນ
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ລຸ້ນ
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ສີ
                  </th>
                 
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ລາຄາຕົ້ນທຶນ
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ລາຄາຂາຍ
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ກຳໄລ
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ສະຖານະ
                  </th>
                  <th className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ຈັດການ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentSaleCars.map((saleCar, index) => {
                  const profit = (saleCar.price || 0) - (saleCar.costPrice || 0);
                  const profitPercentage = saleCar.costPrice ? ((profit / saleCar.costPrice) * 100) : 0;
                  
                  return (
                    <tr key={saleCar.id} className="hover:bg-gray-50">
                      <td className="py-4 px-6 text-sm text-gray-900">
                        {startIndex + index + 1}
                      </td>

                      <td className="py-4 px-6">
                        {saleCar.car?.images && saleCar.car.images.length > 0 ? (
                          <img
                            src={saleCar.car.images[0].secure_url}
                            alt={saleCar.licensePlate || saleCar.name}
                            className="w-16 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-xs text-gray-500">
                              ບໍ່ມີຮູບ
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-6 text-sm text-gray-900 font-medium">
                        <div className="max-w-xs truncate">
                          {saleCar.name || "-"}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-sm text-gray-900 font-medium">
                        {saleCar.licensePlate || "-"}
                      </td>

                      <td className="py-4 px-6 text-sm text-gray-900">
                        <div className="font-medium">
                          {saleCar.car?.brandCars?.name || "-"}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-sm text-gray-900">
                        {saleCar.car?.brandAndModels?.modelCar || "-"}
                      </td>

                      <td className="py-4 px-6 text-sm text-gray-900">
                        {saleCar.colorCar?.name || "-"}
                      </td>

                      

                      <td className="py-4 px-6 text-sm text-gray-900 font-medium">
                        {saleCar.costPrice
                          ? formatNumberWithCommas(saleCar.costPrice) + " ກີບ"
                          : "-"}
                      </td>

                      <td className="py-4 px-6 text-sm text-gray-900 font-medium">
                        {saleCar.price
                          ? formatNumberWithCommas(saleCar.price) + " ກີບ"
                          : "-"}
                      </td>

                      <td className="py-4 px-6 text-sm font-medium">
                        {saleCar.price && saleCar.costPrice ? (
                          <div className={`${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            <div>{formatNumberWithCommas(profit)} ກີບ</div>
                            <div className="text-xs">
                              ({profitPercentage.toFixed(1)}%)
                            </div>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            saleCar.status === "Available"
                              ? "bg-green-100 text-green-800"
                              : saleCar.status === "Sold"
                              ? "bg-red-100 text-red-800"
                              : saleCar.status === "Reserved"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {statusOptions.find((s) => s.value === saleCar.status)
                            ?.label ||
                            saleCar.status ||
                            "ບໍ່ຮູ້"}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-center">
                        <div className="flex justify-center space-x-2">
                          <Link
                            to={`/admin/salecardetail/${saleCar.id}`}
                            className="text-green-600 hover:text-green-800 transition-colors"
                            title="ເບິ່ງລາຍລະອຽດ"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/admin/sale-cars/edit/${saleCar.id}`}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="ແກ້ໄຂ"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(saleCar.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="ລົບ"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {currentSaleCars.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {hasActiveFilters
                  ? "ບໍ່ພົບຂໍ້ມູນທີ່ຕົງກັບການຄົ້ນຫາ"
                  : "ບໍ່ມີລົດຂາຍ"}
              </div>
            )}
          </div>

          {/* Pagination Section */}
          {filteredSaleCars.length > 0 && totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-600">ສະແດງ:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
                  className="border border-gray-300 rounded px-2 py-1"
                >
                  {itemsPerPageOptions.map((option) => (
                    <option key={option} value={option}>
                      {option} ລາຍການ
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-sm text-gray-600">
                ສະແດງ {startIndex + 1} ຫາ {Math.min(endIndex, totalItems)} ຈາກ{" "}
                {totalItems} ລາຍການ
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-md ${
                    currentPage === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </button>

                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-md ${
                    currentPage === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="flex space-x-1">
                  {getPageNumbers().map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 text-sm rounded-md ${
                        currentPage === pageNum
                          ? "bg-emerald-500 text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-md ${
                    currentPage === totalPages
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-md ${
                    currentPage === totalPages
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-600">ໄປຫາໜ້າ:</span>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= totalPages) {
                      handlePageChange(page);
                    }
                  }}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                />
                <span className="text-gray-600">/ {totalPages}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showFilterBrandDropdown ||
        showFilterModelDropdown ||
        showFilterColorDropdown) && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => {
            setShowFilterBrandDropdown(false);
            setShowFilterModelDropdown(false);
            setShowFilterColorDropdown(false);
          }}
        />
      )}
    </div>
  );
};

export default FormSaleCar;