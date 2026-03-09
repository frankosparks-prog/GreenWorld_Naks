import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  User,
  Package,
  ShoppingBag,
  LogOut,
  Settings, // Added Settings for profile/user-related settings
  BarChart,
  User2, // Using a more relevant icon for a modern dashboard (instead of Shield)
} from "lucide-react";
import toast from "react-hot-toast";
const Navbar = ({ setIsLoggedIn }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "Agent",
    // role: "Sales Agent",
  };

  // ✅ Main navigation links - Used BarChart for Dashboard/Home
  const navItems = [
    { path: "/home", label: "Dashboard", icon: <BarChart size={16} /> },
    { path: "/stock", label: "Stock Management", icon: <Package size={16} /> },
    { path: "/sales", label: "Sales & BV", icon: <ShoppingBag size={16} /> },
    // { path: "/massage", label: "Massage", icon: <User2 size={16} /> },
    { path: "/registration", label: "Registration", icon: <User size={16} /> },
  ];

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  // ✅ Logout
  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (confirmed) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsLoggedIn(false);
      toast.success("Logged out successfully");
      setDropdownOpen(false);
      setMenuOpen(false); // Close mobile menu on logout
      navigate("/");
    }
  };

  const logo =
    "https://greenworld.co.za/home/wp-content/uploads/2017/11/green_world_logo.png";

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Close menu when route changes
  useEffect(() => {
    // This is a simple way to ensure the menu closes on navigation
    // The onClick in NavLink already handles it, but this adds robustness.
    return () => setMenuOpen(false);
  }, [navigate]);

  return (
    <div className="fixed top-0 left-0 w-full z-40 shadow-sm bg-gradient-to-r from-emerald-900 via-green-800 to-teal-900 backdrop-blur-md border-b border-emerald-700/50">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left Section: Logo & Name */}
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="System Logo"
            className="w-10 h-10 rounded-full border border-green-700 shadow-sm"
          />
          <div>
            <h1 className="text-lg font-semibold text-white leading-tight">
              Green World System
            </h1>
            <p className="text-xs text-emerald-200 -mt-1">
              Nakuru Branch Management
            </p>
          </div>
        </div>

        {/* Center: Navigation (Desktop Only) */}
        <nav className="hidden md:flex items-center gap-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-all duration-300 ${
                  isActive
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-900/20"
                    : "text-emerald-50 hover:bg-emerald-800/50 hover:text-white"
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right: Profile Dropdown & Mobile Toggle */}
        <div className="relative flex items-center gap-3" ref={dropdownRef}>
          {/* User Info (Desktop only) */}
          <div
            onClick={toggleDropdown}
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-800/40 hover:bg-emerald-700/60 cursor-pointer transition-all border border-emerald-600/30"
          >
            <User className="h-5 w-5 text-emerald-100" />
            <div className="text-sm">
              <p className="text-white font-semibold">{user.username}</p>
              {/* <p className="text-xs text-gray-500">{user.role}</p> */}
            </div>
          </div>

          {dropdownOpen && (
            <div className="absolute top-12 right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in">
              <button
                onClick={() => {
                  navigate("/profile");
                  setDropdownOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-green-50 transition-all text-gray-700"
              >
                <Settings size={18} className="text-green-600" />
                Account Settings
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-red-50 transition-all text-red-600"
              >
                <LogOut size={18} />
                Log Out
              </button>
            </div>
          )}

          {/* Mobile Toggle */}
          <div
            onClick={toggleMenu}
            className="md:hidden cursor-pointer hover:bg-emerald-800/50 rounded-full p-2"
          >
            {menuOpen ? (
              <X size={22} className="text-emerald-100" />
            ) : (
              <Menu size={22} className="text-emerald-100" />
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------- */}
      {/* 🚀 POLISHED MOBILE SIDEBAR (Drawer) 🚀      */}
      {/* ------------------------------------------- */}
      <nav
        className={`fixed top-0 left-0 w-64 h-full bg-white text-gray-800 z-50 transform ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-out shadow-2xl flex flex-col`}
      >
        {/* Sidebar Header & Close Button */}
        <div className="p-4 border-b border-emerald-800/30 bg-gradient-to-br from-emerald-900 to-green-900 text-white relative">
          {/* <button
            onClick={toggleMenu}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button> */}

          <div className="flex items-center gap-3 pt-2 pb-4">
            <img
              src={logo}
              alt="System Logo"
              className="w-12 h-12 rounded-full border-2 border-white bg-white"
            />
            <div>
              <h1 className="font-extrabold text-xl leading-tight">
                Green World
              </h1>
              <p className="text-xs text-green-200">Nakuru Branch Management</p>
            </div>
          </div>

          {/* User Profile Card (Integrated) */}
          <div className="mt-2 p-3 bg-emerald-800/50 border border-emerald-600/30 rounded-lg shadow-inner">
            <p className="font-semibold flex items-center gap-2">
              <User size={16} className="text-emerald-200" />
              {user.username}
            </p>
            {/* <p className="text-xs text-green-300 ml-6">{user.role}</p> */}
          </div>
        </div>

        {/* Navigation Links */}
        <ul className="flex-grow space-y-1 p-4 bg-white">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-emerald-50 text-emerald-900 border-l-4 border-emerald-600 shadow-sm"
                      : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-800"
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            </li>
          ))}
          {/* Profile Link in Mobile Menu */}
          <li>
            <button
              onClick={() => {
                navigate("/profile");
                setMenuOpen(false);
              }}
              className="w-full text-left flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 text-gray-700 hover:bg-gray-100 hover:text-green-700"
            >
              <Settings size={18} />
              Account Settings
            </button>
          </li>
        </ul>

        {/* Footer/Logout Button */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full bg-red-500 py-3 rounded-lg justify-center text-white font-semibold hover:bg-red-600 transition shadow-md"
          >
            <LogOut size={18} />
            Log Out
          </button>
        </div>
      </nav>

      {/* Overlay to close the menu when clicking outside the sidebar */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleMenu}
        />
      )}
    </div>
  );
};

export default Navbar;
