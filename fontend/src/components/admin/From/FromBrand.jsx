import React, { useState, useEffect } from "react";
import { saveBrand } from "../../../api/Brand";
import useCarStore from "../../../Store/car-store";
import { toast } from "react-toastify";
import TableBrand from "../Table/TableBrand";
import { Plus, Car } from "lucide-react";

const FormBrand = () => {
  const token = useCarStore((state) => state.token);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const getBrand = useCarStore((state) => state.getBrand);

  useEffect(() => {
    getBrand();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(<span className="font-phetsarath">ກະລຸນາປ້ອນຊື່ແບນລົດ</span>);
      return;
    }

    setIsLoading(true);
    try {
      const res = await saveBrand(token, { name });
      console.log(res.data.name);
      toast.success(
        <span className="font-phetsarath">ບັນທຶກ {res.data.name} ສຳເລັດ</span>
      );
      getBrand();
      setName("");
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
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold font-notosanslao text-gray-800 font-Sanslem">
              ຈັດການຂໍ້ມູນແບນລົດ
            </h1>
          </div>
          <p className="text-gray-600 font-notosanslao">
            ເພີ່ມແລະຈັດການຂໍ້ມູນແບນລົດໃນລະບົບ
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
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2 font-notosanslao">
                  ຊື່ແບນລົດ
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-notosanslao"
                  placeholder="ປ້ອນຊື່ແບນລົດ..."
                  type="text"
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  disabled={isLoading}
                />
                <div className="text-xs font-notosanslao text-gray-500 text-right mt-1">
                  {name?.length || 0}/191 ຕົວອັກສອນ
                </div>
              </div>

              <div className="md:w-auto">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  &nbsp;
                </label>
                <button
                  type="submit"
                  disabled={isLoading || !name.trim()}
                  className="w-full md:w-auto bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-md font-medium transition-colors flex items-center justify-center space-x-2 disabled:cursor-not-allowed font-notosanslao"
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
            </div>
          </form>
        </div>

        {/* Table */}
        <TableBrand />
      </div>
    </div>
  );
};

export default FormBrand;
