import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Minus, 
  X, 
  Save, 
  ArrowLeft, 
  Search, 
  AlertCircle, 
  Package, 
  User, 
  Calendar, 
  Hash, 
  MapPin, 
  Warehouse,
  Building,
  Phone,
  Mail,
  Edit,
  Trash2,
  Check,
  Download,
  FileText,
  Eye,
  ShoppingCart
} from "lucide-react";
import { toast } from "react-toastify";

// Mock data สำหรับ demo
const mockData = {
  suppliers: [
    { id: 1, companyName: "ABC Motors", contactName: "John Doe", phone: "020-5555-1234", email: "john@abcmotors.com" },
    { id: 2, companyName: "XYZ Auto Parts", contactName: "Jane Smith", phone: "020-5555-5678", email: "jane@xyzauto.com" },
    { id: 3, companyName: "Best Car Dealer", contactName: "Bob Johnson", phone: "020-5555-9012", email: "bob@bestcar.com" }
  ],
  warehouses: [
    { id: 1, name: "คลังหลัก", location: "กรุงเทพ" },
    { id: 2, name: "คลังสาขา 1", location: "ชลบุรี" },
    { id: 3, name: "คลังสาขา 2", location: "ระยอง" }
  ],
  cars: [
    { id: 1, name: "Toyota Camry", qrCode: "TOY001", brand: "Toyota", type: "Sedan", price: 1200000, minimumStock: 2 },
    { id: 2, name: "Honda Accord", qrCode: "HON001", brand: "Honda", type: "Sedan", price: 1300000, minimumStock: 1 },
    { id: 3, name: "BMW X5", qrCode: "BMW001", brand: "BMW", type: "SUV", price: 3500000, minimumStock: 1 },
    { id: 4, name: "Mercedes C-Class", qrCode: "MER001", brand: "Mercedes", type: "Sedan", price: 2800000, minimumStock: 1 }
  ],
  purchaseOrders: [
    { 
      id: 1, 
      status: "PENDING", 
      supplierId: 1,
      createdAt: new Date(),
      quantitytotal: 5,
      products: [
        { id: 1, carId: 1, quantity: 2, warehouseId: 1 },
        { id: 2, carId: 2, quantity: 3, warehouseId: 2 }
      ]
    }
  ],
  stockAlerts: [
    { id: 1, carId: 1, currentStock: 1, minimumStock: 2, warehouseId: 1 },
    { id: 2, carId: 3, currentStock: 0, minimumStock: 1, warehouseId: 2 }
  ]
};

