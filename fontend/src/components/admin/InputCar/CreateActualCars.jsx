import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Save,
  Copy,
  Car,
  Package,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import useCarStore from "../../../Store/car-store";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const CreateActualCars = () => {
  const { 
    user, 
    colors, 
    types, 
    brandAndModels,
    getColor,
    getType,
    getBrandAndModel,
    createInputCar,
    receiveActualCars,
  } = useCarStore();
  
  const navigate = useNavigate();

  const [inputCarData, setInputCarData] = useState(null);
  const [actualCarsData, setActualCarsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Safe arrays
  const safeColors = React.useMemo(() => {
    if (Array.isArray(colors?.data)) return colors.data;
    if (Array.isArray(colors)) return colors;
    return [];
  }, [colors]);

  const safeTypes = React.useMemo(() => {
    if (Array.isArray(types?.data)) return types.data;
    if (Array.isArray(types)) return types;
    return [];
  }, [types]);

  const safeBrandAndModels = React.useMemo(() => {
    if (Array.isArray(brandAndModels?.data)) return brandAndModels.data;
    if (Array.isArray(brandAndModels)) return brandAndModels;
    return [];
  }, [brandAndModels]);

  useEffect(() => {
    loadDataAndInitialize();
  }, []);

  const loadDataAndInitialize = async () => {
    try {
      setLoading(true);
      
      // โหลดข้อมูลจาก localStorage
      const savedData = localStorage.getItem("inputCarData");
      if (!savedData) {
        toast.error("ບໍ່ພົບຂໍ້ມູນຈາກຂັ້ນຕອນກ່ອນໜ້າ");
        navigate("/admin/input-cars/create");
        return;
      }

      const data = JSON.parse(savedData);
      setInputCarData(data);

      // ตรวจสอบข้อมูลที่จำเป็น
      if (!data.receivedItems || !Array.isArray(data.receivedItems) || data.receivedItems.length === 0) {
        toast.error("ບໍ່ພົບຂໍ້ມູນລາຍການສິນຄ້າທີ່ໄດ້ຮັບ");
        navigate("/admin/input-cars/create");
        return;
      }

      // โหลด master data
      const promises = [];
      if (safeColors.length === 0) promises.push(getColor());
      if (safeTypes.length === 0) promises.push(getType());
      if (safeBrandAndModels.length === 0) promises.push(getBrandAndModel());

      if (promises.length > 0) {
        await Promise.allSettled(promises);
      }

      // สร้างข้อมูลรถจริง
      const carsData = [];
      let globalIndex = 0;

      data.receivedItems.forEach((item) => {
        for (let i = 0; i < item.receivedQuantity; i++) {
          carsData.push({
            // IDs สำหรับ mapping
            globalIndex: globalIndex++,
            originalCarId: item.carId,
            originalCarName: item.carName || "",
            
            // ข้อมูลรถจริงที่จำเป็นตาม schema
            name: item.carName || "",
            licensePlate: "",
            actualPrice: "",
            actualCostPrice: "",
            actualYear: "",
            actualVin: "",
            actualEngineNumber: "",
            actualDescription: "",
            
            // Foreign keys ตาม schema
            brandAndModelsId: "",
            colorCarId: "",
            typeId: "",
            
            // ข้อมูลเพิ่มเติมสำหรับ display
            actualColorName: "",
            actualBrandModel: "",
            actualTypeName: "",
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
  const updateCarData = (globalIndex, field, value) => {
    setActualCarsData(prev => prev.map((car) => {
      if (car.globalIndex === globalIndex) {
        const updatedCar = { ...car, [field]: value };
        
        // อัปเดตข้อมูลที่เกี่ยวข้องเมื่อเปลี่ยน dropdown
        if (field === "brandAndModelsId" && value) {
          const selected = safeBrandAndModels.find(bm => bm.id === parseInt(value));
          if (selected) {
            updatedCar.actualBrandModel = `${selected.BrandCars?.name || ""} ${selected.modelCar || ""}`.trim();
          }
        }
        
        if (field === "colorCarId" && value) {
          const selected = safeColors.find(c => c.id === parseInt(value));
          if (selected) {
            updatedCar.actualColorName = selected.name;
          }
        }
        
        if (field === "typeId" && value) {
          const selected = safeTypes.find(t => t.id === parseInt(value));
          if (selected) {
            updatedCar.actualTypeName = selected.name;
          }
        }
        
        return updatedCar;
      }
      return car;
    }));

    // ล้าง error
    const errorKey = `car_${globalIndex}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  // คัดลอกข้อมูลจากรถคันแรก
  const copyFromFirstCar = (targetIndex) => {
    if (actualCarsData.length === 0) return;
    
    const firstCar = actualCarsData[0];
    
    setActualCarsData(prev => prev.map((car) => {
      if (car.globalIndex === targetIndex) {
        return {
          ...car,
          actualPrice: firstCar.actualPrice,
          actualCostPrice: firstCar.actualCostPrice,
          actualYear: firstCar.actualYear,
          actualDescription: firstCar.actualDescription,
          brandAndModelsId: firstCar.brandAndModelsId,
          colorCarId: firstCar.colorCarId,
          typeId: firstCar.typeId,
          actualColorName: firstCar.actualColorName,
          actualBrandModel: firstCar.actualBrandModel,
          actualTypeName: firstCar.actualTypeName,
        };
      }
      return car;
    }));
    
    toast.success("ຄັດລອກຂໍ້ມູນສຳເລັດແລ້ວ");
  };

  // ตรวจสอบความถูกต้อง
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (actualCarsData.length === 0) {
      toast.error("ບໍ່ມີຂໍ້ມູນລົດທີ່ຈະບັນທຶກ");
      return false;
    }

    actualCarsData.forEach((car) => {
      const prefix = `car_${car.globalIndex}`;
      
      if (!car.name?.trim()) {
        newErrors[`${prefix}_name`] = "ກະລຸນາປ້ອນຊື່ລົດ";
        isValid = false;
      }
      
      if (!car.licensePlate?.trim()) {
        newErrors[`${prefix}_licensePlate`] = "ກະລຸນາປ້ອນປ້າຍທະບຽນ";
        isValid = false;
      }
      
      if (!car.actualPrice || parseFloat(car.actualPrice) <= 0) {
        newErrors[`${prefix}_actualPrice`] = "ກະລຸນາປ້ອນລາຄາຂາຍ";
        isValid = false;
      }
      
      if (!car.actualCostPrice || parseFloat(car.actualCostPrice) <= 0) {
        newErrors[`${prefix}_actualCostPrice`] = "ກະລຸນາປ້ອນລາຄາຕົ້ນທຶນ";
        isValid = false;
      }

      // ตรวจสอบราคา
      if (car.actualPrice && car.actualCostPrice && 
          parseFloat(car.actualCostPrice) > parseFloat(car.actualPrice)) {
        newErrors[`${prefix}_actualCostPrice`] = "ລາຄາຕົ້ນທຶນບໍ່ຄວນເກີນລາຄາຂາຍ";
        isValid = false;
      }
    });

    // ตรวจสอบป้ายทะเบียนซ้ำ
    const licensePlates = actualCarsData
      .map(car => car.licensePlate?.trim())
      .filter(Boolean);
    
    const duplicates = licensePlates.filter((plate, index) => 
      licensePlates.indexOf(plate) !== index
    );
    
    if (duplicates.length > 0) {
      [...new Set(duplicates)].forEach(plate => {
        actualCarsData.forEach((car) => {
          if (car.licensePlate?.trim() === plate) {
            newErrors[`car_${car.globalIndex}_licensePlate`] = "ປ້າຍທະບຽນຊ້ຳ";
          }
        });
      });
      isValid = false;
    }

    // ตรวจสอบ VIN ซ้ำ
    const vins = actualCarsData
      .map(car => car.actualVin?.trim())
      .filter(Boolean);
    
    const duplicateVins = vins.filter((vin, index) => 
      vins.indexOf(vin) !== index
    );
    
    if (duplicateVins.length > 0) {
      [...new Set(duplicateVins)].forEach(vin => {
        actualCarsData.forEach((car) => {
          if (car.actualVin?.trim() === vin) {
            newErrors[`car_${car.globalIndex}_actualVin`] = "VIN ຊ້ຳ";
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

    if (!inputCarData || !user?.id) {
      toast.error("ຂໍ້ມູນບໍ່ຄົບຖ້ວນ");
      return;
    }

    try {
      setIsSubmitting(true);

      // Step 1: สร้าง InputCar
      const inputCarPayload = {
        supplierId: inputCarData.supplierId ? parseInt(inputCarData.supplierId) : null,
        expectedDeliveryDate: inputCarData.expectedDeliveryDate || null,
        orderdById: user.id,
        purchaseIds: (inputCarData.selectedPurchases || []).map(p => p.id),
        products: (inputCarData.receivedItems || []).map(item => ({
          carId: item.carId,
          quantity: item.receivedQuantity,
        })),
      };

      const inputCarResult = await createInputCar(inputCarPayload);
      
      // ดึง ID และ products ที่สร้าง
      let inputCarId, createdItems = [];
      
      if (inputCarResult?.data?.data) {
        inputCarId = inputCarResult.data.data.id;
        createdItems = inputCarResult.data.data.products || [];
      } else if (inputCarResult?.data) {
        inputCarId = inputCarResult.data.id;
        createdItems = inputCarResult.data.products || [];
      }

      if (!inputCarId || !createdItems.length) {
        throw new Error("ບໍ່ສາມາດສ້າງລາຍການນຳເຂົ້າໄດ້");
      }

      // Step 2: จัดกลุ่มรถตาม originalCarId
      const groupedCars = {};
      actualCarsData.forEach((car) => {
        const key = car.originalCarId;
        if (!groupedCars[key]) {
          groupedCars[key] = [];
        }
        groupedCars[key].push(car);
      });

      // Step 3: เตรียมข้อมูลสำหรับ receiveActualCars
      const receivedItems = [];
      
      createdItems.forEach(createdItem => {
        const carsForThisItem = groupedCars[createdItem.carId];
        
        if (carsForThisItem && carsForThisItem.length > 0) {
          // กรองรถที่มีข้อมูลครบ
          const validCars = carsForThisItem.filter(car => 
            car.name?.trim() && 
            car.licensePlate?.trim() && 
            car.actualPrice && 
            car.actualCostPrice &&
            parseFloat(car.actualPrice) > 0 &&
            parseFloat(car.actualCostPrice) > 0
          );

          if (validCars.length > 0) {
            receivedItems.push({
              itemId: createdItem.id,
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
                actualColorName: car.actualColorName || null,
                actualBrandModel: car.actualBrandModel || null,
                actualTypeName: car.actualTypeName || null,
              })),
              notes: `ລາຍການນຳເຂົ້າ ${validCars.length} ຄັນ`,
            });
          }
        }
      });

      if (receivedItems.length === 0) {
        throw new Error("ບໍ່ມີຂໍ້ມູນລົດທີ່ຖືກຕ້ອງ");
      }

      // Step 4: บันทึกรถจริง
      await receiveActualCars(inputCarId, { receivedItems });

      // ลบข้อมูลชั่วคราว
      localStorage.removeItem("inputCarData");

      toast.success(`ບັນທຶກລາຍການນຳເຂົ້າສຳເລັດແລ້ວ (${actualCarsData.length} ຄັນ)`);
      navigate("/admin/input-cars");

    } catch (error) {
      console.error("Error submitting:", error);
      const errorMessage = error.response?.data?.message || error.message || "ເກີດຂໍ້ຜິດພາດ";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (confirm("ທ່ານຕ້ອງການຍົກເລີກບໍ? ຂໍ້ມູນຈະຫາຍໄປ")) {
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

  // จัดกลุ่มรถตามชื่อ
  const groupedCars = actualCarsData.reduce((acc, car) => {
    const key = car.originalCarName || `ລົດ ID: ${car.originalCarId}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(car);
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
              disabled={isSubmitting}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
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
                  <p className="text-sm text-blue-600 font-notosanslao">ໃບສັ່ງຊື້</p>
                  <p className="text-xl font-semibold font-notosanslao text-blue-900">
                    {(inputCarData.selectedPurchases || []).length} ໃບ
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Car className="text-green-600" size={20} />
                <div>
                  <p className="text-sm text-green-600 font-notosanslao">ລາຍການສິນຄ້າ</p>
                  <p className="text-xl font-semibold font-notosanslao text-green-900">
                    {(inputCarData.receivedItems || []).length} ລາຍການ
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="text-purple-600" size={20} />
                <div>
                  <p className="text-sm text-purple-600 font-notosanslao">ລົດທີ່ຈະບັນທຶກ</p>
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
          {Object.entries(groupedCars).map(([carName, cars]) => (
            <div key={carName} className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 font-notosanslao">
                  {carName} ({cars.length} ຄັນ)
                </h3>
              </div>

              <div className="p-6 space-y-6">
                {cars.map((car, index) => (
                  <div key={car.globalIndex} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-medium text-gray-900 font-notosanslao">
                        ລົດຄັນທີ່ {index + 1}
                      </h4>
                      {index > 0 && (
                        <button
                          onClick={() => copyFromFirstCar(car.globalIndex)}
                          disabled={isSubmitting}
                          className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 font-notosanslao disabled:opacity-50"
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
                          onChange={(e) => updateCarData(car.globalIndex, "name", e.target.value)}
                          disabled={isSubmitting}
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-notosanslao disabled:bg-gray-100 ${
                            errors[`car_${car.globalIndex}_name`] ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="ປ້ອນຊື່ລົດ"
                        />
                        {errors[`car_${car.globalIndex}_name`] && (
                          <p className="text-red-500 text-sm mt-1 font-notosanslao">
                            {errors[`car_${car.globalIndex}_name`]}
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
                          onChange={(e) => updateCarData(car.globalIndex, "licensePlate", e.target.value)}
                          disabled={isSubmitting}
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-notosanslao disabled:bg-gray-100 ${
                            errors[`car_${car.globalIndex}_licensePlate`] ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="ປ້ອນປ້າຍທະບຽນ"
                        />
                        {errors[`car_${car.globalIndex}_licensePlate`] && (
                          <p className="text-red-500 text-sm mt-1 font-notosanslao">
                            {errors[`car_${car.globalIndex}_licensePlate`]}
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
                          onChange={(e) => updateCarData(car.globalIndex, "actualPrice", e.target.value)}
                          disabled={isSubmitting}
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-notosanslao disabled:bg-gray-100 ${
                            errors[`car_${car.globalIndex}_actualPrice`] ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="ປ້ອນລາຄາຂາຍ"
                          min="0"
                          step="1000"
                        />
                        {errors[`car_${car.globalIndex}_actualPrice`] && (
                          <p className="text-red-500 text-sm mt-1 font-notosanslao">
                            {errors[`car_${car.globalIndex}_actualPrice`]}
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
                          onChange={(e) => updateCarData(car.globalIndex, "actualCostPrice", e.target.value)}
                          disabled={isSubmitting}
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-notosanslao disabled:bg-gray-100 ${
                            errors[`car_${car.globalIndex}_actualCostPrice`] ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="ປ້ອນລາຄາຕົ້ນທຶນ"
                          min="0"
                          step="1000"
                        />
                        {errors[`car_${car.globalIndex}_actualCostPrice`] && (
                          <p className="text-red-500 text-sm mt-1 font-notosanslao">
                            {errors[`car_${car.globalIndex}_actualCostPrice`]}
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
                          onChange={(e) => updateCarData(car.globalIndex, "actualYear", e.target.value)}
                          disabled={isSubmitting}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-notosanslao disabled:bg-gray-100"
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
                          onChange={(e) => updateCarData(car.globalIndex, "brandAndModelsId", e.target.value)}
                          disabled={isSubmitting}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-notosanslao disabled:bg-gray-100"
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
                          onChange={(e) => updateCarData(car.globalIndex, "colorCarId", e.target.value)}
                          disabled={isSubmitting}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-notosanslao disabled:bg-gray-100"
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
                          onChange={(e) => updateCarData(car.globalIndex, "typeId", e.target.value)}
                          disabled={isSubmitting}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-notosanslao disabled:bg-gray-100"
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
                          onChange={(e) => updateCarData(car.globalIndex, "actualVin", e.target.value)}
                          disabled={isSubmitting}
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-notosanslao disabled:bg-gray-100 ${
                            errors[`car_${car.globalIndex}_actualVin`] ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="ເລກ VIN"
                        />
                        {errors[`car_${car.globalIndex}_actualVin`] && (
                          <p className="text-red-500 text-sm mt-1 font-notosanslao">
                            {errors[`car_${car.globalIndex}_actualVin`]}
                          </p>
                        )}
                      </div>

                      {/* ເລກເຄື່ອງຍົນ */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 font-notosanslao">
                          ເລກເຄື່ອງຍົນ
                        </label>
                        <input
                          type="text"
                          value={car.actualEngineNumber}
                          onChange={(e) => updateCarData(car.globalIndex, "actualEngineNumber", e.target.value)}
                          disabled={isSubmitting}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-notosanslao disabled:bg-gray-100"
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
                          onChange={(e) => updateCarData(car.globalIndex, "actualDescription", e.target.value)}
                          disabled={isSubmitting}
                          rows={3}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-notosanslao disabled:bg-gray-100"
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
              disabled={isSubmitting}
              className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-notosanslao disabled:opacity-50"
            >
              ຍົກເລີກ
            </button>
            <button
              onClick={handleBack}
              disabled={isSubmitting}
              className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-notosanslao disabled:opacity-50"
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

        {/* Loading Overlay */}
        {isSubmitting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-medium text-gray-900 mb-2 font-notosanslao">
                  ກຳລັງບັນທຶກ...
                </h3>
                <p className="text-gray-600 font-notosanslao">
                  ກະລຸນາລໍຖ້າ ກຳລັງສ້າງລາຍການນຳເຂົ້າແລະບັນທຶກຂໍ້ມູນລົດ
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateActualCars;