// src/components/admin/Edit/EditCar.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useCarStore from "../../../Store/car-store";
import { readCar, updateCar, uploadCarImage, removeCarImage, uploadCarImaged } from "../../../api/Car";
import { toast } from "react-toastify";
import { ArrowLeft, ChevronDown, Upload, X } from "lucide-react";

const EditCar = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useCarStore((state) => state.token);
  const brands = useCarStore((state) => state.brands);
  const colors = useCarStore((state) => state.colors);
  const types = useCarStore((state) => state.types);
  const brandAndModels = useCarStore((state) => state.brandAndModels);
  
  const getBrand = useCarStore((state) => state.getBrand);
  const getColor = useCarStore((state) => state.getColor);
  const getType = useCarStore((state) => state.getType);
  const getBrandAndModel = useCarStore((state) => state.getBrandAndModel);

  const [form, setForm] = useState({
    brandAndModelsId: "",
    name: "",
    licensePlate: "",
    year: "",
    colorCarId: "",
    vin: "",
    engineNumber: "",
    typeId: "",
    status: "Available",
    price: "",
    costPrice: "",
    description: "",
    brandCarsId: "",
    images: [],
    imaged: []
  });

  // Search states for dropdowns
  const [brandSearch, setBrandSearch] = useState("");
  const [colorSearch, setColorSearch] = useState("");
  const [typeSearch, setTypeSearch] = useState("");
  const [modelSearch, setModelSearch] = useState("");
  
  // Selected states
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  
  // Dropdown visibility states
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    getBrand();
    getColor();
    getType();
    getBrandAndModel();
    loadCarData();
  }, []);

  const loadCarData = async () => {
    try {
      const res = await readCar(token, id);
      const carData = res.data;
      
      setForm({
        brandAndModelsId: carData.brandAndModelsId || "",
        name: carData.name || "",
    
        year: carData.year || "",
        colorCarId: carData.colorCarId || "",
        vin: carData.vin || "",
        engineNumber: carData.engineNumber || "",
        typeId: carData.typeId || "",
        status: carData.status || "Available",
        price: carData.price || "",
        costPrice: carData.costPrice || "",
        description: carData.description || "",
        brandCarsId: carData.brandCarsId || "",
        images: carData.images || [],
        imaged: carData.imaged || []
      });

      // Set selected items and search values
      if (carData.brandCars) {
        setSelectedBrand(carData.brandCars);
        setBrandSearch(carData.brandCars.name);
      }
      
      if (carData.colorCar) {
        setSelectedColor(carData.colorCar);
        setColorSearch(carData.colorCar.name);
      }
      
      if (carData.typecar) {
        setSelectedType(carData.typecar);
        setTypeSearch(carData.typecar.name);
      }
      
      if (carData.brandAndModels) {
        setSelectedModel(carData.brandAndModels);
        setModelSearch(carData.brandAndModels.modelCar);
      }

      setLoading(false);
    } catch (err) {
      console.log(err);
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ");
      setLoading(false);
    }
  };

  // Filter functions
  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(brandSearch.toLowerCase())
  ).slice(0, 5);

  const filteredColors = colors.filter(color =>
    color.name.toLowerCase().includes(colorSearch.toLowerCase())
  ).slice(0, 5);

  const filteredTypes = types.filter(type =>
    type.name.toLowerCase().includes(typeSearch.toLowerCase())
  ).slice(0, 5);

  // Filter models based on selected brand
  const availableModels = selectedBrand 
    ? brandAndModels.filter(model => model.brandCarsId === selectedBrand.id)
    : brandAndModels;
    
  const filteredModels = availableModels.filter(model =>
    model.modelCar.toLowerCase().includes(modelSearch.toLowerCase())
  ).slice(0, 5);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Handle dropdown selections
  const handleBrandSelect = (brand) => {
    setSelectedBrand(brand);
    setBrandSearch(brand.name);
    setForm({ ...form, brandCarsId: brand.id, brandAndModelsId: "" });
    setShowBrandDropdown(false);
    // Reset model selection when brand changes
    setSelectedModel(null);
    setModelSearch("");
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setColorSearch(color.name);
    setForm({ ...form, colorCarId: color.id });
    setShowColorDropdown(false);
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setTypeSearch(type.name);
    setForm({ ...form, typeId: type.id });
    setShowTypeDropdown(false);
  };

  const handleModelSelect = (model) => {
    setSelectedModel(model);
    setModelSearch(model.modelCar);
    setForm({ ...form, brandAndModelsId: model.id });
    setShowModelDropdown(false);
  };

  // Handle image uploads
  const handleImageUpload = async (e, type = 'images') => {
    const files = Array.from(e.target.files);
    setImageUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = async () => {
            try {
              const uploadFunction = type === 'images' ? uploadCarImage : uploadCarImaged;
              const res = await uploadFunction(token, { image: reader.result });
              resolve(res.data);
            } catch (error) {
              console.error('Upload error:', error);
              resolve(null);
            }
          };
          reader.readAsDataURL(file);
        });
      });

      const uploadedImages = await Promise.all(uploadPromises);
      const validImages = uploadedImages.filter(img => img !== null);

      setForm(prev => ({
        ...prev,
        [type]: [...prev[type], ...validImages]
      }));

      toast.success(`ອັບໂຫຼດຮູບພາບສຳເລັດ ${validImages.length} ຮູບ`);
    } catch (error) {
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການອັບໂຫຼດຮູບພາບ");
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemoveImage = async (public_id, type = 'images') => {
    try {
      await removeCarImage(token, public_id);
      setForm(prev => ({
        ...prev,
        [type]: prev[type].filter(img => img.public_id !== public_id)
      }));
      toast.success("ລົບຮູບພາບສຳເລັດ");
    } catch (error) {
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການລົບຮູບພາບ");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    

    try {
      const res = await updateCar(token, id, form);
      toast.success("ອັບເດດຂໍ້ມູນລົດສຳເລັດແລ້ວ");
      navigate("/admin/cars");
    } catch (err) {
      console.log(err);
      const errorMsg = err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດ";
      toast.error(errorMsg);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 font-['Noto_Sans_Lao']">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/admin/cars")}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">ແກ້ໄຂຂໍ້ມູນລົດ</h1>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Brand Selection */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ເລືອກແບຣນ
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={brandSearch}
                    onChange={(e) => {
                      setBrandSearch(e.target.value);
                      setShowBrandDropdown(true);
                      setSelectedBrand(null);
                      setForm({ ...form, brandCarsId: "", brandAndModelsId: "" });
                    }}
                    onFocus={() => setShowBrandDropdown(true)}
                    placeholder="ຄົ້ນຫາແບຣນ..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  />
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                
                {showBrandDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredBrands.length > 0 ? (
                      filteredBrands.map((brand) => (
                        <div
                          key={brand.id}
                          onClick={() => handleBrandSelect(brand)}
                          className={`px-3 py-2 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 ${
                            selectedBrand?.id === brand.id ? 'bg-blue-100' : ''
                          }`}
                        >
                          {brand.name}
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-gray-500">ບໍ່ພົບແບຣນທີ່ຄົ້ນຫາ</div>
                    )}
                  </div>
                )}
              </div>

              {/* Model Selection */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ເລືອກລຸ້ນ
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={modelSearch}
                    onChange={(e) => {
                      setModelSearch(e.target.value);
                      setShowModelDropdown(true);
                      setSelectedModel(null);
                      setForm({ ...form, brandAndModelsId: "" });
                    }}
                    onFocus={() => setShowModelDropdown(true)}
                    placeholder="ຄົ້ນຫາລຸ້ນ..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    disabled={!selectedBrand}
                  />
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                
                {showModelDropdown && selectedBrand && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredModels.length > 0 ? (
                      filteredModels.map((model) => (
                        <div
                          key={model.id}
                          onClick={() => handleModelSelect(model)}
                          className={`px-3 py-2 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 ${
                            selectedModel?.id === model.id ? 'bg-blue-100' : ''
                          }`}
                        >
                          {model.modelCar}
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-gray-500">ບໍ່ພົບລຸ້ນທີ່ຄົ້ນຫາ</div>
                    )}
                  </div>
                )}
              </div>

              {/* Car Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ຊື່ລົດ
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="ປ້ອນຊື່ລົດ"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              

              {/* Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ປີ
                </label>
                <input
                  type="number"
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                  placeholder="ປ້ອນປີ"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Color Selection */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ເລືອກສີ
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={colorSearch}
                    onChange={(e) => {
                      setColorSearch(e.target.value);
                      setShowColorDropdown(true);
                      setSelectedColor(null);
                      setForm({ ...form, colorCarId: "" });
                    }}
                    onFocus={() => setShowColorDropdown(true)}
                    placeholder="ຄົ້ນຫາສີ..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  />
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                
                {showColorDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredColors.length > 0 ? (
                      filteredColors.map((color) => (
                        <div
                          key={color.id}
                          onClick={() => handleColorSelect(color)}
                          className={`px-3 py-2 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 ${
                            selectedColor?.id === color.id ? 'bg-blue-100' : ''
                          }`}
                        >
                          {color.name}
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-gray-500">ບໍ່ພົບສີທີ່ຄົ້ນຫາ</div>
                    )}
                  </div>
                )}
              </div>

              {/* VIN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  VIN
                </label>
                <input
                  type="text"
                  name="vin"
                  value={form.vin}
                  onChange={handleChange}
                  placeholder="ປ້ອນເລກ VIN"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Engine Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ເລກເຄື່ອງຈັກ
                </label>
                <input
                  type="text"
                  name="engineNumber"
                  value={form.engineNumber}
                  onChange={handleChange}
                  placeholder="ປ້ອນເລກເຄື່ອງຈັກ"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Type Selection */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ເລືອກປະເພດ
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={typeSearch}
                    onChange={(e) => {
                      setTypeSearch(e.target.value);
                      setShowTypeDropdown(true);
                      setSelectedType(null);
                      setForm({ ...form, typeId: "" });
                    }}
                    onFocus={() => setShowTypeDropdown(true)}
                    placeholder="ຄົ້ນຫາປະເພດ..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  />
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                
                {showTypeDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredTypes.length > 0 ? (
                      filteredTypes.map((type) => (
                        <div
                          key={type.id}
                          onClick={() => handleTypeSelect(type)}
                          className={`px-3 py-2 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 ${
                            selectedType?.id === type.id ? 'bg-blue-100' : ''
                          }`}
                        >
                          {type.name}
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-gray-500">ບໍ່ພົບປະເພດທີ່ຄົ້ນຫາ</div>
                    )}
                  </div>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ສະຖານະ
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Available">ພ້ອມຂາຍ</option>
                  <option value="Sold">ຂາຍແລ້ວ</option>
                  <option value="Reserved">ຈອງແລ້ວ</option>
          
                </select>
              </div>

              {/* Price */}
              
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ຄຳອະທິບາຍ
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="ປ້ອນຄຳອະທິບາຍ"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Image Upload Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Main Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  ຮູບພາບຫຼັກ
                </label>
                <div className="relative">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 transition-all duration-300 hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 group">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'images')}
                      className="hidden"
                      id="images-upload"
                    />
                    <label
                      htmlFor="images-upload"
                      className="flex flex-col items-center justify-center cursor-pointer"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4 group-hover:from-blue-200 group-hover:to-indigo-200 transition-all duration-300">
                        <Upload className="h-8 w-8 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <span className="text-base font-medium text-gray-700 mb-2">ເພີ່ມຮູບພາບຫຼັກ</span>
                      <span className="text-sm text-gray-500 text-center">
                        ລາກຈັບຍ້າຍຮູບພາບມາວາງທີ່ນີ້ ຫຼື ກົດເພື່ອເລືອກ<br/>
                        <span className="text-xs">PNG, JPG, GIF ຂະໜາດບໍ່ເກີນ 10MB</span>
                      </span>
                    </label>
                  </div>
                  
                  {/* Upload Progress */}
                  {imageUploading && (
                    <div className="absolute inset-0 bg-white bg-opacity-90 rounded-xl flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                        <p className="text-sm text-blue-600 font-medium">ກຳລັງອັບໂຫລດ...</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Preview Images */}
                {form.images.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">ຮູບພາບທີ່ເລືອກ ({form.images.length})</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {form.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-square">
                            <img
                              src={image.secure_url}
                              alt={`Image ${index + 1}`}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(image.public_id, 'images')}
                              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 truncate">ຮູບທີ່ {index + 1}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Detail Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  ຮູບພາບລະອຽດ
                </label>
                <div className="relative">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 transition-all duration-300 hover:border-emerald-400 hover:bg-gradient-to-br hover:from-emerald-50 hover:to-green-50 group">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'imaged')}
                      className="hidden"
                      id="imaged-upload"
                    />
                    <label
                      htmlFor="imaged-upload"
                      className="flex flex-col items-center justify-center cursor-pointer"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full flex items-center justify-center mb-4 group-hover:from-emerald-200 group-hover:to-green-200 transition-all duration-300">
                        <Upload className="h-8 w-8 text-emerald-600 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <span className="text-base font-medium text-gray-700 mb-2">ເພີ່ມຮູບພາບລະອຽດ</span>
                      <span className="text-sm text-gray-500 text-center">
                        ຮູບພາບພາຍໃນ, ເຄື່ອງຈັກ, ລາຍລະອຽດພິເສດ<br/>
                        <span className="text-xs">PNG, JPG, GIF ຂະໜາດບໍ່ເກີນ 10MB</span>
                      </span>
                    </label>
                  </div>
                  
                  {/* Upload Progress */}
                  {imageUploading && (
                    <div className="absolute inset-0 bg-white bg-opacity-90 rounded-xl flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-2"></div>
                        <p className="text-sm text-emerald-600 font-medium">ກຳລັງອັບໂຫລດ...</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Preview Detail Images */}
                {form.imaged.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">ຮູບພາບລະອຽດ ({form.imaged.length})</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {form.imaged.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-square">
                            <img
                              src={image.secure_url}
                              alt={`Detail ${index + 1}`}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(image.public_id, 'imaged')}
                              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 truncate">ລະອຽດທີ່ {index + 1}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={imageUploading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition-colors disabled:opacity-50"
              >
                {imageUploading ? "ກຳລັງອັບໂຫຼດ..." : "ບັນທຶກການປ່ຽນແປງ"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/cars")}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md transition-colors"
              >
                ຍົກເລີກ
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showBrandDropdown || showColorDropdown || showTypeDropdown || showModelDropdown) && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => {
            setShowBrandDropdown(false);
            setShowColorDropdown(false);
            setShowTypeDropdown(false);
            setShowModelDropdown(false);
          }}
        />
      )}
    </div>
  );
};

export default EditCar;