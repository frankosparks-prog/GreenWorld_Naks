import React, { useState } from "react";
import { Eye, EyeOff, Leaf, Lock, User } from "lucide-react"; // Added Lock/User for input icons
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${SERVER_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Login failed");
        setLoading(false);
        return;
      }

      // ✅ Save token + user info to localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Login successful!");

      onLogin();

      // Redirect based on role
      if (data.user.isAdmin) {
        navigate("/admin/dashboard");
      } else {
        navigate("/home");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center relative overflow-hidden"
      style={{
        backgroundImage:
          "linear-gradient(to bottom right, rgba(2,44,34,0.9), rgba(6,78,59,0.85)), url('https://www.news-medical.net/images/Article_Images/ImageForArticle_23934_17048079786429719.jpg')",
      }}
    >
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-green-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <main className="w-full px-4 animate-fade-in flex justify-center z-10">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-10 transition-all duration-300 hover:shadow-emerald-900/50">
          {/* Header Section */}
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="relative mb-4 group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl blur opacity-25 group-hover:opacity-60 transition duration-1000"></div>
              <div className="relative bg-white/10 p-3 rounded-2xl border border-white/10">
                {/* Fallback layout if external image fails, otherwise displays logo */}
                <img
                  src="https://greenworld.co.za/home/wp-content/uploads/2017/11/green_world_logo.png"
                  alt="Green World Logo"
                  className="h-16 w-auto object-contain drop-shadow-md"
                />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              Welcome Back <Leaf className="h-6 w-6 text-emerald-400" />
            </h2>
            <p className="text-emerald-100/80 mt-2 text-sm font-medium">
              Access your Stock & Sales Management Portal
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-green-50 ml-1">
                Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-green-200/70 group-focus-within:text-green-400 transition-colors" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-green-100/30 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:bg-black/30 transition-all duration-200"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-green-50 ml-1">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-green-200/70 group-focus-within:text-green-400 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-green-100/30 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:bg-black/30 transition-all duration-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-green-200/50 hover:text-white transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full relative overflow-hidden py-3.5 rounded-xl font-bold text-white shadow-lg transform transition-all duration-200 
                ${
                  loading
                    ? "bg-emerald-800/50 cursor-not-allowed opacity-70"
                    : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 hover:scale-[1.02] active:scale-95 shadow-lg shadow-emerald-500/30"
                }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Authenticating...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </main>

      <footer className="absolute bottom-4 text-center w-full px-4">
        <p className="text-green-100/60 text-xs tracking-wider">
          © {new Date().getFullYear()} Green World Nakuru Branch — Secure Access
          Portal
        </p>
      </footer>
    </div>
  );
};

export default Login;
