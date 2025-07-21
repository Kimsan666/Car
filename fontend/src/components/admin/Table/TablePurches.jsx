import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  FileText,
  Download,
  Edit,
  Trash2,
  Check,
  X,
  Filter,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import useJimStore from "../../../kaika-Store/jim-store";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { cancelPurchaseOrder } from "../../../api/PuschessOrdeer";

const TablePurches = () => {
  const {
    purchaseOrders,
    isLoading,
    getPurchaseOrders,
    removePurchaseOrder,
    bulkRemovePurchaseOrders,
    approvePurchaseOrder,
    exportToExcel,
    token,
  } = useJimStore();

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    dateFrom: "",
    dateTo: "",
  });

  const [isSearchMode, setIsSearchMode] = useState(false);

  // ✅ เพิ่ม state สำหรับ bulk selection
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

  // ✅ เพิ่ม state สำหรับ pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const navigate = useNavigate();
  const MySwal = withReactContent(Swal);

  // โหลดข้อมูลครั้งแรก
  useEffect(() => {
    if (token) {
      loadPurchaseOrders();
    }
  }, [token]);

  // ✅ Reset pagination เมื่อข้อมูลเปลี่ยน
  useEffect(() => {
    console.log("Purchase orders data changed:", purchaseOrders?.length);
    if (purchaseOrders?.length > 0) {
      // ตรวจสอบว่าหน้าปัจจุบันยังอยู่ในช่วงที่ถูกต้องหรือไม่
      const maxPages = Math.ceil(purchaseOrders.length / itemsPerPage);
      if (currentPage > maxPages && maxPages > 0) {
        console.log("Resetting to page 1 due to data change");
        setCurrentPage(1);
      }
    }
  }, [purchaseOrders?.length, itemsPerPage, currentPage]);

  // ฟังก์ชันโหลดข้อมูล
  const loadPurchaseOrders = async () => {
    try {
      await getPurchaseOrders();
      setIsSearchMode(false);
    } catch (error) {
      console.error("Error loading purchase orders:", error);
      toast.error("ไม่สามารถโหลดข้อมูลใบสั่งซื้อได้");
    }
  };

  // ✅ กรองข้อมูลก่อน
  const filteredPurchaseOrders = useMemo(() => {
    console.log("Processing filters...", { purchaseOrders: purchaseOrders?.length, filters });
    
    if (!Array.isArray(purchaseOrders)) return [];

    let filtered = [...purchaseOrders];

    // กรองตาม search
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim();
      filtered = filtered.filter((order) => {
        const poNumber = `PO-${String(order.id).padStart(6, "0")}`.toLowerCase();
        const companyName = (order.supplier?.companyName || "").toLowerCase();
        const contactName = (order.supplier?.contactName || "").toLowerCase();
        const orderId = order.id.toString();

        return (
          poNumber.includes(searchTerm) ||
          companyName.includes(searchTerm) ||
          contactName.includes(searchTerm) ||
          orderId.includes(searchTerm)
        );
      });
    }

    // กรองตาม status
    if (filters.status) {
      filtered = filtered.filter((order) => order.status === filters.status);
    }

    // กรองตาม dateFrom
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate >= fromDate;
      });
    }

    // กรองตาม dateTo
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate <= toDate;
      });
    }

    console.log("Filtered results:", filtered.length);
    return filtered;
  }, [purchaseOrders, filters]);

  // ✅ คำนวณ pagination แยกต่างหาก
  const paginationData = useMemo(() => {
    const totalItems = filteredPurchaseOrders.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filteredPurchaseOrders.slice(startIndex, endIndex);

    console.log("=== Pagination Debug ===");
    console.log("Total items in filteredPurchaseOrders:", totalItems);
    console.log("Items per page:", itemsPerPage);
    console.log("Current page:", currentPage);
    console.log("Total pages calculated:", totalPages);
    console.log("Start index:", startIndex);
    console.log("End index:", endIndex);
    console.log("Paginated data length:", paginatedData.length);
    console.log("Should show pagination controls:", totalPages > 1);
    console.log("=========================");

    return {
      totalItems,
      totalPages,
      paginatedData,
      startIndex,
      endIndex
    };
  }, [filteredPurchaseOrders, currentPage, itemsPerPage]);

  // ✅ Auto-adjust currentPage หากเกินจำนวนหน้าที่มี
  useEffect(() => {
    if (currentPage > paginationData.totalPages && paginationData.totalPages > 0) {
      console.log("Auto-adjusting current page from", currentPage, "to", paginationData.totalPages);
      setCurrentPage(1); // กลับไปหน้าแรก
    }
  }, [currentPage, paginationData.totalPages]);

  // ✅ Reset current page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedItems(new Set());
    setIsSelectAll(false);
  }, [filters]);

  // ✅ Reset current page when itemsPerPage changes
  useEffect(() => {
    setCurrentPage(1);
    setSelectedItems(new Set());
    setIsSelectAll(false);
  }, [itemsPerPage]);

  // ✅ Bulk selection functions
  const handleSelectItem = (itemId) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedItems(newSelection);

    // Update select all state สำหรับหน้าปัจจุบัน
    const allCurrentPageIds = paginationData.paginatedData.map(order => order.id);
    const allCurrentSelected = allCurrentPageIds.every(id => newSelection.has(id));
    setIsSelectAll(allCurrentSelected && allCurrentPageIds.length > 0);
  };

  const handleSelectAll = () => {
    const newSelection = new Set(selectedItems);
    const currentPageIds = paginationData.paginatedData.map(order => order.id);

    if (isSelectAll) {
      // ยกเลิกการเลือกทั้งหมดในหน้าปัจจุบัน
      currentPageIds.forEach(id => newSelection.delete(id));
      setIsSelectAll(false);
    } else {
      // เลือกทั้งหมดในหน้าปัจจุบัน
      currentPageIds.forEach(id => newSelection.add(id));
      setIsSelectAll(true);
    }
    setSelectedItems(newSelection);
  };

  // ✅ Pagination functions
  const handlePageChange = (newPage) => {
    console.log("Changing page to:", newPage);
    if (newPage >= 1 && newPage <= paginationData.totalPages) {
      setCurrentPage(newPage);
      setSelectedItems(new Set()); // Clear selections when changing page
      setIsSelectAll(false);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    console.log("Changing items per page to:", newItemsPerPage);
    setItemsPerPage(newItemsPerPage);
  };

  // ✅ Bulk delete function
  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) {
      toast.warning(
        <span className="font-notosanslao">ກະລຸນາເລືອກລາຍການທີ່ຕ້ອງການລົບ</span>
      );
      return;
    }

    // ตรวจสอบว่าทั้งหมดเป็น PENDING หรือไม่
    const selectedOrders = filteredPurchaseOrders.filter((order) =>
      selectedItems.has(order.id)
    );
    const nonPendingOrders = selectedOrders.filter(
      (order) => order.status !== "PENDING"
    );

    if (nonPendingOrders.length > 0) {
      toast.error(
        <span className="font-notosanslao">
          ບໍ່ສາມາດລົບໃບສັ່ງຊື້ທີ່ອະນຸມັດແລ້ວ ຫຼື ຍົກເລີກແລ້ວໄດ້ (
          {nonPendingOrders.length} ລາຍການ)
        </span>
      );
      return;
    }

    const result = await MySwal.fire({
      title: (
        <p className="font-notosanslao text-xl">ຢືນຢັນການລົບຫຼາຍລາຍການ?</p>
      ),
      html: (
        <div className="font-notosanslao text-base text-gray-700">
          <p>
            ຈະລົບໃບສັ່ງຊື້ທັງໝົດ{" "}
            <span className="font-bold text-red-600">{selectedItems.size}</span>{" "}
            ລາຍການ
          </p>
          <p className="mt-2 text-sm text-red-500">
            ຂໍ້ມູນນີ້ຈະຖືກລົບຖາວອນ ແລະບໍ່ສາມາດກູ້ຄືນໄດ້!
          </p>
        </div>
      ),
      icon: "warning",
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonText: "ລົບທັງໝົດ",
      cancelButtonText: "ຍົກເລີກ",
      customClass: {
        popup: "font-notosanslao rounded-xl shadow-lg p-6",
        title: "text-red-600",
        confirmButton:
          "bg-red-600 text-white mr-2 px-4 py-2 rounded hover:bg-red-700",
        cancelButton:
          "bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300",
      },
      buttonsStyling: false,
    });

    if (!result.isConfirmed) return;

    setBulkDeleteLoading(true);

    try {
      const idsToDelete = Array.from(selectedItems);
      await bulkRemovePurchaseOrders(idsToDelete);
      setSelectedItems(new Set());
      setIsSelectAll(false);
    } catch (error) {
      console.error("Bulk delete error:", error);
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  // ตรวจสอบว่าเป็น search mode หรือไม่
  useEffect(() => {
    const hasFilters =
      filters.search.trim() ||
      filters.status ||
      filters.dateFrom ||
      filters.dateTo;
    setIsSearchMode(hasFilters);
  }, [filters]);

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      case "RECEIVED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "COMPLETED":
        return "bg-green-200 text-green-900 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "PENDING":
        return <span className="font-notosanslao">ຖ້າອະນຸມັດ</span>;
      case "APPROVED":
        return <span className="font-notosanslao">ອະນຸມັດແລ້ວ</span>;
      case "CANCELLED":
        return <span className="font-notosanslao">ຍົກເລີກແລ້ວ</span>;
      case "RECEIVED":
        return <span className="font-notosanslao">ລໍຖ້າການນຳເຂົ້າ</span>;
      case "COMPLETED":
        return <span className="font-notosanslao">ນຳເຂົ້າແລ້ວ</span>;
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch (error) {
      return "-";
    }
  };

  const handleRefresh = async () => {
    try {
      await loadPurchaseOrders();
      toast.success("ข้อมูลได้รับการอัปเดตแล้ว");
    } catch (error) {
      console.error("Refresh error:", error);
      toast.error("เกิดข้อผิดพลาดในการรีเฟรช");
    }
  };

  const handleClearFilters = () => {
    setFilters({ search: "", status: "", dateFrom: "", dateTo: "" });
    setIsSearchMode(false);
    setSelectedItems(new Set());
    setIsSelectAll(false);
    setCurrentPage(1);
  };

  const confirmAction = (title, message, confirmText = "ยืนยัน") => {
    return MySwal.fire({
      title: <p className="font-notosanslao text-xl">{title}</p>,
      html: (
        <p className="font-notosanslao text-base text-gray-700">{message}</p>
      ),
      icon: "warning",
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonText: confirmText,
      cancelButtonText: "ຍົກເລີກ",
      customClass: {
        popup: "font-notosanslao rounded-xl shadow-lg p-6",
        title: "text-gray-800",
        confirmButton:
          "bg-blue-600 text-white mr-2 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors",
        cancelButton:
          "bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors",
      },
      buttonsStyling: false,
    });
  };

  const handleApprove = async (id, event) => {
    event?.stopPropagation();
    const result = await confirmAction(
      "ຢືນຢັນການອະນຸມັດໃບສັ່ງຊື້?",
      "ທ່ານຕ້ອງການອະນຸມັດໃບສັ່ງຊື້ນີ້ແທ້ ຫຼື ບໍ່?",
      "ອະນຸມັດ"
    );
    if (!result.isConfirmed) return;
    try {
      await approvePurchaseOrder(id);
    } catch (error) {
      console.error("Approve error:", error);
    }
  };

  const handleCancel = async (id, event) => {
    event?.stopPropagation();
    const result = await confirmAction(
      "ຢືນຢັນການຍົກເລີກໃບສັ່ງຊື້?",
      "ທ່ານຕ້ອງການຍົກເລີກໃບສັ່ງຊື້ນີ້ແທ້ ຫຼື ບໍ່?",
      "ຍົກເລີກໃບສັ່ງຊື້"
    );
    if (!result.isConfirmed) return;
    try {
      await cancelPurchaseOrder(id, token);
      getPurchaseOrders();
    } catch (error) {
      console.error("Cancel error:", error);
    }
  };

  const handleDelete = async (id, event) => {
    event?.stopPropagation();
    const result = await confirmAction(
      "ຢືນຢັນການລົບໃບສັ່ງຊື້?",
      "ທ່ານຕ້ອງການລົບໃບສັ່ງຊື້ນີ້ແທ້ ຫຼື ບໍ່? ການດຳເນີນການນີ້ບໍ່ສາມາດຍ້ອນກັບໄດ້",
      "ລົບໃບສັ່ງຊື້"
    );
    if (!result.isConfirmed) return;
    try {
      await removePurchaseOrder(id);
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleExportExcel = async (id, event) => {
    event?.stopPropagation();
    const result = await confirmAction(
      "ສົ່ງອອກໃບສັ່ງຊື້ເປັນ Excel?",
      "ທ່ານຕ້ອງການສົ່ງໃບສັ່ງຊື້ນີ້ອອກເປັນໄຟລ໌ Excel ແທ້ ຫຼື ບໍ່?",
      "ສົ່ງອອກ"
    );
    if (!result.isConfirmed) return;
    try {
      await exportToExcel(id);
    } catch (error) {
      console.error("Export Excel error:", error);
      if (error.response?.status === 404) {
        toast.error("ບໍ່ພົບໃບສັ່ງຊື້ທີ່ຕ້ອງການສົ່ງອອກ");
      } else if (error.response?.status === 500) {
        toast.error("ເກີດຂໍ້ຜິດພາດໃນເຊີເວີ ລອງໃໝ່ອີກຄັ້ງ");
      } else {
        toast.error("ເກີດຂໍ້ຜິດພາດໃນການສົ່ງອອກ Excel");
      }
    }
  };

  const handleCreatePurchaseOrder = () =>
    navigate("/admin/purchase-orders/create");
  const handleViewDetail = (orderId) =>
    navigate(`/admin/purchase-order/${orderId}/detail`);
  const handleEditPurchaseOrder = (orderId, event) => {
    event?.stopPropagation();
    navigate(`/admin/purchase-order/${orderId}/edit`);
  };

  const handleRowClick = (orderId, event) => {
    if (event.target.type === "checkbox" || event.target.closest("button")) {
      return;
    }
    handleViewDetail(orderId);
  };

  // Debug info
  console.log("Render state:", {
    totalItems: paginationData.totalItems,
    totalPages: paginationData.totalPages,
    currentPage,
    itemsPerPage,
    paginatedDataLength: paginationData.paginatedData.length,
    filteredDataLength: filteredPurchaseOrders.length
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-notosanslao font-bold text-gray-900 mb-2">
            ລາຍການໃບສັ່ງຊື້
          </h1>
          <p className="text-gray-600 font-notosanslao">
            ຈັດການໃບສັ່ງຊື້ສິນຄ້າທັງໝົດ ({paginationData.totalItems} ລາຍການ)
            {isSearchMode && (
              <span className="text-blue-600"> - ຜົນການຄົ້ນຫາ</span>
            )}
            {selectedItems.size > 0 && (
              <span className="ml-2 text-red-600 font-semibold">
                (ເລືອກແລ້ວ {selectedItems.size} ລາຍການ)
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-3 mt-4 font-notosanslao lg:mt-0">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
            ໂຫລດໃໝ່
          </button>

          {selectedItems.size > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleteLoading}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-lg transition-colors"
            >
              {bulkDeleteLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ກຳລັງລົບ...
                </>
              ) : (
                <>🗑️ ລົບທີ່ເລືອກ ({selectedItems.size})</>
              )}
            </button>
          )}

          <button
            onClick={handleCreatePurchaseOrder}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            ສ້າງໃບສັ່ງຊື້ໃຫມ່
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-notosanslao text-gray-700 mb-2">
              ຄົ້ນຫາ
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="ຄົ້ນຫາເລກ PO, ຊື່ບໍລິສັດ, ຜູ້ຕິດຕໍ່..."
                className="w-full pl-10 pr-4 py-2 border font-notosanslao border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block font-notosanslao text-sm font-medium text-gray-700 mb-2">
              ສະຖານະ
            </label>
            <select
              className="w-full px-4 py-2 border font-notosanslao border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
            >
              <option value="">ທັງໝົດ</option>
              <option value="PENDING">ຖ້າອະນຸມັດ</option>
              <option value="APPROVED">ອະນຸມັດແລ້ວ</option>
              <option value="CANCELLED">ຍົກເລີກແລ້ວ</option>
              <option value="RECEIVED">ລໍຖ້າການນຳເຂົ້າ</option>
              <option value="COMPLETED">ນຳເຂົ້າແລ້ວ</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-notosanslao text-gray-700 mb-2">
              ວັນທີ່ເລີ່ມຕົ້ນ
            </label>
            <input
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.dateFrom}
              onChange={(e) =>
                setFilters({ ...filters, dateFrom: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-notosanslao text-gray-700 mb-2">
              ວັນທີ່ສຸດທ້າຍ
            </label>
            <input
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.dateTo}
              onChange={(e) =>
                setFilters({ ...filters, dateTo: e.target.value })
              }
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-4">
          <div className="flex gap-3">
            <button
              onClick={handleClearFilters}
              className="px-6 py-2 border border-gray-300 font-notosanslao text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ລ້າງຕົວຄົ້ນຫາທັງໝົດ
            </button>
            <div className="text-sm text-gray-600 font-notosanslao flex items-center">
              <Filter className="w-4 h-4 mr-1" />
              ສະແດງຜົນ {paginationData.totalItems} ລາຍການ
              {isSearchMode && ` ຈາກທັງໝົດ ${purchaseOrders?.length || 0} ລາຍການ`}
            </div>
          </div>

          {/* ✅ Items per page selector */}
          <div className="flex items-center gap-2 text-sm">
            <span className="font-notosanslao text-gray-700">ສະແດງຕໍ່ໜ້າ:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-notosanslao"
            >
              <option value={10}>10 ລາຍການ</option>
              <option value={20}>20 ລາຍການ</option>
              <option value={50}>50 ລາຍການ</option>
              <option value={100}>100 ລາຍການ</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="font-notosanslao">ກຳລັງໂຫລດຂໍ້ມູນ...</span>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-black bg-gradient-to-r from-blue-500 to-blue-600">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={isSelectAll}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-notosanslao text-white uppercase tracking-wider">
                    ລຳດັບ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-notosanslao text-white uppercase tracking-wider">
                    ເລກທີ່ໃບສັ່ງຊື້
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-notosanslao text-white uppercase tracking-wider">
                    ຜູ້ຂາຍ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-notosanslao text-white uppercase tracking-wider">
                    ວັນທີ່ສັ່ງ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-notosanslao text-white uppercase tracking-wider">
                    ຈຳນວນລວມ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-notosanslao text-white uppercase tracking-wider">
                    ສະຖານະ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-notosanslao text-white uppercase tracking-wider">
                    ຜູ້ສ້າງໃບບິນ
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-notosanslao text-white uppercase tracking-wider">
                    ຈັດການ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y font-notosanslao divide-gray-200">
                {paginationData.paginatedData.map((order, index) => {
                  // ✅ คำนวณลำดับที่ถูกต้องตาม pagination
                  const globalIndex = paginationData.startIndex + index + 1;
                  
                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                        selectedItems.has(order.id) ? "bg-blue-50" : ""
                      }`}
                      onClick={(e) => handleRowClick(order.id, e)}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(order.id)}
                          onChange={() => handleSelectItem(order.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-900 font-medium">
                        {globalIndex}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 text-blue-500 mr-3" />
                          <div>
                            <div className="text-sm font-medium font-notosanslao text-gray-900">
                              PO-{String(order.id).padStart(6, "0")}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {order.id}
                            </div>
                            {order.expectedDeliveryDate && (
                              <div className="text-xs text-gray-500">
                                ກຳໜົດສົ່ງ: {formatDate(order.expectedDeliveryDate)}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium font-notosanslao text-gray-900">
                            {order.supplier?.companyName || "ບໍ່ລະບຸ"}
                          </div>
                          {order.supplier?.contactName && (
                            <div className="text-sm text-gray-500">
                              {order.supplier.contactName}
                            </div>
                          )}
                          {order.supplier?.phone && (
                            <div className="text-xs text-gray-500">
                              {order.supplier.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium font-notosanslao text-gray-900">
                          {(order.quantitytotal || 0).toLocaleString()} ຊິ້ນ
                        </div>
                        <div className="text-xs text-gray-500">
                          {(order.products || []).length} ລາຍການສິນຄ້າ
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="font-medium">
                          {order.orderdBy?.employee?.firstName || ""}{" "}
                          {order.orderdBy?.employee?.lastName || ""}
                        </div>
                        {order.orderdBy?.username && (
                          <div className="text-xs text-gray-500">
                            @{order.orderdBy.username}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetail(order.id);
                            }}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            title="ເບິ່ງລາຍລະອຽດ"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* ✅ แสดง Export เฉพาะเมื่อไม่ใช่ CANCELLED */}
                          {order.status !== "CANCELLED" && (
                            <button
                              onClick={(e) => handleExportExcel(order.id, e)}
                              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="ສົ່ງອອກເປັນ Excel"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}

                          {order.status === "PENDING" && (
                            <>
                              <button
                                onClick={(e) => handleApprove(order.id, e)}
                                className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                                title="ອະນຸມັດ"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => handleCancel(order.id, e)}
                                className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg transition-colors"
                                title="ຍົກເລີກ"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => handleEditPurchaseOrder(order.id, e)}
                                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                title="ແກ້ໄຂ"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => handleDelete(order.id, e)}
                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                title="ລົບ"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {order.status === "APPROVED" && (
                            <button
                              onClick={(e) => handleCancel(order.id, e)}
                              className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg transition-colors"
                              title="ຍົກເລີກ"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}

                          {order.status === "CANCELLED" && (
                            <span className="text-xs text-gray-500 italic">
                              ບໍ່ມີການດຳເນີນການ
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && paginationData.paginatedData.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-notosanslao text-gray-900 mb-2">
              {isSearchMode ? "ບໍ່ມີຂໍ້ມູນທີ່ຄົ້ນຫາ" : "ບໍ່ມີໃບສັ່ງຊື້"}
            </h3>
            <p className="text-gray-500 font-notosanslao mb-4">
              {isSearchMode
                ? "ລອງປ່ຽນເງື່ອນໄຂການຄົ້ນຫາ ຫຼື ລ້າງຕົວກອງຄົ້ນຫາໃໝ່"
                : "ຍັງບໍ່ມີຂໍ້ມູນໃບສັ່ງຊື້ໃນລະບົບ"}
            </p>
            {isSearchMode ? (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-notosanslao"
              >
                ລ້າງການຄົ້ນຫາ
              </button>
            ) : (
              <button
                onClick={handleCreatePurchaseOrder}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-notosanslao"
              >
                ສ້າງໃບສັ່ງຊື້ໃໝ່
              </button>
            )}
          </div>
        )}
      </div>

      {/* ✅ Pagination Controls - แสดงเสมอเมื่อมีข้อมูล + ปุ่มทดสอบ */}
      {paginationData.totalItems > 0 && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          {/* Debug Information */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
            <strong>Debug:</strong> ທັງໝົດ {paginationData.totalItems} ລາຍການ | 
            ແບ່ງເປັນ {paginationData.totalPages} ໜ້າ | 
            ໜ້າປັດຈຸບັນ {currentPage} | 
            ສະແດງ {itemsPerPage} ລາຍການຕໍ່ໜ້າ |
            ຂໍ້ມູນໜ້ານີ້ {paginationData.paginatedData.length} ລາຍການ |
            purchaseOrders.length: {purchaseOrders?.length || 0}
          </div>

          {/* ✅ ปุ่มทดสอบ pagination */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-sm font-notosanslao text-blue-800 mb-2">ທດສອບ Pagination:</div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
              >
                ໄປໜ້າ 1
              </button>
              <button
                onClick={() => setCurrentPage(2)}
                disabled={paginationData.totalPages < 2}
                className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:bg-gray-300"
              >
                ໄປໜ້າ 2
              </button>
              <button
                onClick={() => setItemsPerPage(5)}
                className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
              >
                5 ລາຍການ/ໜ້າ
              </button>
              <button
                onClick={() => setItemsPerPage(10)}
                className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
              >
                10 ລາຍການ/ໜ້າ
              </button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Pagination Info */}
            <div className="text-sm text-gray-600 font-notosanslao">
              ສະແດງ {paginationData.startIndex + 1} ຫາ {Math.min(paginationData.endIndex, paginationData.totalItems)} ຈາກທັງໝົດ {paginationData.totalItems} ລາຍການ
              <span className="ml-2 text-blue-600">
                (ໜ້າ {currentPage} ຈາກ {paginationData.totalPages} ໜ້າ)
              </span>
            </div>

            {/* Pagination Buttons - แสดงเสมอ */}
            <div className="flex items-center gap-2">
              {/* Previous Page */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 text-sm font-notosanslao bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                ກ່ອນໜ້າ
              </button>

              {/* Page Numbers - แสดงเสมอ */}
              <div className="flex items-center gap-1">
                {paginationData.totalPages <= 1 ? (
                  /* แสดงแค่หน้าเดียว */
                  <button className="px-3 py-2 text-sm rounded-lg font-notosanslao bg-blue-600 text-white">
                    1
                  </button>
                ) : (
                  /* แสดงหลายหน้า */
                  (() => {
                    const pages = [];
                    const totalPages = paginationData.totalPages;
                    
                    if (totalPages <= 7) {
                      // แสดงทุกหน้า
                      for (let i = 1; i <= totalPages; i++) {
                        pages.push(
                          <button
                            key={i}
                            onClick={() => handlePageChange(i)}
                            className={`px-3 py-2 text-sm rounded-lg font-notosanslao transition-colors ${
                              currentPage === i
                                ? "bg-blue-600 text-white"
                                : "bg-white border border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {i}
                          </button>
                        );
                      }
                    } else {
                      // แสดงแบบย่อ
                      pages.push(
                        <button
                          key={1}
                          onClick={() => handlePageChange(1)}
                          className={`px-3 py-2 text-sm rounded-lg font-notosanslao transition-colors ${
                            currentPage === 1
                              ? "bg-blue-600 text-white"
                              : "bg-white border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          1
                        </button>
                      );

                      if (currentPage > 3) {
                        pages.push(<span key="dots1" className="px-2 text-gray-500">...</span>);
                      }

                      const start = Math.max(2, currentPage - 1);
                      const end = Math.min(totalPages - 1, currentPage + 1);

                      for (let i = start; i <= end; i++) {
                        pages.push(
                          <button
                            key={i}
                            onClick={() => handlePageChange(i)}
                            className={`px-3 py-2 text-sm rounded-lg font-notosanslao transition-colors ${
                              currentPage === i
                                ? "bg-blue-600 text-white"
                                : "bg-white border border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {i}
                          </button>
                        );
                      }

                      if (currentPage < totalPages - 2) {
                        pages.push(<span key="dots2" className="px-2 text-gray-500">...</span>);
                      }

                      pages.push(
                        <button
                          key={totalPages}
                          onClick={() => handlePageChange(totalPages)}
                          className={`px-3 py-2 text-sm rounded-lg font-notosanslao transition-colors ${
                            currentPage === totalPages
                              ? "bg-blue-600 text-white"
                              : "bg-white border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {totalPages}
                        </button>
                      );
                    }

                    return pages;
                  })()
                )}
              </div>

              {/* Next Page */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === paginationData.totalPages || paginationData.totalPages <= 1}
                className="flex items-center gap-1 px-3 py-2 text-sm font-notosanslao bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ຖັດໄປ
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Page Jump */}
            <div className="flex items-center gap-2 text-sm">
              <span className="font-notosanslao text-gray-700">ໄປໜ້າ:</span>
              <input
                type="number"
                min="1"
                max={paginationData.totalPages}
                value={currentPage}
                onChange={(e) => {
                  const page = parseInt(e.target.value);
                  if (page >= 1 && page <= paginationData.totalPages) {
                    handlePageChange(page);
                  }
                }}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Bulk Action Info */}
      {selectedItems.size > 0 && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="font-notosanslao text-blue-800">
              ເລືອກແລ້ວ {selectedItems.size} ລາຍການ
              {(() => {
                const selectedOrders = filteredPurchaseOrders.filter((order) =>
                  selectedItems.has(order.id)
                );
                const pendingCount = selectedOrders.filter(
                  (order) => order.status === "PENDING"
                ).length;
                const nonPendingCount = selectedOrders.length - pendingCount;

                return (
                  <span className="ml-2 text-sm">
                    ({pendingCount} ລົບໄດ້, {nonPendingCount} ລົບບໍ່ໄດ້)
                  </span>
                );
              })()}
            </div>
            <button
              onClick={() => {
                setSelectedItems(new Set());
                setIsSelectAll(false);
              }}
              className="text-blue-600 hover:text-blue-800 font-notosanslao text-sm"
            >
              ຍົກເລີກການເລືອກ
            </button>
          </div>
          <div className="mt-2 text-xs text-blue-600 font-notosanslao">
            * ສາມາດລົບໄດ້ເຉພາະໃບສັ່ງຊື້ທີ່ມີສະຖານະ "ຖ້າອະນຸມັດ" ເທົ່ານັ້ນ
          </div>
        </div>
      )}

      {/* Status Summary */}
      {!isLoading && paginationData.totalItems > 0 && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-notosanslao font-medium text-gray-900 mb-4">
            ສະຫຼຸບສະຖານະ
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { status: "PENDING", label: "ຖ້າອະນຸມັດ", color: "yellow" },
              { status: "APPROVED", label: "ອະນຸມັດແລ້ວ", color: "green" },
              { status: "CANCELLED", label: "ຍົກເລີກແລ້ວ", color: "red" },
              { status: "RECEIVED", label: "ລໍຖ້າການນຳເຂົ້າ", color: "blue" },
              { status: "COMPLETED", label: "ນຳເຂົ້າແລ້ວ", color: "green" },
            ].map(({ status, label, color }) => {
              const count = filteredPurchaseOrders.filter(
                (order) => order.status === status
              ).length;
              const colorClasses = {
                yellow: "bg-yellow-50 border-yellow-200 text-yellow-800",
                green: "bg-green-50 border-green-200 text-green-800",
                red: "bg-red-50 border-red-200 text-red-800",
                blue: "bg-blue-50 border-blue-200 text-blue-800",
              };

              return (
                <div
                  key={status}
                  className={`p-4 rounded-lg border ${colorClasses[color]} cursor-pointer hover:opacity-80 transition-opacity`}
                  onClick={() => setFilters({ ...filters, status: status })}
                >
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm font-notosanslao">{label}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search Tips */}
      {isSearchMode && paginationData.totalItems === 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h4 className="text-lg font-notosanslao font-medium text-blue-900 mb-2">
            ຄຳແນະນຳການຄົ້ນຫາ
          </h4>
          <ul className="text-blue-800 font-notosanslao space-y-1">
            <li>• ສາມາດຄົ້ນຫາດ້ວຍເລກ PO (ເຊັ່ນ: PO-000001)</li>
            <li>• ຄົ້ນຫາດ້ວຍຊື່ບໍລິສັດຜູ້ສະໜອງ</li>
            <li>• ຄົ້ນຫາດ້ວຍຊື່ຜູ້ຕິດຕໍ່</li>
            <li>• ຄົ້ນຫາດ້ວຍ ID ຂອງໃບສັ່ງຊື້</li>
            <li>• ສາມາດໃຊ້ຟິວເຕີວັນທີ່ເພື່ອຊອກຫາໃນໄລຍະເວລາໃດໜຶ່ງ</li>
          </ul>
        </div>
      )}

      {/* Debug Info - ลบออกใน production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 bg-gray-100 border border-gray-300 rounded-xl p-4">
          <h4 className="font-medium text-gray-700 mb-2">Debug Info:</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Total Purchase Orders: {purchaseOrders?.length || 0}</div>
            <div>Filtered Results: {filteredPurchaseOrders.length}</div>
            <div>Paginated Results: {paginationData.paginatedData.length}</div>
            <div>Current Page: {currentPage}</div>
            <div>Total Pages: {paginationData.totalPages}</div>
            <div>Items Per Page: {itemsPerPage}</div>
            <div>Selected Items: {selectedItems.size}</div>
            <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TablePurches;