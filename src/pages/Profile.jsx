import React, { useEffect, useState } from "react";
import {
  User,
  CalendarDays,
  Mail,
  Shield,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

function Profile() {
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Password change state
  const [passwords, setPasswords] = useState({ new: "", confirm: "" });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // ✅ Fetch logged-in agent’s info
  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Please log in first.");
          setLoading(false);
          return;
        }

        const res = await fetch(`${SERVER_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (res.ok) {
          setAgent(data);
        } else {
          toast.error(data.message || "Failed to load profile.");
        }
      } catch {
        toast.error("Error fetching profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, []);

  // 🔑 Handle Password Change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      return toast.error("Passwords do not match");
    }
    if (passwords.new.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    try {
      setUpdatingPassword(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${SERVER_URL}/api/auth/users/${agent._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: passwords.new }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Password updated successfully! Please login again.");
        setPasswords({ new: "", confirm: "" });
        setTimeout(() => {
          localStorage.clear();
          window.location.href = "/";
        }, 2000);
      } else {
        toast.error(data.message || "Failed to update password");
      }
    } catch {
      toast.error("Error updating password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  // 🧮 Format Date Safely
  const formatDate = (dateString) => {
    if (!dateString) return "Date unavailable";
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "Date unavailable"
      : date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50/50">
        <Loader2 size={40} className="animate-spin text-emerald-600 mb-4" />
        <p className="text-gray-500 font-medium animate-pulse">
          Retrieving profile information...
        </p>
      </div>
    );

  if (!agent)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50/50 text-gray-500">
        <User size={48} className="text-gray-300 mb-4" />
        <p className="font-medium">No agent data found.</p>
        <p className="text-sm">Please try logging in again.</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50/50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
          {/* Decorative Header Background */}
          <div className="h-32 bg-gradient-to-r from-emerald-500 to-teal-600 relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          </div>

          <div className="px-8 pb-8">
            {/* Avatar & Basic Info */}
            <div className="relative flex flex-col sm:flex-row items-center sm:items-end -mt-12 mb-6 sm:mb-8 gap-4 sm:gap-6">
              <div className="relative">
                <div className="bg-white p-1.5 rounded-full shadow-md">
                  <div className="bg-emerald-100 h-24 w-24 sm:h-28 sm:w-28 rounded-full flex items-center justify-center text-emerald-700 shadow-inner border border-emerald-200">
                    <User className="h-12 w-12 sm:h-14 sm:w-14" />
                  </div>
                </div>
                <div
                  className="absolute bottom-2 right-2 bg-emerald-500 border-2 border-white rounded-full p-1.5 shadow-sm"
                  title="Active Status"
                >
                  <CheckCircle2 size={12} className="text-white" />
                </div>
              </div>

              <div className="text-center sm:text-left pb-2 flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                  {agent.username || "Unnamed Agent"}
                </h1>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border ${
                      agent.isAdmin
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}
                  >
                    {agent.isAdmin ? "Administrator" : "Sales Agent"}
                  </span>
                  <span className="text-gray-400 text-sm hidden sm:inline">
                    •
                  </span>
                  <span className="text-gray-500 text-sm">
                    {agent.email || "No email"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">
                  Account Details
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="bg-white p-2 rounded-lg shadow-sm text-emerald-600 border border-emerald-100">
                      <Mail size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">
                        Email Address
                      </p>
                      <p className="text-sm font-semibold text-gray-800">
                        {agent.email || "Not Provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="bg-white p-2 rounded-lg shadow-sm text-emerald-600 border border-emerald-100">
                      <CalendarDays size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">
                        Member Since
                      </p>
                      <p className="text-sm font-semibold text-gray-800">
                        {formatDate(agent.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Role Description */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">
                  Permissions & Access
                </h3>

                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60 relative overflow-hidden shadow-sm">
                  <div className="absolute top-0 right-0 -mt-2 -mr-2 text-emerald-200/50">
                    <Shield size={64} />
                  </div>

                  <div className="relative z-10 flex gap-3">
                    <div className="mt-1">
                      <Shield className="text-emerald-600" size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-800 mb-1">
                        {agent.isAdmin
                          ? "Full Admin Access"
                          : "Standard Access"}
                      </h4>
                      <p className="text-sm text-emerald-700/80 leading-relaxed">
                        {agent.isAdmin
                          ? "You have full administrative privileges to manage distributors, view all sales records, and update inventory stock."
                          : "You are authorized to process sales transactions, record stock updates, and track your personal performance metrics."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Password Change Form */}
            <div className="mt-8 border-t border-gray-100 pt-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider pb-4">
                Security Settings
              </h3>
              <form
                onSubmit={handlePasswordChange}
                className="p-5 rounded-2xl bg-gray-50/50 border border-gray-100 space-y-4 max-w-2xl"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwords.new}
                      onChange={(e) =>
                        setPasswords({ ...passwords, new: e.target.value })
                      }
                      className="w-full border border-gray-200 px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-300"
                      placeholder="Enter new password"
                      minLength={6}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={passwords.confirm}
                      onChange={(e) =>
                        setPasswords({ ...passwords, confirm: e.target.value })
                      }
                      className="w-full border border-gray-200 px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-300"
                      placeholder="Confirm new password"
                      minLength={6}
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={
                      updatingPassword || !passwords.new || !passwords.confirm
                    }
                    className="bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {updatingPassword ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Shield size={16} />
                    )}
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Footer Message */}
          <div className="bg-gray-50 border-t border-gray-100 py-3 px-8 text-center">
            <p className="text-xs text-gray-400 font-medium">
              User ID:{" "}
              <span className="font-mono">{agent._id || "UNKNOWN"}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
