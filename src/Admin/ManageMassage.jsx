import React, { useEffect, useState, useMemo } from "react";
import { Trash2, Calendar, Sparkles, User, RefreshCcw } from "lucide-react";
import toast from "react-hot-toast";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

function ManageMassage() {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState("All");

  // Fetch Records
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${SERVER_URL}/api/massage`);
      const data = await res.json();
      if (res.ok) {
        setRecords(data);
        setFilteredRecords(data);
      } else {
        toast.error("Failed to load records");
      }
    } catch {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // (Removed JS mobile detection - using CSS breakpoints instead)

  // Filter Logic
  useEffect(() => {
    if (filterType === "All") {
      setFilteredRecords(records);
    } else {
      setFilteredRecords(records.filter((r) => r.serviceType === filterType));
    }
  }, [filterType, records]);

  // Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;
    try {
      await fetch(`${SERVER_URL}/api/massage/${id}`, { method: "DELETE" });
      toast.success("Record deleted");
      fetchRecords();
    } catch {
      toast.error("Delete failed");
    }
  };

  // Calculations
  const totalRevenue = useMemo(
    () => filteredRecords.reduce((sum, r) => sum + r.price, 0),
    [filteredRecords]
  );

  return (
    <div className="space-y-6 px-4 pb-20 md:px-0 md:pb-0 min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles size={24} className="text-purple-600" /> Massage & Therapy
            Records
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track wellness service performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase">
              Total Revenue
            </span>
            <span className="font-bold text-green-600">
              {totalRevenue.toLocaleString()} KES
            </span>
          </div>
          <button
            onClick={fetchRecords}
            className="p-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors"
          >
            <RefreshCcw
              size={18}
              className={`text-gray-500 ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {["All", "Full Body Massage", "Half Body Massage", "Pedicure"].map(
          (type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-1 md:px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filterType === type
                  ? "bg-purple-600 text-white shadow-md shadow-purple-200"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {type}
            </button>
          )
        )}
      </div>

      {/* Table / Mobile cards (use CSS breakpoints like ManageSales) */}
      {/* Desktop table (hidden on mobile) */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Service
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Agent
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-gray-500">
                    No records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr
                    key={r._id}
                    className="hover:bg-purple-50/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">
                        {r.serviceType}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-green-700">
                      {r.price.toLocaleString()} KES
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User size={14} className="text-gray-400" />
                        {r.salesAgent?.username || "Unknown"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        {new Date(r.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(r._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile card view (hidden on desktop) */}
      <div className="md:hidden space-y-4">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 font-medium">No records found.</p>
          </div>
        ) : (
          filteredRecords.map((r) => (
            <div
              key={r._id}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 w-[22rem] md:w-0"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {r.serviceType}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <Calendar size={12} />{" "}
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-sm font-bold text-green-700">
                  {(r.price || 0).toLocaleString()} KES
                </div>
              </div>
              <div className="border-t border-gray-100 pt-3 flex flex-col gap-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 flex items-center gap-2">
                    <User size={14} /> Agent
                  </span>
                  <span className="text-gray-700 truncate max-w-[160px]">
                    {r.salesAgent?.username || "Unknown"}
                  </span>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => handleDelete(r._id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ManageMassage;
