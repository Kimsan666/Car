// src/page/admin/Management/AddCar.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useCarStore from "../../../Store/car-store";
import {
  saveCar,
  uploadCarImage,
  removeCarImage,
  uploadCarImaged,
} from "../../../api/Car";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  ChevronDown,
  Upload,
  X,
  Save,
  RotateCcw,
} from "lucide-react";

const CreateCar = () => {
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
    year:"",
    typeId: "",
    description: "",
    brandCarsId: "",
    images: [],
    imaged: [],
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

  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    getBrand();
    getColor();
    getType();
    getBrandAndModel();
  }, []);

  // Filter functions
  const filteredBrands = brands
    .filter((brand) =>
      brand.name.toLowerCase().includes(brandSearch.toLowerCase())
    )
    .slice(0, 5);

  const filteredTypes = types
    .filter((type) =>
      type.name.toLowerCase().includes(typeSearch.toLowerCase())
    )
    .slice(0, 5);

  // Filter models based on selected brand
  const availableModels = selectedBrand
    ? brandAndModels.filter((model) => model.brandCarsId === selectedBrand.id)
    : brandAndModels;

  const filteredModels = availableModels
    .filter((model) =>
      model.modelCar.toLowerCase().includes(modelSearch.toLowerCase())
    )
    .slice(0, 5);

  // Helper function to format number with commas
  const formatNumberWithCommas = (value) => {
    if (!value) return "";
    // Remove any non-digit characters except commas
    const numericValue = value.toString().replace(/[^0-9]/g, "");
    // Add commas every three digits
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Helper function to remove commas from formatted number
  const parseFormattedNumber = (value) => {
    if (!value) return "";
    return value.toString().replace(/,/g, "");
  };

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

  // Handle input blur events for validation - แก้ไขด้วย setTimeout
  const handleBrandBlur = () => {
    setTimeout(() => {
      if (brandSearch && !selectedBrand) {
        const exactMatch = brands.find(
          (brand) => brand.name.toLowerCase() === brandSearch.toLowerCase()
        );
        if (exactMatch) {
          handleBrandSelect(exactMatch);
        } else {
          setBrandSearch("");
          toast.warning("ກາລຸນາເລືອກແບຣນຈາກລາຍການທີ່ມີຢູ່");
        }
      }
      setShowBrandDropdown(false);
    }, 200); // รอ 200ms เพื่อให้ onClick ทำงานก่อน
  };

  const handleTypeBlur = () => {
    setTimeout(() => {
      if (typeSearch && !selectedType) {
        const exactMatch = types.find(
          (type) => type.name.toLowerCase() === typeSearch.toLowerCase()
        );
        if (exactMatch) {
          handleTypeSelect(exactMatch);
        } else {
          setTypeSearch("");
          toast.warning("ກາລຸນາເລືອກປະເພດຈາກລາຍການທີ່ມີຢູ່");
        }
      }
      setShowTypeDropdown(false);
    }, 200);
  };

  const handleModelBlur = () => {
    setTimeout(() => {
      if (modelSearch && !selectedModel) {
        const exactMatch = availableModels.find(
          (model) => model.modelCar.toLowerCase() === modelSearch.toLowerCase()
        );
        if (exactMatch) {
          handleModelSelect(exactMatch);
        } else {
          setModelSearch("");
          toast.warning("ກາລຸນາເລືອກລຸ້ນຈາກລາຍການທີ່ມີຢູ່");
        }
      }
      setShowModelDropdown(false);
    }, 200);
  };

  // Handle image uploads
  const handleImageUpload = async (e, type = "images") => {
    const files = Array.from(e.target.files);
    setImageUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = async () => {
            try {
              const uploadFunction =
                type === "images" ? uploadCarImage : uploadCarImaged;
              const res = await uploadFunction(token, { image: reader.result });
              resolve(res.data);
            } catch (error) {
              console.error("Upload error:", error);
              resolve(null);
            }
          };
          reader.readAsDataURL(file);
        });
      });

      const uploadedImages = await Promise.all(uploadPromises);
      const validImages = uploadedImages.filter((img) => img !== null);

      setForm((prev) => ({
        ...prev,
        [type]: [...prev[type], ...validImages],
      }));

      toast.success(`ອັບໂຫຼດຮູບພາບສຳເລັດ ${validImages.length} ຮູບ`);
    } catch (error) {
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການອັບໂຫຼດຮູບພາບ");
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemoveImage = async (public_id, type = "images") => {
    try {
      await removeCarImage(token, public_id);
      setForm((prev) => ({
        ...prev,
        [type]: prev[type].filter((img) => img.public_id !== public_id),
      }));
      toast.success("ລົບຮູບພາບສຳເລັດ");
    } catch (error) {
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການລົບຮູບພາບ");
    }
  };

  const resetForm = () => {
    setForm({
      brandAndModelsId: "",
      name: "",
      typeId: "",
      description: "",
      brandCarsId: "",
      images: [],
      imaged: [],
    });
    setBrandSearch("");
    setColorSearch("");
    setTypeSearch("");
    setModelSearch("");
    setSelectedBrand(null);
    setSelectedColor(null);
    setSelectedType(null);
    setSelectedModel(null);

    // Close all dropdowns
    setShowBrandDropdown(false);
    setShowColorDropdown(false);
    setShowTypeDropdown(false);
    setShowModelDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Strict validation for dropdown selections
    if (brandSearch && !selectedBrand) {
      return toast.error("ກາລຸນາເລືອກແບຣນຈາກລາຍການທີ່ມີຢູ່");
    }

    if (typeSearch && !selectedType) {
      return toast.error("ກາລຸນາເລືອກປະເພດຈາກລາຍການທີ່ມີຢູ່");
    }

    if (modelSearch && !selectedModel) {
      return toast.error("ກາລຸນາເລືອກລຸ້ນຈາກລາຍການທີ່ມີຢູ່");
    }

    // Additional validation: if brand is selected, ensure the model belongs to that brand
    if (
      selectedBrand &&
      selectedModel &&
      selectedModel.brandCarsId !== selectedBrand.id
    ) {
      return toast.error("ລຸ້ນທີ່ເລືອກບໍ່ຕົງກັບແບຣນ");
    }

    try {
      const res = await saveCar(token, form);
      toast.success(res.data.message);
      navigate("/admin/cars");
    } catch (err) {
      console.log(err);
      const errorMsg = err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດ";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="container mx-auto p-4 font-['Noto_Sans_Lao']">
      <div className="bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-emerald-50 to-green-50">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/admin/cars")}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">ເພີ່ມລົດໃໝ່</h1>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <div className="w-2 h-6 bg-blue-500 rounded mr-3"></div>
                ຂໍ້ມູນພື້ນຖານ
              </h3>
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
                        if (
                          selectedBrand &&
                          e.target.value !== selectedBrand.name
                        ) {
                          setSelectedBrand(null);
                          setForm({
                            ...form,
                            brandCarsId: "",
                            brandAndModelsId: "",
                          });
                          setSelectedModel(null);
                          setModelSearch("");
                        }
                      }}
                      onFocus={() => setShowBrandDropdown(true)}
                      onBlur={handleBrandBlur}
                      placeholder="ຄົ້ນຫາແບຣນ..."
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 pr-10 ${
                        selectedBrand
                          ? "border-green-300 bg-green-50 focus:ring-green-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                    />
                    <div className="text-xs font-notosanslao text-gray-500 text-right mt-1">
                      ສາມາດເລືອກບັນທຶກໄດ້ສະເພາະແບນທີ່ຄົ້ນຫາເຫັນເທົ່ານັ້ນ
                    </div>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    {selectedBrand && (
                      <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    )}
                  </div>

                  {showBrandDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredBrands.length > 0 ? (
                        filteredBrands.map((brand) => (
                          <div
                            key={brand.id}
                            onMouseDown={() => handleBrandSelect(brand)} // เปลี่ยนจาก onClick เป็น onMouseDown
                            className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                          >
                            {brand.name}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-gray-500">
                          ບໍ່ພົບແບຣນທີ່ຄົ້ນຫາ
                        </div>
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
                        if (
                          selectedModel &&
                          e.target.value !== selectedModel.modelCar
                        ) {
                          setSelectedModel(null);
                          setForm({ ...form, brandAndModelsId: "" });
                        }
                      }}
                      onFocus={() => setShowModelDropdown(true)}
                      onBlur={handleModelBlur}
                      placeholder="ຄົ້ນຫາລຸ້ນ..."
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 pr-10 ${
                        selectedModel
                          ? "border-green-300 bg-green-50 focus:ring-green-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                      disabled={!selectedBrand}
                    />
                    <div className="text-xs font-notosanslao text-gray-500 text-right mt-1">
                      ສາມາດເລືອກບັນທຶກໄດ້ສະເພາະລຸ້ນທີ່ຄົ້ນຫາເຫັນເທົ່ານັ້ນ
                    </div>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    {selectedModel && (
                      <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    )}
                  </div>

                  {showModelDropdown && selectedBrand && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredModels.length > 0 ? (
                        filteredModels.map((model) => (
                          <div
                            key={model.id}
                            onMouseDown={() => handleModelSelect(model)} // เปลี่ยนจาก onClick เป็น onMouseDown
                            className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                          >
                            {model.modelCar}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-gray-500">
                          ບໍ່ພົບລຸ້ນທີ່ຄົ້ນຫາ
                        </div>
                      )}
                    </div>
                  )}
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
                    placeholder="2020"
                    min="1900"
                    max="2030"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Technical Details Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <div className="w-2 h-6 bg-indigo-500 rounded mr-3"></div>
                ລາຍລະອຽດເຕັກນິກ
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        if (
                          selectedType &&
                          e.target.value !== selectedType.name
                        ) {
                          setSelectedType(null);
                          setForm({ ...form, typeId: "" });
                        }
                      }}
                      onFocus={() => setShowTypeDropdown(true)}
                      onBlur={handleTypeBlur}
                      placeholder="ຄົ້ນຫາປະເພດ..."
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 pr-10 ${
                        selectedType
                          ? "border-green-300 bg-green-50 focus:ring-green-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                    />
                    <div className="text-xs font-notosanslao text-gray-500 text-right mt-1">
                      ສາມາດເລືອກບັນທຶກໄດ້ສະເພາະປະເພດທີ່ຄົ້ນຫາເຫັນເທົ່ານັ້ນ
                    </div>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    {selectedType && (
                      <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    )}
                  </div>

                  {showTypeDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredTypes.length > 0 ? (
                        filteredTypes.map((type) => (
                          <div
                            key={type.id}
                            onMouseDown={() => handleTypeSelect(type)} // เปลี่ยนจาก onClick เป็น onMouseDown
                            className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                          >
                            {type.name}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-gray-500">
                          ບໍ່ພົບປະເພດທີ່ຄົ້ນຫາ
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <div className="w-2 h-6 bg-purple-500 rounded mr-3"></div>
                ຄຳອະທິບາຍ
              </h3>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="ປ້ອນຄຳອະທິບາຍລົດ..."
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Image Upload Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <div className="w-2 h-6 bg-pink-500 rounded mr-3"></div>
                ຮູບພາບລົດ
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Main Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    ຮູບພາບຫຼັກ (3-8 ຮູບ)
                    <span className="text-xs text-gray-500 block mt-1">
                      ໜ້າລົດ, ຫຼັງລົດ, ຂ້າງຊ້າຍ-ຂວາ, ພາຍໃນ
                    </span>
                  </label>
                  <div className="relative">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 transition-all duration-300 hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 group">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "images")}
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
                        <span className="text-base font-medium text-gray-700 mb-2">
                          ເລືອກຮູບພາບຫຼັກ
                        </span>
                        <span className="text-sm text-gray-500 text-center">
                          ລາກຈັບຍ້າຍຮູບພາບມາວາງທີ່ນີ້ ຫຼື ກົດເພື່ອເລືອກ
                          <br />
                          <span className="text-xs">
                            PNG, JPG, GIF ຂະໜາດບໍ່ເກີນ 10MB
                          </span>
                        </span>
                      </label>
                    </div>

                    {/* Upload Progress */}
                    {imageUploading && (
                      <div className="absolute inset-0 bg-white bg-opacity-90 rounded-xl flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                          <p className="text-sm text-blue-600 font-medium">
                            ກຳລັງອັບໂຫຼດ...
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Preview Images */}
                  {form.images.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        ຮູບພາບທີ່ເລືອກ ({form.images.length})
                      </h4>
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
                                onClick={() =>
                                  handleRemoveImage(image.public_id, "images")
                                }
                                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              ຮູບທີ່ {index + 1}
                            </p>
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
                    <span className="text-xs text-gray-500 block mt-1">
                      ເຄື່ອງຈັກ, ລໍ້, ແດັຊບອດ, ບາດແຜ (ຖ້າມີ)
                    </span>
                  </label>
                  <div className="relative">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 transition-all duration-300 hover:border-emerald-400 hover:bg-gradient-to-br hover:from-emerald-50 hover:to-green-50 group">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "imaged")}
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
                        <span className="text-base font-medium text-gray-700 mb-2">
                          ເລືອກຮູບພາບລະອຽດ
                        </span>
                        <span className="text-sm text-gray-500 text-center">
                          ຮູບພາບພາຍໃນ, ເຄື່ອງຈັກ, ລາຍລະອຽດພິເສດ
                          <br />
                          <span className="text-xs">
                            PNG, JPG, GIF ຂະໜາດບໍ່ເກີນ 10MB
                          </span>
                        </span>
                      </label>
                    </div>

                    {/* Upload Progress */}
                    {imageUploading && (
                      <div className="absolute inset-0 bg-white bg-opacity-90 rounded-xl flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-2"></div>
                          <p className="text-sm text-emerald-600 font-medium">
                            ກຳລັງອັບໂຫຼດ...
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Preview Detail Images */}
                  {form.imaged.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        ຮູບພາບລະອຽດ ({form.imaged.length})
                      </h4>
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
                                onClick={() =>
                                  handleRemoveImage(image.public_id, "imaged")
                                }
                                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              ລະອຽດທີ່ {index + 1}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center space-x-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <RotateCcw className="h-4 w-4" />
                <span>ລ້າງຟອມ</span>
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/cars")}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                ຍົກເລີກ
              </button>
              <button
                type="submit"
                disabled={imageUploading}
                className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Save className="h-4 w-4" />
                <span>
                  {imageUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                      ກຳລັງອັບໂຫຼດ...
                    </>
                  ) : (
                    "ບັນທຶກລົດໃໝ່"
                  )}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showBrandDropdown ||
        showColorDropdown ||
        showTypeDropdown ||
        showModelDropdown) && (
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

export default CreateCar;