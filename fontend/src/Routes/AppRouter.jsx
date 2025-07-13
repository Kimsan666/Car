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


const AppRouter = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Login />,
    },
    {
      path: "/user",
      element: <ProtectRouUser element={<Layoutuser />} />,
      children: [{ index: true, element: <Home /> }],
    },
    {
      path: "/admin",
      element: <ProtectRouAdmin element={<Layoutadmin />} />,
      children: [
        { path: "dashboard", element: <Dashboard /> },
        { path: "brands", element: <Brand /> },
        { path: "edit-brands/:id", element: <EditBrand /> },
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
