import React from "react";
import { Outlet } from "react-router-dom";
import SidebarAdmin from "../components/admin/SidebarAdmin";;

const Layoutadmin = () => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <SidebarAdmin />
      <div className="flex-1 h-screen flex flex-col min-w-0 transition-all duration-300">        
        {/* Main Content Area */}
        <main className="flex-1 h-screen p-4 overflow-y-auto">
          <div className="max-w-full bg-white rounded-xl shadow-sm border border-gray-200/50 p-6 min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layoutadmin;