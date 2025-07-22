import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useCarStore from "../../../Store/car-store";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Upload,
  X,
  Save,
  RotateCcw,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  FileText,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import {
  readCustomer,
  updateCustomer,
  removeCarImageC,
  uploadCarImagedC,
} from "../../../api/Customer";

const EditCustomer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useCarStore((state) => state.token);

  const [form, setForm] = useState({
    fname: "",
    lname: "",
    number: "",
    email: "",
    address: "",
    numberDocuments: "",
    documentsType: "",
    images: [],
  });

  const [imageUploading, setImageUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  // Document types options
  const documentTypes = [
    { value: "passport", label: "ໜັງສືຜ່ານແດນ (Passport)" },
    { value: "id_card", label: "ບັດປະຊາຊົນ (ID Card)" },
    { value: "driving_license", label: "ໃບຂັບຂີ່ (Driving License)" },
    { value: "census", label: "ປຶ້ມສຳມະໂນຄົວ (Census)" },
  ];

  useEffect(() => {
    loadCustomerData();
  }, []);

  const loadCustomerData = async () => {
    try {
      setLoading(true);
      const res = await readCustomer(token, id);
      const customerData = res.data.data;

      setForm({
        fname: customerData.fname || "",
        lname: customerData.lname || "",
        email: customerData.email || "",
        number: customerData.number || "",
        address: customerData.address || "",
        documentsType: customerData.documentsType || "",
        numberDocuments: customerData.numberDocuments || "",
        images: customerData.images || [],
      });
    } catch (err) {
      console.log(err);
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ");
      navigate("/admin/customers");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Handle phone number input (numbers only)
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setForm({
      ...form,
      number: value,
    });
  };

  // Image compression function
  const compressImage = (file, quality = 0.8, maxWidth = 1200) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // File validation
  const validateFile = (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`ຮູບແບບ ${file.type} ບໍ່ຮອງຮັບ. ເຮົາຮອງຮັບ JPG, PNG, GIF ເທົ່ານັ້ນ`);
    }
    
    if (file.size > maxSize) {
      throw new Error(`ຮູບພາບໃຫຍ່ເກີນໄປ. ຂະໜາດສູງສຸດ 10MB`);
    }
    
    return true;
  };

  // Handle image uploads with better error handling and compression
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate files first
    try {
      files.forEach(validateFile);
    } catch (error) {
      toast.error(error.message);
      return;
    }

    setImageUploading(true);
    setUploadProgress(files.map((_, index) => ({ index, status: 'pending', progress: 0 })));

    const successfulUploads = [];
    
    // Upload files sequentially to avoid overwhelming the server
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        // Update progress
        setUploadProgress(prev => prev.map(p => 
          p.index === i ? { ...p, status: 'compressing', progress: 25 } : p
        ));

        // Compress image
        const compressedFile = await compressImage(file, 0.8, 1200);
        
        // Update progress
        setUploadProgress(prev => prev.map(p => 
          p.index === i ? { ...p, status: 'uploading', progress: 50 } : p
        ));

        // Convert to base64
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(compressedFile);
        });

        // Update progress
        setUploadProgress(prev => prev.map(p => 
          p.index === i ? { ...p, progress: 75 } : p
        ));

        // Upload with timeout and retry
        const uploadWithRetry = async (retries = 3) => {
          for (let attempt = 1; attempt <= retries; attempt++) {
            try {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
              
              const res = await uploadCarImagedC(token, { image: base64 });
              clearTimeout(timeoutId);
              return res;
            } catch (error) {
              if (attempt === retries) throw error;
              
              // Wait before retry
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
          }
        };

        const res = await uploadWithRetry();
        
        if (res && res.data) {
          successfulUploads.push(res.data);
          
          // Update progress - success
          setUploadProgress(prev => prev.map(p => 
            p.index === i ? { ...p, status: 'success', progress: 100 } : p
          ));
        }

      } catch (error) {
        console.error(`Upload error for file ${i}:`, error);
        
        // Update progress - error
        setUploadProgress(prev => prev.map(p => 
          p.index === i ? { ...p, status: 'error', progress: 0 } : p
        ));
        
        // Show specific error message
        const errorMsg = error.name === 'AbortError' 
          ? `ການອັບໂຫຼດຮູບທີ່ ${i + 1} timeout ແລ້ວ` 
          : `ເກີດຂໍ້ຜິດພາດໃນການອັບໂຫຼດຮູບທີ່ ${i + 1}`;
        
        toast.error(errorMsg);
      }
    }

    // Update form with successful uploads
    if (successfulUploads.length > 0) {
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...successfulUploads],
      }));
      
      toast.success(`ອັບໂຫຼດສຳເລັດ ${successfulUploads.length} ຮູບ ຈາກທັງໝົດ ${files.length} ຮູບ`);
    }

    // Clean up
    setTimeout(() => {
      setImageUploading(false);
      setUploadProgress([]);
    }, 2000);

    // Clear file input
    e.target.value = '';
  };

  const handleRemoveImage = async (public_id) => {
    try {
      await removeCarImageC(token, public_id);
      setForm((prev) => ({
        ...prev,
        images: prev.images.filter((img) => img.public_id !== public_id),
      }));
      toast.success("ລົບຮູບພາບສຳເລັດ");
    } catch (error) {
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການລົບຮູບພາບ");
    }
  };

  const resetForm = async () => {
    await loadCustomerData(); // Reload original data
  };

  const handleSubmit = async () => {
    // Validation
    if (!form.fname.trim()) {
      return toast.error("ກາລຸນາປ້ອນຊື່ລູກຄ້າ");
    }
    if (!form.lname.trim()) {
      return toast.error("ກາລຸນາປ້ອນນາມສະກຸນລູກຄ້າ");
    }
    if (!form.number.trim()) {
      return toast.error("ກາລຸນາປ້ອນເບີໂທລູກຄ້າ");
    }
    if (!form.email.trim()) {
      return toast.error("ກາລຸນາປ້ອນອີເມວລູກຄ້າ");
    }
    if (!form.address.trim()) {
      return toast.error("ກາລຸນາປ້ອນທີ່ຢູ່ລູກຄ້າ");
    }
    if (!form.numberDocuments.trim()) {
      return toast.error("ກາລຸນາປ້ອນເລກເອກະສານ");
    }
    if (!form.documentsType) {
      return toast.error("ກາລຸນາເລືອກປະເພດເອກະສານ");
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      return toast.error("ຮູບແບບອີເມວບໍ່ຖືກຕ້ອງ");
    }

    // Phone number validation (basic check)
    if (form.number.length < 8) {
      return toast.error("ເບີໂທຕ້ອງມີຢ່າງໜ້ອຍ 8 ຫຼັກ");
    }

    // Check if still uploading
    if (imageUploading) {
      return toast.warning("ກາລຸນາລໍຖ້າການອັບໂຫຼດຮູບພາບໃຫ້ເສັດສິ້ນກ່ອນ");
    }

    try {
      // Use updateCustomer API instead of saveCustomer
      const res = await updateCustomer(token, id, form);
      toast.success(res.data.message || "ອັບເດດຂໍ້ມູນລູກຄ້າສຳເລັດແລ້ວ");
      navigate("/admin/customers");
    } catch (err) {
      console.log(err);
      const errorMsg = err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດ";
      toast.error(errorMsg);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 font-['Noto_Sans_Lao']">
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3">ກຳລັງໂຫຼດຂໍ້ມູນ...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 font-['Noto_Sans_Lao']">
      <div className="bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/admin/customers")}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">ແກ້ໄຂຂໍ້ມູນລູກຄ້າ</h1>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-8">
            {/* Personal Information Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <div className="w-2 h-6 bg-blue-500 rounded mr-3"></div>
                <User className="h-5 w-5 mr-2" />
                ຂໍ້ມູນສ່ວນຕົວ
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ຊື່ *
                  </label>
                  <input
                    type="text"
                    name="fname"
                    value={form.fname}
                    onChange={handleChange}
                    placeholder="ປ້ອນຊື່ລູກຄ້າ"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <div className="text-xs text-gray-500 text-right mt-1">
                    {form.fname?.length || 0}/191 ຕົວອັກສອນ
                  </div>
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ນາມສະກຸນ *
                  </label>
                  <input
                    type="text"
                    name="lname"
                    value={form.lname}
                    onChange={handleChange}
                    placeholder="ປ້ອນນາມສະກຸນລູກຄ້າ"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <div className="text-xs text-gray-500 text-right mt-1">
                    {form.lname?.length || 0}/191 ຕົວອັກສອນ
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <div className="w-2 h-6 bg-green-500 rounded mr-3"></div>
                <Phone className="h-5 w-5 mr-2" />
                ຂໍ້ມູນຕິດຕໍ່
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ເບີໂທລະສັບ *
                  </label>
                  <input
                    type="tel"
                    name="number"
                    value={form.number}
                    onChange={handlePhoneChange}
                    placeholder="ປ້ອນເບີໂທລະສັບ"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    ປ້ອນໄດ້ແຄ່ຕົວເລກເທົ່ານັ້ນ
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ອີເມວ *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="ປ້ອນທີ່ຢູ່ອີເມວ"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    ຕົວຢ່າງ: example@gmail.com
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  ທີ່ຢູ່ *
                </label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="ປ້ອນທີ່ຢູ່ລູກຄ້າ"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  required
                />
                <div className="text-xs text-gray-500 text-right mt-1">
                  {form.address?.length || 0}/191 ຕົວອັກສອນ
                </div>
              </div>
            </div>

            {/* Document Information Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <div className="w-2 h-6 bg-purple-500 rounded mr-3"></div>
                <CreditCard className="h-5 w-5 mr-2" />
                ຂໍ້ມູນເອກະສານ
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Document Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ປະເພດເອກະສານ *
                  </label>
                  <select
                    name="documentsType"
                    value={form.documentsType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">ເລືອກປະເພດເອກະສານ</option>
                    {documentTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Document Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ເລກເອກະສານ *
                  </label>
                  <input
                    type="text"
                    name="numberDocuments"
                    value={form.numberDocuments}
                    onChange={handleChange}
                    placeholder="ປ້ອນເລກເອກະສານ"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    ເລກບັດປະຊາຊົນ, ໜັງສືຜ່ານແດນ, ໃບຂັບຂີ່ ຫຼື ອື່ນໆ
                  </div>
                </div>
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <div className="w-2 h-6 bg-pink-500 rounded mr-3"></div>
                <FileText className="h-5 w-5 mr-2" />
                ຮູບພາບເອກະສານ
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  ຮູບພາບເອກະສານ (ເສີມ)
                  <span className="text-xs text-gray-500 block mt-1">
                    ຮູບພາບບັດປະຊາຊົນ, ໜັງສືຜ່ານແດນ, ໃບຂັບຂີ່ ຫຼື ເອກະສານອື່ນໆ
                  </span>
                </label>
                <div className="relative">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 transition-all duration-300 hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 group">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="images-upload"
                      disabled={imageUploading}
                    />
                    <label
                      htmlFor="images-upload"
                      className={`flex flex-col items-center justify-center ${imageUploading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4 group-hover:from-blue-200 group-hover:to-indigo-200 transition-all duration-300">
                        <Upload className="h-8 w-8 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <span className="text-base font-medium text-gray-700 mb-2">
                        {imageUploading ? 'ກຳລັງອັບໂຫຼດ...' : 'ເລືອກຮູບພາບເອກະສານ'}
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
                  {imageUploading && uploadProgress.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">ສະຖານະການອັບໂຫຼດ:</h4>
                      {uploadProgress.map((progress, index) => (
                        <div key={index} className="bg-white rounded-lg p-3 border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-700">ຮູບທີ່ {progress.index + 1}</span>
                            <div className="flex items-center space-x-2">
                              {progress.status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                              {progress.status === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
                              <span className="text-xs text-gray-500">
                                {progress.status === 'pending' && 'ລໍຖ້າ...'}
                                {progress.status === 'compressing' && 'ບີບອັດ...'}
                                {progress.status === 'uploading' && 'ອັບໂຫຼດ...'}
                                {progress.status === 'success' && 'ສຳເລັດ'}
                                {progress.status === 'error' && 'ຜິດພາດ'}
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                progress.status === 'success' ? 'bg-green-500' :
                                progress.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${progress.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Preview Images */}
                {form.images.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      ຮູບພາບເອກະສານ ({form.images.length})
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {form.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-square">
                            <img
                              src={image.secure_url}
                              alt={`Document ${index + 1}`}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(image.public_id)}
                              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            ເອກະສານທີ່ {index + 1}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                <span>ໂຫຼດຄືນ</span>
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/customers")}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                ຍົກເລີກ
              </button>
              <button
                onClick={handleSubmit}
                disabled={imageUploading}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Save className="h-4 w-4" />
                <span>
                  {imageUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                      ກຳລັງອັບໂຫຼດ...
                    </>
                  ) : (
                    "ອັບເດດຂໍ້ມູນ"
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCustomer;