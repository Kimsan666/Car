// src/page/admin/Management/Car.jsx
import React, { useState, useEffect } from "react";
import useCarStore from "../../../Store/car-store";
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
} from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { removeCustomer } from "../../../api/Customer";

const FormCustomer = () => {
  const token = useCarStore((state) => state.token);
  const customers = useCarStore((state) => state.customers);
  const navigate = useNavigate();
  const getCustomer = useCarStore((state) => state.getCustomer);

  // Search states
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    getCustomer();
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Enhanced car filtering logic
  const filteredCars = customers.filter((customer) => {
    // General search filter
    const matchesSearch =
      !searchTerm ||
      customer.fname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lname?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Pagination calculations
  const totalItems = filteredCars.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCars = filteredCars.slice(startIndex, endIndex);

  // Items per page options
  const itemsPerPageOptions = [10, 20, 30, 40, 50];

  const clearAllFilters = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (items) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to first page
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);

      // Adjust if we're near the beginning or end
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
    searchTerm ;

  const handleDelete = async (id) => {
    if (window.confirm("ທ່ານແນ່ໃຈບໍ່ທີ່ຈະລົບລົດນີ້?")) {
      try {
        const res = await removeCustomer(token, id);
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
                  <p className="text-2xl font-bold text-blue-700">
                    {customers.length}
                  </p>
                </div>
                <div className="p-2 bg-blue-200 rounded-lg">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-green-200 rounded-lg">
                  <Eye className="h-6 w-6 text-green-600" />
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
                <h3 className="text-sm font-medium text-gray-700">
                  ການກັ່ນຕອງແບບລະອຽດ
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Items Per Page Selector */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    ຈໍານວນລາຍການຕໍ່ໜ້າ
                  </label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) =>
                      handleItemsPerPageChange(Number(e.target.value))
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {itemsPerPageOptions.map((option) => (
                      <option key={option} value={option}>
                        {option} ລາຍການ
                      </option>
                    ))}
                  </select>
                </div>

                {/* Results Counter */}
                <div className="flex items-end">
                  <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2 text-sm w-full">
                    <span className="text-blue-600 font-medium">
                      ຜົນການຄົ້ນຫາ: {filteredCars.length} ຄັນ
                    </span>
                    <br />
                    <span className="text-xs text-gray-600">
                      ສະແດງ {startIndex + 1}-{Math.min(endIndex, totalItems)}{" "}
                      ຈາກ {totalItems}
                    </span>
                  </div>
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
                    ຊື່ ແລະ ນາມສະກຸນ
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ອີເມວ
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ເບີໂທ
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ທີ່ຢູ່
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ວັນທີ່ສ້າງ
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
                {currentCars.map((car, index) => (
                  <tr key={car.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6 text-sm text-gray-900">
                      {startIndex + index + 1}
                    </td>
                    
                    <td className="py-4 px-6 text-sm text-gray-900">
                      {car.fname} {car.lname}
                    </td>

                    <td className="py-4 px-6 text-sm text-gray-900">
                      {car.email}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900">
                      {car.number}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900">
                      {car.adress}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900">
                      {car.createAt}
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

            {currentCars.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {hasActiveFilters
                  ? "ບໍ່ພົບຂໍ້ມູນທີ່ຕົງກັບການຄົ້ນຫາ"
                  : "ບໍ່ມີຂໍ້ມູນ"}
              </div>
            )}
          </div>

          {/* Pagination Section */}
          {filteredCars.length > 0 && totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Pagination Info */}
              <div className="text-sm text-gray-600">
                ສະແດງ {startIndex + 1} ຫາ {Math.min(endIndex, totalItems)} ຈາກ{" "}
                {totalItems} ລາຍການ
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center space-x-2">
                {/* First Page */}
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

                {/* Previous Page */}
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

                {/* Page Numbers */}
                <div className="flex space-x-1">
                  {getPageNumbers().map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 text-sm rounded-md ${
                        currentPage === pageNum
                          ? "bg-blue-500 text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                {/* Next Page */}
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

                {/* Last Page */}
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

              {/* Quick Page Jump */}
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

export default FormCustomer;
