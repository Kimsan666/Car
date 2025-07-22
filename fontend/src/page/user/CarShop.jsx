import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  Plus,
  X,
  Car,
  Calendar,
  Palette,
  Tag,
  Eye,
  Grid3x3,
  List,
  Filter,
  SlidersHorizontal,
  Heart
} from "lucide-react";
import useCarStore from "../../Store/car-store";

const CarShop = () => {
  const navigate = useNavigate();
  const {
    salecars = [],
    carts = [],
    getSaleCars,
    actionAdtoCart,
    removeFromCart,
    clearCart,
    token
  } = useCarStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Available");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [viewMode, setViewMode] = useState("grid");
  const [showCart, setShowCart] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadSaleCars();
  }, []);

  const loadSaleCars = async () => {
    try {
      setLoading(true);
      await getSaleCars();
    } catch (error) {
      console.error("Error loading sale cars:", error);
    } finally {
      setLoading(false);
    }
  };

  // ກັ່ນຕອງລາຍການລົດ
  const filteredCars = Array.isArray(salecars) ? salecars.filter((car) => {
    const matchesSearch = 
      car.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.car?.brandCars?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.car?.brandAndModels?.modelCar?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !filterStatus || car.status === filterStatus;

    const matchesPrice = 
      (!priceRange.min || car.price >= parseFloat(priceRange.min)) &&
      (!priceRange.max || car.price <= parseFloat(priceRange.max));

    return matchesSearch && matchesStatus && matchesPrice;
  }) : [];

  const handleAddToCart = async (car) => {
    try {
      const cartItem = {
        id: car.id,
        product: car,
      };
      
      const success = await actionAdtoCart(cartItem);
      if (success) {
        // Animation feedback
        const button = document.getElementById(`add-btn-${car.id}`);
        if (button) {
          button.classList.add('animate-pulse');
          setTimeout(() => button.classList.remove('animate-pulse'), 500);
        }
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const getTotalCartItems = () => {
    return carts.length;
  };

  const getTotalCartPrice = () => {
    return carts.reduce((total, item) => total + (item.price || 0), 0);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('lo-LA', {
      style: 'currency',
      currency: 'LAK',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const CarCard = ({ car }) => (
    <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-lg">
      {/* ຮູບພາບລົດ */}
      <div className="relative h-56 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {car.car?.images?.[0] || car.car?.imaged?.[0] ? (
          <img
            src={car.car.images?.[0]?.secure_url || car.car.imaged?.[0]?.secure_url}
            alt={car.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Car size={48} className="text-gray-300" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1.5 rounded-full text-xs font-medium shadow-sm backdrop-blur-sm ${
            car.status === 'Available' 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
              : car.status === 'Sold'
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>
            {car.status === 'Available' ? 'ພ້ອມຂາຍ' : car.status === 'Sold' ? 'ຂາຍແລ້ວ' : 'ຈອງແລ້ວ'}
          </span>
        </div>

        {/* Quick View Button */}
        <button
          onClick={() => setSelectedCar(car)}
          className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2.5 rounded-full hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
        >
          <Eye size={16} className="text-gray-600" />
        </button>

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* ຂໍ້ມູນລົດ */}
      <div className="p-5">
        <div className="mb-4">
          <h3 className="font-semibold text-lg text-gray-900 mb-2 font-notosanslao line-clamp-1">
            {car.name || 'ບໍ່ມີຊື່'}
          </h3>
          <p className="text-sm text-gray-600 font-notosanslao">
            {car.car?.brandCars?.name} • {car.car?.brandAndModels?.modelCar}
          </p>
        </div>

        {/* ລາຍລະອຽດ */}
        <div className="space-y-2 mb-5">
          {car.licensePlate && (
            <div className="flex items-center text-sm text-gray-500">
              <Tag size={14} className="mr-2 text-gray-400" />
              <span>{car.licensePlate}</span>
            </div>
          )}
          {car.year && (
            <div className="flex items-center text-sm text-gray-500">
              <Calendar size={14} className="mr-2 text-gray-400" />
              <span>{car.year}</span>
            </div>
          )}
          {car.colorCar?.name && (
            <div className="flex items-center text-sm text-gray-500">
              <Palette size={14} className="mr-2 text-gray-400" />
              <span className="font-notosanslao">{car.colorCar.name}</span>
            </div>
          )}
        </div>

        {/* ລາຄາແລະປຸ່ມ */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {formatPrice(car.price)}
            </p>
            {car.costPrice && car.costPrice !== car.price && (
              <p className="text-sm text-gray-400 line-through">
                {formatPrice(car.costPrice)}
              </p>
            )}
          </div>
          
          <button
            id={`add-btn-${car.id}`}
            onClick={() => handleAddToCart(car)}
            disabled={car.status !== 'Available'}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 font-medium transition-all duration-200 text-sm ${
              car.status === 'Available'
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transform hover:-translate-y-0.5'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Plus size={16} />
            {car.status === 'Available' ? 'ເພີ່ມ' : 'ບໍ່ວ່າງ'}
          </button>
        </div>
      </div>
    </div>
  );

  const CarListItem = ({ car }) => (
    <div className="bg-white rounded-xl p-5 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200">
      <div className="flex gap-5">
        {/* ຮູບພາບ */}
        <div className="w-28 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
          {car.car?.images?.[0] || car.car?.imaged?.[0] ? (
            <img
              src={car.car.images?.[0]?.secure_url || car.car.imaged?.[0]?.secure_url}
              alt={car.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Car size={24} className="text-gray-300" />
            </div>
          )}
        </div>

        {/* ຂໍ້ມູນ */}
        <div className="flex-1">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold text-lg text-gray-900 font-notosanslao">
                {car.name || 'ບໍ່ມີຊື່'}
              </h3>
              <p className="text-sm text-gray-600 font-notosanslao">
                {car.car?.brandCars?.name} • {car.car?.brandAndModels?.modelCar}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              car.status === 'Available' 
                ? 'bg-emerald-50 text-emerald-700' 
                : car.status === 'Sold'
                ? 'bg-rose-50 text-rose-700'
                : 'bg-amber-50 text-amber-700'
            }`}>
              {car.status === 'Available' ? 'ພ້ອມຂາຍ' : car.status === 'Sold' ? 'ຂາຍແລ້ວ' : 'ຈອງແລ້ວ'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            {car.licensePlate && <span>{car.licensePlate}</span>}
            {car.year && <span>{car.year}</span>}
            {car.colorCar?.name && <span className="font-notosanslao">{car.colorCar.name}</span>}
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-xl font-bold text-gray-900">
                {formatPrice(car.price)}
              </p>
              {car.costPrice && car.costPrice !== car.price && (
                <p className="text-sm text-gray-400 line-through">
                  {formatPrice(car.costPrice)}
                </p>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedCar(car)}
                className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={() => handleAddToCart(car)}
                disabled={car.status !== 'Available'}
                className={`px-5 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors ${
                  car.status === 'Available'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Plus size={16} />
                ເພີ່ມ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-notosanslao">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-notosanslao mb-1">
                ຮ້ານຂາຍລົດ
              </h1>
              <p className="text-gray-600 font-notosanslao">
                ພົບລົດທັງໝົດ <span className="font-semibold text-blue-600">{filteredCars.length}</span> ຄັນ
              </p>
            </div>

            {/* Cart & Checkout Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCart(!showCart)}
                className="relative bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl transition-colors flex items-center gap-2 font-notosanslao"
              >
                <ShoppingCart size={20} />
                <span className="hidden sm:inline">ກະຕ້າ</span>
                {getTotalCartItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                    {getTotalCartItems()}
                  </span>
                )}
              </button>
              
              {getTotalCartItems() > 0 && (
                <button
                  onClick={() => navigate('/user/checkout')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 font-notosanslao"
                >
                  ຊຳລະເງິນ
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Modern Search & Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-100">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="ຄົ້ນຫາລົດ, ຍີ່ຫໍ້, ຮຸ່ນ, ປ້າຍທະບຽນ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-notosanslao"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium font-notosanslao"
            >
              <SlidersHorizontal size={20} />
              ກັ່ນຕອງ
            </button>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 font-notosanslao">ເບິ່ງແບບ:</span>
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Grid3x3 size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-notosanslao"
              >
                <option value="">ທຸກສະຖານະ</option>
                <option value="Available">ພ້ອມຂາຍ</option>
                <option value="Sold">ຂາຍແລ້ວ</option>
                <option value="Reserved">ຈອງແລ້ວ</option>
              </select>

              <input
                type="number"
                placeholder="ລາຄາຕ່ຳສຸດ"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-notosanslao"
              />
              
              <input
                type="number"
                placeholder="ລາຄາສູງສຸດ"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-notosanslao"
              />
            </div>
          )}
        </div>

        {/* Cars Display */}
        {filteredCars.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Car size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 font-notosanslao">
              ບໍ່ພົບລົດ
            </h3>
            <p className="text-gray-500 font-notosanslao">
              ລອງປ່ຽນເງື່ອນໄຂການຄົ້ນຫາ
            </p>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {filteredCars.map((car) => (
              viewMode === 'grid' ? (
                <CarCard key={car.id} car={car} />
              ) : (
                <CarListItem key={car.id} car={car} />
              )
            ))}
          </div>
        )}
      </div>

      {/* Mini Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setShowCart(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold font-notosanslao">
                  ກະຕ້າ ({getTotalCartItems()})
                </h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {carts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingCart size={24} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-notosanslao">ກະຕ້າຂອງທ່ານຫວ່າງເປົ່າ</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {carts.map((item, index) => (
                      <div key={item.cartItemId || index} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="w-16 h-12 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                          {item.car?.images?.[0] || item.car?.imaged?.[0] ? (
                            <img
                              src={item.car.images?.[0]?.secure_url || item.car.imaged?.[0]?.secure_url}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Car size={16} className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm font-notosanslao mb-1">
                            {item.name || 'ລົດ'}
                          </h4>
                          <p className="text-xs text-gray-600 font-notosanslao mb-2">
                            {item.car?.brandCars?.name} • {item.car?.brandAndModels?.modelCar}
                          </p>
                          <p className="text-sm font-semibold text-blue-600">
                            {formatPrice(item.price || 0)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.cartItemId || index)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {carts.length > 0 && (
                <div className="border-t border-gray-100 p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold font-notosanslao">ລວມທັງໝົດ:</span>
                    <span className="text-xl font-bold text-blue-600">
                      {formatPrice(getTotalCartPrice())}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={clearCart}
                      className="bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors font-medium font-notosanslao"
                    >
                      ລຶບທັງໝົດ
                    </button>
                    <button 
                      onClick={() => {
                        setShowCart(false);
                        navigate('/user/checkout');
                      }}
                      className="bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors font-medium font-notosanslao shadow-sm"
                    >
                      ຊຳລະເງິນ
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Car Detail Modal */}
      {selectedCar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold font-notosanslao">
                  ລາຍລະອຽດລົດ
                </h2>
                <button
                  onClick={() => setSelectedCar(null)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl mb-6 overflow-hidden">
                {selectedCar.car?.images?.[0] || selectedCar.car?.imaged?.[0] ? (
                  <img
                    src={selectedCar.car.images?.[0]?.secure_url || selectedCar.car.imaged?.[0]?.secure_url}
                    alt={selectedCar.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Car size={64} className="text-gray-300" />
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold font-notosanslao mb-2">
                    {selectedCar.name || 'ບໍ່ມີຊື່'}
                  </h3>
                  <p className="text-gray-600 font-notosanslao">
                    {selectedCar.car?.brandCars?.name} • {selectedCar.car?.brandAndModels?.modelCar}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-500 font-notosanslao">ປ້າຍທະບຽນ:</span>
                      <p className="font-medium">{selectedCar.licensePlate || '-'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">ປີ:</span>
                      <p className="font-medium">{selectedCar.year || '-'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500 font-notosanslao">ສະຖານະ:</span>
                      <p className="font-medium">{selectedCar.status}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-500 font-notosanslao">ສີ:</span>
                      <p className="font-medium font-notosanslao">{selectedCar.colorCar?.name || '-'}</p>
                    </div>
                    {selectedCar.vin && (
                      <div>
                        <span className="font-medium text-gray-500">VIN:</span>
                        <p className="font-medium">{selectedCar.vin}</p>
                      </div>
                    )}
                    {selectedCar.engineNumber && (
                      <div>
                        <span className="font-medium text-gray-500 font-notosanslao">ເລກເຄື່ອງຈັກ:</span>
                        <p className="font-medium">{selectedCar.engineNumber}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <p className="text-3xl font-bold text-gray-900 mb-1">
                        {formatPrice(selectedCar.price)}
                      </p>
                      {selectedCar.costPrice && selectedCar.costPrice !== selectedCar.price && (
                        <p className="text-sm text-gray-400 line-through">
                          {formatPrice(selectedCar.costPrice)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      handleAddToCart(selectedCar);
                      setSelectedCar(null);
                    }}
                    disabled={selectedCar.status !== 'Available'}
                    className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-medium transition-all duration-200 font-notosanslao ${
                      selectedCar.status === 'Available'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transform hover:-translate-y-0.5'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Plus size={20} />
                    {selectedCar.status === 'Available' ? 'ເພີ່ມໃສ່ກະຕ້າ' : 'ບໍ່ວ່າງ'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarShop;