// src/page/admin/Management/BrandAndModel.jsx
import React, { useState, useEffect } from "react";
import useCarStore from "../../../Store/car-store";
import { saveBrandAndModel, deleteBrandAndModel } from "../../../api/BrandAndModel";
import { toast } from "react-toastify";
import { Trash, Edit, Search, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

const FormSupplierProduct = () => {
  const token = useCarStore((state) => state.token);
  const brands = useCarStore((state) => state.brands);
  const brandAndModels = useCarStore((state) => state.brandAndModels);
  const getBrand = useCarStore((state) => state.getBrand);
  const getBrandAndModel = useCarStore((state) => state.getBrandAndModel);

  const [form, setForm] = useState({
    modelCar: "",
    brandCarsId: "",
  });

  const [brandSearch, setBrandSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getBrand();
    getBrandAndModel();
  }, []);

  // Filter brands based on search
  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(brandSearch.toLowerCase())
  ).slice(0, 5); // แสดงแค่ 5 รายการ

  // Filter brand and models based on search
  const filteredBrandAndModels = brandAndModels.filter(item =>
    item.modelCar.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.BrandCars.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      const res = await saveBrandAndModel(token, form);
      toast.success(res.data.message);
      setForm({ modelCar: "", brandCarsId: "" });
      setBrandSearch("");
      setSelectedBrand(null);
      getBrandAndModel();
    } catch (err) {
      console.log(err);
      const errorMsg = err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດ";
      toast.error(errorMsg);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("ທ່ານແນ່ໃຈບໍ່ທີ່ຈະລົບ?")) {
      try {
        const res = await deleteBrandAndModel(token, id);
        toast.success(res.data.message);
        getBrandAndModel();
      } catch (err) {
        console.log(err);
        const errorMsg = err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດ";
        toast.error(errorMsg);
      }
    }
  };

  return (
    <div className="container mx-auto p-4 font-notosanslao">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-800">ຈັດການລຸ້ນລົດ</h1>
        </div>

        <div className="p-6">
          {/* Form Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">ເພີ່ມລຸ້ນລົດໃໝ່</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
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
                  <label className="block text-sm font-medium font-notosanslao text-gray-700 mb-2">
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
                  <div className="text-xs font-notosanslao text-gray-500 text-right mt-1">
                  {form.modelCar?.length || 0}/191 ຕົວອັກສອນ
                </div>
                </div>
              </div>

              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 font-notosanslao text-white px-6 py-2 rounded-md transition-colors"
              >
                ບັນທຶກ
              </button>
            </form>
          </div>

          {/* Search Section */}
          <div className="mb-6 font-notosanslao">
            <div className="relative max-w-md font-notosanslao">
              <Search className="absolute font-notosanslao left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ຄົ້ນຫາລຸ້ນຫຼືແບຣນ..."
                className="pl-10 pr-4 py-2 border font-notosanslao border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Table Section */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ລຳດັບ
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ແບຣນ
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ລຸ້ນ
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ວັນທີ່ສ້າງ
                  </th>
                  <th className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ຈັດການ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBrandAndModels.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6 text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900">
                      {item.BrandCars.name}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900">
                      {item.modelCar}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString('lo-LA')}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex justify-center space-x-2">
                        <Link
                          to={`/admin/edit-brandmodel/${item.id}`}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredBrandAndModels.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                ບໍ່ມີຂໍ້ມູນ
              </div>
            )}
          </div>
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

export default FormSupplierProduct;