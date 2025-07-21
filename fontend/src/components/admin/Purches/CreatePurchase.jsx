import React, { useState, useEffect } from "react";
import {
  Plus,
  Minus,
  X,
  Save,
  ArrowLeft,
  Search,
  AlertCircle,
  Car,
  Package,
  User,
} from "lucide-react";
import useCarStore from "../../../Store/car-store";
import { toast } from "react-toastify";
import { savePurchases } from "../../../api/Purchase";
import { useNavigate } from "react-router-dom";

const CreatePurchase = () => {
  const {
    user,
    token,
    suppliers,
    suppliersproducts,
    getSupplier,
    getSuppliersProduct,
  } = useCarStore();
  const navigate = useNavigate();
  // Safe array conversion
  const safeSuppliers = Array.isArray(suppliers?.data)
    ? suppliers.data
    : Array.isArray(suppliers)
    ? suppliers
    : [];
  const safeSupplierProducts = Array.isArray(suppliersproducts) ? suppliersproducts : [];

  // Debug logging
  useEffect(() => {
    console.log("safeSuppliers", safeSuppliers);
    console.log("supplierproducts", suppliersproducts);
  }, [suppliers, suppliersproducts, safeSuppliers, safeSupplierProducts]);

  const [formData, setFormData] = useState({
    supplierId: "",
    expectedDeliveryDate: "",
    products: [], // array ของ { carId, quantity }
    orderdById: user?.id || "",
  });

  const [searchCar, setSearchCar] = useState("");
  const [showCarSearch, setShowCarSearch] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    // อัปเดต orderdById เมื่อ user เปลี่ยน
    if (user?.id) {
      setFormData((prev) => ({ ...prev, orderdById: user.id }));
    }
  }, [user]);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);

      // โหลดข้อมูลจาก API
      await Promise.all([
        safeSuppliers.length === 0 ? getSupplier() : Promise.resolve(),
        safeSupplierProducts.length === 0 ? getSuppliersProduct() : Promise.resolve(),
      ]);
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast.error("ບໍ່ສາມາດໂຫລດຂໍ້ມູນໄດ້");
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name === "supplierId") {
      setShowCarSearch(false);
      setSearchCar("");
      // ล้างสินค้าเก่าเมื่อเปลี่ยน supplier
      setFormData(prev => ({ ...prev, products: [] }));
    }
  };

  const addCar = (supplierProduct) => {
    const car = supplierProduct.Car; // ข้อมูลรถจาก supplier product
    
    // ตรวจสอบว่ามีรถคันนี้อยู่แล้วหรือไม่
    const existingCarIndex = formData.products.findIndex(
      (p) => p.carId === car.id
    );

    if (existingCarIndex !== -1) {
      // ถ้ามีแล้ว เพิ่มจำนวน
      const newProducts = [...formData.products];
      newProducts[existingCarIndex].quantity += 1;
      setFormData((prev) => ({ ...prev, products: newProducts }));
      toast.info(`ເພີ່ມຈຳນວນ ${car.name} ແລ້ວ`);
    } else {
      // ถ้ายังไม่มี เพิ่มใหม่
      const newProduct = {
        carId: car.id,
        quantity: 1,
        // ข้อมูลเพิ่มเติมสำหรับแสดงผล
        carName: car.name,
        licensePlate: car.licensePlate,
        brandModel: car.brandAndModels
          ? `${car.brandAndModels.BrandCars?.name} ${car.brandAndModels.modelCar}`
          : "",
        color: car.colorCar?.name || "",
        type: car.typecar?.name || "",
        year: car.year,
        price: car.price || 0,
        costPrice: car.costPrice || 0,
        vin: car.vin,
        status: car.status,
        // ข้อมูลจาก supplier product
        supplierProductId: supplierProduct.id,
        supplierNotes: supplierProduct.notes,
        isActive: supplierProduct.isActive,
      };

      setFormData((prev) => ({
        ...prev,
        products: [...prev.products, newProduct],
      }));
    }

    setShowCarSearch(false);
    setSearchCar("");
  };

  const updateQuantity = (productIndex, newQuantity) => {
    if (newQuantity <= 0) {
      removeProduct(productIndex);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      products: prev.products.map((product, index) =>
        index === productIndex ? { ...product, quantity: newQuantity } : product
      ),
    }));
  };

  const removeProduct = (productIndex) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.filter((_, index) => index !== productIndex),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.supplierId) {
      newErrors.supplierId = "ກະລຸນາເລືອກຜູ້ສະໜອງ";
    }

    if (!formData.orderdById) {
      newErrors.orderdById = "ກະລຸນາລະບຸຜູ້ສັ່ງຊື້";
    }

    if (formData.products.length === 0) {
      newErrors.products = "ກະລຸນາເພີ່ມລົດຢ່າງນ້ອຍ 1 ຄັນ";
    }

    // ตรวจสอบจำนวน
    for (let product of formData.products) {
      if (product.quantity <= 0) {
        newErrors.products = "ຈຳນວນລົດຕ້ອງມີຄ່າມາກກວ່າ 0";
        break;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ");
      return;
    }

    try {
      setIsSubmitting(true);

      // เตรียมข้อมูลให้ตรงกับ backend API
      const submitData = {
        supplierId: parseInt(formData.supplierId),
        expectedDeliveryDate: formData.expectedDeliveryDate || null,
        products: formData.products.map((product) => ({
          carId: product.carId,
          quantity: product.quantity,
        })),
        orderdById: parseInt(formData.orderdById),
      };

      console.log("=== PURCHASE SUBMISSION DEBUG ===");
      console.log("Submit data:", submitData);
      console.log("User token:", token ? "✓ Present" : "✗ Missing");
      
      // เรียก API ผ่าน axios (แก้ไขจากเดิมที่ใช้ fetch)
      const response = await savePurchases(token, submitData);

      // ตรวจสอบ response
      console.log("API Response:", response);

      // แสดงข้อความสำเร็จ
      toast.success(response.data.message || "ສ້າງໃບສັ່ງຊື້ສຳເລັດແລ້ວ");

      // Reset form
      setFormData({
        supplierId: "",
        expectedDeliveryDate: "",
        products: [],
        orderdById: user?.id || "",
      });

      // Navigate back ถ้ามี react-router
      // navigate("/admin/purchase");
    } catch (error) {
      console.error("=== ERROR SUBMITTING PURCHASE ===");
      console.error("Error details:", error);
      
      // แสดง error message ที่เหมาะสม
      let errorMessage = "ເກີດຂໍ້ຜິດພາດໃນການສ້າງໃບສັ່ງຊື້";
      
      // ตรวจสอบว่าเป็น axios error หรือไม่
      if (error.response) {
        // Server ตอบกลับมาแต่มี error status
        console.log("Server Error Response:", error.response.data);
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        // Request ถูกส่งแต่ไม่ได้รับ response
        errorMessage = "ບໍ່ສາມາດເຊື່ອມຕໍ່ກັບເຊີເວີໄດ້ ກະລຸນາກວດສອບວ່າ backend server ເປີດຢູ່ບໍ່";
      } else {
        // Error อื่นๆ ในการตั้งค่า request
        errorMessage = error.message || errorMessage;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (formData.products.length > 0) {
      if (
        confirm("ທ່ານຕ້ອງການຍົກເລີກການສ້າງໃບສັ່ງຊື້ບໍ? ຂໍ້ມູນທີ່ປ້ອນຈະຫາຍໄປ")
      ) {
        setFormData({
          supplierId: "",
          expectedDeliveryDate: "",
          products: [],
          orderdById: user?.id || "",
        });
      }
    }
  };

  // กรอง supplier products ตาม supplier ที่เลือก
  const filteredSupplierProductsBySupplierId = formData.supplierId 
    ? safeSupplierProducts.filter(sp => sp.supplierId === parseInt(formData.supplierId) && sp.isActive)
    : [];

  // กรองตามคำค้นหา
  const filteredSupplierProducts = filteredSupplierProductsBySupplierId.filter((supplierProduct) => {
    const car = supplierProduct.Car;
    const searchTerm = searchCar.toLowerCase();
    return (
      car?.name?.toLowerCase().includes(searchTerm) ||
      car?.licensePlate?.toLowerCase().includes(searchTerm) ||
      car?.brandAndModels?.modelCar?.toLowerCase().includes(searchTerm) ||
      car?.brandAndModels?.BrandCars?.name?.toLowerCase().includes(searchTerm) ||
      car?.vin?.toLowerCase().includes(searchTerm) ||
      supplierProduct.notes?.toLowerCase().includes(searchTerm)
    );
  });

  const totalQuantity = formData.products.reduce(
    (sum, product) => sum + product.quantity,
    0
  );
  const selectedSupplier = safeSuppliers.find(
    (s) => s.id === parseInt(formData.supplierId)
  );

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-notosanslao">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                  navigate("/admin/purchases");
                }}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="font-notosanslao">
              <h1 className="text-2xl font-bold text-gray-900">
                ສ້າງໃບສັ່ງຊື້ລົດໃຫມ່
              </h1>
              <p className="text-gray-600 mt-1">ເພີ່ມໃບສັ່ງຊື້ລົດຈາກຜູ້ສະໜອງ</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white font-notosanslao rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              ຂໍ້ມູນໃບສັ່ງຊື້
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ຜູ້ສະໜອງ <span className="text-red-500">*</span>
                </label>
                <select
                  name="supplierId"
                  value={formData.supplierId}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.supplierId ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">ເລືອກຜູ້ສະໜອງ</option>
                  {safeSuppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.companyName}
                      {supplier.contactName && ` - ${supplier.contactName}`}
                    </option>
                  ))}
                </select>
                {errors.supplierId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.supplierId}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ຜູ້ສັ່ງຊື້ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="orderdById"
                  value={user?.username || ""}
                  readOnly
                  className="w-full p-3 border border-gray-300 bg-gray-50 rounded-lg"
                />
                {errors.orderdById && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.orderdById}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ວັນທີ່ຄາດວ່າຈະໄດ້ຮັບລົດ
                </label>
                <input
                  type="date"
                  name="expectedDeliveryDate"
                  value={formData.expectedDeliveryDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {selectedSupplier && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-notosanslao text-blue-900 mb-2">
                  ຂໍ້ມູນຜູ້ສະໜອງ
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
                  <div>
                    <span className="font-medium">ບໍລິສັດ:</span>{" "}
                    {selectedSupplier.companyName}
                  </div>
                  <div>
                    <span className="font-medium">ຜູ້ຕິດຕໍ່:</span>{" "}
                    {selectedSupplier.contactName || "-"}
                  </div>
                  <div>
                    <span className="font-medium">ໂທລະສັບ:</span>{" "}
                    {selectedSupplier.phone || "-"}
                  </div>
                  {selectedSupplier.email && (
                    <div>
                      <span className="font-medium">ອີເມວ:</span>{" "}
                      {selectedSupplier.email}
                    </div>
                  )}
                  {selectedSupplier.address && (
                    <div className="md:col-span-2">
                      <span className="font-medium">ທີ່ຢູ່:</span>{" "}
                      {selectedSupplier.address}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Car Selection */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-notosanslao text-gray-900">
                ລາຍການລົດ
              </h2>
              <button
                type="button"
                onClick={() => setShowCarSearch(!showCarSearch)}
                disabled={!formData.supplierId || filteredSupplierProductsBySupplierId.length === 0}
                className={`px-4 py-2 rounded-lg font-notosanslao hover:bg-blue-700 flex items-center gap-2 transition-colors ${
                  !formData.supplierId || filteredSupplierProductsBySupplierId.length === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white"
                }`}
              >
                <Plus size={20} />
                ເພີ່ມລົດ
              </button>
            </div>

            {errors.products && (
              <p className="text-red-500 text-sm mb-4">{errors.products}</p>
            )}

            {/* Status Messages */}
            {!formData.supplierId && (
              <div className="mb-6 p-4 bg-yellow-50 border font-notosanslao border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="text-yellow-600 w-5 h-5" />
                  <div>
                    <p className="text-yellow-800 font-medium">
                      ກະລຸນາເລືອກຜູ້ສະໜອງກ່ອນ
                    </p>
                    <p className="text-yellow-700 text-sm mt-1">
                      ທ່ານຕ້ອງເລືອກຜູ້ສະໜອງກ່ອນຈຶ່ງຈະສາມາດເລືອກສິນຄ້າໄດ້
                    </p>
                  </div>
                </div>
              </div>
            )}

            {formData.supplierId && filteredSupplierProductsBySupplierId.length === 0 && (
              <div className="mb-6 p-4 bg-yellow-50 border font-notosanslao border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="text-yellow-600 w-5 h-5" />
                  <div>
                    <p className="text-yellow-800 font-medium">
                      ຜູ້ສະໜອງນີ້ບໍ່ມີສິນຄ້າ
                    </p>
                    <p className="text-yellow-700 text-sm mt-1">
                      ຜູ້ສະໜອງທີ່ເລືອກບໍ່ມີສິນຄ້າໃນລະບົບ ຫຼື ສິນຄ້າຖືກປິດການນຳໃຊ້
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Car Search */}
            {showCarSearch && formData.supplierId && filteredSupplierProductsBySupplierId.length > 0 && (
              <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Search size={20} className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="ຄົ້ນຫາລົດ (ຊື່, ປ້າຍທະບຽນ, ຍີ່ຫໍ້, VIN)"
                    value={searchCar}
                    onChange={(e) => setSearchCar(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-notosanslao"
                  />
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {filteredSupplierProducts.length > 0 ? (
                    <div className="space-y-2">
                      {filteredSupplierProducts.map((supplierProduct) => {
                        const car = supplierProduct.Car;
                        return (
                          <div
                            key={supplierProduct.id}
                            className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">
                                  {car?.name || "ບໍ່ມີຊື່"}
                                </h4>
                                <p className="text-sm text-gray-600 font-notosanslao">
                                  ປ້າຍທະບຽນ: {car?.licensePlate || "-"}
                                </p>
                                <div className="flex gap-4 font-notosanslao text-xs text-gray-500 mt-1">
                                  <span>
                                    ຍີ່ຫໍ້: {car?.brandAndModels?.BrandCars?.name || "-"}
                                  </span>
                                  <span>
                                    ຮຸ່ນ: {car?.brandAndModels?.modelCar || "-"}
                                  </span>
                                  <span>ສີ: {car?.colorCar?.name || "-"}</span>
                                  <span>ປີ: {car?.year || "-"}</span>
                                </div>
                                <div className="flex gap-4 font-notosanslao text-xs text-blue-600 mt-1">
                                  <span>ປະເພດ: {car?.typecar?.name || "-"}</span>
                                  <span>ສະຖານະ: {car?.status || "-"}</span>
                                  {car?.price && (
                                    <span>
                                      ລາຄາ: {car.price.toLocaleString()} ກີບ
                                    </span>
                                  )}
                                </div>
                                {car?.vin && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    <span>VIN: {car.vin}</span>
                                  </div>
                                )}
                                {supplierProduct.notes && (
                                  <div className="text-xs text-green-600 mt-1 font-notosanslao">
                                    <span>ໝາຍເຫດ: {supplierProduct.notes}</span>
                                  </div>
                                )}
                                {!supplierProduct.isActive && (
                                  <div className="text-xs text-red-600 mt-1 font-notosanslao">
                                    <span>⚠️ ສິນຄ້ານີ້ຖືກປິດການນຳໃຊ້</span>
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => addCar(supplierProduct)}
                                disabled={!supplierProduct.isActive}
                                className={`p-2 rounded-lg transition-colors ${
                                  supplierProduct.isActive
                                    ? "text-blue-600 hover:bg-blue-50"
                                    : "text-gray-400 cursor-not-allowed"
                                }`}
                              >
                                <Plus size={24} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center font-notosanslao text-gray-500 py-8">
                      {searchCar
                        ? "ບໍ່ພົບສິນຄ້າທີ່ຄົ້ນຫາ"
                        : "ກະລຸນາພິມເພື່ອຄົ້ນຫາສິນຄ້າ"}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Selected Cars Table */}
            {formData.products.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-notosanslao text-gray-700">
                        ລຳດັບ
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-notosanslao text-gray-700">
                        ຊື່ລົດ
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-notosanslao text-gray-700">
                        ປ້າຍທະບຽນ
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-notosanslao text-gray-700">
                        ຍີ່ຫໍ້/ຮຸ່ນ
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center text-sm font-notosanslao text-gray-700">
                        ຈຳນວນ
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center text-sm font-notosanslao text-gray-700">
                        ຈັດການ
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.products.map((product, index) => (
                      <tr
                        key={`${product.carId}-${index}`}
                        className="hover:bg-gray-50 font-notosanslao"
                      >
                        <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                          <div>{product.carName}</div>
                          <div className="text-xs text-gray-500">
                            {product.color && `ສີ: ${product.color}`}
                            {product.type && ` | ປະເພດ: ${product.type}`}
                            {product.year && ` | ປີ: ${product.year}`}
                          </div>
                          {product.vin && (
                            <div className="text-xs text-gray-500">
                              VIN: {product.vin}
                            </div>
                          )}
                          {product.supplierNotes && (
                            <div className="text-xs text-green-600">
                              ໝາຍເຫດ: {product.supplierNotes}
                            </div>
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-sm text-gray-600">
                          {product.licensePlate || "-"}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-sm text-gray-600">
                          {product.brandModel || "-"}
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(index, product.quantity - 1)
                              }
                              className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="w-16 px-2 py-1 text-center font-medium bg-blue-50 text-blue-700 rounded border border-blue-200">
                              {product.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(index, product.quantity + 1)
                              }
                              className="p-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => removeProduct(index)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 font-semibold">
                      <td
                        colSpan="4"
                        className="border border-gray-300 px-4 py-3 text-right text-sm text-gray-700"
                      >
                        ຈຳນວນລວມທັງໝົດ:
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center text-sm text-gray-900">
                        {totalQuantity}
                      </td>
                      <td className="border border-gray-300 px-4 py-3"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {formData.products.length === 0 && (
              <div className="text-center text-gray-500 py-12">
                <div className="text-4xl mb-4">🚗</div>
                <p className="text-lg font-notosanslao">ຍັງບໍ່ມີລົດໃນລາຍການ</p>
                <p className="text-sm font-notosanslao">
                  {formData.supplierId
                    ? filteredSupplierProductsBySupplierId.length > 0 
                      ? 'ກົດປຸ່ມ "ເພີ່ມລົດ" ເພື່ອເລືອກລົດທີ່ຕ້ອງການສັ່ງຊື້'
                      : "ຜູ້ສະໜອງນີ້ບໍ່ມີສິນຄ້າໃນລະບົບ"
                    : "ກະລຸນາເລືອກຜູ້ສະໜອງກ່ອນເພື່ອເລືອກສິນຄ້າ"
                  }
                </p>
              </div>
            )}
          </div>

          {/* Order Summary */}
          {formData.products.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-notosanslao font-semibold text-gray-900 mb-4">
                ສະຫຼຸບການສັ່ງຊື້
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Car className="text-blue-600" size={20} />
                    <div>
                      <p className="text-sm text-blue-600 font-notosanslao">
                        ຈຳນວນລາຍການ
                      </p>
                      <p className="text-xl font-semibold text-blue-900">
                        {formData.products.length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Package className="text-green-600" size={20} />
                    <div>
                      <p className="text-sm text-green-600 font-notosanslao">
                        ຈຳນວນລວມ
                      </p>
                      <p className="text-xl font-semibold text-green-900">
                        {totalQuantity}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <User className="text-purple-600" size={20} />
                    <div>
                      <p className="text-sm text-purple-600 font-notosanslao">
                        ຜູ້ສັ່ງຊື້
                      </p>
                      <p className="text-xl font-semibold text-purple-900">
                        {user?.username || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => {
                  navigate("/admin/purchases");
                }}
                className="px-6 py-3 text-gray-700 border font-notosanslao border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                ຍົກເລີກ
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={
                  isSubmitting || formData.products.length === 0 || !user
                }
                className={`px-6 py-3 bg-blue-600 text-white rounded-lg font-notosanslao hover:bg-blue-700 flex items-center gap-2 transition-colors ${
                  isSubmitting || formData.products.length === 0 || !user
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <Save size={20} />
                {isSubmitting ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກໃບສັ່ງຊື້"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePurchase;