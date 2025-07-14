import React, { useEffect, useState } from "react";
import useCarStore from "../../../Store/car-store"; // ປ່ຽນຈາກ jim-store
import { useParams } from "react-router-dom";
import {
  Search,
  Filter,
  RefreshCw,
  Car,
  ShoppingBag,
  ChevronDown,
  Grid3X3,
  List,
  Tag,
  CheckCircle2,
  AlertCircle,
  Star,
  ChevronLeft,
  ShoppingBasket,
  Archive,
  Calendar,
  Palette,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const FormCardCar = () => {
  const getCar = useCarStore((state) => state.getCar);
  const cars = useCarStore((state) => state.cars);
  const getBrand = useCarStore((state) => state.getBrand);
  const brands = useCarStore((state) => state.brands);
  const getColor = useCarStore((state) => state.getColor);
  const colors = useCarStore((state) => state.colors);
  const getType = useCarStore((state) => state.getType);
  const types = useCarStore((state) => state.types);
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [filteredCars, setFilteredCars] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");

  // ກັ່ນຕອງເອົາເຉພາະລົດທີ່ມີສະຖານະ Available
  const availableCars = cars.filter(car => car.status === "Available");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await getCar();
      await getBrand();
      await getColor();
      await getType();
      setLoading(false);
    };

    fetchData();
  }, [getCar, getBrand, getColor, getType]);

  useEffect(() => {
    if (availableCars.length > 0) {
      let filtered = [...availableCars];

      setIsSearching(
        searchTerm.trim() !== "" ||
          selectedBrand !== "" ||
          selectedColor !== "" ||
          selectedType !== ""
      );

      if (searchTerm.trim() !== "") {
        filtered = filtered.filter((car) =>
          car.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          car.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (selectedBrand !== "") {
        filtered = filtered.filter(
          (car) => car.brandCarsId === parseInt(selectedBrand)
        );
      }

      if (selectedColor !== "") {
        filtered = filtered.filter(
          (car) => car.colorCarId === parseInt(selectedColor)
        );
      }

      if (selectedType !== "") {
        filtered = filtered.filter(
          (car) => car.typeId === parseInt(selectedType)
        );
      }

      setFilteredCars(filtered);
    } else {
      setFilteredCars([]);
      setIsSearching(false);
    }
  }, [availableCars, searchTerm, selectedBrand, selectedColor, selectedType]);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const handleReset = () => {
    setSearchTerm("");
    setSelectedBrand("");
    setSelectedColor("");
    setSelectedType("");
    setIsSearching(false);
    getCar();
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('lo-LA').format(price);
  };

  const carsToDisplay = isSearching ? filteredCars : availableCars;

  // Car Card Component for Grid View
  const CarCard = ({ car }) => {
    return (
      <div
        onClick={() => navigate(`/car-detail/${car.id}`)}
        className="bg-white rounded-xl border-2 border-gray-100 hover:border-blue-300 p-4 hover:shadow-lg transition-all duration-300 cursor-pointer"
      >
        {/* Car Image */}
        <div className="relative w-full h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden mb-4">
          {car.images?.length > 0 ? (
            <img
              src={car.images[0].url}
              alt={car.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Car className="w-16 h-16" />
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            {car.status}
          </div>
        </div>

        {/* Car Info */}
        <div>
          <h3 className="font-bold text-lg mb-2 text-gray-800 line-clamp-2">
            {car.name}
          </h3>
          
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Tag className="w-4 h-4" />
              <span>{car.licensePlate}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{car.year}</span>
            </div>
            
            {car.brandCars && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Star className="w-4 h-4" />
                <span>{car.brandCars.name}</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="flex justify-between items-center">
            <div className="text-right">
              <div className="text-xl font-bold text-red-600">
                {formatPrice(car.price)} ₭
              </div>
              {car.costPrice && (
                <div className="text-sm text-gray-500">
                  ລາຄາຕົ້ນທຶນ: {formatPrice(car.costPrice)} ₭
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // List view component
  const CarListView = ({ car, index }) => {
    return (
      <div
        onClick={() => navigate(`/car-detail/${car.id}`)}
        className="bg-white rounded-xl border-2 border-gray-100 hover:border-blue-300 p-4 hover:shadow-lg transition-all duration-300 cursor-pointer"
      >
        <div className="flex items-center gap-4">
          {/* Row Number */}
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
            {index + 1}
          </div>

          {/* Car Image */}
          <div className="flex-shrink-0 w-20 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden">
            {car.images?.length > 0 ? (
              <img
                src={car.images[0].url}
                alt={car.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Car className="w-8 h-8" />
              </div>
            )}
          </div>

          {/* Car Info */}
          <div className="flex-grow">
            <div className="flex items-start justify-between">
              <div className="flex-grow">
                <h3 className="font-bold text-lg mb-1 text-gray-800">
                  {car.name}
                </h3>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                  <span className="flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    {car.licensePlate}
                  </span>

                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {car.year}
                  </span>

                  {car.brandCars && (
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      {car.brandCars.name}
                    </span>
                  )}
                </div>

                {/* Additional info */}
                <div className="flex items-center gap-4 text-xs">
                  {car.colorCar && (
                    <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 flex items-center gap-1">
                      <Palette className="w-3 h-3" />
                      {car.colorCar.name}
                    </span>
                  )}
                  
                  {car.typecar && (
                    <span className="px-2 py-1 rounded bg-amber-50 text-amber-700 flex items-center gap-1">
                      <Settings className="w-3 h-3" />
                      {car.typecar.name}
                    </span>
                  )}

                  <span className="px-2 py-1 rounded bg-green-100 text-green-800">
                    {car.status}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="text-right ml-4">
                <div className="text-xl font-bold text-red-600">
                  {formatPrice(car.price)} ₭
                </div>
                {car.costPrice && (
                  <div className="text-sm text-gray-500">
                    ຕົ້ນທຶນ: {formatPrice(car.costPrice)} ₭
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {car.description && (
              <div className="mt-2 text-sm text-gray-600 line-clamp-2">
                {car.description}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="font-phetsarath w-full min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-700 to-purple-700 text-white px-6 py-6 shadow-xl">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center mb-4 md:mb-0">
              <button
                onClick={() => navigate(-1)}
                className="mr-4 hover:bg-blue-600 p-2 rounded-full transition-colors duration-200"
              >
                <ChevronLeft className="h-10 w-10" />
              </button>
              <h1 className="text-3xl font-bold flex items-center">
                <Car className="mr-3 h-8 w-8" />
                <span>ລົດຂາຍ</span>
              </h1>
            </div>
            <div className="flex gap-3">
              <div className="bg-white bg-opacity-20 rounded-lg px-4 py-3 flex items-center backdrop-blur-sm">
                <Car className="h-5 w-5 mr-2" />
                <span className="font-medium">
                  ລົດທັງໝົດ: {availableCars.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="w-full">
          {/* Enhanced Search and Filter Bar */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Search className="h-6 w-6 mr-3 text-blue-600" />
                ຄົ້ນຫາລົດ
              </h2>

              <div className="flex items-center gap-3">
                {/* View Mode Toggle */}
                <div className="bg-gray-100 rounded-lg p-1 flex">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md transition-all duration-200 ${
                      viewMode === "grid"
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-gray-600 hover:text-blue-600"
                    }`}
                    title="ມຸມມອງແບບກະຕາດ"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md transition-all duration-200 ${
                      viewMode === "list"
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-gray-600 hover:text-blue-600"
                    }`}
                    title="ມຸມມອງແບບລາຍການ"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200 bg-gray-100 hover:bg-blue-50 px-4 py-2 rounded-lg"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  ຕົວກອງ
                  <ChevronDown
                    className={`h-4 w-4 ml-2 transition-transform duration-200 ${
                      showFilters ? "transform rotate-180" : ""
                    }`}
                  />
                </button>
              </div>
            </div>

            <form onSubmit={handleSearch}>
              <div className="relative mb-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ຄົ້ນຫາຕາມຊື່ລົດ ຫຼື ປ້າຍທະບຽນ..."
                  className="w-full p-4 border border-gray-200 rounded-xl pl-12 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-lg"
                />
                <Search className="absolute top-4.5 left-4 h-5 w-5 text-gray-400" />
              </div>

              {showFilters && (
                <div className="mt-6 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-100 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ຍີ່ຫໍ້
                      </label>
                      <select
                        value={selectedBrand}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        <option value="">ທັງໝົດ</option>
                        {brands.map((brand) => (
                          <option key={brand.id} value={brand.id}>
                            {brand.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ສີ
                      </label>
                      <select
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        <option value="">ທັງໝົດ</option>
                        {colors.map((color) => (
                          <option key={color.id} value={color.id}>
                            {color.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ປະເພດ
                      </label>
                      <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        <option value="">ທັງໝົດ</option>
                        {types.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:self-end">
                      <button
                        type="button"
                        onClick={handleReset}
                        className="w-full px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        ລ້າງຕົວກອງ
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Cars Display */}
          {loading ? (
            <div className="w-full py-20 flex flex-col items-center justify-center bg-white rounded-2xl shadow-lg">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-700 mb-6"></div>
              <p className="text-gray-600 text-lg">ກຳລັງໂຫລດຂໍ້ມູນ...</p>
            </div>
          ) : (
            <>
              {isSearching && (
                <div className="mb-6 px-2">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-700 font-medium">
                      ພົບ{" "}
                      <span className="font-bold text-xl">
                        {filteredCars.length}
                      </span>{" "}
                      ລາຍການ
                      {searchTerm && <span> ສຳລັບ "{searchTerm}"</span>}
                      {selectedBrand && <span> ໃນຍີ່ຫໍ້ທີ່ເລືອກ</span>}
                      {selectedColor && <span> ໃນສີທີ່ເລືອກ</span>}
                      {selectedType && <span> ໃນປະເພດທີ່ເລືອກ</span>}
                    </p>
                  </div>
                </div>
              )}

              {/* Grid/List View */}
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {carsToDisplay.length > 0 ? (
                    carsToDisplay.map((car, index) => (
                      <CarCard key={`${car.id}-${index}`} car={car} />
                    ))
                  ) : (
                    <div className="col-span-full h-64 flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 shadow-lg">
                      <Car className="h-16 w-16 text-gray-300 mb-4" />
                      <p className="text-2xl text-gray-500 font-medium mb-2">
                        {isSearching
                          ? "ບໍ່ພົບລົດທີ່ຄົ້ນຫາ"
                          : "ບໍ່ມີລົດຂາຍ"}
                      </p>
                      {isSearching && (
                        <button
                          onClick={handleReset}
                          className="mt-4 px-6 py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg flex items-center transition-colors duration-200"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          ລ້າງຕົວກອງ
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4 mb-8">
                  {carsToDisplay.length > 0 ? (
                    carsToDisplay.map((car, index) => (
                      <CarListView
                        key={`${car.id}-${index}`}
                        car={car}
                        index={index}
                      />
                    ))
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 shadow-lg">
                      <Car className="h-16 w-16 text-gray-300 mb-4" />
                      <p className="text-2xl text-gray-500 font-medium mb-2">
                        {isSearching
                          ? "ບໍ່ພົບລົດທີ່ຄົ້ນຫາ"
                          : "ບໍ່ມີລົດຂາຍ"}
                      </p>
                      {isSearching && (
                        <button
                          onClick={handleReset}
                          className="mt-4 px-6 py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg flex items-center transition-colors duration-200"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          ລ້າງຕົວກອງ
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormCardCar;