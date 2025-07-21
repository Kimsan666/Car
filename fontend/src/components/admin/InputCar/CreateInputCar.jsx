import React, { useState, useEffect } from "react";
import {
  Plus,
  Minus,
  Search,
  CheckCircle,
  Package,
  Truck,
  ArrowLeft,
  AlertCircle,
  Car,
  FileText,
  Calendar,
  User,
  Building2,
  ArrowRight,
} from "lucide-react";
import useCarStore from "../../../Store/car-store";
import { toast } from "react-toastify";
import { listPurchases } from "../../../api/Purchase";
import { useNavigate } from "react-router-dom";

const CreateInputCar = () => {
  const { user, token, suppliers, getSupplier } = useCarStore();
  const navigate = useNavigate();

  // Safe array conversion
  const safeSuppliers = Array.isArray(suppliers?.data)
    ? suppliers.data
    : Array.isArray(suppliers)
    ? suppliers
    : [];

  const [confirmedPurchases, setConfirmedPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPurchases, setSelectedPurchases] = useState([]);
  const [receivedItems, setReceivedItems] = useState([]);
  const [formData, setFormData] = useState({
    supplierId: "",
    expectedDeliveryDate: "",
    notes: "",
  });

  useEffect(() => {
    loadConfirmedPurchases();
    if (safeSuppliers.length === 0) {
      getSupplier();
    }
  }, []);

  // โหลดใบสั่งซื้อที่อนุมัติแล้ว
  const loadConfirmedPurchases = async () => {
    try {
      setLoading(true);
      const response = await listPurchases(token, { status: "CONFIRMED" });
      console.log("Confirmed purchases:", response.data.data);
      setConfirmedPurchases(response.data.data || []);
    } catch (error) {
      console.error("Error loading confirmed purchases:", error);
      toast.error("ບໍ່ສາມາດໂຫຼດໃບສັ່ງຊື້ທີ່ອນຸມັດແລ້ວໄດ້");
    } finally {
      setLoading(false);
    }
  };

  // กรองใบสั่งซื้อตามคำค้นหา
  const filteredPurchases = confirmedPurchases.filter((purchase) => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      purchase.supplier?.companyName?.toLowerCase().includes(searchTerm) ||
      purchase.orderdBy?.username?.toLowerCase().includes(searchTerm) ||
      purchase.id.toString().includes(searchTerm)
    );
  });

  // เลือก/ยกเลิกใบสั่งซื้อ
  const togglePurchaseSelection = (purchase) => {
    const isSelected = selectedPurchases.find(p => p.id === purchase.id);
    
    if (isSelected) {
      // ยกเลิกการเลือก
      setSelectedPurchases(prev => prev.filter(p => p.id !== purchase.id));
      setReceivedItems(prev => prev.filter(item => 
        !purchase.products.some(product => product.id === item.originalItemId)
      ));
    } else {
      // เลือกใบสั่งซื้อ
      setSelectedPurchases(prev => [...prev, purchase]);
      
      // เพิ่มรายการสินค้าจากใบสั่งซื้อนี้
      const newItems = purchase.products.map(product => ({
        originalItemId: product.id,
        purchaseId: purchase.id,
        carId: product.carId,
        carName: product.Car?.name || "",
        licensePlate: product.Car?.licensePlate || "",
        brandModel: product.Car?.brandAndModels 
          ? `${product.Car.brandAndModels.BrandCars?.name || ""} ${product.Car.brandAndModels.modelCar || ""}`
          : "",
        orderedQuantity: product.quantity,
        receivedQuantity: product.quantity, // เริ่มต้นเท่ากับที่สั่ง
        maxQuantity: product.quantity,
      }));
      
      setReceivedItems(prev => [...prev, ...newItems]);
    }

    // อัปเดต supplierId จากใบสั่งซื้อแรกที่เลือก
    if (!isSelected && selectedPurchases.length === 0) {
      setFormData(prev => ({
        ...prev,
        supplierId: purchase.supplierId?.toString() || ""
      }));
    }
  };

  // อัปเดตจำนวนที่ได้รับ
  const updateReceivedQuantity = (originalItemId, newQuantity) => {
    setReceivedItems(prev => prev.map(item => {
      if (item.originalItemId === originalItemId) {
        return {
          ...item,
          receivedQuantity: Math.max(0, Math.min(newQuantity, item.maxQuantity))
        };
      }
      return item;
    }));
  };

  // ตรวจสอบความถูกต้องของข้อมูล
  const validateForm = () => {
    if (selectedPurchases.length === 0) {
      toast.error("ກະລຸນາເລືອກໃບສັ່ງຊື້ຢ່າງນ້ອຍ 1 ໃບ");
      return false;
    }

    const hasValidItems = receivedItems.some(item => item.receivedQuantity > 0);
    if (!hasValidItems) {
      toast.error("ກະລຸນາລະບຸຈຳນວນທີ່ໄດ້ຮັບຢ່າງນ້ອຍ 1 ລາຍການ");
      return false;
    }

    return true;
  };

  // ไปหน้าถัดไป (ป้อนข้อมูลรถจริง)
  const handleNext = () => {
    if (!validateForm()) return;

    // เตรียมข้อมูลสำหรับหน้าถัดไป
    const inputCarData = {
      selectedPurchases,
      receivedItems: receivedItems.filter(item => item.receivedQuantity > 0),
      formData,
      supplierId: formData.supplierId,
      expectedDeliveryDate: formData.expectedDeliveryDate,
      notes: formData.notes,
    };

    // บันทึกข้อมูลใน localStorage ชั่วคราว (เนื่องจากจะใช้ในหน้าถัดไป)
    localStorage.setItem("inputCarData", JSON.stringify(inputCarData));
    
    // นำไปหน้าป้อนข้อมูลรถจริง
    navigate("/admin/input-cars/create-actual");
  };

  const handleCancel = () => {
    navigate("/admin/input-cars");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // คำนวณสถิติ
  const totalOrderedQuantity = receivedItems.reduce((sum, item) => sum + item.orderedQuantity, 0);
  const totalReceivedQuantity = receivedItems.reduce((sum, item) => sum + item.receivedQuantity, 0);
  const selectedSupplier = safeSuppliers.find(s => s.id === parseInt(formData.supplierId));

  if (loading) {
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancel}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="font-notosanslao">
              <h1 className="text-2xl font-bold text-gray-900">
                ສ້າງລາຍການນຳເຂົ້າລົດ - ຂັ້ນຕອນທີ 1
              </h1>
              <p className="text-gray-600 mt-1">
                ເລືອກໃບສັ່ງຊື້ທີ່ອນຸມັດແລ້ວ ແລະ ລະບຸຈຳນວນທີ່ໄດ້ຮັບຈິງ
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Search size={20} className="text-gray-400" />
            <input
              type="text"
              placeholder="ຄົ້ນຫາໃບສັ່ງຊື້ (ID, ຊື່ບໍລິສັດ, ຜູ້ສັ່ງ)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-notosanslao"
            />
          </div>
          
          {confirmedPurchases.length === 0 && (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2 font-notosanslao">
                ບໍ່ມີໃບສັ່ງຊື້ທີ່ອນຸມັດແລ້ວ
              </h3>
              <p className="text-gray-500 font-notosanslao">
                ຕ້ອງມີໃບສັ່ງຊື້ທີ່ມີສະຖານະ "ອນຸມັດແລ້ວ" ເພື່ອສ້າງລາຍການນຳເຂົ້າ
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Purchase Orders List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 font-notosanslao">
                  ໃບສັ່ງຊື້ທີ່ອນຸມັດແລ້ວ
                </h2>
                <p className="text-sm text-gray-600 font-notosanslao">
                  ເລືອກໃບສັ່ງຊື້ທີ່ຕ້ອງການນຳເຂົ້າ ({filteredPurchases.length} ໃບ)
                </p>
              </div>
              
              <div className="max-h-[600px] overflow-y-auto">
                {filteredPurchases.length > 0 ? (
                  <div className="space-y-4 p-6">
                    {filteredPurchases.map((purchase) => {
                      const isSelected = selectedPurchases.find(p => p.id === purchase.id);
                      return (
                        <div
                          key={purchase.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            isSelected
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                          onClick={() => togglePurchaseSelection(purchase)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg font-semibold text-gray-900 font-notosanslao">
                                  #{purchase.id}
                                </span>
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium font-notosanslao">
                                  ອນຸມັດແລ້ວ
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="space-y-1 font-notosanslao">
                                  <div className="flex items-center gap-2">
                                    <Building2 size={16} className="text-gray-400" />
                                    <span>
                                      <span className="font-medium">ຜູ້ສະໜອງ:</span>{" "}
                                      {purchase.supplier?.companyName || "ບໍ່ລະບຸ"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <User size={16} className="text-gray-400" />
                                    <span>
                                      <span className="font-medium">ຜູ້ສັ່ງ:</span>{" "}
                                      {purchase.orderdBy?.username || "ບໍ່ລະບຸ"}
                                    </span>
                                  </div>
                                </div>
                                <div className="space-y-1 font-notosanslao">
                                  <div className="flex items-center gap-2">
                                    <Package size={16} className="text-gray-400" />
                                    <span>
                                      <span className="font-medium">ຈຳນວນ:</span>{" "}
                                      {purchase.quantitytotal || purchase._count?.products || 0} ລາຍການ
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-gray-400" />
                                    <span>
                                      <span className="font-medium">ວັນທີ່:</span>{" "}
                                      {new Date(purchase.createdAt).toLocaleDateString("lo-LA")}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Product Summary */}
                              {purchase.products && purchase.products.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                  <p className="text-xs text-gray-600 font-notosanslao mb-2">
                                    ລາຍການສິນຄ້າ:
                                  </p>
                                  <div className="space-y-1">
                                    {purchase.products.slice(0, 2).map((product, index) => (
                                      <div key={index} className="text-xs text-gray-600 font-notosanslao">
                                        • {product.Car?.name || "ບໍ່ມີຊື່"} - {product.quantity} ຄັນ
                                      </div>
                                    ))}
                                    {purchase.products.length > 2 && (
                                      <div className="text-xs text-blue-600 font-notosanslao">
                                        + ອີກ {purchase.products.length - 2} ລາຍການ
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="ml-4">
                              {isSelected ? (
                                <CheckCircle className="text-blue-600" size={24} />
                              ) : (
                                <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 font-notosanslao">
                    {searchQuery ? "ບໍ່ພົບໃບສັ່ງຊື້ທີ່ຄົ້ນຫາ" : "ບໍ່ມີໃບສັ່ງຊື້ທີ່ອນຸມັດແລ້ວ"}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Selected Items & Received Quantities */}
          <div className="space-y-6">
            {/* Form Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 font-notosanslao">
                ຂໍ້ມູນລາຍການນຳເຂົ້າ
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-notosanslao">
                    ຜູ້ສະໜອງ
                  </label>
                  <input
                    type="text"
                    value={selectedSupplier?.companyName || "ຈະເລືອກອັດຕະໂນມັດຈາກໃບສັ່ງຊື້"}
                    readOnly
                    className="w-full p-3 border border-gray-300 bg-gray-50 rounded-lg text-gray-600 font-notosanslao"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-notosanslao">
                    ວັນທີ່ຄາດວ່າຈະໄດ້ຮັບ
                  </label>
                  <input
                    type="date"
                    name="expectedDeliveryDate"
                    value={formData.expectedDeliveryDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-notosanslao"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-notosanslao">
                    ໝາຍເຫດ
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="ໝາຍເຫດເພີ່ມເຕີມ..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-notosanslao"
                  />
                </div>
              </div>
            </div>

            {/* Summary */}
            {selectedPurchases.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 font-notosanslao">
                  ສະຫຼຸບ
                </h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-900">{selectedPurchases.length}</div>
                    <div className="text-sm text-blue-600 font-notosanslao">ໃບສັ່ງຊື້</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-900">{receivedItems.length}</div>
                    <div className="text-sm text-green-600 font-notosanslao">ລາຍການສິນຄ້າ</div>
                  </div>
                </div>

                <div className="space-y-2 text-sm font-notosanslao">
                  <div className="flex justify-between">
                    <span>ຈຳນວນທີ່ສັ່ງທັງໝົດ:</span>
                    <span className="font-medium">{totalOrderedQuantity} ຄັນ</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ຈຳນວນທີ່ຈະໄດ້ຮັບ:</span>
                    <span className="font-medium text-green-600">{totalReceivedQuantity} ຄັນ</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ສ່ວນຕ່າງ:</span>
                    <span className={`font-medium ${
                      totalOrderedQuantity - totalReceivedQuantity === 0 ? "text-green-600" : "text-red-600"
                    }`}>
                      {totalOrderedQuantity - totalReceivedQuantity} ຄັນ
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Received Items List */}
            {receivedItems.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 font-notosanslao">
                    ລະບຸຈຳນວນທີ່ໄດ້ຮັບ
                  </h3>
                  <p className="text-sm text-gray-600 font-notosanslao">
                    ແກ້ໄຂຈຳນວນທີ່ໄດ້ຮັບຈິງ
                  </p>
                </div>
                
                <div className="max-h-[400px] overflow-y-auto">
                  <div className="space-y-3 p-6">
                    {receivedItems.map((item) => (
                      <div key={item.originalItemId} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 font-notosanslao">
                              {item.carName}
                            </h4>
                            <p className="text-sm text-gray-600 font-notosanslao">
                              {item.licensePlate && `ປ້າຍ: ${item.licensePlate}`}
                              {item.brandModel && ` | ${item.brandModel}`}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600 font-notosanslao">
                            ສັ່ງ: {item.orderedQuantity} ຄັນ
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateReceivedQuantity(item.originalItemId, item.receivedQuantity - 1)}
                              disabled={item.receivedQuantity <= 0}
                              className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Minus size={16} />
                            </button>
                            
                            <span className="w-16 px-2 py-1 text-center font-medium bg-blue-50 text-blue-700 rounded border border-blue-200 font-notosanslao">
                              {item.receivedQuantity}
                            </span>
                            
                            <button
                              onClick={() => updateReceivedQuantity(item.originalItemId, item.receivedQuantity + 1)}
                              disabled={item.receivedQuantity >= item.maxQuantity}
                              className="p-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-notosanslao"
                >
                  ຍົກເລີກ
                </button>
                <button
                  onClick={handleNext}
                  disabled={selectedPurchases.length === 0 || !receivedItems.some(item => item.receivedQuantity > 0)}
                  className={`flex-1 px-4 py-3 text-white rounded-lg flex items-center justify-center gap-2 transition-colors font-notosanslao ${
                    selectedPurchases.length === 0 || !receivedItems.some(item => item.receivedQuantity > 0)
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  ຖັດໄປ
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateInputCar;