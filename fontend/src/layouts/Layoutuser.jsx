import React from "react";
import { Outlet } from "react-router-dom";


const Layoutuser = () => {
  return (
    <div className="">
      {/* Fixed NavUser - อยู่กับที่เมื่อเลื่อนหน้าจอ */}
      {/* <header className="fixed top-0 left-0 right-0 bg-white z-10 shadow-sm">
        <NavUser />
        <hr className="border-gray-200" />
      </header> */}
      
      {/* เพิ่ม padding-top เพื่อไม่ให้เนื้อหาถูกซ่อนใต้ nav */}
      <main className="">
        <Outlet />
      </main>
    </div>
  );
};

export default Layoutuser;