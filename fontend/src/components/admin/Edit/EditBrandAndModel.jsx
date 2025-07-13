// src/components/admin/Edit/EditBrandAndModel.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useCarStore from "../../../Store/car-store";
import { readBrandAndModel, updateBrandAndModel } from "../../../api/BrandAndModel";
import { toast } from "react-toastify";
import { ArrowLeft, ChevronDown } from "lucide-react";

const EditBrandAndModel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useCarStore((state) => state.token);
  const brands = useCarStore((state) => state.brands);
  const getBrand = useCarStore((state) => state.getBrand);

  const [form, setForm] = useState({
    modelCar: "",
    brandCarsId: "",
  });

  const [brandSearch, setBrandSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBrand();
    hdlGetBrandAndModel();
  }, []);

  // Filter brands based on search
  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(brandSearch.toLowerCase())
  ).slice(0, 5);

  const hdlGetBrandAndModel = async () => {
    try {
      const res = await readBrandAndModel(token, id);
      const data = res.data;
      setForm({
        modelCar: data.modelCar,
        brandCarsId: data.brandCarsId,
      });
      setBrandSearch(data.BrandCars.name);
      setSelectedBrand(data.BrandCars);
      setLoading(false);
    } catch (err) {
      console.log(err);
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleBrandSearch = (e) => {
    setBrandSearch(e.target.value);
    setShowBrandDropdown(true);
    setSelectedBrand(null);
    setForm({ ...form, brandCarsId: "" });
  };

  const handleBrandSelect = (brand) => {
    setSelectedBrand(brand);
    setBrandSearch(brand.name);
    setForm({ ...form, brandCarsId: brand.id });
    setShowBrandDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.modelCar.trim()) {
      return toast.error("ກາລຸນາປ້ອນຊື່ລຸ້ນ");
    }
    if (!form.brandCarsId) {
      return toast.error("ກາລຸນາເລືອກແບຣນ");
    }

    try {
      const res = await updateBrandAndModel(token, id, form);
      toast.success(res.data.message);
      navigate("/admin/brandmodels");
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
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/admin/brandmodels")}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">ແກ້ໄຂລຸ້ນລົດ</h1>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Brand Selection with Search */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ເລືອກແບຣນ *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={brandSearch}
                    onChange={handleBrandSearch}
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

              {/* Model Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ຊື່ລຸ້ນ *
                </label>
                <input
                  type="text"
                  name="modelCar"
                  value={form.modelCar}
                  onChange={handleChange}
                  placeholder="ປ້ອນຊື່ລຸ້ນ"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition-colors"
              >
                ບັນທຶກການປ່ຽນແປງ
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/brandmodels")}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md transition-colors"
              >
                ຍົກເລີກ
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showBrandDropdown && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowBrandDropdown(false)}
        />
      )}
    </div>
  );
};

export default EditBrandAndModel;