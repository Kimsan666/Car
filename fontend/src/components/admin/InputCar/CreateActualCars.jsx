import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Save,
  Plus,
  X,
  Upload,
  Car,
  Package,
  AlertCircle,
  Camera,
  Trash2,
  Copy,
  CheckCircle,
} from "lucide-react";
import useCarStore from "../../../Store/car-store";
import { toast } from "react-toastify";
import { saveInputCar, receiveActualCars } from "../../../api/InputCar";
import { useNavigate } from "react-router-dom";

const CreateActualCars = () => {
  const { 
    user, 
    token, 
    brands, 
    colors, 
    types, 
    brandAndModels,
    getBrand,
    getColor,
    getType,
    getBrandAndModel,
  } = useCarStore();
  const navigate = useNavigate();

  const [inputCarData, setInputCarData] = useState(null);
  const [actualCarsData, setActualCarsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Safe arrays
  const safeBrands = Array.isArray(brands?.data) ? brands.data : Array.isArray(brands) ? brands : [];
  const safeColors = Array.isArray(colors?.data) ? colors.data : Array.isArray(colors) ? colors : [];
  const safeTypes = Array.isArray(types?.data) ? types.data : Array.isArray(types) ? types : [];
  const safeBrandAndModels = Array.isArray(brandAndModels?.data) ? brandAndModels.data : Array.isArray(brandAndModels) ? brandAndModels : [];

  useEffect(() => {
    loadDataAndInitialize();
  }, []);

  const loadDataAndInitialize = async () => {
    try {
      // โหลดข้อมูลจาก localStorage
      const savedData = localStorage.getItem("inputCarData");
      if (!savedData) {
        toast.error("ບໍ່ພົບຂໍ້ມູນຈາກຂັ້ນຕອນກ່ອນໜ້າ");
        navigate("/admin/input-cars/create");
        return;
      }

      const data = JSON.parse(savedData);
      setInputCarData(data);
      console.log("Input car data:", data);

      // โหลดข้อมูล master data
      await Promise.all([
        safeBrands.length === 0 ? getBrand() : Promise.resolve(),
        safeColors.length === 0 ? getColor() : Promise.resolve(),
        safeTypes.length === 0 ? getType() : Promise.resolve(),
        safeBrandAndModels.length === 0 ? getBrandAndModel() : Promise.resolve(),
      ]);

      // สร้างโครงสร้างข้อมูลรถจริงตามจำนวนที่ได้รับ
      const carsData = [];
      data.receivedItems.forEach((item) => {
        for (let i = 0; i < item.receivedQuantity; i++) {
          carsData.push({
            itemId: item.originalItemId,
            carIndex: i,
            originalCarId: item.carId,
            originalCarName: item.carName,
            originalLicensePlate: item.licensePlate,
            originalBrandModel: item.brandModel,
            
            // ข้อมูลรถจริง
            name: item.carName, // เริ่มต้นด้วยชื่อเดิม
            licensePlate: "",
            actualPrice: "",
            actualCostPrice: "",
            actualYear: "",
            actualVin: "",
            actualEngineNumber: "",
            actualDescription: "",
            brandAndModelsId: "",
            colorCarId: "",
            typeId: "",
            brandCarsId: "",
            actualColorName: "",
            actualBrandModel: "",
            actualTypeName: "",
            images: [],
            imaged: [],
          });
        }
      });

      setActualCarsData(carsData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ");
      navigate("/admin/input-cars/create");
    } finally {
      setLoading(false);
    }
  };

  // อัปเดตข้อมูลรถ
  const updateCarData = (carIndex, field, value) => {
    setActualCarsData(prev => prev.map((car, index) => {
      if (index === carIndex) {
        const updatedCar = { ...car, [field]: value };
        
        // ถ้าเป็นการเปลี่ยน brandAndModelsId ให้อัปเดต actualBrandModel
        if (field === "brandAndModelsId") {
          const selectedBrandModel = safeBrandAndModels.find(bm => bm.id === parseInt(value));
          if (selectedBrandModel) {
            updatedCar.actualBrandModel = `${selectedBrandModel.BrandCars?.name || ""} ${selectedBrandModel.modelCar || ""}`;
          }
        }
        
        // ถ้าเป็นการเปลี่ยน colorCarId ให้อัปเดต actualColorName
        if (field === "colorCarId") {
          const selectedColor = safeColors.find(c => c.id === parseInt(value));
          if (selectedColor) {
            updatedCar.actualColorName = selectedColor.name;
          }
        }
        
        // ถ้าเป็นการเปลี่ยน typeId ให้อัปเดต actualTypeName
        if (field === "typeId") {
          const selectedType = safeTypes.find(t => t.id === parseInt(value));
          if (selectedType) {
            updatedCar.actualTypeName = selectedType.name;
          }
        }
        
        return updatedCar;
      }
      return car;
    }));

    // ล้าง error ของฟิลด์นี้
    if (errors[`car_${carIndex}_${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`car_${carIndex}_${field}`];
        return newErrors;
      });
    }
  };

  // คัดลอกข้อมูลจากรถคันแรก
  const copyFromFirstCar = (targetIndex) => {
    if (actualCarsData.length === 0) return;
    
    const firstCar = actualCarsData[0];
    const targetCar = actualCarsData[targetIndex];
    
    // คัดลอกข้อมูลยกเว้นข้อมูลที่ไม่ควรซ้ำ
    setActualCarsData(prev => prev.map((car, index) => {
      if (index === targetIndex) {
        return {
          ...car,
          actualPrice: firstCar.actualPrice,
          actualCostPrice: firstCar.actualCostPrice,
          actualYear: firstCar.actualYear,
          actualDescription: firstCar.actualDescription,
          brandAndModelsId: firstCar.brandAndModelsId,
          colorCarId: firstCar.colorCarId,
          typeId: firstCar.typeId,
          brandCarsId: firstCar.brandCarsId,
          actualColorName: firstCar.actualColorName,
          actualBrandModel: firstCar.actualBrandModel,
          actualTypeName: firstCar.actualTypeName,
          // ไม่คัดลอก: name, licensePlate, actualVin, actualEngineNumber, images
        };
      }
      return car;
    }));
    
    toast.success("ຄັດລອກຂໍ້ມູນສຳເລັດແລ້ວ");
  };

  // ตรวจสอบความถูกต้องของข้อมูล
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    actualCarsData.forEach((car, index) => {
      if (!car.name?.trim()) {
        newErrors[`car_${index}_name`] = "ກະລຸນາປ້ອນຊື່ລົດ";
        isValid = false;
      }
      
      if (!car.licensePlate?.trim()) {
        newErrors[`car_${index}_licensePlate`] = "ກະລຸນາປ້ອນປ້າຍທະບຽນ";
        isValid = false;
      }
      
      if (!car.actualPrice || parseFloat(car.actualPrice) <= 0) {
        newErrors[`car_${index}_actualPrice`] = "ກະລຸນາປ້ອນລາຄາຂາຍ";
        isValid = false;
      }
      
      if (!car.actualCostPrice || parseFloat(car.actualCostPrice) <= 0) {
        newErrors[`car_${index}_actualCostPrice`] = "ກະລຸນາປ້ອນລາຄາຕົ້ນທຶນ";
        isValid = false;
      }
    });

    // ตรวจสอบป้ายทะเบียนซ้ำ
    const licensePlates = actualCarsData.map(car => car.licensePlate?.trim()).filter(Boolean);
    const duplicatePlates = licensePlates.filter((plate, index) => licensePlates.indexOf(plate) !== index);
    
    if (duplicatePlates.length > 0) {
      duplicatePlates.forEach(plate => {
        actualCarsData.forEach((car, index) => {
          if (car.licensePlate?.trim() === plate) {
            newErrors[`car_${index}_licensePlate`] = "ປ້າຍທະບຽນຊ້ຳກັນ";
          }
        });
      });
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // บันทึกข้อมูล
  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("ກະລຸນາແກ້ໄຂຂໍ້ມູນທີ່ບໍ່ຖືກຕ້ອງ");
      return;
    }

    try {
      setIsSubmitting(true);

      // เตรียมข้อมูลสำหรับ API
      const inputCarPayload = {
        supplierId: inputCarData.supplierId ? parseInt(inputCarData.supplierId) : null,
        expectedDeliveryDate: inputCarData.expectedDeliveryDate || null,
        orderdById: user?.id,
        purchaseIds: inputCarData.selectedPurchases.map(p => p.id),
        products: inputCarData.receivedItems.map(item => ({
          carId: item.carId,
          quantity: item.receivedQuantity,
        })),
      };

      console.log("Creating InputCar with:", inputCarPayload);

      // สร้าง InputCar ก่อน (ใช้ API functions)
      const inputCarResult = await saveInputCar(token, inputCarPayload);
      
      // Fixed: ใช้ response structure ที่ถูกต้อง
      const inputCarId = inputCarResult.data.data?.id || inputCarResult.data.id;

      console.log("InputCar created:", inputCarResult);
      console.log("InputCar ID:", inputCarId);
      console.log("InputCar data structure:", inputCarResult.data);

      if (!inputCarId) {
        throw new Error("ບໍ່ສາມາດສ້າງລາຍການນຳເຂົ້າໄດ້ - ບໍ່ພົບ ID");
      }

      // ແຍກຂໍ້ມູນລົດຕາມ carId ເດີມ (ບໍ່ແມ່ນ itemId)
      const groupedByOriginalCarId = {};
      actualCarsData.forEach((car, index) => {
        console.log(`Processing car ${index}:`, car);
        
        const key = car.originalCarId;
        if (!groupedByOriginalCarId[key]) {
          groupedByOriginalCarId[key] = [];
        }
        groupedByOriginalCarId[key].push(car);
      });

      console.log("Grouped cars by originalCarId:", groupedByOriginalCarId);

      // ເຕຣຽມຂໍ້ມູນສຳລັບ receiveActualCars
      const receivedItems = [];
      
      // ຫາ ItemOnInputCar ທີ່ສ້າງໃໝ່ຈາກ response
      const createdItems = inputCarResult.data.data?.products || inputCarResult.data.products || [];
      console.log("Created items from InputCar:", createdItems);

      // ສຳລັບແຕ່ລະ CarId ທີ່ມີໃນ response
      createdItems.forEach(createdItem => {
        console.log("Processing created item:", createdItem);
        
        // ຫາລົດທີ່ຕົງກັນຈາກ groupedByOriginalCarId
        const carsForThisItem = groupedByOriginalCarId[createdItem.carId];
        
        if (carsForThisItem && carsForThisItem.length > 0) {
          console.log(`Found ${carsForThisItem.length} cars for carId ${createdItem.carId}`);
          
          // ກວດສອບຂໍ້ມູນທີ່ຈຳເປັນ
          const validCars = carsForThisItem.filter(car => 
            car.name?.trim() && 
            car.licensePlate?.trim() && 
            car.actualPrice && 
            car.actualCostPrice
          );

          if (validCars.length === 0) {
            console.warn(`No valid cars found for carId ${createdItem.carId}`);
            return;
          }

          receivedItems.push({
            itemId: createdItem.id, // ໃຊ້ ID ຂອງ ItemOnInputCar ທີ່ສ້າງໃໝ່
            receivedQuantity: validCars.length,
            actualCars: validCars.map(car => ({
              name: car.name.trim(),
              licensePlate: car.licensePlate.trim(),
              actualPrice: parseFloat(car.actualPrice),
              actualCostPrice: parseFloat(car.actualCostPrice),
              actualYear: car.actualYear ? parseInt(car.actualYear) : null,
              actualVin: car.actualVin?.trim() || null,
              actualEngineNumber: car.actualEngineNumber?.trim() || null,
              actualDescription: car.actualDescription?.trim() || null,
              brandAndModelsId: car.brandAndModelsId ? parseInt(car.brandAndModelsId) : null,
              colorCarId: car.colorCarId ? parseInt(car.colorCarId) : null,
              typeId: car.typeId ? parseInt(car.typeId) : null,
              brandCarsId: car.brandCarsId ? parseInt(car.brandCarsId) : null,
              actualColorName: car.actualColorName || null,
              actualBrandModel: car.actualBrandModel || null,
              actualTypeName: car.actualTypeName || null,
              images: car.images || [],
              imaged: car.imaged || [],
            })),
            notes: `ລາຍການນຳເຂົ້າ ${validCars.length} ຄັນ`,
          });
        } else {
          console.warn(`No cars found for carId ${createdItem.carId}`);
        }
      });

      console.log("Final receivedItems:", receivedItems);

      // ກວດສອບວ່າມີຂໍ້ມູນສົ່ງຫຼືບໍ່
      if (receivedItems.length === 0) {
        throw new Error("ບໍ່ມີຂໍ້ມູນລົດທີ່ຖືກຕ້ອງສຳລັບການບັນທຶກ");
      }

      // ກວດສອບຂໍ້ມູນກ່ອນສົ່ງ
      const isValidReceiveData = receivedItems.every(item => 
        item.itemId && 
        item.receivedQuantity > 0 && 
        item.actualCars && 
        item.actualCars.length > 0 &&
        item.actualCars.every(car => 
          car.name && 
          car.licensePlate && 
          car.actualPrice > 0 && 
          car.actualCostPrice > 0
        )
      );

      if (!isValidReceiveData) {
        throw new Error("ຂໍ້ມູນລົດບໍ່ຄົບຖ້ວນຫຼືບໍ່ຖືກຕ້ອງ");
      }

      console.log("Receiving actual cars with inputCarId:", inputCarId);
      console.log("Sending payload:", JSON.stringify({ receivedItems }, null, 2));

      // บันทึกรถจริง (ใช้ API functions)
      const receiveResult = await receiveActualCars(token, inputCarId, { receivedItems });
      console.log("Actual cars received:", receiveResult);

      // ลบข้อมูลชั่วคราวใน localStorage
      localStorage.removeItem("inputCarData");

      toast.success(`ບັນທຶກລາຍການນຳເຂົ້າສຳເລັດແລ້ວ (${actualCarsData.length} ຄັນ)`);
      navigate("/admin/input-cars");

    } catch (error) {
      console.error("Error submitting:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      const errorMessage = error.response?.data?.message || error.message || "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (confirm("ທ່ານຕ້ອງການຍົກເລີກການສ້າງລາຍການນຳເຂົ້າບໍ? ຂໍ້ມູນທີ່ປ້ອນຈະຫາຍໄປ")) {
      localStorage.removeItem("inputCarData");
      navigate("/admin/input-cars");
    }
  };

  const handleBack = () => {
    navigate("/admin/input-cars/create");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-notosanslao">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
        </div>
      </div>
    );
  }

  if (!inputCarData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2 font-notosanslao">
            ບໍ່ພົບຂໍ້ມູນ
          </h3>
          <p className="text-gray-600 font-notosanslao mb-4">
            ກະລຸນາເລີ່ມຕົ້ນຈາກຂັ້ນຕອນທີ 1
          </p>
          <button
            onClick={() => navigate("/admin/input-cars/create")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-notosanslao"
          >
            ກັບໄປຂັ້ນຕອນທີ 1
          </button>
        </div>
      </div>
    );
  }

  // จัดกลุ่มรถตาม originalCarName
  const groupedActualCars = actualCarsData.reduce((acc, car, index) => {
    const key = car.originalCarName;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push({ ...car, index });
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="font-notosanslao">
              <h1 className="text-2xl font-bold text-gray-900">
                ສ້າງລາຍການນຳເຂົ້າລົດ - ຂັ້ນຕອນທີ 2
              </h1>
              <p className="text-gray-600 mt-1">
                ປ້ອນຂໍ້ມູນລົດຈິງທີ່ໄດ້ຮັບ ({actualCarsData.length} ຄັນ)
              </p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 font-notosanslao">
            ສະຫຼຸບຂໍ້ມູນ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Package className="text-blue-600" size={20} />
                <div>
                  <p className="text-sm text-blue-600 font-notosanslao">
                    ໃບສັ່ງຊື້ທີ່ເລືອກ
                  </p>
                  <p className="text-xl font-semibold font-notosanslao text-blue-900">
                    {inputCarData.selectedPurchases.length} ໃບ
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Car className="text-green-600" size={20} />
                <div>
                  <p className="text-sm text-green-600 font-notosanslao">
                    ລາຍການສິນຄ້າ
                  </p>
                  <p className="text-xl font-semibold font-notosanslao text-green-900">
                    {inputCarData.receivedItems.length} ລາຍການ
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="text-purple-600" size={20} />
                <div>
                  <p className="text-sm text-purple-600 font-notosanslao">
                    ລົດທີ່ຈະໄດ້ຮັບ
                  </p>
                  <p className="text-xl font-semibold font-notosanslao text-purple-900">
                    {actualCarsData.length} ຄັນ
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Car Forms */}
        <div className="space-y-6">
          {Object.entries(groupedActualCars).map(([carName, cars]) => (
            <div key={carName} className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 font-notosanslao">
                  {carName} ({cars.length} ຄັນ)
                </h3>
                <p className="text-sm text-gray-600 font-notosanslao">
                  ປ້ອນຂໍ້ມູນລົດຈິງທີ່ໄດ້ຮັບ
                </p>
              </div>

              <div className="p-6 space-y-6">
                {cars.map((car, carIndex) => (
                  <div key={car.index} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-medium text-gray-900 font-notosanslao">
                        ລົດຄັນທີ່ {carIndex + 1}
                      </h4>
                      {carIndex > 0 && (
                        <button
                          onClick={() => copyFromFirstCar(car.index)}
                          className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 font-notosanslao"
                        >
                          <Copy size={16} />
                          ຄັດລອກຈາກຄັນທີ 1
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* ຊື່ລົດ */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 font-notosanslao">
                          ຊື່ລົດ <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={car.name}
                          onChange={(e) => updateCarData(car.index, "name", e.target.value)}
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-notosanslao ${
                            errors[`car_${car.index}_name`] ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="ປ້ອນຊື່ລົດ"
                        />
                        {errors[`car_${car.index}_name`] && (
                          <p className="text-red-500 text-sm mt-1 font-notosanslao">
                            {errors[`car_${car.index}_name`]}
                          </p>
                        )}
                      </div>

                      {/* ປ້າຍທະບຽນ */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 font-notosanslao">
                          ປ້າຍທະບຽນ <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={car.licensePlate}
                          onChange={(e) => updateCarData(car.index, "licensePlate", e.target.value)}
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-notosanslao ${
                            errors[`car_${car.index}_licensePlate`] ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="ປ້ອນປ້າຍທະບຽນ"
                        />
                        {errors[`car_${car.index}_licensePlate`] && (
                          <p className="text-red-500 text-sm mt-1 font-notosanslao">
                            {errors[`car_${car.index}_licensePlate`]}
                          </p>
                        )}
                      </div>

                      {/* ລາຄາຂາຍ */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 font-notosanslao">
                          ລາຄາຂາຍ (ກີບ) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={car.actualPrice}
                          onChange={(e) => updateCarData(car.index, "actualPrice", e.target.value)}
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-notosanslao ${
                            errors[`car_${car.index}_actualPrice`] ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="ປ້ອນລາຄາຂາຍ"
                          min="0"
                          step="1000"
                        />
                        {errors[`car_${car.index}_actualPrice`] && (
                          <p className="text-red-500 text-sm mt-1 font-notosanslao">
                            {errors[`car_${car.index}_actualPrice`]}
                          </p>
                        )}
                      </div>

                      {/* ລາຄາຕົ້ນທຶນ */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 font-notosanslao">
                          ລາຄາຕົ້ນທຶນ (ກີບ) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={car.actualCostPrice}
                          onChange={(e) => updateCarData(car.index, "actualCostPrice", e.target.value)}
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-notosanslao ${
                            errors[`car_${car.index}_actualCostPrice`] ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="ປ້ອນລາຄາຕົ້ນທຶນ"
                          min="0"
                          step="1000"
                        />
                        {errors[`car_${car.index}_actualCostPrice`] && (
                          <p className="text-red-500 text-sm mt-1 font-notosanslao">
                            {errors[`car_${car.index}_actualCostPrice`]}
                          </p>
                        )}
                      </div>

                      {/* ປີ */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 font-notosanslao">
                          ປີ
                        </label>
                        <input
                          type="number"
                          value={car.actualYear}
                          onChange={(e) => updateCarData(car.index, "actualYear", e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-notosanslao"
                          placeholder="ປີຜະລິດ"
                          min="1900"
                          max={new Date().getFullYear() + 1}
                        />
                      </div>

                      {/* ຍີ່ຫໍ້ແລະຮຸ່ນ */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 font-notosanslao">
                          ຍີ່ຫໍ້ແລະຮຸ່ນ
                        </label>
                        <select
                          value={car.brandAndModelsId}
                          onChange={(e) => updateCarData(car.index, "brandAndModelsId", e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-notosanslao"
                        >
                          <option value="">ເລືອກຍີ່ຫໍ້ແລະຮຸ່ນ</option>
                          {safeBrandAndModels.map((bm) => (
                            <option key={bm.id} value={bm.id}>
                              {bm.BrandCars?.name} {bm.modelCar}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* ສີ */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 font-notosanslao">
                          ສີ
                        </label>
                        <select
                          value={car.colorCarId}
                          onChange={(e) => updateCarData(car.index, "colorCarId", e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-notosanslao"
                        >
                          <option value="">ເລືອກສີ</option>
                          {safeColors.map((color) => (
                            <option key={color.id} value={color.id}>
                              {color.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* ປະເພດ */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 font-notosanslao">
                          ປະເພດລົດ
                        </label>
                        <select
                          value={car.typeId}
                          onChange={(e) => updateCarData(car.index, "typeId", e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-notosanslao"
                        >
                          <option value="">ເລືອກປະເພດລົດ</option>
                          {safeTypes.map((type) => (
                            <option key={type.id} value={type.id}>
                              {type.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* VIN */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 font-notosanslao">
                          VIN
                        </label>
                        <input
                          type="text"
                          value={car.actualVin}
                          onChange={(e) => updateCarData(car.index, "actualVin", e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-notosanslao"
                          placeholder="ເລກ VIN"
                        />
                      </div>

                      {/* ເລກເຄື່ອງຍົນ */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 font-notosanslao">
                          ເລກເຄື່ອງຍົນ
                        </label>
                        <input
                          type="text"
                          value={car.actualEngineNumber}
                          onChange={(e) => updateCarData(car.index, "actualEngineNumber", e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-notosanslao"
                          placeholder="ເລກເຄື່ອງຍົນ"
                        />
                      </div>

                      {/* ລາຍລະອຽດ */}
                      <div className="md:col-span-2 lg:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2 font-notosanslao">
                          ລາຍລະອຽດເພີ່ມເຕີມ
                        </label>
                        <textarea
                          value={car.actualDescription}
                          onChange={(e) => updateCarData(car.index, "actualDescription", e.target.value)}
                          rows={3}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-notosanslao"
                          placeholder="ລາຍລະອຽດເພີ່ມເຕີມ..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <div className="flex justify-end gap-4">
            <button
              onClick={handleCancel}
              className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-notosanslao"
              disabled={isSubmitting}
            >
              ຍົກເລີກ
            </button>
            <button
              onClick={handleBack}
              className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-notosanslao"
              disabled={isSubmitting}
            >
              ກັບໄປ
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || actualCarsData.length === 0}
              className={`px-6 py-3 text-white rounded-lg flex items-center gap-2 transition-colors font-notosanslao ${
                isSubmitting || actualCarsData.length === 0
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              <Save size={20} />
              {isSubmitting ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກລາຍການນຳເຂົ້າ"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateActualCars;