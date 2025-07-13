import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  PackageSearch,
  Boxes,
  Combine,
  Container,
  Warehouse,
  Package,
  CalendarArrowDown,
  UserRoundPen,
  ArchiveRestore,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useCarStore from "../../Store/car-store";
import MenuAdminDropdown from "./menuAdmin/MenuAdminDropdown";

const SidebarAdmin = () => {
  const [openMenu, setOpenMenu] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const logout = useCarStore((state) => state.actionLogout);
  const navigate = useNavigate();

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMenu = (name) => {
    if (!isCollapsed) {
      setOpenMenu(openMenu === name ? null : name);
    }
  };

  const toggleSidebar = () => {
    if (window.innerWidth > 1024) {
      setIsCollapsed(!isCollapsed);
    } else {
      setIsSidebarOpen(!isSidebarOpen);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && window.innerWidth <= 1024 && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar - ปรับแต่งใหม่ให้สวยขึ้น */}
      <div
        className={`bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white h-screen flex flex-col fixed z-40 transition-all duration-300 ease-in-out shadow-2xl border-r border-slate-700/50
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          ${isCollapsed ? "w-16" : "w-64"} 
          lg:relative lg:z-0`}
      >
        {/* Header - ปรับให้มีปุ่ม toggle ด้วย */}
        <div
          className={`flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 border-b border-slate-700/50 relative overflow-hidden h-16
          ${isCollapsed ? "justify-center px-2" : "justify-between px-4"}`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>

          {/* Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="relative z-10 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-300 transform hover:scale-105 group backdrop-blur-sm"
          >
            {isSidebarOpen && !isCollapsed ? (
              <X
                size={18}
                className="group-hover:rotate-90 transition-transform duration-300"
              />
            ) : (
              <Menu
                size={18}
                className="group-hover:scale-110 transition-transform duration-300"
              />
            )}
          </button>

          {/* Logo/Title */}
          {!isCollapsed && (
            <div className="relative z-10 flex-1 text-center">
              <span className="bg-gradient-to-r from-blue-200 to-indigo-200 bg-clip-text text-transparent text-lg font-bold tracking-wide">
                AdminPanel
              </span>
            </div>
          )}

          {/* Spacer for balance when not collapsed */}
          {!isCollapsed && <div className="w-10"></div>}
        </div>

        {/* Menu Items - ปรับแต่งใหม่ */}
        <div className="flex-1 py-4 font-notosanslao overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
          {MenuAdminDropdown.map((group, index) => (
            <div
              key={index}
              className={`mb-1 ${isCollapsed ? "px-2" : "px-3"}`}
            >
              {/* Main Menu Item */}
              {group.sub ? (
                <button
                  onClick={() => {
                    if (isCollapsed) {
                      setIsCollapsed(false);
                    }
                    toggleMenu(group.name);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group relative overflow-hidden
                    ${
                      openMenu === group.name
                        ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-blue-200 shadow-lg"
                        : "text-gray-300 hover:bg-slate-700/50 hover:text-white"
                    }`}
                  title={isCollapsed ? group.name : ""}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`transition-colors duration-200 ${
                        openMenu === group.name
                          ? "text-blue-400"
                          : "text-slate-400 group-hover:text-blue-400"
                      }`}
                    >
                      {group.icon}
                    </div>
                    {!isCollapsed && (
                      <span className="font-medium text-sm">{group.name}</span>
                    )}
                  </div>
                  {!isCollapsed && (
                    <div
                      className={`transition-transform duration-200 ${
                        openMenu === group.name ? "rotate-180" : ""
                      }`}
                    >
                      <ChevronDown size={16} />
                    </div>
                  )}
                </button>
              ) : (
                <NavLink
                  to={group.path}
                  end
                  onClick={() => {
                    if (isCollapsed) {
                      setIsCollapsed(false);
                    }
                    if (window.innerWidth < 1024) {
                      setIsSidebarOpen(false);
                    }
                  }}
                  className={({ isActive }) =>
                    `flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-[1.02]"
                        : "text-gray-300 hover:bg-slate-700/50 hover:text-white hover:transform hover:scale-[1.01]"
                    }`
                  }
                  title={isCollapsed ? group.name : ""}
                >
                  <div
                    className={`transition-colors duration-200 ${"text-slate-400 group-hover:text-blue-400"}`}
                  >
                    {group.icon}
                  </div>
                  {!isCollapsed && (
                    <span className="font-medium text-sm">{group.name}</span>
                  )}
                </NavLink>
              )}

              {/* Sub Menu Items */}
              {group.sub && openMenu === group.name && !isCollapsed && (
                <div className="mt-2 ml-4 space-y-1 border-l-2 border-slate-600/30 pl-4">
                  {group.sub.map((sub, subIndex) => (
                    <NavLink
                      key={subIndex}
                      to={sub.path}
                      onClick={() => {
                        if (isCollapsed) {
                          setIsCollapsed(false);
                        }
                        if (window.innerWidth < 1024) {
                          setIsSidebarOpen(false);
                        }
                      }}
                      className={({ isActive }) =>
                        `flex items-center gap-3 p-2.5 rounded-lg transition-all duration-200 group ${
                          isActive
                            ? "bg-gradient-to-r from-blue-500/30 to-indigo-500/30 text-blue-200 shadow-md"
                            : "text-gray-400 hover:bg-slate-700/30 hover:text-white"
                        }`
                      }
                    >
                      <div className="text-slate-500 group-hover:text-blue-400 transition-colors duration-200">
                        {sub.icon}
                      </div>
                      <span className="font-medium text-xs">{sub.name}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Sign Out Button - ปรับให้สวยขึ้น */}
        <div
          className={`p-4 border-t border-slate-700/50 bg-slate-800/30 ${
            isCollapsed ? "px-2" : ""
          }`}
        >
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 p-3 bg-gradient-to-r from-red-600/20 to-pink-600/20 hover:from-red-600/30 hover:to-pink-600/30 text-red-300 hover:text-red-200 rounded-xl transition-all duration-200 border border-red-500/20 hover:border-red-400/30 shadow-lg hover:shadow-xl transform hover:scale-[1.02] group`}
            title={isCollapsed ? "Sign Out" : ""}
          >
            <LogOut
              size={18}
              className="group-hover:rotate-12 transition-transform duration-200"
            />
            {!isCollapsed && (
              <span className="font-medium text-sm">Sign Out</span>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default SidebarAdmin;