// Custom Number Keypad Component
const CustomNumberKeypad = ({ isOpen, onClose, onConfirm, initialValue = 1, maxValue = 9999, title = "ป้อนจำนวน" }) => {
  const [value, setValue] = useState(initialValue.toString());

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue.toString());
    }
  }, [isOpen, initialValue]);

  const handleNumber = (num) => {
    if (value === "0" || (value.length === 1 && value === "1" && initialValue === 1)) {
      setValue(num.toString());
    } else {
      const newValue = value + num.toString();
      if (parseInt(newValue) <= maxValue) {
        setValue(newValue);
      }
    }
  };

  const handleClear = () => setValue("0");
  const handleBackspace = () => setValue(value.length > 1 ? value.slice(0, -1) : "0");
  const handleConfirm = () => {
    const numValue = parseInt(value) || 0;
    if (numValue > 0 && numValue <= maxValue) {
      onConfirm(numValue);
      onClose();
    }
  };

  const handleQuickAdd = (amount) => {
    const currentNum = parseInt(value) || 0;
    const newValue = currentNum + amount;
    if (newValue <= maxValue) {
      setValue(newValue.toString());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm mx-auto shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {parseInt(value).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">สูงสุด {maxValue.toLocaleString()} คัน</div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {/* Row 1 */}
            {[7, 8, 9].map(num => (
              <button key={num} onClick={() => handleNumber(num)} 
                className="h-14 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-lg transition-colors">
                {num}
              </button>
            ))}
            <button onClick={() => handleQuickAdd(10)} 
              className="h-14 bg-blue-100 hover:bg-blue-200 rounded-xl font-semibold text-blue-700 text-sm transition-colors">
              +10
            </button>

            {/* Row 2 */}
            {[4, 5, 6].map(num => (
              <button key={num} onClick={() => handleNumber(num)} 
                className="h-14 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-lg transition-colors">
                {num}
              </button>
            ))}
            <button onClick={() => handleQuickAdd(50)} 
              className="h-14 bg-blue-100 hover:bg-blue-200 rounded-xl font-semibold text-blue-700 text-sm transition-colors">
              +50
            </button>

            {/* Row 3 */}
            {[1, 2, 3].map(num => (
              <button key={num} onClick={() => handleNumber(num)} 
                className="h-14 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-lg transition-colors">
                {num}
              </button>
            ))}
            <button onClick={() => handleQuickAdd(100)} 
              className="h-14 bg-blue-100 hover:bg-blue-200 rounded-xl font-semibold text-blue-700 text-sm transition-colors">
              +100
            </button>

            {/* Row 4 */}
            <button onClick={() => handleNumber(0)} 
              className="h-14 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-lg transition-colors">
              0
            </button>
            <button onClick={handleBackspace} 
              className="h-14 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center">
              ⌫
            </button>
            <button onClick={handleClear} 
              className="h-14 bg-red-100 hover:bg-red-200 rounded-xl font-semibold text-red-700 transition-colors">
              AC
            </button>
            <button onClick={() => handleQuickAdd(500)} 
              className="h-14 bg-blue-100 hover:bg-blue-200 rounded-xl font-semibold text-blue-700 text-sm transition-colors">
              +500
            </button>
          </div>

          <button onClick={handleConfirm} disabled={parseInt(value) === 0}
            className={`w-full mt-6 h-12 rounded-xl font-semibold text-white transition-colors ${
              parseInt(value) === 0 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}>
            ตกลง
          </button>
        </div>
      </div>
    </div>
  );
};

// Stock Alert Component
const StockAlert = ({ showNavigateButton = false, maxItems = 5, onNavigateToPurchaseOrder, onViewDetails }) => {
  const [stockStats, setStockStats] = useState({
    lowStock: 0,
    outOfStock: 0,
    normalStock: 0
  });
  const [criticalStockProducts, setCriticalStockProducts] = useState([]);

  useEffect(() => {
    // คำนวณสถิติสต็อก
    const lowStock = mockData.stockAlerts.filter(item => item.currentStock > 0 && item.currentStock <= item.minimumStock).length;
    const outOfStock = mockData.stockAlerts.filter(item => item.currentStock === 0).length;
    const normalStock = mockData.cars.length - lowStock - outOfStock;

    setStockStats({ lowStock, outOfStock, normalStock });

    // คำนวณรายการสินค้าที่ต้องเร่งสั่งซื้อ
    const critical = mockData.stockAlerts
      .filter(stock => stock.currentStock <= stock.minimumStock)
      .sort((a, b) => {
        if (a.currentStock === 0 && b.currentStock !== 0) return -1;
        if (a.currentStock !== 0 && b.currentStock === 0) return 1;
        const ratioA = a.currentStock / (a.minimumStock || 1);
        const ratioB = b.currentStock / (b.minimumStock || 1);
        return ratioA - ratioB;
      })
      .slice(0, maxItems);

    setCriticalStockProducts(critical);
  }, [maxItems]);

  const totalCritical = stockStats.lowStock + stockStats.outOfStock;
  if (totalCritical === 0) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow-sm mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center flex-1">
          <div className="flex-shrink-0">
            <AlertCircle className="text-yellow-500 text-xl" />
          </div>
          <div className="ml-3 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-800 font-medium text-lg">แจ้งเตือนสินค้าคงคลัง</p>
                <p className="text-sm text-yellow-700 mt-1">
                  {stockStats.lowStock > 0 && <span>มีสินค้าใกล้หมด {stockStats.lowStock} รายการ </span>}
                  {stockStats.outOfStock > 0 && (
                    <span>{stockStats.lowStock > 0 ? "และ " : ""}สินค้าหมด {stockStats.outOfStock} รายการ</span>
                  )}
                </p>
              </div>
              <div className="flex gap-2 ml-4">
                {showNavigateButton && (
                  <button onClick={onNavigateToPurchaseOrder}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium">
                    <ShoppingCart className="w-4 h-4" />
                    สร้างใบสั่งซื้อ
                  </button>
                )}
                <button onClick={onViewDetails}
                  className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium">
                  <Eye className="w-4 h-4" />
                  ดูรายละเอียด
                </button>
              </div>
            </div>

            {criticalStockProducts.length > 0 && (
              <div className="mt-3">
                <div className="bg-white rounded-lg p-3 border border-yellow-200">
                  <h4 className="text-sm font-medium text-gray-800 mb-2">สินค้าที่ต้องเร่งสั่งซื้อ:</h4>
                  <div className="space-y-2">
                    {criticalStockProducts.map((stock, index) => {
                      const car = mockData.cars.find(c => c.id === stock.carId);
                      const warehouse = mockData.warehouses.find(w => w.id === stock.warehouseId);
                      return (
                        <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded text-sm">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{car?.name || "ไม่พบข้อมูล"}</div>
                            <div className="text-gray-600 text-xs">คลัง: {warehouse?.name || "ไม่พบข้อมูล"}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">คงเหลือ: {stock.currentStock}</div>
                            <div className="text-xs text-gray-600">ขั้นต่ำ: {stock.minimumStock}</div>
                          </div>
                          <div className="ml-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              stock.currentStock === 0 ? "bg-red-100 text-red-800" : "bg-orange-100 text-orange-800"
                            }`}>
                              {stock.currentStock === 0 ? "หมด" : "ใกล้หมด"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Purchase Order System Component
const PurchaseOrderSystem = () => {
  const [currentView, setCurrentView] = useState("list"); // list, create, edit, detail
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [purchaseOrders, setPurchaseOrders] = useState(mockData.purchaseOrders);
  
  // Create Purchase Order States
  const [keypadState, setKeypadState] = useState({
    isOpen: false,
    itemIndex: null,
    currentQuantity: 1,
  });

  const [formData, setFormData] = useState({
    supplierId: "",
    expectedDeliveryDate: "",
    items: [],
  });

  const [supplierProducts, setSupplierProducts] = useState([]);
  const [searchProduct, setSearchProduct] = useState("");
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [errors, setErrors] = useState({});

  const handleQuantityClick = (itemIndex) => {
    const currentItem = formData.items[itemIndex];
    setKeypadState({
      isOpen: true,
      itemIndex: itemIndex,
      currentQuantity: currentItem.quantity,
    });
  };

  const handleKeypadConfirm = (newQuantity) => {
    if (keypadState.itemIndex !== null) {
      updateQuantity(keypadState.itemIndex, newQuantity);
    }
    setKeypadState({ isOpen: false, itemIndex: null, currentQuantity: 1 });
  };

  const handleKeypadClose = () => {
    setKeypadState({ isOpen: false, itemIndex: null, currentQuantity: 1 });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    if (name === "supplierId") {
      setShowProductSearch(false);
      setSearchProduct("");
      setSupplierProducts(value ? mockData.cars : []);
      setFormData(prev => ({ ...prev, items: [] }));
    }
  };

  const addProduct = (car) => {
    const newItem = {
      carId: car.id,
      carName: car.name,
      carCode: car.qrCode,
      brand: car.brand,
      type: car.type,
      quantity: 1,
      minimumOrderQuantity: 1,
      warehouseId: null,
    };
    setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
    setShowProductSearch(false);
    setSearchProduct("");
  };

  const updateQuantity = (itemIndex, newQuantity) => {
    const item = formData.items[itemIndex];
    if (newQuantity < item.minimumOrderQuantity) {
      toast.error(`จำนวนต่ำสุดที่สั่งได้คือ ${item.minimumOrderQuantity} คัน`);
      return;
    }
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, index) =>
        index === itemIndex ? { ...item, quantity: newQuantity } : item
      ),
    }));
  };

  const updateWarehouse = (itemIndex, warehouseId) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, index) =>
        index === itemIndex ? { ...item, warehouseId: warehouseId ? parseInt(warehouseId) : null } : item
      ),
    }));
  };

  const removeProduct = (itemIndex) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, index) => index !== itemIndex),
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.supplierId) {
      newErrors.supplierId = "กรุณาเลือกผู้จำหน่าย";
    }
    if (formData.items.length === 0) {
      newErrors.items = "กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ";
    }
    for (let i = 0; i < formData.items.length; i++) {
      const item = formData.items[i];
      if (item.quantity < item.minimumOrderQuantity) {
        newErrors.items = `${item.carName} ต้องสั่งอย่างน้อย ${item.minimumOrderQuantity} คัน`;
        break;
      }
      if (!item.warehouseId) {
        newErrors.items = `${item.carName} ต้องเลือกคลังสินค้า`;
        break;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      toast.error("กรุณาป้อนข้อมูลให้ครบถ้วน");
      return;
    }
    
    const newOrder = {
      id: Date.now(),
      status: "PENDING",
      supplierId: parseInt(formData.supplierId),
      expectedDeliveryDate: formData.expectedDeliveryDate,
      createdAt: new Date(),
      quantitytotal: formData.items.reduce((sum, item) => sum + item.quantity, 0),
      products: formData.items.map(item => ({
        id: Date.now() + Math.random(),
        carId: item.carId,
        quantity: item.quantity,
        warehouseId: item.warehouseId,
      })),
    };

    setPurchaseOrders(prev => [newOrder, ...prev]);
    setFormData({ supplierId: "", expectedDeliveryDate: "", items: [] });
    setCurrentView("list");
    toast.success("สร้างใบสั่งซื้อสำเร็จ");
  };

  const handleNavigateToCreate = () => {
    setCurrentView("create");
    setFormData({ supplierId: "", expectedDeliveryDate: "", items: [] });
  };

  const handleViewDetails = (orderId) => {
    setSelectedOrderId(orderId);
    setCurrentView("detail");
  };

  const handleEdit = (orderId) => {
    setSelectedOrderId(orderId);
    setCurrentView("edit");
  };

  const handleDelete = (orderId) => {
    if (window.confirm("คุณแน่ใจหรือไม่ที่จะลบใบสั่งซื้อนี้?")) {
      setPurchaseOrders(prev => prev.filter(order => order.id !== orderId));
      toast.success("ลบใบสั่งซื้อสำเร็จ");
    }
  };

  const handleApprove = (orderId) => {
    if (window.confirm("คุณแน่ใจหรือไม่ที่จะอนุมัติใบสั่งซื้อนี้?")) {
      setPurchaseOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: "APPROVED" } : order
      ));
      toast.success("อนุมัติใบสั่งซื้อสำเร็จ");
    }
  };

  const handleCancel = (orderId) => {
    if (window.confirm("คุณแน่ใจหรือไม่ที่จะยกเลิกใบสั่งซื้อนี้?")) {
      setPurchaseOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: "CANCELLED" } : order
      ));
      toast.success("ยกเลิกใบสั่งซื้อสำเร็จ");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "APPROVED": return "bg-green-100 text-green-800 border-green-200";
      case "CANCELLED": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "PENDING": return "รอการอนุมัติ";
      case "APPROVED": return "อนุมัติแล้ว";
      case "CANCELLED": return "ยกเลิกแล้ว";
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat("th-TH").format(number || 0);
  };

  const filteredProducts = supplierProducts.filter(product => {
    const searchTerm = searchProduct.toLowerCase();
    return (
      product.name?.toLowerCase().includes(searchTerm) ||
      product.qrCode?.toLowerCase().includes(searchTerm)
    );
  });

  const totalQuantity = formData.items.reduce((sum, item) => sum + item.quantity, 0);
  const selectedSupplier = mockData.suppliers.find(s => s.id === parseInt(formData.supplierId));

  // List View
  if (currentView === "list") {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <StockAlert 
            showNavigateButton={true}
            onNavigateToPurchaseOrder={handleNavigateToCreate}
            onViewDetails={() => toast.info("ดูรายละเอียดสต็อก")}
          />
          
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ใบสั่งซื้อรถยนต์</h1>
                <p className="text-gray-600 mt-1">จัดการใบสั่งซื้อรถยนต์จากผู้จำหน่าย</p>
              </div>
              <button
                onClick={handleNavigateToCreate}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                สร้างใบสั่งซื้อใหม่
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">รายการใบสั่งซื้อ</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">เลขที่</th>
                    <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">ผู้จำหน่าย</th>
                    <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700">วันที่สั่งซื้อ</th>
                    <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700">จำนวนรวม</th>
                    <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700">สถานะ</th>
                    <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrders.map((order) => {
                    const supplier = mockData.suppliers.find(s => s.id === order.supplierId);
                    return (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                          PO-{String(order.id).padStart(6, "0")}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                          {supplier?.companyName || "ไม่ระบุ"}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center text-sm text-gray-900">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center text-sm text-gray-900">
                          {formatNumber(order.quantitytotal)} คัน
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleViewDetails(order.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="ดูรายละเอียด"
                            >
                              <Eye size={16} />
                            </button>
                            {order.status === "PENDING" && (
                              <>
                                <button
                                  onClick={() => handleEdit(order.id)}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="แก้ไข"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => handleApprove(order.id)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="อนุมัติ"
                                >
                                  <Check size={16} />
                                </button>
                                <button
                                  onClick={() => handleCancel(order.id)}
                                  className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                  title="ยกเลิก"
                                >
                                  <X size={16} />
                                </button>
                                <button
                                  onClick={() => handleDelete(order.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="ลบ"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Create View
  if (currentView === "create") {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView("list")}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">สร้างใบสั่งซื้อใหม่</h1>
                <p className="text-gray-600 mt-1">เพิ่มใบสั่งซื้อรถยนต์จากผู้จำหน่าย</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Supplier Selection */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">ข้อมูลผู้จำหน่าย</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ผู้จำหน่าย <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="supplierId"
                    value={formData.supplierId}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.supplierId ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">เลือกผู้จำหน่าย</option>
                    {mockData.suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.companyName}
                        {supplier.contactName && ` - ${supplier.contactName}`}
                      </option>
                    ))}
                  </select>
                  {errors.supplierId && <p className="text-red-500 text-sm mt-1">{errors.supplierId}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    วันที่คาดว่าจะได้รับสินค้า
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
                  <h3 className="text-blue-900 mb-2">ข้อมูลผู้จำหน่าย</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
                    <div><span className="font-medium">บริษัท:</span> {selectedSupplier.companyName}</div>
                    <div><span className="font-medium">ผู้ติดต่อ:</span> {selectedSupplier.contactName || "-"}</div>
                    <div><span className="font-medium">โทรศัพท์:</span> {selectedSupplier.phone || "-"}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Product Selection */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">รายการสินค้า</h2>
                <button
                  type="button"
                  onClick={() => setShowProductSearch(!showProductSearch)}
                  disabled={!formData.supplierId}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    formData.supplierId
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <Plus size={20} />
                  เพิ่มสินค้า
                </button>
              </div>

              {errors.items && <p className="text-red-500 text-sm mb-4">{errors.items}</p>}

              {!formData.supplierId && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="text-yellow-600 w-5 h-5" />
                    <p className="text-yellow-800 font-medium">กรุณาเลือกผู้จำหน่ายก่อนเพิ่มสินค้า</p>
                  </div>
                </div>
              )}

              {/* Product Search */}
              {showProductSearch && formData.supplierId && (
                <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Search size={20} className="text-gray-400" />
                    <input
                      type="text"
                      placeholder="ค้นหาสินค้า (ชื่อหรือรหัสสินค้า)"
                      value={searchProduct}
                      onChange={(e) => setSearchProduct(e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {filteredProducts.length > 0 ? (
                      <div className="space-y-2">
                        {filteredProducts.map((car) => (
                          <div
                            key={car.id}
                            className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{car.name}</h4>
                                <p className="text-sm text-gray-600">รหัสสินค้า: {car.qrCode}</p>
                                <div className="flex gap-4 text-xs text-gray-500 mt-1">
                                  <span>ยี่ห้อ: {car.brand}</span>
                                  <span>ประเภท: {car.type}</span>
                                  <span>ราคา: {formatNumber(car.price)} บาท</span>
                                </div>
                              </div>
                              <button
                                onClick={() => addProduct(car)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        {searchProduct ? "ไม่พบสินค้าที่ค้นหา" : "กรุณาพิมพ์เพื่อค้นหาสินค้า"}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Selected Products Table */}
              {formData.items.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">ลำดับ</th>
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">ชื่อสินค้า</th>
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">ประเภท</th>
                        <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700">จำนวน</th>
                        <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700">คลังสินค้า *</th>
                        <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, index) => {
                        const selectedWarehouse = mockData.warehouses.find(w => w.id === item.warehouseId);
                        return (
                          <tr key={`${item.carId}-${index}`} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                            <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                              <div>
                                {item.carName}
                                <div className="text-xs text-gray-500">รหัส: {item.carCode}</div>
                              </div>
                            </td>
                            <td className="border border-gray-300 px-4 py-3 text-sm text-gray-600">{item.type}</td>
                            <td className="border border-gray-300 px-4 py-3">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(index, item.quantity - 1)}
                                  className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                  disabled={item.quantity <= item.minimumOrderQuantity}
                                >
                                  <Minus size={16} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleQuantityClick(index)}
                                  className="w-16 px-2 py-1 text-center font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200 transition-colors"
                                >
                                  {item.quantity}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(index, item.quantity + 1)}
                                  className="p-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                >
                                  <Plus size={16} />
                                </button>
                              </div>
                            </td>
                            <td className="border border-gray-300 px-4 py-3">
                              <select
                                value={item.warehouseId || ""}
                                onChange={(e) => updateWarehouse(index, e.target.value)}
                                className={`w-full p-2 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                  !item.warehouseId ? "border-red-300 bg-red-50" : "border-gray-300"
                                }`}
                                required
                              >
                                <option value="">เลือกคลัง *</option>
                                {mockData.warehouses.map((warehouse) => (
                                  <option key={warehouse.id} value={warehouse.id}>
                                    {warehouse.name}
                                  </option>
                                ))}
                              </select>
                              {selectedWarehouse && (
                                <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                  <MapPin size={12} />
                                  {selectedWarehouse.location}
                                </div>
                              )}
                              {!item.warehouseId && (
                                <div className="text-xs text-red-500 mt-1">ต้องเลือกคลัง</div>
                              )}
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
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50 font-semibold">
                        <td colSpan="3" className="border border-gray-300 px-4 py-3 text-right text-sm text-gray-700">
                          จำนวนรวมทั้งหมด:
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center text-sm text-gray-900">{totalQuantity}</td>
                        <td colSpan="2" className="border border-gray-300 px-4 py-3"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {formData.items.length === 0 && (
                <div className="text-center text-gray-500 py-12">
                  <div className="text-4xl mb-4">🚗</div>
                  <p className="text-lg">ยังไม่มีสินค้าในรายการ</p>
                  <p className="text-sm">
                    {formData.supplierId
                      ? 'กดปุ่ม "เพิ่มสินค้า" เพื่อเลือกสินค้า'
                      : "เลือกผู้จำหน่ายก่อนเพื่อเพิ่มสินค้า"}
                  </p>
                </div>
              )}
            </div>

            {/* Order Summary */}
            {formData.items.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">สรุปการสั่งซื้อ</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Package className="text-blue-600" size={20} />
                      <div>
                        <p className="text-sm text-blue-600">จำนวนรายการ</p>
                        <p className="text-xl font-semibold text-blue-900">{formData.items.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Plus className="text-green-600" size={20} />
                      <div>
                        <p className="text-sm text-green-600">จำนวนรวม</p>
                        <p className="text-xl font-semibold text-green-900">{totalQuantity}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Warehouse className="text-purple-600" size={20} />
                      <div>
                        <p className="text-sm text-purple-600">คลังที่เลือก</p>
                        <p className="text-xl font-semibold text-purple-900">
                          {new Set(formData.items.filter(item => item.warehouseId).map(item => item.warehouseId)).size}
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
                  onClick={() => setCurrentView("list")}
                  className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={formData.items.length === 0}
                  className={`px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors ${
                    formData.items.length === 0 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Save size={20} />
                  บันทึกใบสั่งซื้อ
                </button>
              </div>
            </div>
          </div>

          {/* Custom Number Keypad */}
          <CustomNumberKeypad
            isOpen={keypadState.isOpen}
            onClose={handleKeypadClose}
            onConfirm={handleKeypadConfirm}
            initialValue={keypadState.currentQuantity}
            maxValue={9999}
            minValue={1}
            title="ป้อนจำนวน"
          />
        </div>
      </div>
    );
  }

  // Detail View
  if (currentView === "detail") {
    const order = purchaseOrders.find(o => o.id === selectedOrderId);
    if (!order) return <div>ไม่พบข้อมูล</div>;

    const supplier = mockData.suppliers.find(s => s.id === order.supplierId);

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentView("list")}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">รายละเอียดใบสั่งซื้อ</h1>
                  <p className="text-gray-600 mt-1">PO-{String(order.id).padStart(6, "0")}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Download size={16} />
                  Excel
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  <Download size={16} />
                  PDF
                </button>
                {order.status === "PENDING" && (
                  <>
                    <button 
                      onClick={() => handleEdit(order.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Edit size={16} />
                      แก้ไข
                    </button>
                    <button 
                      onClick={() => handleApprove(order.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      <Check size={16} />
                      อนุมัติ
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">ข้อมูลใบสั่งซื้อ</h2>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">เลขที่ใบสั่งซื้อ</p>
                        <p className="font-medium">PO-{String(order.id).padStart(6, "0")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">วันที่สั่งซื้อ</p>
                        <p className="font-medium">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">จำนวนรวม</p>
                        <p className="font-medium">{formatNumber(order.quantitytotal)} คัน</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">จำนวนรายการ</p>
                        <p className="font-medium">{order.products.length} รายการ</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products List */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">รายการสินค้า</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">ลำดับ</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">ชื่อสินค้า</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">ประเภท</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">จำนวน</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">คลังสินค้า</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {order.products.map((item, index) => {
                        const car = mockData.cars.find(c => c.id === item.carId);
                        const warehouse = mockData.warehouses.find(w => w.id === item.warehouseId);
                        return (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 text-center text-sm text-gray-900">{index + 1}</td>
                            <td className="px-4 py-4">
                              <div>
                                <p className="font-medium text-gray-900">{car?.name || "ไม่ระบุชื่อ"}</p>
                                {car?.qrCode && <p className="text-sm text-gray-500">รหัส: {car.qrCode}</p>}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center text-gray-900">{car?.type || "-"}</td>
                            <td className="px-4 py-4 text-center text-gray-900">{formatNumber(item.quantity)}</td>
                            <td className="px-4 py-4 text-center text-gray-900">
                              <div className="flex items-center justify-center gap-1">
                                <Warehouse className="w-4 h-4 text-gray-400" />
                                <span>{warehouse?.name || "ไม่ระบุ"}</span>
                              </div>
                              {warehouse?.location && (
                                <p className="text-xs text-gray-500 mt-1">{warehouse.location}</p>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Supplier Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">ข้อมูลผู้จำหน่าย</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Building className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">ชื่อบริษัท</p>
                      <p className="font-medium">{supplier?.companyName || "ไม่ระบุ"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">ผู้ติดต่อ</p>
                      <p className="font-medium">{supplier?.contactName || "ไม่ระบุ"}</p>
                    </div>
                  </div>
                  {supplier?.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">เบอร์โทร</p>
                        <p className="font-medium">{supplier.phone}</p>
                      </div>
                    </div>
                  )}
                  {supplier?.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">อีเมว</p>
                        <p className="font-medium">{supplier.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">สรุปใบสั่งซื้อ</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">จำนวนรายการ:</span>
                    <span className="font-medium">{order.products.length} รายการ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">จำนวนรวม:</span>
                    <span className="font-medium">{formatNumber(order.quantitytotal)} คัน</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">คลังสินค้า:</span>
                    <span className="font-medium">
                      {new Set(order.products.map(item => item.warehouseId)).size} คลัง
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Edit View (similar to create but with existing data)
  if (currentView === "edit") {
    const order = purchaseOrders.find(o => o.id === selectedOrderId);
    if (!order) return <div>ไม่พบข้อมูล</div>;

    // Initialize form with existing data
    React.useEffect(() => {
      if (order) {
        setFormData({
          supplierId: order.supplierId.toString(),
          expectedDeliveryDate: order.expectedDeliveryDate || "",
          items: order.products.map(product => {
            const car = mockData.cars.find(c => c.id === product.carId);
            return {
              carId: product.carId,
              carName: car?.name || "",
              carCode: car?.qrCode || "",
              brand: car?.brand || "",
              type: car?.type || "",
              quantity: product.quantity,
              minimumOrderQuantity: 1,
              warehouseId: product.warehouseId,
            };
          }),
        });
        setSupplierProducts(mockData.cars);
      }
    }, [order]);

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentView("list")}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">แก้ไขใบสั่งซื้อ</h1>
                  <p className="text-gray-600 mt-1">เลขที่: PO-{String(order.id).padStart(6, "0")}</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                {order.status === "PENDING" ? "รอดำเนินการ" : order.status}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Same form structure as create but with existing data */}
            {/* ... (use same form JSX as create view) ... */}
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setCurrentView("list")}
                  className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => {
                    if (!validateForm()) {
                      toast.error("กรุณาป้อนข้อมูลให้ครบถ้วน");
                      return;
                    }
                    
                    const updatedOrder = {
                      ...order,
                      supplierId: parseInt(formData.supplierId),
                      expectedDeliveryDate: formData.expectedDeliveryDate,
                      quantitytotal: formData.items.reduce((sum, item) => sum + item.quantity, 0),
                      products: formData.items.map(item => ({
                        id: Date.now() + Math.random(),
                        carId: item.carId,
                        quantity: item.quantity,
                        warehouseId: item.warehouseId,
                      })),
                    };

                    setPurchaseOrders(prev => prev.map(o => o.id === order.id ? updatedOrder : o));
                    setCurrentView("list");
                    toast.success("แก้ไขใบสั่งซื้อสำเร็จ");
                  }}
                  disabled={formData.items.length === 0}
                  className={`px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors ${
                    formData.items.length === 0 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Save size={20} />
                  บันทึกการแก้ไข
                </button>
              </div>
            </div>
          </div>

          <CustomNumberKeypad
            isOpen={keypadState.isOpen}
            onClose={handleKeypadClose}
            onConfirm={handleKeypadConfirm}
            initialValue={keypadState.currentQuantity}
            maxValue={9999}
            minValue={1}
            title="ป้อนจำนวน"
          />
        </div>
      </div>
    );
  }

  return null;
};

// Toast notification setup
const ToastProvider = ({ children }) => {
  return (
    <div>
      {children}
      <div id="toast-container" className="fixed top-4 right-4 z-50 space-y-2">
        {/* Toast notifications will be rendered here */}
      </div>
    </div>
  );
};

// Add toast functionality


export default function App() {
  return (
    <ToastProvider>
      <PurchaseOrderSystem />
    </ToastProvider>
  );
}