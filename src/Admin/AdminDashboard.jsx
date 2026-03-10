// src/components/Admin/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import { NavLink, Outlet, Navigate, useNavigate } from "react-router-dom";
import {
  Users2,
  FileText,
  LogOut,
  FileClock as FileClockIcon,
  Menu as MenuIcon,
  X as CloseIcon,
  User,
  ShieldCheck,
  ChevronRight,
  Users,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";

const links = [
  {
    to: "/admin/dashboard/users",
    label: "User Management",
    icon: <Users2 size={20} />,
  },
  {
    to: "/admin/dashboard/stock",
    label: "Stock Inventory",
    icon: <FileText size={20} />,
  },
  {
    to: "/admin/dashboard/sales",
    label: "Sales Records",
    icon: <FileClockIcon size={20} />,
  },
  {
    to: "/admin/dashboard/dist",
    label: "Distributors",
    icon: <User size={20} />,
  },
  {
    to: "/admin/dashboard/analytics",
    label: "Analytics",
    icon: <TrendingUp size={20} />,
  },
  // {
  //   to: "/admin/dashboard/massage",
  //   label: "Wellness Services",
  //   icon: <Users size={20} />,
  // },
];

const AdminDashboard = () => {
  const [open, setOpen] = useState(window.innerWidth > 768); // Default open on desktop
  const navigate = useNavigate();

  // Auto logout when token expires
  const handleLogout = useCallback(() => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("user");
    toast.success("Logged out successfully 👋");
    navigate("/");
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) return;
    try {
      const { exp } = JSON.parse(atob(token.split(".")[1]));
      const timeout = exp * 1000 - Date.now();
      const id = setTimeout(handleLogout, timeout);
      return () => clearTimeout(id);
    } catch (_) {}
  }, [handleLogout]);

  // Handle window resize for sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setOpen(false);
      } else {
        setOpen(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed z-30 top-0 left-0 h-full w-72 bg-[#1a1c23] text-white border-r border-gray-800 transition-transform duration-300 ease-in-out shadow-2xl ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-20 border-b border-gray-800 bg-[#1a1c23]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-600 rounded-lg">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-wide text-white leading-none">
                Admin Portal
              </h2>
              <p className="text-xs text-gray-400 mt-1">Green World Nakuru</p>
            </div>
          </div>
          <button
            className="md:hidden text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-800 transition-colors"
            onClick={() => setOpen(false)}
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="mt-8 px-4 space-y-2">
          <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Main Menu
          </p>
          {links.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => window.innerWidth < 768 && setOpen(false)}
              className={({ isActive }) =>
                `group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${
                  isActive
                    ? "bg-green-600 text-white shadow-lg shadow-green-900/20"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`
              }
            >
              <div className="flex items-center gap-3">
                {icon}
                <span>{label}</span>
              </div>
              <ChevronRight
                size={16}
                className={`opacity-0 group-hover:opacity-100 transition-opacity duration-200 -mr-2`}
              />
            </NavLink>
          ))}
        </nav>

        {/* User Profile / Logout */}
        <div className="absolute bottom-0 inset-x-0 p-4 border-t border-gray-800 bg-[#15171e]">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-green-500 to-emerald-700 flex items-center justify-center text-white font-bold text-sm shadow-md">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">
                Administrator
              </p>
              <p className="text-xs text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Online
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-red-900/30 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white text-sm font-medium transition-all duration-200 group"
          >
            <LogOut
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div
        className={`flex-1 flex flex-col h-full transition-all duration-300 ${
          open ? "md:ml-72" : "ml-0"
        }`}
      >
        {/* Topbar */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm/50">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              className={`p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors ${open ? "md:hidden" : ""}`}
              onClick={() => setOpen(!open)}
            >
              <MenuIcon size={24} />
            </button>

            {/* Breadcrumb / Title */}
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                Dashboard Overview
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                Manage your system resources efficiently
              </p>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-100 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              System Healthy
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6 relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

          <div className="relative z-0 max-w-7xl mx-auto animate-in fade-in duration-500 slide-in-from-bottom-2">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export const AdminRoutes = () => <Navigate to="users" replace />;
export default AdminDashboard;
