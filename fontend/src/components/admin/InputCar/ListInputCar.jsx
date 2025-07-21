import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Plus,
  Download,
  Calendar,
  User,
  Building2,
  RefreshCw,
  AlertTriangle,
  Truck,
  FileText,
} from "lucide-react";
import useCarStore from "../../../Store/car-store";
import { toast } from "react-toastify";
import {
  listInputCars,
  readInputCar,
  removeInputCar,
  updateInputCarStatus,
  searchInputCars,
} from "../../../api/InputCar";
import { useNavigate } from "react-router-dom";

const ListInputCars = () => {
  const { user, token, suppliers, getSupplier } = useCarStore();
  const navigate = useNavigate();

  const [inputCars, setInputCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedInputCar, setSelectedInputCar] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Filter และ Search states
  const [filters, setFilters] = useState({
    status: "",
    supplierId: "",
    orderdById: "",
    dateFrom: "",
    dateTo: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Safe suppliers array
  const safeSuppliers = Array.isArray(suppliers?.data)
    ? suppliers.data
    : Array.isArray(suppliers)
    ? suppliers
    : [];

  useEffect(() => {
    loadInputCars();
    if (safeSuppliers.length === 0) {
      getSupplier();
    }
  }, []);

  // โหลดข้อมูล Input Cars
  const loadInputCars = async () => {
    try {
      setLoading(true);
      const response = await listInputCars(token, filters);
      setInputCars(response.data.data || []);
    } catch (error) {
      console.error("Error loading input cars:", error);
      toast.error("ບໍ່ສາມາດໂຫຼດຂໍ້ມູນລາຍການນຳເຂົ້າໄດ້");
    } finally {
      setLoading(false);
    }
  };

  // ค้นหา Input Cars
  const handleSearch = async () => {
    if (!searchQuery.trim() && Object.values(filters).every(v => !v)) {
      loadInputCars();
      return;
    }

    try {
      setLoading(true);
      const searchData = {
        query: searchQuery.trim(),
        ...filters,
      };
      const response = await searchInputCars(token, searchData);
      setInputCars(response.data.data || []);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error searching input cars:", error);
      toast.error("ບໍ່ສາມາດຄົ້ນຫາໄດ້");
    } finally {
      setLoading(false);
    }
  };

  // Reset filters และ search
  const handleReset = () => {
    setFilters({
      status: "",
      supplierId: "",
      orderdById: "",
      dateFrom: "",
      dateTo: "",
    });
    setSearchQuery("");
    setCurrentPage(1);
    loadInputCars();
  };

  // ดูรายละเอียด
  const handleViewDetails = async (inputCarId) => {
    try {
      setLoading(true);
      const response = await readInputCar(token, inputCarId);
      setSelectedInputCar(response.data.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error("Error loading input car details:", error);
      toast.error("ບໍ່ສາມາດໂຫຼດລາຍລະອຽດໄດ້");
    } finally {
      setLoading(false);
    }
  };

  // เปลี่ยนสถานะ
  const handleStatusChange = async (inputCarId, newStatus) => {
    try {
      setLoading(true);
      const response = await updateInputCarStatus(token, inputCarId, {
        status: newStatus,
      });
      toast.success(response.data.message || "ປ່ຽນສະຖານະສຳເລັດແລ້ວ");
      loadInputCars();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(
        error.response?.data?.message || "ບໍ່ສາມາດປ່ຽນສະຖານະໄດ້"
      );
    } finally {
      setLoading(false);
    }
  };

  // ลบ Input Car
  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setLoading(true);
      const response = await removeInputCar(token, deleteTarget.id);
      toast.success(response.data.message || "ລົບລາຍການນຳເຂົ້າສຳເລັດແລ້ວ");
      loadInputCars();
      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (error) {
      console.error("Error deleting input car:", error);
      toast.error(
        error.response?.data?.message || "ບໍ່ສາມາດລົບລາຍການນຳເຂົ້າໄດ້"
      );
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันสำหรับแสดงสถานะ
  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: {
        label: "ລໍຖ້າຢືນຢັນ",
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Clock,
      },
      CONFIRMED: {
        label: "ຢືນຢັນແລ້ວ",
        className: "bg-blue-100 text-blue-800 border-blue-200",
        icon: CheckCircle,
      },
      RECEIVED: {
        label: "ໄດ້ຮັບແລ້ວ",
        className: "bg-green-100 text-green-800 border-green-200",
        icon: Package,
      },
      CANCELLED: {
        label: "ຍົກເລີກ",
        className: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle,
      },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border font-notosanslao ${config.className}`}
      >
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  // ฟังก์ชันสำหรับแสดงปุ่มตามสถานะ
  const getActionButtons = (inputCar) => {
    const canEdit = ["PENDING"].includes(inputCar.status);
    const canDelete = ["PENDING", "CANCELLED"].includes(inputCar.status);
    const canConfirm = inputCar.status === "PENDING";
    const canCancel = ["PENDING", "CONFIRMED"].includes(inputCar.status);

    return (
      <div className="flex items-center gap-1">
        {/* ดูรายละเอียด */}
        <button
          onClick={() => handleViewDetails(inputCar.id)}
          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="ເບິ່ງລາຍລະອຽດ"
        >
          <Eye size={16} />
        </button>

        {/* แก้ไข */}
        {canEdit && (
          <button
            onClick={() => {
              // Navigate to edit page
              console.log("Edit input car:", inputCar.id);
              toast.info("ຟັງຊັນແກ້ໄຂກຳລັງພັດທະນາ");
            }}
            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="ແກ້ໄຂ"
          >
            <Edit size={16} />
          </button>
        )}

        {/* ຢືນຢັນ */}
        {canConfirm && (
          <button
            onClick={() => handleStatusChange(inputCar.id, "CONFIRMED")}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="ຢືນຢັນ"
          >
            <CheckCircle size={16} />
          </button>
        )}

        {/* ຍົກເລີກ */}
        {canCancel && (
          <button
            onClick={() => handleStatusChange(inputCar.id, "CANCELLED")}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="ຍົກເລີກ"
          >
            <XCircle size={16} />
          </button>
        )}

        {/* ລົບ */}
        {canDelete && (
          <button
            onClick={() => {
              setDeleteTarget(inputCar);
              setShowDeleteModal(true);
            }}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="ລົບ"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    );
  };

  // Pagination
  const totalPages = Math.ceil(inputCars.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInputCars = inputCars.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="font-notosanslao">
              <h1 className="text-2xl font-bold text-gray-900">
                ລາຍການນຳເຂົ້າລົດ
              </h1>
              <p className="text-gray-600 mt-1">
                ຈັດການລາຍການນຳເຂົ້າລົດຈາກຜູ້ສະໜອງ
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/admin/input-cars/create")}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors font-notosanslao"
              >
                <Plus size={20} />
                ສ້າງລາຍການນຳເຂົ້າໃໝ່
              </button>
            </div>
          </div>
        </div>

        {/* Search และ Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="ຄົ້ນຫາລາຍການນຳເຂົ້າ (ຊື່ບໍລິສັດ, ຜູ້ສ້າງ, ລົດ)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-notosanslao"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-notosanslao"
              >
                ຄົ້ນຫາ
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 font-notosanslao"
              >
                <Filter size={16} />
                ກັ່ນຕອງ
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 font-notosanslao"
              >
                <RefreshCw size={16} />
                ລີເຊັດ
              </button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-notosanslao">
                    ສະຖານະ
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters({ ...filters, status: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-notosanslao"
                  >
                    <option value="">ທັງໝົດ</option>
                    <option value="PENDING">ລໍຖ້າຢືນຢັນ</option>
                    <option value="CONFIRMED">ຢືນຢັນແລ້ວ</option>
                    <option value="RECEIVED">ໄດ້ຮັບແລ້ວ</option>
                    <option value="CANCELLED">ຍົກເລີກ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-notosanslao">
                    ຜູ້ສະໜອງ
                  </label>
                  <select
                    value={filters.supplierId}
                    onChange={(e) =>
                      setFilters({ ...filters, supplierId: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-notosanslao"
                  >
                    <option value="">ທັງໝົດ</option>
                    {safeSuppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.companyName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-notosanslao">
                    ວັນທີ່ເລີ່ມ
                  </label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) =>
                      setFilters({ ...filters, dateFrom: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-notosanslao"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-notosanslao">
                    ວັນທີ່ສິ້ນສຸດ
                  </label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) =>
                      setFilters({ ...filters, dateTo: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-notosanslao"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleSearch}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-notosanslao"
                  >
                    ນຳໃຊ້ຕົວກັ່ນ
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "ທັງໝົດ",
              count: inputCars.length,
              color: "blue",
              icon: Truck,
            },
            {
              label: "ລໍຖ້າຢືນຢັນ",
              count: inputCars.filter((ic) => ic.status === "PENDING").length,
              color: "yellow",
              icon: Clock,
            },
            {
              label: "ຢືນຢັນແລ້ວ",
              count: inputCars.filter((ic) => ic.status === "CONFIRMED").length,
              color: "blue",
              icon: CheckCircle,
            },
            {
              label: "ໄດ້ຮັບແລ້ວ",
              count: inputCars.filter((ic) => ic.status === "RECEIVED").length,
              color: "green",
              icon: Package,
            },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 font-notosanslao">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.count}
                    </p>
                  </div>
                  <div
                    className={`p-3 rounded-full bg-${stat.color}-100 text-${stat.color}-600`}
                  >
                    <Icon size={24} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600 font-notosanslao">
                ກຳລັງໂຫຼດ...
              </span>
            </div>
          ) : currentInputCars.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-notosanslao">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-notosanslao">
                      ຜູ້ສະໜອງ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-notosanslao">
                      ຜູ້ສ້າງ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-notosanslao">
                      ຈຳນວນລາຍການ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-notosanslao">
                      ສະຖານະ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-notosanslao">
                      ວັນທີ່ສ້າງ
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider font-notosanslao">
                      ຈັດການ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentInputCars.map((inputCar) => (
                    <tr key={inputCar.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-notosanslao">
                        #{inputCar.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900 font-notosanslao">
                              {inputCar.supplier?.companyName || "ບໍ່ລະບຸ"}
                            </div>
                            {inputCar.supplier?.contactName && (
                              <div className="text-sm text-gray-500 font-notosanslao">
                                {inputCar.supplier.contactName}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900 font-notosanslao">
                              {inputCar.orderdBy?.username || "ບໍ່ລະບຸ"}
                            </div>
                            {inputCar.orderdBy?.employee && (
                              <div className="text-sm text-gray-500 font-notosanslao">
                                {inputCar.orderdBy.employee.firstName}{" "}
                                {inputCar.orderdBy.employee.lastName}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-notosanslao">
                          {inputCar._count?.products || inputCar.quantitytotal || 0}{" "}
                          <span className="text-gray-500 font-notosanslao">ລາຍການ</span>
                        </div>
                        {inputCar._count?.Purches > 0 && (
                          <div className="text-xs text-blue-600 font-notosanslao">
                            {inputCar._count.Purches} ໃບສັ່ງຊື້
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(inputCar.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-notosanslao">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(inputCar.createdAt).toLocaleDateString("lo-LA")}
                        </div>
                        {inputCar.expectedDeliveryDate && (
                          <div className="text-xs text-blue-600 font-notosanslao">
                            ຄາດວ່າ: {new Date(inputCar.expectedDeliveryDate).toLocaleDateString("lo-LA")}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {getActionButtons(inputCar)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Truck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2 font-notosanslao">
                ບໍ່ມີລາຍການນຳເຂົ້າ
              </h3>
              <p className="text-gray-500 font-notosanslao">
                ຍັງບໍ່ມີລາຍການນຳເຂົ້າໃນລະບົບ ຫຼື ບໍ່ພົບຜົນການຄົ້ນຫາ
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-notosanslao"
                  >
                    ກ່ອນໜ້າ
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(currentPage + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-notosanslao"
                  >
                    ຕໍ່ໄປ
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 font-notosanslao">
                      ສະແດງ{" "}
                      <span className="font-medium">{startIndex + 1}</span> ເຖິງ{" "}
                      <span className="font-medium">
                        {Math.min(endIndex, inputCars.length)}
                      </span>{" "}
                      ຈາກ{" "}
                      <span className="font-medium">{inputCars.length}</span>{" "}
                      ລາຍການ
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() =>
                          setCurrentPage(Math.max(currentPage - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-notosanslao"
                      >
                        ກ່ອນໜ້າ
                      </button>
                      {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1;
                        const isCurrentPage = page === currentPage;
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium font-notosanslao ${
                              isCurrentPage
                                ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      <button
                        onClick={() =>
                          setCurrentPage(Math.min(currentPage + 1, totalPages))
                        }
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-notosanslao"
                      >
                        ຕໍ່ໄປ
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedInputCar && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 font-notosanslao">
                  ລາຍລະອຽດລາຍການນຳເຂົ້າ #{selectedInputCar.id}
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 font-notosanslao">
                    ຂໍ້ມູນຜູ້ສະໜອງ
                  </h4>
                  <div className="space-y-2 text-sm font-notosanslao">
                    <div>
                      <span className="font-medium">ບໍລິສັດ:</span>{" "}
                      {selectedInputCar.supplier?.companyName || "ບໍ່ລະບຸ"}
                    </div>
                    <div>
                      <span className="font-medium">ຜູ້ຕິດຕໍ່:</span>{" "}
                      {selectedInputCar.supplier?.contactName || "ບໍ່ລະບຸ"}
                    </div>
                    <div>
                      <span className="font-medium">ໂທລະສັບ:</span>{" "}
                      {selectedInputCar.supplier?.phone || "ບໍ່ລະບຸ"}
                    </div>
                    <div>
                      <span className="font-medium">ອີເມວ:</span>{" "}
                      {selectedInputCar.supplier?.email || "ບໍ່ລະບຸ"}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3 font-notosanslao">
                    ຂໍ້ມູນລາຍການນຳເຂົ້າ
                  </h4>
                  <div className="space-y-2 text-sm font-notosanslao">
                    <div>
                      <span className="font-medium">ຜູ້ສ້າງ:</span>{" "}
                      {selectedInputCar.orderdBy?.username || "ບໍ່ລະບຸ"}
                    </div>
                    <div>
                      <span className="font-medium">ສະຖານະ:</span>{" "}
                      {getStatusBadge(selectedInputCar.status)}
                    </div>
                    <div>
                      <span className="font-medium">ວັນທີ່ສ້າງ:</span>{" "}
                      {new Date(selectedInputCar.createdAt).toLocaleDateString(
                        "lo-LA"
                      )}
                    </div>
                    {selectedInputCar.expectedDeliveryDate && (
                      <div>
                        <span className="font-medium">ຄາດວ່າຈະໄດ້ຮັບ:</span>{" "}
                        {new Date(
                          selectedInputCar.expectedDeliveryDate
                        ).toLocaleDateString("lo-LA")}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Products Table */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 font-notosanslao">
                  ລາຍການສິນຄ້າ
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700 font-notosanslao">
                          ລຳດັບ
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700 font-notosanslao">
                          ລົດ
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 font-notosanslao">
                          ຈຳນວນ
                        </th>
                        {selectedInputCar.status === "RECEIVED" && (
                          <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 font-notosanslao">
                            ຈຳນວນທີ່ໄດ້ຮັບ
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInputCar.products?.map((item, index) => (
                        <tr key={index} className="font-notosanslao">
                          <td className="border border-gray-300 px-4 py-2 text-sm">
                            {index + 1}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-sm">
                            <div className="font-medium">
                              {item.Car?.name || "ບໍ່ລະບຸ"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {item.Car?.licensePlate && `ປ້າຍ: ${item.Car.licensePlate}`}
                              {item.Car?.brandAndModels && 
                                ` | ${item.Car.brandAndModels.BrandCars?.name} ${item.Car.brandAndModels.modelCar}`}
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-sm text-center">
                            {item.quantity}
                          </td>
                          {selectedInputCar.status === "RECEIVED" && (
                            <td className="border border-gray-300 px-4 py-2 text-sm text-center">
                              {item.receivedQuantity || "-"}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr className="font-notosanslao">
                        <td colSpan={selectedInputCar.status === "RECEIVED" ? "3" : "2"} className="border border-gray-300 px-4 py-2 text-sm font-medium text-right">
                          ຈຳນວນລວມ:
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-sm font-medium text-center">
                          {selectedInputCar.quantitytotal || 0}
                        </td>
                        {selectedInputCar.status === "RECEIVED" && (
                          <td className="border border-gray-300 px-4 py-2 text-sm font-medium text-center">
                            {selectedInputCar.products?.reduce((sum, item) => sum + (item.receivedQuantity || 0), 0) || 0}
                          </td>
                        )}
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Related Purchases */}
              {selectedInputCar.Purches && selectedInputCar.Purches.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3 font-notosanslao">
                    ໃບສັ່ງຊື້ທີ່ກ່ຽວຂ້ອງ
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedInputCar.Purches.map((purchase) => (
                      <div key={purchase.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium font-notosanslao">
                              ໃບສັ່ງຊື້ #{purchase.id}
                            </div>
                            <div className="text-sm text-gray-600 font-notosanslao">
                              ສະຖານະ: {purchase.status}
                            </div>
                            <div className="text-sm text-gray-600 font-notosanslao">
                              ຈຳນວນ: {purchase.quantitytotal} ລາຍການ
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 font-notosanslao">
                            {new Date(purchase.createdAt).toLocaleDateString("lo-LA")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-notosanslao"
                >
                  ປິດ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="text-red-500 mr-3" size={24} />
                <h3 className="text-lg font-semibold text-gray-900 font-notosanslao">
                  ຢືນຢັນການລົບ
                </h3>
              </div>
              <p className="text-gray-600 mb-6 font-notosanslao">
                ທ່ານຕ້ອງການລົບລາຍການນຳເຂົ້າ #{deleteTarget.id} ຫຼືບໍ່?
                ການກະທຳນີ້ບໍ່ສາມາດຍົກເລີກໄດ້.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-notosanslao"
                >
                  ຍົກເລີກ
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-notosanslao"
                >
                  ລົບ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListInputCars;