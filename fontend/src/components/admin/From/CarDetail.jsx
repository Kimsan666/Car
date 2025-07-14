// src/components/admin/Detail/CarDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import useCarStore from "../../../Store/car-store";
import { readCar } from "../../../api/Car";
import { toast } from "react-toastify";
import { ArrowLeft, Edit, Calendar, DollarSign, Info, Car as CarIcon, Palette, Wrench } from "lucide-react";

const CarDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useCarStore((state) => state.token);
  
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageType, setSelectedImageType] = useState('images');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    loadCarData();
  }, []);

  const loadCarData = async () => {
    try {
      const res = await readCar(token, id);
      setCar(res.data);
      setLoading(false);
    } catch (err) {
      console.log(err);
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ");
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'Sold': return 'bg-red-100 text-red-800';
      case 'Reserved': return 'bg-yellow-100 text-yellow-800';
      case 'Maintenance': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'Available': return 'ວ່າງ';
      case 'Sold': return 'ຂາຍແລ້ວ';
      case 'Reserved': return 'ຈອງແລ້ວ';
      case 'Maintenance': return 'ບຳລຸງຮັກສາ';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">
          <p className="text-gray-500">ບໍ່ພົບຂໍ້ມູນລົດ</p>
        </div>
      </div>
    );
  }

  const currentImages = selectedImageType === 'images' ? car.images : car.imaged;

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/admin/cars")}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">ລາຍລະອຽດລົດ</h1>
            </div>
            <Link
              to={`/admin/edit-car/${car.id}`}
              className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              <Edit className="h-4 w-4" />
              <span>ແກ້ໄຂ</span>
            </Link>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div>
              <div className="mb-4">
                <div className="flex space-x-4 mb-4">
                  <button
                    onClick={() => {
                      setSelectedImageType('images');
                      setSelectedImageIndex(0);
                    }}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      selectedImageType === 'images' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    ຮູບພາບຫຼັກ ({car.images?.length || 0})
                  </button>
                  <button
                    onClick={() => {
                      setSelectedImageType('imaged');
                      setSelectedImageIndex(0);
                    }}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      selectedImageType === 'imaged' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    ຮູບພາບລະອຽດ ({car.imaged?.length || 0})
                  </button>
                </div>

                {/* Main Image Display */}
                {currentImages && currentImages.length > 0 ? (
                  <div className="mb-4">
                    <img
                      src={currentImages[selectedImageIndex]?.secure_url}
                      alt={`${car.licensePlate} - ${selectedImageIndex + 1}`}
                      className="w-full h-64 md:h-96 object-cover rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="w-full h-64 md:h-96 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center">
                      <CarIcon className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">ບໍ່ມີຮູບພາບ</p>
                    </div>
                  </div>
                )}

                {/* Image Thumbnails */}
                {currentImages && currentImages.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {currentImages.map((image, index) => (
                      <img
                        key={index}
                        src={image.secure_url}
                        alt={`Thumbnail ${index + 1}`}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`w-full h-16 object-cover rounded cursor-pointer border-2 transition-all ${
                          selectedImageIndex === index 
                            ? 'border-blue-500' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Car Information */}
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Info className="h-5 w-5 mr-2" />
                  ຂໍ້ມູນພື້ນຖານ
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">ປ້າຍທະບຽນ</label>
                    <p className="text-lg font-semibold text-gray-900">{car.licensePlate}</p>
                  </div>
                  {car.name && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600">ຊື່ລົດ</label>
                      <p className="text-lg text-gray-900">{car.name}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-600">ແບຣນ</label>
                    <p className="text-lg text-gray-900">{car.brandCars?.name || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">ລຸ້ນ</label>
                    <p className="text-lg text-gray-900">{car.brandAndModels?.modelCar || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">ສະຖານະ</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(car.status)}`}>
                      {getStatusText(car.status)}
                    </span>
                  </div>
                  {car.year && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600">ປີ</label>
                      <p className="text-lg text-gray-900">{car.year}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Technical Details */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Wrench className="h-5 w-5 mr-2" />
                  ລາຍລະອຽດເຕັກນິກ
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">ສີ</label>
                    <p className="text-lg text-gray-900 flex items-center">
                      <Palette className="h-4 w-4 mr-2" />
                      {car.colorCar?.name || '-'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">ປະເພດ</label>
                    <p className="text-lg text-gray-900">{car.typecar?.name || '-'}</p>
                  </div>
                  {car.vin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600">VIN</label>
                      <p className="text-lg text-gray-900 font-mono">{car.vin}</p>
                    </div>
                  )}
                  {car.engineNumber && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600">ເລກເຄື່ອງຈັກ</label>
                      <p className="text-lg text-gray-900 font-mono">{car.engineNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  ລາຄາ
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">ລາຄາຂາຍ</label>
                    <p className="text-2xl font-bold text-green-600">
                      {new Intl.NumberFormat('lo-LA').format(car.price)} ₭
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">ລາຄາຕົ້ນທຶນ</label>
                    <p className="text-xl font-semibold text-orange-600">
                      {new Intl.NumberFormat('lo-LA').format(car.costPrice)} ₭
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600">ກຳໄລ</label>
                    <p className="text-xl font-semibold text-blue-600">
                      {new Intl.NumberFormat('lo-LA').format(car.price - car.costPrice)} ₭
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {car.description && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">ຄຳອະທິບາຍ</h2>
                  <p className="text-gray-700 leading-relaxed">{car.description}</p>
                </div>
              )}

              {/* Timestamps */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  ຂໍ້ມູນເວລາ
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">ວັນທີ່ສ້າງ</label>
                    <p className="text-lg text-gray-900">
                      {new Date(car.createdAt).toLocaleDateString('lo-LA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">ວັນທີ່ອັບເດດ</label>
                    <p className="text-lg text-gray-900">
                      {new Date(car.updatedAt).toLocaleDateString('lo-LA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetail;