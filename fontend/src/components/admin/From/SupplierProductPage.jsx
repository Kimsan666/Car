import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import useCarStore from '../../../Store/car-store';
import { 
  listSuppliersProduct, 
  saveSupplierProduct, 
  updateSupplierProduct, 
  removeSupplierProduct, 
  toggleSupplierProduct,
  readSupplierProduct 
} from '../../../api/SupplierProduct';

const SupplierProductPage = () => {
  const { 
    token, 
    suppliers = [], 
    cars = [], 
    suppliersproducts = [],
    getSupplier,
    getCar,
    getSuppliersProduct 
  } = useCarStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [filters, setFilters] = useState({
    supplierId: '',
    carId: '',
    isActive: ''
  });
  
  const [formData, setFormData] = useState({
    supplierId: '',
    carId: '',
    isActive: true,
    notes: ''
  });

  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setInitialLoading(true);
      await Promise.all([
        getSupplier(),
        getCar(),
        getSuppliersProduct()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ');
    } finally {
      setInitialLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      supplierId: '',
      carId: '',
      isActive: true,
      notes: ''
    });
    setEditingItem(null);
  };

  const openModal = (item = null) => {
    if (item) {
      setFormData({
        supplierId: item.supplierId,
        carId: item.carId,
        isActive: item.isActive,
        notes: item.notes || ''
      });
      setEditingItem(item);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async () => {
    if (!formData.supplierId || !formData.carId) {
      toast.error('ກະລຸນາເລືອກຜູ້ສະໜອງແລະລົດ');
      return;
    }

    setLoading(true);

    try {
      if (editingItem) {
        await updateSupplierProduct(token, editingItem.id, formData);
        toast.success('ອັບເດດການເຊື່ອມຕໍ່ສຳເລັດແລ້ວ');
      } else {
        await saveSupplierProduct(token, formData);
        toast.success('ເພີ່ມການເຊື່ອມຕໍ່ສຳເລັດແລ້ວ');
      }
      
      await getSuppliersProduct();
      closeModal();
    } catch (error) {
      console.error('Error saving supplier product:', error);
      toast.error(error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດ');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລົບການເຊື່ອມຕໍ່ນີ້?')) {
      try {
        await removeSupplierProduct(token, id);
        toast.success('ລົບການເຊື່ອມຕໍ່ສຳເລັດແລ້ວ');
        await getSuppliersProduct();
      } catch (error) {
        console.error('Error deleting supplier product:', error);
        toast.error('ເກີດຂໍ້ຜິດພາດໃນການລົບຂໍ້ມູນ');
      }
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleSupplierProduct(token, id);
      toast.success('ປ່ຽນສະຖານະສຳເລັດແລ້ວ');
      await getSuppliersProduct();
    } catch (error) {
      console.error('Error toggling supplier product:', error);
      toast.error('ເກີດຂໍ້ຜິດພາດໃນການປ່ຽນສະຖານະ');
    }
  };

  const handleViewDetail = async (item) => {
    try {
      const response = await readSupplierProduct(token, item.id);
      setSelectedItem(response.data.data);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error('Error fetching detail:', error);
      toast.error('ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດລາຍລະອຽດ');
    }
  };

  const filteredData = Array.isArray(suppliersproducts) ? suppliersproducts.filter(item => {
    return (
      (!filters.supplierId || item.supplierId.toString() === filters.supplierId) &&
      (!filters.carId || item.carId.toString() === filters.carId) &&
      (filters.isActive === '' || item.isActive.toString() === filters.isActive)
    );
  }) : [];

  if (initialLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">ຈັດການການເຊື່ອມຕໍ່ຜູ້ສະໜອງ-ລົດ</h1>
            <button
              onClick={() => openModal()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-200"
            >
              + ເພີ່ມການເຊື່ອມຕໍ່ໃໝ່
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ຜູ້ສະໜອງ</label>
              <select
                value={filters.supplierId}
                onChange={(e) => setFilters({...filters, supplierId: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">ທັງໝົດ</option>
                {Array.isArray(suppliers) && suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.companyName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ລົດ</label>
              <select
                value={filters.carId}
                onChange={(e) => setFilters({...filters, carId: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">ທັງໝົດ</option>
                {Array.isArray(cars) && cars.map(car => (
                  <option key={car.id} value={car.id}>
                    {car.name} - {car.licensePlate}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ສະຖານະ</label>
              <select
                value={filters.isActive}
                onChange={(e) => setFilters({...filters, isActive: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">ທັງໝົດ</option>
                <option value="true">ເປີດໃຊ້ງານ</option>
                <option value="false">ປິດໃຊ້ງານ</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ລຳດັບ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ຜູ້ສະໜອງ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ລົດ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ປ້າຍທະບຽນ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ສະຖານະ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ຫມາຍເຫດ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ຈັດການ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.supplier?.companyName}</div>
                    <div className="text-sm text-gray-500">{item.supplier?.contactName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.Car?.name}</div>
                    <div className="text-sm text-gray-500">
                      {item.Car?.brandAndModels?.BrandCars?.name} - {item.Car?.brandAndModels?.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.Car?.licensePlate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.isActive ? 'ເປີດໃຊ້ງານ' : 'ປິດໃຊ້ງານ'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.notes && item.notes.length > 30 ? `${item.notes.substring(0, 30)}...` : item.notes || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleViewDetail(item)}
                      className="text-blue-600 hover:text-blue-800 transition duration-200"
                    >
                      ລາຍລະອຽດ
                    </button>
                    <button
                      onClick={() => openModal(item)}
                      className="text-yellow-600 hover:text-yellow-800 transition duration-200"
                    >
                      ແກ້ໄຂ
                    </button>
                    <button
                      onClick={() => handleToggle(item.id)}
                      className={`transition duration-200 ${
                        item.isActive 
                          ? 'text-orange-600 hover:text-orange-800' 
                          : 'text-green-600 hover:text-green-800'
                      }`}
                    >
                      {item.isActive ? 'ປິດ' : 'ເປີດ'}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-800 transition duration-200"
                    >
                      ລົບ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              ບໍ່ມີຂໍ້ມູນການເຊື່ອມຕໍ່
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingItem ? 'ແກ້ໄຂການເຊື່ອມຕໍ່' : 'ເພີ່ມການເຊື່ອມຕໍ່ໃໝ່'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ຜູ້ສະໜອງ *</label>
                <select
                  value={formData.supplierId}
                  onChange={(e) => setFormData({...formData, supplierId: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">ເລືອກຜູ້ສະໜອງ</option>
                  {Array.isArray(suppliers) && suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.companyName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ລົດ *</label>
                <select
                  value={formData.carId}
                  onChange={(e) => setFormData({...formData, carId: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">ເລືອກລົດ</option>
                  {Array.isArray(cars) && cars.map(car => (
                    <option key={car.id} value={car.id}>
                      {car.name} - {car.licensePlate}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ສະຖານະ</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value={true}
                      checked={formData.isActive === true}
                      onChange={() => setFormData({...formData, isActive: true})}
                      className="mr-2"
                    />
                    ເປີດໃຊ້ງານ
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value={false}
                      checked={formData.isActive === false}
                      onChange={() => setFormData({...formData, isActive: false})}
                      className="mr-2"
                    />
                    ປິດໃຊ້ງານ
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ຫມາຍເຫດ</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ໃສ່ຫມາຍເຫດ..."
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-200"
                >
                  ຍົກເລີກ
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 disabled:opacity-50"
                >
                  {loading ? 'ກຳລັງບັນທຶກ...' : (editingItem ? 'ອັບເດດ' : 'ບັນທຶກ')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isDetailModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">ລາຍລະອຽດການເຊື່ອມຕໍ່</h2>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">ຂໍ້ມູນຜູ້ສະໜອງ</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">ຊື່ບໍລິສັດ:</span>
                    <p className="text-gray-800">{selectedItem.supplier?.companyName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">ຊື່ຜູ້ຕິດຕໍ່:</span>
                    <p className="text-gray-800">{selectedItem.supplier?.contactName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">ອີເມວ:</span>
                    <p className="text-gray-800">{selectedItem.supplier?.email}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">ເບີໂທ:</span>
                    <p className="text-gray-800">{selectedItem.supplier?.phone}</p>
                  </div>
                  {selectedItem.supplier?.address && (
                    <div className="col-span-2">
                      <span className="font-medium text-gray-600">ທີ່ຢູ່:</span>
                      <p className="text-gray-800">{selectedItem.supplier.address}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">ຂໍ້ມູນລົດ</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">ຊື່ລົດ:</span>
                    <p className="text-gray-800">{selectedItem.Car?.name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">ປ້າຍທະບຽນ:</span>
                    <p className="text-gray-800">{selectedItem.Car?.licensePlate}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">ຍີ່ຫໍ້:</span>
                    <p className="text-gray-800">{selectedItem.Car?.brandAndModels?.BrandCars?.name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">ໂມເດນ:</span>
                    <p className="text-gray-800">{selectedItem.Car?.brandAndModels?.name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">ສີ:</span>
                    <p className="text-gray-800">{selectedItem.Car?.colorCar?.name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">ປະເພດ:</span>
                    <p className="text-gray-800">{selectedItem.Car?.typecar?.name}</p>
                  </div>
                </div>

                {selectedItem.Car?.images && selectedItem.Car.images.length > 0 && (
                  <div className="mt-4">
                    <span className="font-medium text-gray-600 block mb-2">ຮູບພາບລົດ:</span>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedItem.Car.images.slice(0, 4).map((image, index) => (
                        <img
                          key={index}
                          src={image.url}
                          alt={`Car image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">ຂໍ້ມູນການເຊື່ອມຕໍ່</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">ສະຖານະ:</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedItem.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedItem.isActive ? 'ເປີດໃຊ້ງານ' : 'ປິດໃຊ້ງານ'}
                    </span>
                  </div>
                  {selectedItem.notes && (
                    <div>
                      <span className="font-medium text-gray-600">ຫມາຍເຫດ:</span>
                      <p className="text-gray-800 mt-1 bg-gray-50 p-2 rounded">{selectedItem.notes}</p>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">ວັນທີ່ສ້າງ:</span>
                    <span className="text-gray-800">
                      {new Date(selectedItem.createdAt).toLocaleDateString('lo-LA')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">ອັບເດດລ່າສຸດ:</span>
                    <span className="text-gray-800">
                      {new Date(selectedItem.updatedAt).toLocaleDateString('lo-LA')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-200"
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

export default SupplierProductPage;