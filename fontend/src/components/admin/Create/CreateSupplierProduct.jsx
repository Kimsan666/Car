import React, { useState, useEffect } from "react";
import {
  Plus,
  X,
  Save,
  ArrowLeft,
  Search,
  AlertCircle,
  Building,
  Car,
  CheckCircle,
  Package,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useCarStore from "../../../Store/car-store";
import { saveSupplierProduct } from "../../../api/SupplierProduct";
import { toast } from "react-toastify";

const CreateSupplierProduct = () => {
  const navigate = useNavigate();
  const {
    token,
    suppliers = [],
    cars = [],
    suppliersproducts = [],
    getSupplier,
    getCar,
    getSuppliersProduct,
  } = useCarStore();

  const [formData, setFormData] = useState({
    supplierId: "",
    cars: [],
  });

  const [availableSuppliers, setAvailableSuppliers] = useState([]);
  const [availableCars, setAvailableCars] = useState([]);
  const [searchCar, setSearchCar] = useState("");
  const [showCarSearch, setShowCarSearch] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  // Debug logs
  console.log("Raw cars data:", cars);
  console.log("Raw suppliers data:", suppliers);
  console.log("Raw suppliersproducts data:", suppliersproducts);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    // แก้ไขการแสดงข้อมูลจาก store
    const suppliersData = Array.isArray(suppliers) ? suppliers : 
                         suppliers?.data ? suppliers.data : [];
    
    const carsData = Array.isArray(cars) ? cars : 
                    cars?.data ? cars.data : [];

    console.log("Processed suppliers:", suppliersData);
    console.log("Processed cars:", carsData);

    setAvailableSuppliers(suppliersData);
    setAvailableCars(carsData);
  }, [suppliers, cars]);

  const loadInitialData = async () => {
    try {
      setDataLoading(true);

      await Promise.all([
        getSupplier(),
        getCar(),
        getSuppliersProduct(), // ดึงข้อมูลการเชื่อมต่อที่มีอยู่แล้ว
      ]);
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast.error("ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້");
    } finally {
      setTimeout(() => setDataLoading(false), 500); // เพิ่มเวลาให้ข้อมูลโหลดเสร็จ
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
      setFormData((prev) => ({ ...prev, cars: [] }));
    }
  };

  const addCar = (car) => {
    // ต้องการ supplierId ก่อน
    if (!formData.supplierId) {
      toast.error("ກະລຸນາເລືອກຜູ້ສະໜອງກ່ອນ");
      return;
    }

    // ตรวจสอบไม่ให้เพิ่มรถซ้ำ
    const isExist = formData.cars.some((c) => c.carId === car.id);
    if (isExist) {
      toast.error("ລົດນີ້ຖືກເລືອກແລ້ວ");
      return;
    }
    
    // แก้ไขการเข้าถึงข้อมูลรถให้ถูกต้องตาม schema
    const newCar = {
      carId: car.id,
      brandName: car.brandCars?.name || "ບໍ່ລະບຸແບຣນ",
      modelName: car.brandAndModels?.modelCar || "ບໍ່ລະບຸລຸ້ນ",
      typeName: car.typecar?.name || "ບໍ່ລະບຸປະເພດ",
      description: car.description || "",
      notes: "",
      isActive: true,
    };

    console.log("Adding car:", newCar);

    setFormData((prev) => ({
      ...prev,
      cars: [...prev.cars, newCar],
    }));

    setShowCarSearch(false);
    setSearchCar("");
    toast.success("ເພີ່ມລົດສຳເລັດ");
  };

  const updateCarField = (itemIndex, field, value) => {
    setFormData((prev) => ({
      ...prev,
      cars: prev.cars.map((car, index) =>
        index === itemIndex ? { ...car, [field]: value } : car
      ),
    }));
  };

  const updateCarStatus = (itemIndex, isActive) => {
    updateCarField(itemIndex, "isActive", isActive);
  };

  const updateCarNotes = (itemIndex, notes) => {
    updateCarField(itemIndex, "notes", notes);
  };

  const removeCar = (itemIndex) => {
    setFormData((prev) => ({
      ...prev,
      cars: prev.cars.filter((_, index) => index !== itemIndex),
    }));
    toast.info("ລຶບລົດອອກຈາກລາຍການ");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.supplierId) {
      newErrors.supplierId = "ກະລຸນາເລືອກຜູ້ສະໜອງ";
    }

    if (formData.cars.length === 0) {
      newErrors.cars = "ກະລຸນາເພີ່ມລົດຢ່າງນ້ອຍ 1 ຄັນ";
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
      setLoading(true);

      // สร้างการเชื่อมต่อทีละรายการ
      const promises = formData.cars.map(async (car) => {
        try {
          const result = await saveSupplierProduct(token, {
            supplierId: parseInt(formData.supplierId),
            carId: car.carId,
            notes: car.notes || "",
            isActive: car.isActive,
          });
          console.log("Saved car connection:", result);
          return result;
        } catch (error) {
          console.error("Error saving car connection:", error);
          throw error;
        }
      });

      await Promise.all(promises);

      toast.success(`ສ້າງການເຊື່ອມຕໍ່ສຳເລັດ ${formData.cars.length} ລາຍການ`);
      
      // รีเฟรชข้อมูล
      await getSuppliersProduct();
      
      navigate("/admin/supplier-products");
    } catch (error) {
      console.error("Error submitting supplier products:", error);

      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.join(", ");
        toast.error(errorMessages);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("ບໍ່ສາມາດບັນທຶກຂໍ້ມູນໄດ້: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // แก้ไขการ filter รถ
  const filteredCars = Array.isArray(availableCars)
    ? availableCars.filter((car) => {
        const searchTerm = searchCar.toLowerCase();

        // ตรวจสอบว่าไม่ได้เลือกในรายการปัจจุบัน
        const isNotSelectedInCurrentForm = !formData.cars.some(
          (c) => c.carId === car.id
        );

        // ตรวจสอบว่าไม่ได้มีการเชื่อมต่อกับ supplier ที่เลือกแล้ว
        const suppliersProductsArray = Array.isArray(suppliersproducts) ? suppliersproducts : [];
        const isNotLinkedToSupplier = !suppliersProductsArray.some(
          (sp) =>
            sp.supplierId === parseInt(formData.supplierId) &&
            sp.carId === car.id
        );

        // ตรวจสอบการค้นหา - แก้ไขการเข้าถึงข้อมูล
        const matchesSearch = !searchTerm || 
          car.brandCars?.name?.toLowerCase().includes(searchTerm) ||
          car.brandAndModels?.modelCar?.toLowerCase().includes(searchTerm) ||
          car.typecar?.name?.toLowerCase().includes(searchTerm) ||
          car.description?.toLowerCase().includes(searchTerm);

        return isNotSelectedInCurrentForm && isNotLinkedToSupplier && matchesSearch;
      })
    : [];

  const selectedSupplier = Array.isArray(availableSuppliers)
    ? availableSuppliers.find((s) => s.id === parseInt(formData.supplierId))
    : null;

  const isSupplierSelected = Boolean(formData.supplierId);

  if (dataLoading) {
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
              onClick={() => navigate("/admin/supplier-products")}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="font-notosanslao">
              <h1 className="text-2xl font-bold text-gray-900">
                ເພີ່ມການເຊື່ອມຕໍ່ຜູ້ສະໜອງ-ລົດ
              </h1>
              <p className="text-gray-600 mt-1">
                ສ້າງຄວາມສຳພັນລະຫວ່າງຜູ້ສະໜອງແລະລົດຫຼາຍລາຍການ
              </p>
              <div className="text-sm text-blue-600 mt-2">
                📊 ສຖິຕິ: ຜູ້ສະໜອງ {availableSuppliers.length} ລາຍ, ລົດ {availableCars.length} ຄັນ
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Supplier Selection */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 font-notosanslao">
              <Building size={20} className="text-blue-600" />
              ຂໍ້ມູນຜູ້ສະໜອງ
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-notosanslao">
                  ຜູ້ສະໜອງ <span className="text-red-500">*</span>
                </label>
                <select
                  name="supplierId"
                  value={formData.supplierId}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-notosanslao ${
                    errors.supplierId ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">ເລືອກຜູ້ສະໜອງ</option>
                  {availableSuppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.companyName}
                      {supplier.contactName && ` - ${supplier.contactName}`}
                    </option>
                  ))}
                </select>
                {errors.supplierId && (
                  <p className="text-red-500 text-sm mt-1 font-notosanslao">
                    {errors.supplierId}
                  </p>
                )}
                {availableSuppliers.length === 0 && (
                  <p className="text-yellow-600 text-sm mt-1 font-notosanslao">
                    ⚠️ ບໍ່ມີຜູ້ສະໜອງໃນລະບົບ
                  </p>
                )}
              </div>
            </div>

            {selectedSupplier && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-blue-900 mb-2 font-medium font-notosanslao">
                  ຂໍ້ມູນຜູ້ສະໜອງ
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800 font-notosanslao">
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
                  <div>
                    <span className="font-medium">ອີເມວ:</span>{" "}
                    {selectedSupplier.email || "-"}
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-medium">ທີ່ຢູ່:</span>{" "}
                    {selectedSupplier.address || "-"}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Car Selection */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 font-notosanslao">
                <Car size={20} className="text-green-600" />
                ລາຍການລົດ
              </h2>
              <button
                onClick={() => setShowCarSearch(!showCarSearch)}
                disabled={!isSupplierSelected}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-notosanslao ${
                  isSupplierSelected
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <Plus size={20} />
                ເພີ່ມລົດ ({availableCars.length} ຄັນຍັງເຫຼືອ)
              </button>
            </div>

            {errors.cars && (
              <p className="text-red-500 text-sm mb-4 font-notosanslao">
                {errors.cars}
              </p>
            )}

            {!isSupplierSelected && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="text-yellow-600 w-5 h-5" />
                  <div className="font-notosanslao">
                    <p className="text-yellow-800 font-medium">
                      ກະລຸນາເລືອກຜູ້ສະໜອງກ່ອນເພີ່ມລົດ
                    </p>
                    <p className="text-yellow-700 text-sm mt-1">
                      ທ່ານຕ້ອງເລືອກຜູ້ສະໜອງກ່ອນ ເພື່ອເພີ່ມລົດ
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Car Search */}
            {showCarSearch && isSupplierSelected && (
              <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Search size={20} className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="ຄົ້ນຫາລົດ (ແບຣນ, ລຸ້ນ, ປະເພດ, ລາຍລະອຽດ)"
                    value={searchCar}
                    onChange={(e) => setSearchCar(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-notosanslao"
                  />
                </div>

                {/* Info about filtering */}
                <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 font-notosanslao">
                    📋 ຫມາຍເຫດ: ລົດທີ່ມີການເຊື່ອມຕໍ່ກັບຜູ້ສະໜອງນີ້ແລ້ວ ຈະບໍ່ສະແດງໃນລາຍການ
                  </p>
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {filteredCars.length > 0 ? (
                    <div className="space-y-2">
                      {filteredCars.map((car) => (
                        <div
                          key={car.id}
                          className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 font-notosanslao">
                                {car.brandCars?.name || "ບໍ່ລະບຸແບຣນ"} - {car.brandAndModels?.modelCar || "ບໍ່ລະບຸລຸ້ນ"}
                              </h4>
                              <div className="flex gap-4 text-xs text-gray-500 mt-1 font-notosanslao">
                                <span>ປະເພດ: {car.typecar?.name || "-"}</span>
                                <span>ລາຍລະອຽດ: {car.description || "-"}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => addCar(car)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="ເພີ່ມລົດນີ້"
                            >
                              <Plus size={20} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8 font-notosanslao">
                      {searchCar ? (
                        <div>
                          <div className="text-4xl mb-2">🔍</div>
                          <p>ບໍ່ພົບລົດທີ່ຄົ້ນຫາ "{searchCar}"</p>
                          <p className="text-sm">ลองค้นหาด้วยคำอื่นหรือลົດທີ່ຄົ້ນຫາມີການເຊື່ອມຕໍ່ແລ້ວ</p>
                        </div>
                      ) : availableCars.length === 0 ? (
                        <div>
                          <div className="text-4xl mb-2">🚗</div>
                          <p>ບໍ່ມີລົດໃນລະບົບ</p>
                        </div>
                      ) : (
                        <div>
                          <div className="text-4xl mb-2">✅</div>
                          <p>ລົດທັງໝົດມີການເຊື່ອມຕໍ່ກັບຜູ້ສະໜອງນີ້ແລ້ວ</p>
                          <p className="text-sm">ກະລຸນາພິມເພື່ອຄົ້ນຫາລົດ</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Selected Cars Table */}
            {formData.cars.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700 font-notosanslao">
                        ລຳດັບ
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700 font-notosanslao">
                        ຂໍ້ມູນລົດ
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700 font-notosanslao">
                        ສະຖານະ
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700 font-notosanslao">
                        ໝາຍເຫດ
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700 font-notosanslao">
                        ຈັດການ
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.cars.map((car, index) => (
                      <tr
                        key={`${car.carId}-${index}`}
                        className="hover:bg-gray-50"
                      >
                        <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900 font-notosanslao">
                          {index + 1}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                          <div className="font-notosanslao">
                            <div className="font-medium">{car.brandName} - {car.modelName}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              ປະເພດ: {car.typeName}
                            </div>
                            {car.description && (
                              <div className="text-xs text-gray-500">
                                {car.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center">
                          <button
                            onClick={() => updateCarStatus(index, !car.isActive)}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors font-notosanslao ${
                              car.isActive
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-red-100 text-red-800 hover:bg-red-200"
                            }`}
                          >
                            {car.isActive ? (
                              <>
                                <CheckCircle size={12} className="mr-1" />
                                ເປີດໃຊ້ງານ
                              </>
                            ) : (
                              <>
                                <X size={12} className="mr-1" />
                                ປິດໃຊ້ງານ
                              </>
                            )}
                          </button>
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          <input
                            type="text"
                            value={car.notes}
                            onChange={(e) => updateCarNotes(index, e.target.value)}
                            placeholder="ໝາຍເຫດ..."
                            className="w-full p-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-notosanslao"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center">
                          <button
                            onClick={() => removeCar(index)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                            title="ລຶບລົດນີ້ອອກ"
                          >
                            <X size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {formData.cars.length === 0 && (
              <div className="text-center text-gray-500 py-12">
                <div className="text-4xl mb-4">🚗</div>
                <p className="text-lg font-notosanslao">ຍັງບໍ່ມີລົດໃນລາຍການ</p>
                <p className="text-sm font-notosanslao">
                  {isSupplierSelected
                    ? 'ກົດປຸ່ມ "ເພີ່ມລົດ" ເພື່ອເລືອກລົດ'
                    : "ເລືອກຜູ້ສະໜອງກ່ອນເພື່ອເພີ່ມລົດ"}
                </p>
              </div>
            )}
          </div>

          {/* Summary */}
          {formData.cars.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 font-notosanslao">
                ສະຫຼຸບຂໍ້ມູນ
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Package className="text-blue-600" size={20} />
                    <div className="font-notosanslao">
                      <p className="text-sm text-blue-600">ຈຳນວນລົດ</p>
                      <p className="text-xl font-semibold text-blue-900">
                        {formData.cars.length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-green-600" size={20} />
                    <div className="font-notosanslao">
                      <p className="text-sm text-green-600">ເປີດໃຊ້ງານ</p>
                      <p className="text-xl font-semibold text-green-900">
                        {formData.cars.filter((c) => c.isActive).length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <X className="text-red-600" size={20} />
                    <div className="font-notosanslao">
                      <p className="text-sm text-red-600">ປິດໃຊ້ງານ</p>
                      <p className="text-xl font-semibold text-red-900">
                        {formData.cars.filter((c) => !c.isActive).length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Car className="text-gray-600" size={20} />
                    <div className="font-notosanslao">
                      <p className="text-sm text-gray-600">มีเชื่อมต่อแล้ว</p>
                      <p className="text-xl font-semibold text-gray-900">
                        {formData.supplierId && Array.isArray(suppliersproducts)
                          ? suppliersproducts.filter(
                              (sp) => sp.supplierId === parseInt(formData.supplierId)
                            ).length
                          : 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Car breakdown */}
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2 font-notosanslao">
                  ລາຍລະອຽດລົດ:
                </h4>
                <div className="space-y-2">
                  {formData.cars.map((car, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <span className="text-sm text-gray-700 font-notosanslao">
                        {car.brandName} - {car.modelName}
                      </span>
                      <div className="flex items-center gap-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-notosanslao ${
                            car.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {car.isActive ? "ເປີດໃຊ້ງານ" : "ປິດໃຊ້ງານ"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-end gap-4">
              <button
                onClick={() => navigate("/admin/supplier-products")}
                className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-notosanslao"
                disabled={loading}
              >
                ຍົກເລີກ
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || formData.cars.length === 0 || !token || !formData.supplierId}
                className={`px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors font-notosanslao ${
                  loading || formData.cars.length === 0 || !token || !formData.supplierId
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <Save size={20} />
                {loading ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກຂໍ້ມູນ"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSupplierProduct;