import React, { useState, useEffect } from "react";
import useCarStore from "../../../Store/car-store";
import { toast } from "react-toastify";
import { Plus, Car } from "lucide-react";
import { Link } from "react-router-dom";
import TableSupplierProduct from "../Table/TableSupplierProduct";

const FormSupplierProduct = () => {
  const getSuppliersProduct = useCarStore((state) => state.getSuppliersProduct);

  useEffect(() => {
    getSuppliersProduct();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between space-x-3 mb-2 font-notosanslao">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 font-Sanslem">
                ຈັດການຂໍ້ມູນສິນຄ້າຂອງຜູ້ສະໜອງ
              </h1>
            </div>
            <Link
              to="/admin/supplier-products/create"
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              <span>ເພີ່ມສິນຄ້າຂອງຜູ້ສະໜອງ</span>
            </Link>
          </div>
          <p className="text-gray-600 font-notosanslao">
            ເພີ່ມແລະຈັດການຂໍ້ມູນສິນຄ້າຂອງຜູ້ສະໜອງ</p>
        </div>

        {/* Add Form */}

        {/* Table */}
        <TableSupplierProduct />
      </div>
    </div>
  );
};

export default FormSupplierProduct;
