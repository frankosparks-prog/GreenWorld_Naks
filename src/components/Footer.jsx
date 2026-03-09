import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Mail } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-gradient-to-br from-emerald-950 via-green-900 to-teal-950 text-white py-10 px-6 rounded-t-3xl shadow-2xl border-t border-emerald-600/30 mt-2">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10">
        {/* System Info */}
        <div className="text-center sm:text-left">
          <h2 className="text-lg font-bold mb-3 text-emerald-400 tracking-wide">
            🌱 Green World Nakuru Branch
          </h2>
          <p className="text-white/80 text-sm leading-relaxed">
            <span className="block italic mb-1">
              “Empowering health through natural wellness.”
            </span>
            <span className="text-gray-300">
              A complete <strong>Stock & Sales Management System</strong> built
              for efficiency, transparency, and growth.
            </span>
          </p>
        </div>

        {/* Quick Links */}
        <div className="text-center sm:text-left">
          <h3 className="text-base font-semibold mb-3 text-emerald-400 uppercase tracking-wide">
            Quick Access
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                to="/home"
                className="hover:text-lime-400 transition duration-200"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/stock"
                className="hover:text-lime-400 transition duration-200"
              >
                Manage Stock
              </Link>
            </li>
            <li>
              <Link
                to="/sales"
                className="hover:text-lime-400 transition duration-200"
              >
                View Sales
              </Link>
            </li>
          </ul>
        </div>

        {/* Connect */}
        <div className="text-center sm:text-left">
          <h3 className="text-base font-semibold mb-3 text-emerald-400 uppercase tracking-wide">
            System Connect
          </h3>
          <div className="flex justify-center sm:justify-start gap-5">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-lime-400 hover:scale-110 transform transition"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-lime-400 hover:scale-110 transform transition"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-lime-400 hover:scale-110 transform transition"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-lime-400 hover:scale-110 transform transition"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="mailto:greenworldNakuru@example.com"
              className="hover:text-lime-400 hover:scale-110 transform transition"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/10 my-8"></div>

      {/* System Logo */}
      <div className="flex flex-col items-center space-y-2">
        <img
          src="./greenworld1.png"
          alt="Green World Logo"
          className="w-16 h-16 rounded-full border border-emerald-400/40 shadow-md hover:scale-105 transition-transform"
        />
        <p className="text-xs text-white/60 tracking-wide uppercase">
          Green World Stock & Sales System
        </p>
      </div>

      {/* Copyright */}
      <div className="mt-6 text-center text-[13px] text-white/50">
        © {new Date().getFullYear()} —{" "}
        <span className="text-emerald-400 font-medium">Green World Nakuru</span>
        .
        <br className="sm:hidden" /> System powered by innovation 🌿.
      </div>
    </footer>
  );
}

export default Footer;
