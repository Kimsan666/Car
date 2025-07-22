import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Eye,
  Check,
  X,
  Calendar,
  User,
  Car,
  Phone,
  Mail,
  Clock,
  ShoppingCart,
  CheckCircle2,
  XCircle,
  Edit3,
  Trash2,
  Filter,
  RefreshCw,
  Package,
  CreditCard,
  AlertTriangle
} from "lucide-react";
import {
  listReservations,
  getReservationById,
  confirmReservation,
  cancelReservation,
  updateReservation
} from "../../api/Cart";
import useCarStore from "../../Store/car-store";

const ReservationManagement = () => {
  const { token } = useCarStore();
  
  // States
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const response = await listReservations(token);
      if (response.data) {
        setReservations(response.data.data || []);
      }
    } catch (error) {
      console.error("Error loading reservations:", error);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  // ກັ່ນຕອງການຈອງ
  const filteredReservations = Array.isArray(reservations) ? reservations.filter((reservation) => {
    const matchesSearch = 
      reservation.customer?.fname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.customer?.lname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.customer?.number?.includes(searchTerm) ||
      reservation.saleCars?.some(car => 
        car.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus = !statusFilter || reservation.status === statusFilter;

    return matchesSearch && matchesStatus;
  }) : [];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('lo-LA', {
      style: 'currency',
      currency: 'LAK',
      minimumFractionDigits: 0,
    }).format(price || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('lo-LA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock,
        text: 'ລໍຖ້າ'
      },
      'confirmed': {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle2,
        text: 'ຢືນຢັນແລ້ວ'
      },
      'cancelled': {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle,
        text: 'ຍົກເລີກແລ້ວ'
      }
    };

    const config = statusConfig[status] || statusConfig['pending'];
    const IconComponent = config.icon;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${config.color} flex items-center gap-1`}>
        <IconComponent size={12} />
        {config.text}
      </span>
    );
  };

  const handleViewDetail = async (reservationId) => {
    try {
      setLoading(true);
      const response = await getReservationById(token, reservationId);
      if (response.data) {
        setSelectedReservation(response.data.data);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error("Error loading reservation detail:", error);
      alert("ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດລາຍລະອຽດ");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReservation = async (reservationId) => {
    if (!confirm("ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການຢືນຢັນການຈອງນີ້?")) return;

    try {
      setActionLoading(true);
      await confirmReservation(token, reservationId);
      alert("ຢືນຢັນການຈອງສຳເລັດ!");
      await loadReservations();
    } catch (error) {
      console.error("Error confirming reservation:", error);
      alert("ເກີດຂໍ້ຜິດພາດໃນການຢືນຢັນ");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    if (!confirm("ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການຍົກເລີກການຈອງນີ້?")) return;

    try {
      setActionLoading(true);
      await cancelReservation(token, reservationId);
      alert("ຍົກເລີກການຈອງສຳເລັດ!");
      await loadReservations();
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      alert("ເກີດຂໍ້ຜິດພາດໃນການຍົກເລີກ");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && reservations.length === 0) {
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
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-notosanslao">
                📋 ຈັດການການຈອງ
              </h1>
              <p className="text-gray-600 font-notosanslao mt-1">
                ຈັດການການຈອງລົດທັງໝົດ {filteredReservations.length} ລາຍການ
              </p>
            </div>

            <button
              onClick={loadReservations}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 font-notosanslao flex items-center gap-2"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              ໂຫຼດໃໝ່
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search & Filter */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="ຄົ້ນຫາຊື່ລູກຄ້າ, ເບີໂທ, ລົດ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-notosanslao"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-notosanslao"
            >
              <option value="">ທຸກສະຖານະ</option>
              <option value="pending">ລໍຖ້າຢືນຢັນ</option>
              <option value="confirmed">ຢືນຢັນແລ້ວ</option>
              <option value="cancelled">ຍົກເລີກແລ້ວ</option>
            </select>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock size={24} className="text-yellow-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {filteredReservations.filter(r => r.status === 'pending').length}
                </h3>
                <p className="text-sm text-gray-600 font-notosanslao">ລໍຖ້າຢືນຢັນ</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 size={24} className="text-green-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {filteredReservations.filter(r => r.status === 'confirmed').length}
                </h3>
                <p className="text-sm text-gray-600 font-notosanslao">ຢືນຢັນແລ້ວ</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle size={24} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {filteredReservations.filter(r => r.status === 'cancelled').length}
                </h3>
                <p className="text-sm text-gray-600 font-notosanslao">ຍົກເລີກແລ້ວ</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Package size={24} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {filteredReservations.length}
                </h3>
                <p className="text-sm text-gray-600 font-notosanslao">ທັງໝົດ</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reservations List */}
        {filteredReservations.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 font-notosanslao">
              ບໍ່ມີການຈອງ
            </h3>
            <p className="text-gray-500 font-notosanslao">
              {searchTerm || statusFilter ? 'ລອງປ່ຽນເງື່ອນໄຂການຄົ້ນຫາ' : 'ຍັງບໍ່ມີການຈອງໃດໆ'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReservations.map((reservation) => (
              <div key={reservation.id} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 font-notosanslao">
                        #{reservation.id} - {reservation.customer?.fname} {reservation.customer?.lname}
                      </h3>
                      {getStatusBadge(reservation.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Phone size={14} />
                        <span>{reservation.customer?.number}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>{formatDate(reservation.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Car size={14} />
                        <span className="font-notosanslao">
                          {reservation.saleCars?.length || 0} ຄັນ
                        </span>
                      </div>
                    </div>

                    {/* Cars Preview */}
                    {reservation.saleCars && reservation.saleCars.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2 font-notosanslao">ລົດທີ່ຈອງ:</h4>
                        <div className="flex flex-wrap gap-2">
                          {reservation.saleCars.slice(0, 3).map((car, index) => (
                            <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-notosanslao">
                              {car.name || car.licensePlate}
                            </span>
                          ))}
                          {reservation.saleCars.length > 3 && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm font-notosanslao">
                              +{reservation.saleCars.length - 3} ອື່ນໆ
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-blue-600">
                          {formatPrice(reservation.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleViewDetail(reservation.id)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="ເບິ່ງລາຍລະອຽດ"
                    >
                      <Eye size={16} />
                    </button>

                    {reservation.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleConfirmReservation(reservation.id)}
                          disabled={actionLoading}
                          className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                          title="ຢືນຢັນການຈອງ"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => handleCancelReservation(reservation.id)}
                          disabled={actionLoading}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="ຍົກເລີກການຈອງ"
                        >
                          <X size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold font-notosanslao mb-2">
                    ລາຍລະອຽດການຈອງ #{selectedReservation.id}
                  </h2>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(selectedReservation.status)}
                    <span className="text-sm text-gray-500">
                      ສ້າງເມື່ອ: {formatDate(selectedReservation.createdAt)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Customer Info */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User size={20} className="text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold font-notosanslao">ຂໍ້ມູນລູກຄ້າ</h3>
                    </div>
                    
                    {selectedReservation.customer && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-gray-400" />
                          <span className="font-notosanslao">
                            {selectedReservation.customer.fname} {selectedReservation.customer.lname}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={16} className="text-gray-400" />
                          <span>{selectedReservation.customer.number}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail size={16} className="text-gray-400" />
                          <span>{selectedReservation.customer.email}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cars Info */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Car size={20} className="text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold font-notosanslao">
                        ລົດທີ່ຈອງ ({selectedReservation.saleCars?.length || 0} ຄັນ)
                      </h3>
                    </div>

                    {selectedReservation.saleCars && selectedReservation.saleCars.length > 0 ? (
                      <div className="space-y-3">
                        {selectedReservation.saleCars.map((car, index) => (
                          <div key={index} className="bg-white rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium font-notosanslao">
                                  {car.name || 'ບໍ່ມີຊື່'}
                                </h4>
                                <p className="text-sm text-gray-600 font-notosanslao">
                                  {car.car?.brandCars?.name} • {car.car?.brandAndModels?.modelCar}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {car.licensePlate}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-blue-600">
                                  {formatPrice(car.price)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 font-notosanslao">ບໍ່ມີຂໍ້ມູນລົດ</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Total & Actions */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xl font-semibold font-notosanslao">ລວມທັງໝົດ:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatPrice(selectedReservation.totalAmount)}
                  </span>
                </div>

                {selectedReservation.status === 'pending' && (
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        handleCancelReservation(selectedReservation.id);
                        setShowDetailModal(false);
                      }}
                      disabled={actionLoading}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 font-notosanslao flex items-center justify-center gap-2"
                    >
                      <XCircle size={20} />
                      ຍົກເລີກການຈອງ
                    </button>
                    <button
                      onClick={() => {
                        handleConfirmReservation(selectedReservation.id);
                        setShowDetailModal(false);
                      }}
                      disabled={actionLoading}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 font-notosanslao flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={20} />
                      ຢືນຢັນການຈອງ
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationManagement;