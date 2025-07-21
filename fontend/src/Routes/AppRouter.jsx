import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "../page/user/Home";
import Login from "../page/auth/Login";
import Dashboard from "../page/admin/Dashboard";
import Layoutuser from "../layouts/Layoutuser";
import Layoutadmin from "../layouts/Layoutadmin";
import ProtectRouUser from "./ProtectRouUser";
import ProtectRouAdmin from "./ProtectRouAdmin";
import Brand from "../page/admin/Management/Brand";
import EditBrand from "../components/admin/Edit/EditBrand";
import Color from "../page/admin/Management/Color";
import EditColor from "../components/admin/Edit/EditColor";
import EditType from "../components/admin/Edit/EditType";
import Type from "../page/admin/Management/Type";
import BrandAndModel from "../page/admin/Management/BrandAndModel";
import EditBrandAndModel from "../components/admin/Edit/EditBrandAndModel";
import FormCar from "../components/admin/From/FormCar";
import EditCar from "../components/admin/Edit/EditCar";
import CarDetail from "../components/admin/From/CarDetail";
import CreateCar from "../components/admin/Create/CreateCar";
import FormCardCar from "../components/admin/From/FormCardCar";
import CreateSupplier from "../components/admin/Create/CreateSupplier";
import FormSupplier from "../components/admin/From/FormSupplier";
import EditSupplier from "../components/admin/Edit/EditSupplier";
import CreateCustomer from "../components/admin/Create/CreateCustomer";
import FormCustomer from "../components/admin/From/FormCustomer";
import CreatePurchase from "../components/admin/Purches/CreatePurchase";
import SupplierProductPage from "../components/admin/From/SupplierProductPage";
import CreateSupplierProduct from "../components/admin/Create/CreateSupplierProduct";
import { List, Table } from "lucide-react";
import ListPurchase from "../components/admin/Purches/ListPurchase";
import EditPurchase from "../components/admin/Purches/EditPurchase";
import ReportCar from "../components/admin/Report/ReportCar";
import CreateInputCar from "../components/admin/InputCar/CreateInputCar";
import CreateActualCars from "../components/admin/InputCar/CreateActualCars";
import ListInputCars from "../components/admin/InputCar/ListInputCar";
import FormSupplierProduct from "../components/admin/From/FormSupplierProduct";
import TableSupplierProduct from "../components/admin/Table/TableSupplierProduct";


const AppRouter = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Login />,
    },
    {
      path: "/user",
      element: <ProtectRouUser element={<Layoutuser />} />,
      children: [{ index: true, element: <FormCardCar /> }],
    },
    {
      path: "/admin",
      element: <ProtectRouAdmin element={<Layoutadmin />} />,
      children: [
        { path: "dashboard", element: <Dashboard /> },
        { path: "brands", element: <Brand /> },
        { path: "edit-brands/:id", element: <EditBrand /> },
        { path: "colors", element: <Color /> },
        { path: "edit-colors/:id", element: <EditColor /> },
        { path: "types", element: <Type /> },
        { path: "edit-types/:id", element: <EditType /> },
        { path: "brandmodels", element: <BrandAndModel /> },
        { path: "edit-brandmodel/:id", element: <EditBrandAndModel /> },
        { path: "cars", element: <FormCar /> },
        { path: "edit-car/:id", element: <EditCar /> },
        { path: "car/:id", element: <CarDetail /> },
        { path: "car/create", element: <CreateCar /> },
        { path: "suppliers", element: <FormSupplier /> },
        { path: "suppliers/create", element: <CreateSupplier /> },
        { path: "edit-suppliers/:id", element: <EditSupplier /> },
        { path: "customers", element: <FormCustomer /> },
        { path: "customers/create", element: <FormCustomer /> },
        { path: "purchase/create", element: <CreatePurchase /> },
        { path: "purchases", element: <ListPurchase /> },
        { path: "edit-purchases/:id", element: <EditPurchase /> },
        { path: "supplier-products/create", element: <CreateSupplierProduct /> },
        { path: "supplier-products", element: <TableSupplierProduct /> },

        { path: "input-cars", element: <ListInputCars /> },
        { path: "input-cars/create", element: <CreateInputCar /> },
        { path: "input-cars/create-actual", element: <CreateActualCars /> },






        { path: "report-car", element: <ReportCar /> },
      ],
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
};

export default AppRouter;
