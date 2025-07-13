import React, { useState, useEffect } from "react";
import { readBrand, saveBrand, updateBrand } from "../../../api/Brand";
import useCarStore from "../../../Store/car-store";
import { toast } from "react-toastify";
import TableBrand from "../Table/TableBrand";
import { Plus, Car } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { readType, updateType } from "../../../api/Type";
const inirialState = {
  name: "",
};
const EditType = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useCarStore((state) => state.token);
  const [isLoading, setIsLoading] = useState(false);
  const getType = useCarStore((state) => state.getType);

  useEffect(() => {
    getType();
  }, []);

  const [form, setForm] = useState({
    name: "",
  });

  useEffect(() => {
    // getSupplier();
    fetchBrand(token, id, form);
  }, []);

  const fetchBrand = async (id, form) => {
    try {
      const res = await readType(id, form);
      console.log("res for backend", res);

      setForm(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleOnChange = (e) => {
    console.log(e.target.name, e.target.value);
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(form);
    try {
      if (form.name.length === 0) {
        toast.error(<p className="font-phetsarath">ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບ</p>);
        return;
      }
      const res = await updateType(token, id, form);
      // console.log(res);
      toast.success(<p className="font-phetsarath">ອັບເດດປະເພດລົດສຳເລັດ</p>);
      setForm(inirialState);

      navigate("/admin/types");
    } catch (err) {
      console.log(err);
      const errMessage = err.response?.data?.message;
      toast.error(<span className="font-phetsarath">{errMessage}</span>);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 font-Sanslem">
              ຈັດການແກ້ໄຂປະເພດລົດ
            </h1>
          </div>
          <p className="text-gray-600 font-notosanslao">
            ແກ້ໄຂປະເພດລົດ
          </p>
        </div>

        {/* Add Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Plus className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-800 font-notosanslao">
                ເພີ່ມປະເພດລົດໃໝ່ {form.name}
              </h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2 font-notosanslao">
                  ຊື່ປະເພດລົດ
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-notosanslao"
                  placeholder="ຊື່ປະເພດລົດ ເຊັ່ນ: (ລົດຄອບຄົວ, ກະບະ, ລົດ4ປະຕູ.....)"
                  type="text"
                  maxLength={191}
                  name="name"
                  value={form.name}
                  onChange={handleOnChange}
                />
              </div>

              <div className="md:w-auto">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  &nbsp;
                </label>
                <button
                  type="submit"
                  disabled={isLoading || !form.name.trim()}
                  className="w-full md:w-auto bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-md font-medium transition-colors flex items-center justify-center space-x-2 disabled:cursor-not-allowed font-notosanslao"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>ກຳລັງບັນທຶກການແກ້ໄຂ...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>ບັນທຶກແກ້ໄຂ</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditType;
