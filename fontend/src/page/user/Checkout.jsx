import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingCart,
  User,
  UserPlus,
  CreditCard,
  Check,
  AlertCircle,
  Car,
  Phone,
  Mail,
  MapPin,
  FileText,
  Save,
  Loader2,
  Package,
  CheckCircle2,
  Trash2,
  Plus
} from "lucide-react";
import useCarStore from "../../Store/car-store";
import { saveCustomer } from "../../api/Customer";
import { createOrder } from "../../api/Order";

const Checkout = () => {
  const navigate = useNavigate();
  const {
    carts = [],
    customers = [],
    token,
    getCustomer,
    clearCart,
    removeFromCart
  } = useCarStore();

  // States
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);

  // New Customer Form States
  const [newCustomer, setNewCustomer] = useState({
    fname: "",
    lname: "",
    number: "",
    email: "",
    address: "",
    numberDocuments: "",
    documentsType: "id_card",
    images: []
  });
  const [newCustomerErrors, setNewCustomerErrors] = useState({});

  useEffect(() => {
    loadCustomers();
  }, []);

  // ຖ້າບໍ່ມີສິນຄ້າໃນກະຕ້າ ໃຫ້ກັບໄປຫນ້າຫຼັກ
  useEffect(() => {
    if (carts.length === 0) {
      navigate('/user');
    }
  }, [carts.length, navigate]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      await getCustomer();
    } catch (error) {
      console.error("Error loading customers:", error);
    } finally {
      setLoading(false);
    }
  };

  // Format price function
  const formatPrice = (price) => {
    return new Intl.NumberFormat('lo-LA', {
      style: 'currency',
      currency: 'LAK',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Calculate total
  const getTotalPrice = () => {
    return carts.reduce((total, item) => total + (parseFloat(item.price) || 0), 0);
  };

  // Handle new customer form change
  const handleNewCustomerChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer(prev => ({ ...prev, [name]: value }));
    
    // Clear specific error when user starts typing
    if (newCustomerErrors[name]) {
      setNewCustomerErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Validate new customer form
  const validateNewCustomer = () => {
    const errors = {};

    if (!newCustomer.fname.trim()) {
      errors.fname = "ກະລຸນາປ້ອນຊື່";
    }

    if (!newCustomer.lname.trim()) {
      errors.lname = "ກະລຸນາປ້ອນນາມສະກຸນ";
    }

    if (!newCustomer.number.trim()) {
      errors.number = "ກະລຸນາປ້ອນເບີໂທລະສັບ";
    }

    if (!newCustomer.email.trim()) {
      errors.email = "ກະລຸນາປ້ອນອີເມວ";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newCustomer.email)) {
        errors.email = "ຮູບແບບອີເມວບໍ່ຖືກຕ້ອງ";
      }
    }

    if (!newCustomer.numberDocuments.trim()) {
      errors.numberDocuments = "ກະລຸນາປ້ອນເລກເອກະສານ";
    }

    setNewCustomerErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Create new customer
  const handleCreateCustomer = async () => {
    if (!validateNewCustomer()) {
      return;
    }

    try {
      setLoading(true);
      
      const response = await saveCustomer(token, newCustomer);

      if (response.data && response.data.data) {
        // Refresh customers list
        await loadCustomers();
        
        // Select the new customer
        setSelectedCustomerId(response.data.data.id.toString());
        
        // Close modal and reset form
        setShowAddCustomerModal(false);
        setNewCustomer({
          fname: "",
          lname: "",
          number: "",
          email: "",
          address: "",
          numberDocuments: "",
          documentsType: "id_card",
          images: []
        });
        setNewCustomerErrors({});

        // Show success message
        alert("ສ້າງລູກຄ້າໃໝ່ສຳເລັດແລ້ວ!");
      }
    } catch (error) {
      console.error("Error creating customer:", error);
      alert(error.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການສ້າງລູກຄ້າ");
    } finally {
      setLoading(false);
    }
  };

  // Handle checkout
  const handleCheckout = async () => {
    if (!selectedCustomerId) {
      alert("ກະລຸນາເລືອກລູກຄ້າກ່ອນ");
      return;
    }

    if (carts.length === 0) {
      alert("ກະຕ້າຫວ່າງເປົ່າ");
      return;
    }

    try {
      setOrderLoading(true);

      // Prepare order data
      const orderData = {
        customerId: parseInt(selectedCustomerId),
        totalAmount: getTotalPrice(),
        items: carts.map(item => ({
          carId: item.id,
          quantity: 1,
          price: parseFloat(item.price)
        }))
      };

      const response = await createOrder(token, orderData);

      if (response.data && response.data.success) {
        alert("ສັ່ງຊື້ສຳເລັດແລ້ວ!");
        
        // Clear cart
        clearCart();
        
        // Navigate back to shop
        navigate('/user');
      }
    } catch (error) {
      console.error("Error creating order:", error);
      alert(error.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການສັ່ງຊື້");
    } finally {
      setOrderLoading(false);
    }
  };

  const customersArray = Array.isArray(customers) ? customers : (customers?.data || []);
  const selectedCustomer = customersArray.find(c => c.id === parseInt(selectedCustomerId));

  if (carts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 font-notosanslao">
            ກະຕ້າຫວ່າງເປົ່າ
          </h3>
          <p className="text-gray-500 font-notosanslao mb-4">
            ກະລຸນາເລືອກສິນຄ້າກ່ອນດຳເນີນການຊຳລະ
          </p>
          <button
            onClick={() => navigate('/user')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors font-notosanslao"
          >
            ກັບໄປເລືອກສິນຄ້າ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/user')}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 font-notosanslao">
                ຊຳລະເງິນ
              </h1>
              <p className="text-gray-600 font-notosanslao">
                ກວດສອບລາຍການແລະຂໍ້ມູນລູກຄ້າ
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Order Summary */}
          <div className="space-y-6">
            {/* Cart Items */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Package size={20} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold font-notosanslao">
                    ລາຍການສິນຄ້າ
                  </h2>
                  <p className="text-sm text-gray-600 font-notosanslao">
                    {carts.length} ລາຍການ
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {carts.map((item, index) => (
                  <div key={item.cartItemId || index} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-20 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                      {item.car?.images?.[0] || item.car?.imaged?.[0] ? (
                        <img
                          src={item.car.images?.[0]?.secure_url || item.car.imaged?.[0]?.secure_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Car size={24} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 font-notosanslao mb-1">
                        {item.name || 'ລົດ'}
                      </h4>
                      <p className="text-sm text-gray-600 font-notosanslao mb-2">
                        {item.car?.brandCars?.name} • {item.car?.brandAndModels?.modelCar}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-blue-600">
                          {formatPrice(item.price || 0)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.cartItemId || index)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Total */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-semibold font-notosanslao">ລວມທັງໝົດ:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatPrice(getTotalPrice())}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Customer Info */}
          <div className="space-y-6">
            {/* Customer Selection */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <User size={20} className="text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold font-notosanslao">
                      ຂໍ້ມູນລູກຄ້າ
                    </h2>
                    <p className="text-sm text-gray-600 font-notosanslao">
                      ເລືອກຫຼືເພີ່ມລູກຄ້າໃໝ່
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddCustomerModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-notosanslao flex items-center gap-2"
                >
                  <Plus size={16} />
                  ເພີ່ມໃໝ່
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-sm text-gray-600 font-notosanslao">ກຳລັງໂຫຼດ...</p>
                </div>
              ) : customersArray.length === 0 ? (
                <div className="text-center py-8 bg-yellow-50 rounded-xl border border-yellow-200">
                  <AlertCircle className="mx-auto mb-3 text-yellow-600" size={32} />
                  <p className="text-sm text-yellow-800 font-notosanslao mb-4">
                    ບໍ່ມີຂໍ້ມູນລູກຄ້າ
                  </p>
                  <button
                    onClick={() => setShowAddCustomerModal(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-notosanslao"
                  >
                    ເພີ່ມລູກຄ້າຄົນທຳອິດ
                  </button>
                </div>
              ) : (
                <div>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-notosanslao mb-4"
                  >
                    <option value="">ເລືອກລູກຄ້າ ({customersArray.length} ຄົນ)</option>
                    {customersArray.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.fname} {customer.lname} - {customer.number}
                      </option>
                    ))}
                  </select>

                  {/* Selected Customer Details */}
                  {selectedCustomer && (
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-3 font-notosanslao">
                        ລາຍລະອຽດລູກຄ້າ:
                      </h4>
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-blue-800">
                          <User size={14} />
                          <span className="font-notosanslao">
                            {selectedCustomer.fname} {selectedCustomer.lname}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-blue-800">
                          <Phone size={14} />
                          <span>{selectedCustomer.number}</span>
                        </div>
                        <div className="flex items-center gap-2 text-blue-800">
                          <Mail size={14} />
                          <span>{selectedCustomer.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-blue-800">
                          <FileText size={14} />
                          <span>{selectedCustomer.numberDocuments}</span>
                        </div>
                        {selectedCustomer.address && (
                          <div className="flex items-center gap-2 text-blue-800">
                            <MapPin size={14} />
                            <span className="font-notosanslao">{selectedCustomer.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Checkout Button */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <CreditCard size={20} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold font-notosanslao">
                    ຢືນຢັນການສັ່ງຊື້
                  </h2>
                  <p className="text-sm text-gray-600 font-notosanslao">
                    ກວດສອບຂໍ້ມູນແລ້ວກົດຢືນຢັນ
                  </p>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={!selectedCustomerId || carts.length === 0 || orderLoading}
                className={`w-full py-4 rounded-xl font-medium font-notosanslao flex items-center justify-center gap-3 transition-all duration-200 ${
                  selectedCustomerId && carts.length > 0 && !orderLoading
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transform hover:-translate-y-0.5'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {orderLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    ກຳລັງປະມວນຜົນ...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={20} />
                    ຢືນຢັນການສັ່ງຊື້ ({formatPrice(getTotalPrice())})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold font-notosanslao flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <UserPlus size={16} className="text-green-600" />
                  </div>
                  ເພີ່ມລູກຄ້າໃໝ່
                </h3>
                <button
                  onClick={() => {
                    setShowAddCustomerModal(false);
                    setNewCustomerErrors({});
                  }}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-notosanslao">
                    ຊື່ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fname"
                    value={newCustomer.fname}
                    onChange={handleNewCustomerChange}
                    className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-notosanslao transition-colors ${
                      newCustomerErrors.fname ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="ປ້ອນຊື່"
                  />
                  {newCustomerErrors.fname && (
                    <p className="text-red-500 text-sm mt-1 font-notosanslao">{newCustomerErrors.fname}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-notosanslao">
                    ນາມສະກຸນ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lname"
                    value={newCustomer.lname}
                    onChange={handleNewCustomerChange}
                    className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-notosanslao transition-colors ${
                      newCustomerErrors.lname ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="ປ້ອນນາມສະກຸນ"
                  />
                  {newCustomerErrors.lname && (
                    <p className="text-red-500 text-sm mt-1 font-notosanslao">{newCustomerErrors.lname}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-notosanslao">
                    ເບີໂທລະສັບ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="number"
                    value={newCustomer.number}
                    onChange={handleNewCustomerChange}
                    className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      newCustomerErrors.number ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="020 XXXXXXXX"
                  />
                  {newCustomerErrors.number && (
                    <p className="text-red-500 text-sm mt-1 font-notosanslao">{newCustomerErrors.number}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-notosanslao">
                    ອີເມວ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={newCustomer.email}
                    onChange={handleNewCustomerChange}
                    className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      newCustomerErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="example@email.com"
                  />
                  {newCustomerErrors.email && (
                    <p className="text-red-500 text-sm mt-1 font-notosanslao">{newCustomerErrors.email}</p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-notosanslao">
                    ທີ່ຢູ່
                  </label>
                  <textarea
                    name="address"
                    value={newCustomer.address}
                    onChange={handleNewCustomerChange}
                    rows={3}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-notosanslao transition-colors resize-none"
                    placeholder="ປ້ອນທີ່ຢູ່"
                  />
                </div>

                {/* Document Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-notosanslao">
                    ປະເພດເອກະສານ
                  </label>
                  <select
                    name="documentsType"
                    value={newCustomer.documentsType}
                    onChange={handleNewCustomerChange}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-notosanslao transition-colors"
                  >
                    <option value="id_card">ບັດປະຈໍາຕົວ</option>
                    <option value="passport">ໜັງສືຜ່ານແດນ</option>
                    <option value="driving_license">ໃບຂັບຂີ່</option>
                    <option value="census">ໃບສຳມະໂນ</option>
                  </select>
                </div>

                {/* Document Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-notosanslao">
                    ເລກເອກະສານ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="numberDocuments"
                    value={newCustomer.numberDocuments}
                    onChange={handleNewCustomerChange}
                    className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-notosanslao transition-colors ${
                      newCustomerErrors.numberDocuments ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="ປ້ອນເລກເອກະສານ"
                  />
                  {newCustomerErrors.numberDocuments && (
                    <p className="text-red-500 text-sm mt-1 font-notosanslao">{newCustomerErrors.numberDocuments}</p>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddCustomerModal(false);
                    setNewCustomerErrors({});
                  }}
                  disabled={loading}
                  className="flex-1 px-4 py-3 text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-notosanslao"
                >
                  ຍົກເລີກ
                </button>
                <button
                  onClick={handleCreateCustomer}
                  disabled={loading}
                  className={`flex-2 px-6 py-3 rounded-xl font-medium font-notosanslao flex items-center justify-center gap-2 transition-all duration-200 ${
                    loading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md transform hover:-translate-y-0.5'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      ກຳລັງບັນທຶກ...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      ບັນທຶກ
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;