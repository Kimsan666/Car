import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Car, User, DollarSign, FileText, Eye, Trash2, Check } from 'lucide-react';
import useCarStore from '../../../Store/car-store';

// Custom Modal Component
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-lg shadow-xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// Print Receipt Modal Component
const PrintReceiptModal = ({ isOpen, onClose, onConfirm, orderData }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ການພິມໃບເສັດ" size="sm">
      <div className="text-center">
        <div className="mb-6">
          <FileText size={64} className="mx-auto text-blue-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">ການຂາຍສຳເລັດແລ້ວ!</h3>
          <p className="text-gray-600">ທ່ານຕ້ອງການພິມໃບເສັດຫຼືບໍ່?</p>
          {orderData && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg text-left">
              <p><strong>ລູກຄ້າ:</strong> {orderData.customerName}</p>
              <p><strong>ຈຳນວນລົດ:</strong> {orderData.carCount} ຄັນ</p>
              <p><strong>ຈຳນວນເງິນ:</strong> {orderData.totalAmount?.toLocaleString()} ກີບ</p>
            </div>
          )}
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => onConfirm(false)}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            ບໍ່ພິມ
          </button>
          <button
            onClick={() => onConfirm(true)}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            ພິມໃບເສັດ
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Customer Form Modal
const CustomerFormModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    number: '',
    email: '',
    address: '',
    numberDocuments: '',
    documentsType: 'id_card'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const documentTypes = [
    { value: 'id_card', label: 'ບັດປະຊາຊົນ' },
    { value: 'passport', label: 'ໜັງສືຜ່ານແດນ' },
    { value: 'driving_license', label: 'ໃບຂັບຂີ່' },
    { value: 'other', label: 'ອື່ນໆ' }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fname.trim()) newErrors.fname = 'ກະລຸນາປ້ອນຊື່';
    if (!formData.lname.trim()) newErrors.lname = 'ກະລຸນາປ້ອນນາມສະກຸນ';
    if (!formData.number.trim()) newErrors.number = 'ກະລຸນາປ້ອນເບີໂທ';
    if (!formData.email.trim()) newErrors.email = 'ກະລຸນາປ້ອນອີເມວ';
    if (!formData.numberDocuments.trim()) newErrors.numberDocuments = 'ກະລຸນາປ້ອນເລກເອກະສານ';
    
    // Email validation
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'ຮູບແບບອີເມວບໍ່ຖືກຕ້ອງ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSave(formData);
      setFormData({
        fname: '',
        lname: '',
        number: '',
        email: '',
        address: '',
        numberDocuments: '',
        documentsType: 'id_card'
      });
      onClose();
    } catch (error) {
      // Error is handled in the store
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ເພີ່ມລູກຄ້າໃໝ່" size="md">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ຊື່ *
            </label>
            <input
              type="text"
              name="fname"
              value={formData.fname}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.fname ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="ປ້ອນຊື່"
            />
            {errors.fname && <p className="text-red-500 text-sm mt-1">{errors.fname}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ນາມສະກຸນ *
            </label>
            <input
              type="text"
              name="lname"
              value={formData.lname}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.lname ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="ປ້ອນນາມສະກຸນ"
            />
            {errors.lname && <p className="text-red-500 text-sm mt-1">{errors.lname}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ເບີໂທ *
            </label>
            <input
              type="text"
              name="number"
              value={formData.number}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.number ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="020 XXXX XXXX"
            />
            {errors.number && <p className="text-red-500 text-sm mt-1">{errors.number}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ອີເມວ *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="example@email.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ທີ່ຢູ່
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="ປ້ອນທີ່ຢູ່"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ເລກເອກະສານ *
            </label>
            <input
              type="text"
              name="numberDocuments"
              value={formData.numberDocuments}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.numberDocuments ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="ປ້ອນເລກເອກະສານ"
            />
            {errors.numberDocuments && <p className="text-red-500 text-sm mt-1">{errors.numberDocuments}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ປະເພດເອກະສານ *
            </label>
            <select
              name="documentsType"
              value={formData.documentsType}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {documentTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            ຍົກເລີກ
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'ກຳລັງບັນທຶກ...' : 'ບັນທຶກ'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Main Sales Form Component
const FormSales = () => {
  const {
    customers,
    availableCars,
    cars,
    selectedCustomer,
    isCreatingOrder,
    loadingSalesCustomers,
    loadingAvailableCars,
    user,
    getCustomer,
    getAvailableCars,
    addSelectedCar,
    removeSelectedCar,
    setSelectedCustomer,
    clearSelectedCustomer,
    clearSelectedCars,
    calculateTotalAmount,
    createCustomer,
    createSalesOrder
  } = useCarStore();

  const [customerSearch, setCustomerSearch] = useState('');
  const [carSearch, setCarSearch] = useState('');
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showCarModal, setShowCarModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [totalAmount, setTotalAmount] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getCustomer();
    getAvailableCars();
  }, []);

  // Filter functions
  const filteredCustomers = customers.filter(customer =>
    `${customer.fname} ${customer.lname}`.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.number.includes(customerSearch) ||
    customer.email.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const filteredCars = availableCars.filter(car =>
    car.name?.toLowerCase().includes(carSearch.toLowerCase()) ||
    car.licensePlate?.toLowerCase().includes(carSearch.toLowerCase()) ||
    car.brandAndModels?.BrandCars?.name?.toLowerCase().includes(carSearch.toLowerCase()) ||
    car.brandAndModels?.modelCar?.toLowerCase().includes(carSearch.toLowerCase())
  );

  // Calculate total from selected cars
  const calculatedTotal = calculateTotalAmount();

  const validateSalesForm = () => {
    const newErrors = {};
    
    if (!selectedCustomer) {
      newErrors.customer = 'ກະລຸນາເລືອກລູກຄ້າ';
    }
    
    if (cars.length === 0) {
      newErrors.cars = 'ກະລຸນາເລືອກລົດຢ່າງໜ້ອຍ 1 ຄັນ';
    }
    
    if (!totalAmount || parseFloat(totalAmount) <= 0) {
      newErrors.totalAmount = 'ກະລຸນາປ້ອນຈຳນວນເງິນທີ່ຖືກຕ້ອງ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateOrder = async () => {
    if (!validateSalesForm()) return;

    try {
      const orderData = {
        customerId: selectedCustomer.id,
        carIds: cars.map(car => car.id),
        totalAmount: parseFloat(totalAmount)
      };

      const result = await createSalesOrder(orderData);
      
      // Prepare data for success modal
      setOrderSuccess({
        customerName: `${selectedCustomer.fname} ${selectedCustomer.lname}`,
        carCount: cars.length,
        totalAmount: parseFloat(totalAmount),
        orderId: result.data?.id
      });
      
      // Clear form
      setTotalAmount('');
      setErrors({});
      
      // Show print modal
      setShowPrintModal(true);
      
    } catch (error) {
      // Error is handled in the store
    }
  };

  const handlePrintDecision = (shouldPrint) => {
    setShowPrintModal(false);
    
    if (shouldPrint) {
      // Here you would implement the print functionality
      console.log('Printing receipt for order:', orderSuccess);
      // You could open a new window with the receipt or use a print library
      window.print(); // Simple example
    }
    
    setOrderSuccess(null);
  };

  const handleSaveCustomer = async (customerData) => {
    try {
      const result = await createCustomer(customerData);
      // Auto-select the newly created customer
      if (result.data) {
        setSelectedCustomer(result.data);
      }
    } catch (error) {
      // Error is handled in the store
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US').format(price);
  };

  const getCarDisplayName = (car) => {
    const brand = car.brandAndModels?.BrandCars?.name || car.brandCars?.name || '';
    const model = car.brandAndModels?.modelCar || '';
    const name = car.name || '';
    
    if (brand && model) {
      return `${brand} ${model}${name ? ` (${name})` : ''}`;
    }
    return name || car.licensePlate || 'ບໍ່ມີຊື່';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" style={{ fontFamily: 'Noto Sans Lao, sans-serif' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">ລະບົບການຂາຍລົດ</h1>
          <p className="text-gray-600">ຈັດການການຂາຍລົດຢ່າງງ່າຍດາຍ ແລະ ຮວດໄວ</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Selection */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <User size={20} />
                ເລືອກລູກຄ້າ
              </h2>
              <button
                onClick={() => setShowCustomerForm(true)}
                className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm flex items-center gap-1"
              >
                <Plus size={16} />
                ເພີ່ມໃໝ່
              </button>
            </div>

            {selectedCustomer ? (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-blue-800">
                      {selectedCustomer.fname} {selectedCustomer.lname}
                    </h3>
                    <p className="text-blue-600 text-sm">{selectedCustomer.number}</p>
                    <p className="text-blue-600 text-sm">{selectedCustomer.email}</p>
                  </div>
                  <button
                    onClick={clearSelectedCustomer}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="ຄົ້ນຫາລູກຄ້າ..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2">
                  {loadingSalesCustomers ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="text-gray-500 mt-2">ກຳລັງໂຫຼດ...</p>
                    </div>
                  ) : filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                      <div
                        key={customer.id}
                        onClick={() => setSelectedCustomer(customer)}
                        className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <h4 className="font-medium text-gray-800">
                          {customer.fname} {customer.lname}
                        </h4>
                        <p className="text-gray-600 text-sm">{customer.number}</p>
                        <p className="text-gray-500 text-xs">{customer.email}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">ບໍ່ພົບລູກຄ້າ</p>
                  )}
                </div>
              </>
            )}
            
            {errors.customer && (
              <p className="text-red-500 text-sm mt-2">{errors.customer}</p>
            )}
          </div>

          {/* Car Selection */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Car size={20} />
                ເລືອກລົດ
              </h2>
              <span className="text-sm text-gray-500">
                ເລືອກແລ້ວ: {cars.length} ຄັນ
              </span>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="ຄົ້ນຫາລົດ..."
                value={carSearch}
                onChange={(e) => setCarSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {loadingAvailableCars ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-500 mt-2">ກຳລັງໂຫຼດ...</p>
                </div>
              ) : filteredCars.length > 0 ? (
                filteredCars.map((car) => {
                  const isSelected = cars.find(c => c.id === car.id);
                  return (
                    <div
                      key={car.id}
                      onClick={() => isSelected ? removeSelectedCar(car.id) : addSelectedCar(car)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        isSelected 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">
                            {getCarDisplayName(car)}
                          </h4>
                          <p className="text-gray-600 text-sm">
                            {car.licensePlate}
                          </p>
                          <p className="text-blue-600 text-sm font-medium">
                            {formatPrice(car.price)} ກີບ
                          </p>
                          {car.colorCar && (
                            <p className="text-gray-500 text-xs">
                              ສີ: {car.colorCar.name}
                            </p>
                          )}
                        </div>
                        {isSelected && (
                          <Check size={20} className="text-green-500" />
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center py-4">ບໍ່ພົບລົດທີ່ສາມາດຂາຍໄດ້</p>
              )}
            </div>
            
            {errors.cars && (
              <p className="text-red-500 text-sm mt-2">{errors.cars}</p>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <DollarSign size={20} />
              ສະຫຼຸບການສັ່ງຊື້
            </h2>

            {cars.length > 0 && (
              <div className="mb-4">
                <h3 className="font-medium text-gray-700 mb-2">ລົດທີ່ເລືອກ:</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {cars.map((car) => (
                    <div key={car.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{getCarDisplayName(car)}</p>
                        <p className="text-xs text-gray-600">{car.licensePlate}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatPrice(car.price)} ກີບ</p>
                        <button
                          onClick={() => removeSelectedCar(car.id)}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          ລຶບ
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ລາຄາລົດລວມ:
                </label>
                <p className="text-lg font-bold text-blue-600">
                  {formatPrice(calculatedTotal)} ກີບ
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ຈຳນວນເງິນສຳລະ *
                </label>
                <input
                  type="number"
                  value={totalAmount}
                  onChange={(e) => {
                    setTotalAmount(e.target.value);
                    if (errors.totalAmount) {
                      setErrors(prev => ({ ...prev, totalAmount: '' }));
                    }
                  }}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.totalAmount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="ປ້ອນຈຳນວນເງິນ"
                />
                {errors.totalAmount && (
                  <p className="text-red-500 text-sm mt-1">{errors.totalAmount}</p>
                )}
              </div>

              <button
                onClick={handleCreateOrder}
                disabled={isCreatingOrder || !selectedCustomer || cars.length === 0}
                className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isCreatingOrder ? 'ກຳລັງບັນທຶກ...' : 'ສຳເລັດການຂາຍ'}
              </button>

              {cars.length > 0 && (
                <button
                  onClick={clearSelectedCars}
                  className="w-full mt-2 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  ລ້າງລາຍການລົດ
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Form Modal */}
      <CustomerFormModal
        isOpen={showCustomerForm}
        onClose={() => setShowCustomerForm(false)}
        onSave={handleSaveCustomer}
      />

      {/* Print Receipt Modal */}
      <PrintReceiptModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        onConfirm={handlePrintDecision}
        orderData={orderSuccess}
      />
    </div>
  );
};

export default FormSales;