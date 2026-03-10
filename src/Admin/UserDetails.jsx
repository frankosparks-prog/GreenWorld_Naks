/* UserDetails.jsx  */
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  User,
  ShieldAlert,
  ShieldCheck,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Mail,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const PAGE_SIZE = 8;

// ───────────────────────────────────────────────────────────────────────────────
// Polished Modal Component (Responsive)
// ───────────────────────────────────────────────────────────────────────────────
const Modal = ({ open, title, children, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4 sm:p-0">
      <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl transform transition-all scale-100 overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto">{children}</div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3 border-t border-gray-100 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-medium transition-colors w-full sm:w-auto"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// ───────────────────────────────────────────────────────────────────────────────
// Main page
// ───────────────────────────────────────────────────────────────────────────────
export default function UserDetails() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* filters & pagination */
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);

  /* modal state */
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDel, setShowDel] = useState(false);
  const [selection, setSelection] = useState(null);

  /* new / edit form state  */
  const initialForm = {
    username: "",
    email: "",
    password: "",
    isAdmin: false,
    isActive: true,
  };
  const [formData, setFormData] = useState(initialForm);

  // ──────────────────────────────────
  // helper: fetch ALL users
  // ──────────────────────────────────
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token");
      const res = await axios.get(`${SERVER_URL}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      setError("Could not load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ──────────────────────────────────
  // CRUD helpers
  // ──────────────────────────────────
  const saveUser = async (payload, isEdit = false) => {
    try {
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token");
      const url = isEdit
        ? `${SERVER_URL}/api/auth/users/${payload.id}`
        : `${SERVER_URL}/api/auth/signup`;

      const method = isEdit ? "PUT" : "POST";
      await axios({
        url,
        method,
        data: payload,
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(`User ${isEdit ? "updated" : "created"} successfully`);
      setShowAdd(false);
      setShowEdit(false);
      setFormData(initialForm);
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Action failed");
    }
  };

  const deleteUser = async (id) => {
    try {
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token");
      await axios.delete(`${SERVER_URL}/api/auth/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("User deleted");
      setShowDel(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  const toggleUserStatus = async (user) => {
    try {
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token");
      await axios.put(
        `${SERVER_URL}/api/auth/users/${user._id}`,
        { isActive: !user.isActive },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success(`User ${user.isActive ? "deactivated" : "activated"}`);
      fetchUsers();
    } catch (err) {
      toast.error("Status update failed");
    }
  };

  // ──────────────────────────────────
  // derived list (filter + search)
  // ──────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...users];
    if (roleFilter !== "all") {
      list = list.filter((u) => (u.isAdmin ? "admin" : "user") === roleFilter);
    }
    if (search.trim()) {
      const term = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.username.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term),
      );
    }
    return list;
  }, [users, roleFilter, search]);

  // pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  // counts
  const totalAdmins = users.filter((u) => u.isAdmin).length;

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[50vh] text-green-600">
        <ClipLoader color="#16a34a" size={40} />
        <p className="mt-4 text-sm font-medium text-gray-500 animate-pulse">
          Loading user directory...
        </p>
      </div>
    );
  }

  if (error)
    return (
      <div className="p-8 text-center min-h-[50vh] flex flex-col justify-center items-center">
        <div className="inline-block p-4 bg-red-50 rounded-full mb-3">
          <ShieldAlert className="text-red-500" size={32} />
        </div>
        <p className="text-red-600 font-medium">{error}</p>
        <button
          onClick={fetchUsers}
          className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    );

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {" "}
      {/* Extra padding bottom for mobile fab clearance if needed */}
      {/* Header + Stats */}
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <div className="flex items-center gap-3 mt-1.5 overflow-x-auto">
            <span className="text-sm text-gray-500 whitespace-nowrap">
              Total: <strong className="text-gray-900">{users.length}</strong>
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            <span className="text-sm text-gray-500 whitespace-nowrap">
              Admins: <strong className="text-purple-600">{totalAdmins}</strong>
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
          {/* Search */}
          <div className="relative w-full md:w-auto">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Search users..."
              className="w-full md:w-64 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all shadow-sm"
            />
          </div>

          <div className="flex gap-3">
            {/* Filter */}
            <div className="relative flex-1 md:flex-none">
              <Filter
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full md:w-40 border border-gray-200 rounded-xl pl-9 pr-8 py-2.5 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none appearance-none bg-white shadow-sm cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admins</option>
                <option value="user">Agents</option>
              </select>
            </div>

            {/* Add Button */}
            <button
              onClick={() => {
                setShowAdd(true);
                setFormData(initialForm);
              }}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl shadow-lg shadow-green-900/20 transition-all active:scale-95 whitespace-nowrap"
            >
              <Plus size={18} />
              <span>Add User</span>
            </button>
          </div>
        </div>
      </div>
      {/* ─────────────────────────── */}
      {/* MOBILE CARD VIEW (< md)     */}
      {/* ─────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {paginated.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
            <p className="text-gray-500 text-sm">
              No users found matching your search.
            </p>
          </div>
        ) : (
          paginated.map((u) => (
            <div
              key={u._id}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${u.isAdmin ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700"}`}
                  >
                    {u.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {u.username}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Mail size={12} />
                      <span className="truncate max-w-[150px]">{u.email}</span>
                    </div>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-lg text-[10px] uppercase font-bold tracking-wide border ${u.isAdmin ? "bg-purple-50 text-purple-700 border-purple-100" : "bg-blue-50 text-blue-700 border-blue-100"}`}
                >
                  {u.isAdmin ? "ADMIN" : "AGENT"}
                </span>
              </div>

              <div className="flex justify-between items-center mt-2 px-1">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  {u.isActive ? (
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  )}
                  {u.isActive ? "Active Account" : "Deactivated"}
                </div>
                <button
                  onClick={() => toggleUserStatus(u)}
                  className={`text-xs font-semibold px-2 py-1 rounded transition-colors ${u.isActive ? "text-red-600 bg-red-50 hover:bg-red-100" : "text-green-600 bg-green-50 hover:bg-green-100"}`}
                >
                  {u.isActive ? "Deactivate" : "Activate"}
                </button>
              </div>

              <div className="border-t border-gray-50 pt-3 flex gap-2">
                <button
                  onClick={() => {
                    setSelection(u);
                    setFormData({ ...u, password: "" });
                    setShowEdit(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button
                  onClick={() => {
                    setSelection(u);
                    setShowDel(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-100 transition-colors"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      {/* ─────────────────────────── */}
      {/* DESKTOP TABLE VIEW (>= md)  */}
      {/* ─────────────────────────── */}
      <div className="hidden md:block bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  User Profile
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Email Address
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Access Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-12">
                    <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                      <User className="text-gray-400" size={24} />
                    </div>
                    <p className="text-gray-500 font-medium">No users found.</p>
                    <p className="text-gray-400 text-sm">
                      Try adjusting your filters.
                    </p>
                  </td>
                </tr>
              ) : (
                paginated.map((u) => (
                  <tr
                    key={u._id}
                    className="hover:bg-gray-50/80 transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${u.isAdmin ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700"}`}
                        >
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {u.username}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {u.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                          u.isAdmin
                            ? "bg-purple-50 text-purple-700 border-purple-100"
                            : "bg-blue-50 text-blue-700 border-blue-100"
                        }`}
                      >
                        {u.isAdmin ? (
                          <ShieldCheck size={12} />
                        ) : (
                          <User size={12} />
                        )}
                        {u.isAdmin ? "Administrator" : "Sales Agent"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>{" "}
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>{" "}
                            Inactive
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => toggleUserStatus(u)}
                          className={`p-2 rounded-lg transition-colors ${u.isActive ? "text-gray-400 hover:text-red-600 hover:bg-red-50" : "text-gray-400 hover:text-green-600 hover:bg-green-50"}`}
                          title={
                            u.isActive ? "Deactivate User" : "Activate User"
                          }
                        >
                          {u.isActive ? (
                            <ToggleRight size={16} className="text-green-500" />
                          ) : (
                            <ToggleLeft size={16} className="text-red-500" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSelection(u);
                            setFormData({ ...u, password: "" });
                            setShowEdit(true);
                          }}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit User"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setSelection(u);
                            setShowDel(true);
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="bg-white md:bg-gray-50 border md:border-t border-gray-200 md:border-gray-200 rounded-xl md:rounded-none px-6 py-4 flex items-center justify-between shadow-sm md:shadow-none">
          <p className="text-sm text-gray-500">
            Page{" "}
            <span className="font-medium text-gray-900">{currentPage}</span> of{" "}
            <span className="font-medium">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="p-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="p-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* ADD user modal                                                       */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <Modal
        open={showAdd}
        title="Create New Account"
        onClose={() => setShowAdd(false)}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveUser(formData, false);
          }}
          className="space-y-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <input
                required
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full border border-gray-300 px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                placeholder="e.g. jdoe"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full border border-gray-300 px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                placeholder="user@example.com"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full border border-gray-300 px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() =>
                setFormData({ ...formData, isAdmin: !formData.isAdmin })
              }
            >
              <div
                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.isAdmin ? "bg-green-600 border-green-600" : "bg-white border-gray-300"}`}
              >
                {formData.isAdmin && <User size={12} className="text-white" />}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Grant Admin Privileges
                </p>
                <p className="text-xs text-gray-500">
                  User is an administrator.
                </p>
              </div>
            </div>
            <div
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() =>
                setFormData({ ...formData, isActive: !formData.isActive })
              }
            >
              <div
                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.isActive ? "bg-green-600 border-green-600" : "bg-white border-gray-300"}`}
              >
                {formData.isActive && <User size={12} className="text-white" />}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Account Active
                </p>
                <p className="text-xs text-gray-500">Allow login access.</p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-green-900/10 transition-all active:scale-95"
          >
            Create User
          </button>
        </form>
      </Modal>
      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* EDIT user modal                                                      */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <Modal
        open={showEdit}
        title={`Edit Profile: ${selection?.username || ""}`}
        onClose={() => setShowEdit(false)}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveUser({ ...formData, id: selection._id }, true);
          }}
          className="space-y-5"
        >
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Username
            </label>
            <input
              required
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className="w-full border border-gray-300 px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full border border-gray-300 px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              New Password{" "}
              <span className="normal-case font-normal text-gray-400">
                (optional)
              </span>
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full border border-gray-300 px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
              placeholder="Leave blank to keep current"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() =>
                setFormData({ ...formData, isAdmin: !formData.isAdmin })
              }
            >
              <div
                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.isAdmin ? "bg-green-600 border-green-600" : "bg-white border-gray-300"}`}
              >
                {formData.isAdmin && <User size={12} className="text-white" />}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Grant Admin Privileges
                </p>
                <p className="text-xs text-gray-500">
                  User is an administrator.
                </p>
              </div>
            </div>
            <div
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() =>
                setFormData({ ...formData, isActive: !formData.isActive })
              }
            >
              <div
                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.isActive ? "bg-green-600 border-green-600" : "bg-white border-gray-300"}`}
              >
                {formData.isActive && <User size={12} className="text-white" />}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Account Active
                </p>
                <p className="text-xs text-gray-500">Allow login access.</p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-yellow-900/10 transition-all active:scale-95"
          >
            Update Profile
          </button>
        </form>
      </Modal>
      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* DELETE confirm modal                                                 */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <Modal
        open={showDel}
        title="Delete User"
        onClose={() => setShowDel(false)}
      >
        <div className="text-center py-4">
          <div className="mx-auto w-14 h-14 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert size={28} />
          </div>
          <p className="text-gray-600 mb-6 px-4 leading-relaxed">
            Are you sure you want to delete the account for <br />
            <strong className="text-gray-900 text-lg">
              {selection?.username}
            </strong>
            ?
            <span className="block text-xs text-red-500 mt-2">
              This action cannot be undone.
            </span>
          </p>

          <button
            onClick={() => deleteUser(selection._id)}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-red-900/20 transition-all active:scale-95"
          >
            Confirm Deletion
          </button>
        </div>
      </Modal>
    </div>
  );
}
