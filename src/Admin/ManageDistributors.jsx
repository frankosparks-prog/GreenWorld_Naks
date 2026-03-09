import React, { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCcw,
  Search,
  User,
  Phone,
  Hash,
  Calendar,
  Flag,
  Users,
  Save,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

function ManageDistributors() {
  const [distributors, setDistributors] = useState([]);
  const [filteredDistributors, setFilteredDistributors] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    dor: "",
    phone: "",
    gender: "",
    idNumber: "",
    nationality: "",
    otherNationality: "",
    amount: 1500,
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 6;

  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentRecords = filteredDistributors.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredDistributors.length / recordsPerPage);

  // ✅ Fetch Distributors
  const fetchDistributors = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${SERVER_URL}/api/distributors`);
      const data = await res.json();
      if (res.ok) {
        setDistributors(data);
        setFilteredDistributors(data);
      } else toast.error(data.error || "Failed to load distributors.");
    } catch {
      toast.error("Server error while fetching distributors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistributors();
  }, []);

  // ✅ Filter/Search
  useEffect(() => {
    const filtered = distributors.filter(
      (d) =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.phone.toString().includes(searchTerm) ||
        d.nationality.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredDistributors(filtered);
    setCurrentPage(1);
  }, [searchTerm, distributors]);

  // ✅ Handle Input Change
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // ✅ Validate Form
  const validateForm = () => {
    const phoneRegex = /^[0-9]{10,}$/;
    if (!formData.name.trim()) return "Full Name is required.";
    if (!phoneRegex.test(formData.phone))
      return "Phone must contain at least 10 digits.";
    if (!formData.gender) return "Gender is required.";
    if (!formData.nationality) return "Nationality is required.";
    if (formData.nationality === "Other" && !formData.otherNationality.trim())
      return "Please specify the other nationality.";
    return null;
  };

  // ✅ Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) return toast.error(error);

    const nationalityToSave =
      formData.nationality === "Other"
        ? formData.otherNationality
        : formData.nationality;

    const payload = { ...formData, nationality: nationalityToSave };
    delete payload.otherNationality;

    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `${SERVER_URL}/api/distributors/${editingId}`
      : `${SERVER_URL}/api/distributors`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(
          editingId
            ? "Distributor updated successfully!"
            : "Distributor added successfully!",
        );
        resetForm();
        fetchDistributors();
      } else toast.error(data.error || "Failed to save distributor.");
    } catch {
      toast.error("Server error while saving distributor.");
    }
  };

  // ✅ Edit Mode
  const handleEdit = (distributor) => {
    setFormData({
      ...distributor,
      otherNationality: distributor.nationality,
      amount: distributor.amount || 1500,
    });
    setEditingId(distributor._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast("Editing mode activated ✏️");
  };

  // ✅ Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this distributor?"))
      return;
    try {
      const res = await fetch(`${SERVER_URL}/api/distributors/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Distributor deleted successfully!");
        fetchDistributors();
      } else toast.error(data.error || "Failed to delete.");
    } catch {
      toast.error("Server error while deleting distributor.");
    }
  };

  // ✅ Reset
  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      dob: "",
      dor: "",
      phone: "",
      gender: "",
      idNumber: "",
      nationality: "",
      otherNationality: "",
      amount: 1500,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users size={28} className="text-green-600" /> Distributor
            Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Register and manage sales agents and distributors.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search distributors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ➕ Left Column: Add/Edit Form */}
        <div className="lg:col-span-1">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-6"
          >
            <div className="bg-gray-50 px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                {editingId ? (
                  <Pencil size={16} className="text-blue-500" />
                ) : (
                  <Plus size={16} className="text-green-500" />
                )}
                {editingId ? "Update Profile" : "Register Distributor"}
              </h3>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  Cancel
                </button>
              )}
            </div>

            <div className="p-5 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. John Doe"
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Phone & ID */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Phone
                  </label>
                  <div className="relative">
                    <Phone
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={14}
                    />
                    <input
                      type="number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="07..."
                      className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    ID Number
                  </label>
                  <div className="relative">
                    <Hash
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={14}
                    />
                    <input
                      type="number"
                      name="idNumber"
                      value={formData.idNumber}
                      onChange={handleChange}
                      placeholder="ID No."
                      className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Amount (fixed) */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Amount (KSh)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    readOnly
                    disabled
                    className="w-full pl-3 pr-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-700"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Reg. Date
                  </label>
                  <input
                    type="date"
                    name="dor"
                    value={formData.dor}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none"
                  />
                </div>
              </div>

              {/* Gender & Nationality */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Nationality
                  </label>
                  <select
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none"
                  >
                    <option value="">Select</option>
                    <option value="Kenyan">Kenyan</option>
                    <option value="Ugandan">Ugandan</option>
                    <option value="Tanzanian">Tanzanian</option>
                    <option value="Rwandan">Rwandan</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {formData.nationality === "Other" && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Specify Nationality
                  </label>
                  <input
                    type="text"
                    name="otherNationality"
                    value={formData.otherNationality}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none"
                  />
                </div>
              )}

              <button
                type="submit"
                className={`w-full py-2.5 rounded-xl text-white font-medium shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 ${
                  editingId
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                }`}
              >
                {editingId ? <Save size={18} /> : <Plus size={18} />}
                {editingId ? "Save Changes" : "Add Distributor"}
              </button>
            </div>
          </form>
        </div>

        {/* 📋 Right Column: List Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Table Header Controls */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-base font-semibold text-gray-800">
                Distributor Directory
              </h2>
              <button
                onClick={fetchDistributors}
                className={`p-2 rounded-full hover:bg-white text-gray-500 hover:text-green-600 transition-all ${
                  loading ? "animate-spin" : ""
                }`}
                title="Refresh List"
              >
                <RefreshCcw size={18} />
              </button>
            </div>

            {loading && filteredDistributors.length === 0 ? (
              <div className="flex flex-col justify-center items-center py-20 text-green-600">
                <Loader2 size={32} className="animate-spin mb-3" />
                <p className="text-sm font-medium text-gray-500">
                  Loading data...
                </p>
              </div>
            ) : currentRecords.length === 0 ? (
              <div className="text-center py-20">
                <Users size={40} className="mx-auto text-gray-200 mb-3" />
                <p className="text-gray-500 font-medium">
                  No distributors found.
                </p>
                <p className="text-sm text-gray-400">
                  Try adding a new one or adjust your search.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Distributor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Dates
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 bg-white">
                      {currentRecords.map((d) => (
                        <tr
                          key={d._id}
                          className="hover:bg-green-50/30 transition-colors group"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">
                                {d.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {d.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                  ID: {d.idNumber || "N/A"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600 flex items-center gap-2">
                              <Phone size={12} className="text-gray-400" />
                              {d.phone}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600 flex items-center gap-1.5">
                                <Flag size={12} /> {d.nationality}
                              </span>
                              <span className="text-xs text-gray-500 pl-4">
                                {d.gender}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-800">
                              {d.amount
                                ? `KSh ${d.amount.toLocaleString()}`
                                : "KSh 1,500"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                            <div
                              className="flex items-center gap-1.5 mb-1"
                              title="Date of Registration"
                            >
                              <Calendar size={12} className="text-green-500" />
                              {d.dor
                                ? new Date(d.dor).toLocaleDateString()
                                : "-"}
                            </div>
                            {d.dob && (
                              <div
                                className="flex items-center gap-1.5"
                                title="Date of Birth"
                              >
                                <span className="w-3 text-center">🎂</span>
                                {new Date(d.dob).toLocaleDateString()}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEdit(d)}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(d._id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-3 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      Showing{" "}
                      <span className="font-medium">{indexOfFirst + 1}</span> -{" "}
                      <span className="font-medium">
                        {Math.min(indexOfLast, filteredDistributors.length)}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium">
                        {filteredDistributors.length}
                      </span>
                    </p>
                    <div className="flex gap-2">
                      <button
                        disabled={currentPage === 1}
                        onClick={() =>
                          setCurrentPage((p) => Math.max(p - 1, 1))
                        }
                        className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        disabled={currentPage === totalPages}
                        onClick={() =>
                          setCurrentPage((p) => Math.min(p + 1, totalPages))
                        }
                        className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageDistributors;
