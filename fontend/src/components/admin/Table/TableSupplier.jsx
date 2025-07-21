import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import useCarStore from "../../../Store/car-store";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { removeBrand } from "../../../api/Brand";
import {
  Search,
  X,
  Edit,
  Trash2,
  Eye,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { removeSupplier } from "../../../api/Supplier";

const TableSupplier = () => {
  const token = useCarStore((state) => state.token);
  const getSupplier = useCarStore((state) => state.getSupplier);
  const suppliers = useCarStore((state) => state.suppliers);
  const [selectedProduct, setselectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const productsPerPage = 15;
  const MySwal = withReactContent(Swal);

  useEffect(() => {
    getSupplier();
  }, []);
  // ตรวจสอบว่า suppliers มีข้อมูลและเป็น object ที่มี data property หรือไม่
  const supplierData = suppliers?.data || [];
  const filteredsuppliers = useMemo(() => {
    if (!supplierData || !Array.isArray(supplierData)) return [];

    if (!searchTerm.trim()) return supplierData;

    return supplierData.filter((supplierData) =>
      supplierData?.companyName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [suppliers, searchTerm]);
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const indexOfLast = currentPage * productsPerPage;
  const indexOfFirst = indexOfLast - productsPerPage;
  const currentProducts = filteredsuppliers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredsuppliers.length / productsPerPage);

  const handleRemove = async (id) => {
    const result = await MySwal.fire({
      title: <p className="font-phetsarath text-xl">ຢືນຢັນການລົບ?</p>,
      html: (
        <p className="font-phetsarath text-gray-700">
          ຂໍ້ມູນນີ້ຈະຖືກລົບຖາວອນ ແລະບໍ່ສາມາດກູ້ຄືນໄດ້!
        </p>
      ),
      icon: "warning",
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonText: "ລົບເລີຍ",
      cancelButtonText: "ຍົກເລີກ",
      customClass: {
        popup: "font-phetsarath rounded-lg shadow-lg",
        confirmButton:
          "bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md mr-2",
        cancelButton:
          "bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md",
      },
      buttonsStyling: false,
    });

    if (!result.isConfirmed) return;

    try {
      const res = await removeSupplier(token, id);
      toast.success(
        <span className="font-phetsarath">ລົບ {res.data.name} ສຳເລັດ</span>
      );
      getSupplier();
    } catch (err) {
      console.log(err);
      toast.error(<p className="font-phetsarath">ການລົບລົ້ມເຫຼວ</p>);
    }
  };

  const handleRowClick = (product, event) => {
    setselectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setselectedProduct(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (!suppliers) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
            <div className="text-gray-500 font-phetsarath">
              ກຳລັງໂຫລດຂໍ້ມູນ...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center font-notosanslao justify-between space-y-3 sm:space-y-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 font-phetsarath">
              ລາຍການຜູ້ສະໜອງ
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              ພົບ {filteredsuppliers.length} ລາຍການທັງໝົດ
            </p>
          </div>

          {/* Search */}
          <div className="flex space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 font-notosanslao text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="ຄົ້ນຫາຜູ້ສະໜອງ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-md  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-phetsarath"
              />
            </div>
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="px-3 py-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 font-notosanslao">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ລຳດັບ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ຊື່ບໍລິສັດ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ຊື່ຜູ້ຕິດຕໍ່
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ອີເມວ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ເບີໂທ
              </th>
              
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ວັນທີອັບເດດ
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                ຈັດການ
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentProducts.length > 0 ? (
              currentProducts.map((item, index) => (
                <tr
                  key={item.id || index}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={(e) => handleRowClick(item, e)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {indexOfFirst + index + 1}
                    {console.log("sssssssssss", item)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 font-phetsarath">
                      {item.companyName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 font-phetsarath">
                      {item.contactName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 font-phetsarath">
                      {item.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 font-phetsarath">
                      {item.phone}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(item.updatedAt)}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(item, e);
                        }}
                        className="text-blue-500 hover:text-blue-700 p-1"
                        title="ເບິ່ງລາຍລະອຽດ"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/admin/edit-suppliers/${item.id}`}
                        className="text-amber-500 hover:text-amber-700 p-1"
                        title="ແກ້ໄຂ"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemove(item.id);
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="ລົບ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center">
                  <div className="text-gray-500 font-phetsarath">
                    <p className="text-lg">
                      {searchTerm
                        ? "ບໍ່ພົບຂໍ້ມູນທີ່ຄົ້ນຫາ"
                        : "ບໍ່ມີຂໍ້ມູນແບນລົດ"}
                    </p>
                    {searchTerm && (
                      <button
                        onClick={handleClearSearch}
                        className="mt-2 text-blue-500 hover:text-blue-700 underline"
                      >
                        ລ້າງການຄົ້ນຫາ
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredsuppliers.length > productsPerPage && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 font-phetsarath">
              ສະແດງ {indexOfFirst + 1} ຫາ{" "}
              {Math.min(indexOfLast, filteredsuppliers.length)} ຈາກທັງໝົດ{" "}
              {filteredsuppliers.length} ລາຍການ
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-2 text-sm text-gray-700 font-phetsarath">
                ໜ້າ {currentPage} ຈາກ {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 font-phetsarath">
                  ລາຍລະອຽດຜູ້ສະໜອງ
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 font-phetsarath">
                  ຊື່ບໍລິສັດ:
                </label>
                <p className="mt-1 text-sm text-gray-900 font-phetsarath">
                  {selectedProduct.companyName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 font-phetsarath">
                  ຊື່ຕິດຕໍ່:
                </label>
                <p className="mt-1 text-sm text-gray-900 font-phetsarath">
                  {selectedProduct.contactName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 font-phetsarath">
                  ອີເມວ:
                </label>
                <p className="mt-1 text-sm text-gray-900 font-phetsarath">
                  {selectedProduct.email}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 font-phetsarath">
                  ເບີຕິດຕໍ່:
                </label>
                <p className="mt-1 text-sm text-gray-900 font-phetsarath">
                  {selectedProduct.phone}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 font-phetsarath">
                  ທີ່ຕັ້ງບໍລິສັດ:
                </label>
                <p className="mt-1 text-sm text-gray-900 font-phetsarath">
                  {selectedProduct.address}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-phetsarath">
                    ວັນທີ່ສ້າງ
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(selectedProduct.createdAt)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 font-phetsarath">
                    ອັບເດດຫຼ້າສຸດ
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(selectedProduct.updatedAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <Link
                to={`/admin/edit-suppliers/${selectedProduct.id}`}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium font-phetsarath"
                onClick={handleCloseModal}
              >
                ແກ້ໄຂ
              </Link>
              <button
                onClick={handleCloseModal}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium font-phetsarath"
              >
                ປິດ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableSupplier;
