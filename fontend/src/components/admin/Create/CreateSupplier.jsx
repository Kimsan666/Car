import React, { useState, useEffect } from "react";
import { saveBrand } from "../../../api/Brand";
import useCarStore from "../../../Store/car-store";
import { toast } from "react-toastify";
import TableBrand from "../Table/TableBrand";
import { Plus, Car, ArrowLeft } from "lucide-react";
import { saveSupplier } from "../../../api/Supplier";
import { useNavigate } from "react-router-dom";
const inirialState = {
  companyName: "",
  contactName: "",
  email: "",
  phone: "",
  address: "",
};
const CreateSupplier = () => {
  const navigate = useNavigate();
  const token = useCarStore((state) => state.token);
  const [form, setForm] = useState(inirialState);
  const [isLoading, setIsLoading] = useState(false);
  const getSupplier = useCarStore((state) => state.getSupplier);
  useEffect(() => {
    getSupplier();
  }, []);
  const handleOnChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    try {
      const res = await saveSupplier(token, form);
      console.log(res.data.name);
      toast.success(
        <span className="font-phetsarath">ບັນທຶກ {res.data.name} ສຳເລັດ</span>
      );
      getSupplier();
      setForm("");
    } catch (err) {
      const errMessage = err.response?.data?.message;
      toast.error(<span className="font-phetsarath">{errMessage}</span>);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="flex font-notosanslao gap-4 items-center">
              <button
                onClick={() => navigate("/admin/suppliers")}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="w-10 h-10 bg-blue-500  rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 font-Sanslem">
                ຈັດການແບນລົດ
              </h1>
            </div>
          </div>
          <p className="text-gray-600 font-notosanslao">
            ເພີ່ມແລະຈັດການແບນລົດໃນລະບົບ
          </p>
        </div>

        {/* Add Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Plus className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-800 font-notosanslao">
                ເພີ່ມແບນລົດໃໝ່
              </h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-notosanslao">
                  ຊື່ບໍລິສັດ <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full border border-gray-300 p-2 rounded-md font-notosanslao focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ຊື່ບໍລິສັດ"
                  type="text"
                  name="companyName"
                  value={form.companyName || ""}
                  onChange={handleOnChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-notosanslao">
                  ຊື່ຜູ້ຕິດຕໍ່
                </label>
                <input
                  className="w-full border border-gray-300 p-2 rounded-md font-notosanslao focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ຊື່ຜູ້ຕິດຕໍ່"
                  type="text"
                  name="contactName"
                  value={form.contactName || ""}
                  onChange={handleOnChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-notosanslao">
                  ອີເມວ <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full border border-gray-300 p-2 font-notosanslao rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="example@email.com"
                  type="email"
                  name="email"
                  value={form.email || ""}
                  onChange={handleOnChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-notosanslao">
                  ເບີໂທລະສັບ <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full border border-gray-300 font-notosanslao p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ເບີ 9xxxxxxx"
                  type="text"
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/\D/g, "");
                  }}
                  inputMode="numeric"
                  name="phone"
                  value={form.phone || ""}
                  onChange={handleOnChange}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-notosanslao font-medium text-gray-700 mb-2">
                ທີ່ຕັ້ງບໍລິສັດ
              </label>
              <textarea
                name="address"
                maxLength={191}
                value={form.address || ""}
                onChange={handleOnChange}
                className="w-full border border-gray-300 font-notosanslao rounded-lg p-2 min-h-[120px] resize-y"
                placeholder="ທີ່ຕັ້ງບໍລິສັດ"
              />
              <div className="text-xs font-notosanslao text-gray-500 text-right mt-1">
                {form.address?.length || 0}/191 ຕົວອັກສອນ
              </div>
            </div>

            <div className="md:w-auto">
              <label className="block text-sm font-notosanslao font-medium text-gray-700 mb-2">
                &nbsp;
              </label>
              <button
                type="submit"
                //   disabled={isLoading || !form.trim()}
                className="w-full md:w-auto bg-blue-500  hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-md font-medium transition-colors flex items-center justify-center space-x-2 disabled:cursor-not-allowed font-notosanslao"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>ກຳລັງບັນທຶກ...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>ບັນທຶກ</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateSupplier;
