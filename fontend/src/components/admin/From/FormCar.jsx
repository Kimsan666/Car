// src/page/admin/Management/Car.jsx
import React, { useState, useEffect } from "react";
import useCarStore from "../../../Store/car-store";
import { removeCar } from "../../../api/Car";
import { toast } from "react-toastify";
import { Trash, Edit, Search, ChevronDown, X, Eye, Plus, Filter, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const FormCar = () => {
  const token = useCarStore((state) => state.token);
  const brands = useCarStore((state) => state.brands);
  const colors = useCarStore((state) => state.colors);
  const types = useCarStore((state) => state.types);
  const brandAndModels = useCarStore((state) => state.brandAndModels);
  const cars = useCarStore((state) => state.cars);
  const navigate = useNavigate();
  
  const getBrand = useCarStore((state) => state.getBrand);
  const getColor = useCarStore((state) => state.getColor);
  const getType = useCarStore((state) => state.getType);
  const getBrandAndModel = useCarStore((state) => state.getBrandAndModel);
  const getCar = useCarStore((state) => state.getCar);

  // Search states
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter states
  const [filterBrandSearch, setFilterBrandSearch] = useState("");
  const [filterModelSearch, setFilterModelSearch] = useState("");
  const [selectedFilterBrand, setSelectedFilterBrand] = useState(null);
  const [selectedFilterModel, setSelectedFilterModel] = useState(null);
  
  // Dropdown visibility states
  const [showFilterBrandDropdown, setShowFilterBrandDropdown] = useState(false);
  const [showFilterModelDropdown, setShowFilterModelDropdown] = useState(false);

  useEffect(() => {
    getBrand();
    getColor();
    getType();
    getBrandAndModel();
    getCar();
  }, []);

  // Filter functions for search dropdowns
  const filteredFilterBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(filterBrandSearch.toLowerCase())
  ).slice(0, 5);

  // Filter models based on selected filter brand
  const availableFilterModels = selectedFilterBrand 
    ? brandAndModels.filter(model => model.brandCarsId === selectedFilterBrand.id)
    : brandAndModels;
    
  const filteredFilterModels = availableFilterModels.filter(model =>
    model.modelCar.toLowerCase().includes(filterModelSearch.toLowerCase())
  ).slice(0, 5);

  // Enhanced car filtering logic
  const filteredCars = cars.filter(car => {
    // General search filter
    const matchesSearch = !searchTerm || 
      car.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.brandCars?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.brandAndModels?.modelCar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.colorCar?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.typecar?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.vin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.engineNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    // Brand filter
    const matchesBrand = !selectedFilterBrand || 
      car.brandCarsId === selectedFilterBrand.id;

    // Model filter  
    const matchesModel = !selectedFilterModel ||
      car.brandAndModelsId === selectedFilterModel.id;

    return matchesSearch && matchesBrand && matchesModel;
  });

  // Handle filter brand selection
  const handleFilterBrandSelect = (brand) => {
    setSelectedFilterBrand(brand);
    setFilterBrandSearch(brand.name);
    setShowFilterBrandDropdown(false);
    // Reset model filter when brand changes
    setSelectedFilterModel(null);
    setFilterModelSearch("");
  };

  // Handle filter model selection
  const handleFilterModelSelect = (model) => {
    setSelectedFilterModel(model);
    setFilterModelSearch(model.modelCar);
    setShowFilterModelDropdown(false);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setFilterBrandSearch("");
    setFilterModelSearch("");
    setSelectedFilterBrand(null);
    setSelectedFilterModel(null);
  };

  // Check if any filters are active
  const hasActiveFilters = searchTerm || selectedFilterBrand || selectedFilterModel;

  const handleDelete = async (id) => {
    if (window.confirm("ທ່ານແນ່ໃຈບໍ່ທີ່ຈະລົບລົດນີ້?")) {
      try {
        const res = await removeCar(token, id);
        toast.success(res.data.message);
        getCar();
      } catch (err) {
        console.log(err);
        const errorMsg = err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດ";
        toast.error(errorMsg);
      }
    }
  };

  return (
    <div className="container mx-auto p-4 font-['Noto_Sans_Lao']">
      <div className="bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">ຈັດການລົດ</h1>
              <p className="text-sm text-gray-600">ຈັດການຂໍ້ມູນລົດຂອງຮ້ານ</p>
            </div>
            
            <Link
              to="/admin/car/create"
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              <span>ເພີ່ມລົດໃໝ່</span>
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
                  <p className="text-2xl font-bold text-blue-700">{cars.length}</p>
                </div>
                <div className="p-2 bg-blue-200 rounded-lg">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">ວ່າງ</p>
                  <p className="text-2xl font-bold text-green-700">
                    {cars.filter(car => car.status === 'Available').length}
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
                  <p className="text-2xl font-bold text-red-700">
                    {cars.filter(car => car.status === 'Sold').length}
                  </p>
                </div>
                <div className="p-2 bg-red-200 rounded-lg">
                  <Eye className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">ຈອງແລ້ວ</p>
                  <p className="text-2xl font-bold text-yellow-700">
                    {cars.filter(car => car.status === 'Reserved').length}
                  </p>
                </div>
                <div className="p-2 bg-yellow-200 rounded-lg">
                  <Eye className="h-6 w-6 text-yellow-600" />
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
                  placeholder="ຄົ້ນຫາທົ່ວໄປ (ຊື່, ປ້າຍທະບຽນ, VIN, ແບຣນ...)"
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Clear Filters Button */}
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
                <h3 className="text-sm font-medium text-gray-700">ການກັ່ນຕອງແບບລະອຽດ</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Brand Filter */}
                <div className="relative">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    ກັ່ນຕອງຕາມແບຣນ
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={filterBrandSearch}
                      onChange={(e) => {
                        setFilterBrandSearch(e.target.value);
                        setShowFilterBrandDropdown(true);
                      }}
                      onFocus={() => setShowFilterBrandDropdown(true)}
                      placeholder="ເລືອກແບຣນ..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    />
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    
                    {/* Selected Brand Indicator */}
                    {selectedFilterBrand && (
                      <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFilterBrand(null);
                            setFilterBrandSearch("");
                            setSelectedFilterModel(null);
                            setFilterModelSearch("");
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {showFilterBrandDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                      {filteredFilterBrands.length > 0 ? (
                        filteredFilterBrands.map((brand) => (
                          <div
                            key={brand.id}
                            onClick={() => handleFilterBrandSelect(brand)}
                            className={`px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer border-b last:border-b-0 ${
                              selectedFilterBrand?.id === brand.id ? 'bg-blue-100 text-blue-800' : ''
                            }`}
                          >
                            {brand.name}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">ບໍ່ພົບແບຣນທີ່ຄົ້ນຫາ</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Model Filter */}
                <div className="relative">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    ກັ່ນຕອງຕາມລຸ້ນ
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={filterModelSearch}
                      onChange={(e) => {
                        setFilterModelSearch(e.target.value);
                        setShowFilterModelDropdown(true);
                      }}
                      onFocus={() => setShowFilterModelDropdown(true)}
                      placeholder={selectedFilterBrand ? "ເລືອກລຸ້ນ..." : "ເລືອກແບຣນກ່ອນ"}
                      disabled={!selectedFilterBrand}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    
                    {/* Selected Model Indicator */}
                    {selectedFilterModel && (
                      <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFilterModel(null);
                            setFilterModelSearch("");
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {showFilterModelDropdown && selectedFilterBrand && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                      {filteredFilterModels.length > 0 ? (
                        filteredFilterModels.map((model) => (
                          <div
                            key={model.id}
                            onClick={() => handleFilterModelSelect(model)}
                            className={`px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer border-b last:border-b-0 ${
                              selectedFilterModel?.id === model.id ? 'bg-blue-100 text-blue-800' : ''
                            }`}
                          >
                            {model.modelCar}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">ບໍ່ພົບລຸ້ນທີ່ຄົ້ນຫາ</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Results Counter */}
                <div className="flex items-end">
                  <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2 text-sm">
                    <span className="text-blue-600 font-medium">
                      ຜົນການຄົ້ນຫາ: {filteredCars.length} ຄັນ
                    </span>
                  </div>
                </div>
              </div>

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-gray-600">ການກັ່ນຕອງທີ່ເປີດໃຊ້:</span>
                    
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
                  </div>
                </div>
              )}
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
                    ປ້າຍທະບຽນ
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ແບຣນ/ລຸ້ນ
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ສີ
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ປີ
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ລາຄາ
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
                {filteredCars.map((car, index) => (
                  <tr key={car.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6 text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="py-4 px-6">
                      {car.images && car.images.length > 0 ? (
                        <img
                          src={car.images[0].secure_url}
                          alt={car.licensePlate}
                          className="w-16 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-500">ບໍ່ມີຮູບ</span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900">
                      {car.licensePlate}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900">
                      {car.brandCars?.name} {car.brandAndModels?.modelCar}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900">
                      {car.colorCar?.name}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900">
                      {car.year}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900">
                      {new Intl.NumberFormat('lo-LA').format(car.price)} ₭
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        car.status === 'Available' ? 'bg-green-100 text-green-800' :
                        car.status === 'Sold' ? 'bg-red-100 text-red-800' :
                        car.status === 'Reserved' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {car.status === 'Available' ? 'ວ່າງ' :
                         car.status === 'Sold' ? 'ຂາຍແລ້ວ' :
                         car.status === 'Reserved' ? 'ຈອງແລ້ວ' : 'ບຳລຸງຮັກສາ'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex justify-center space-x-2">
                        <Link
                          to={`/admin/car/${car.id}`}
                          className="text-green-600 hover:text-green-800 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/admin/edit-car/${car.id}`}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(car.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredCars.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {hasActiveFilters ? "ບໍ່ພົບຂໍ້ມູນທີ່ຕົງກັບການຄົ້ນຫາ" : "ບໍ່ມີຂໍ້ມູນ"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showFilterBrandDropdown || showFilterModelDropdown) && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => {
            setShowFilterBrandDropdown(false);
            setShowFilterModelDropdown(false);
          }}
        />
      )}
    </div>
  );
};

export default FormCar;