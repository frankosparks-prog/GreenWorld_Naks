import React, { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  DollarSign,
  Save,
  Loader2,
  Footprints,
  User,
  History,
  Calendar,
  Stethoscope, // ✅ Added icon for Screening
} from "lucide-react";
import toast from "react-hot-toast";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

// ✅ Added Screening to the list
const services = [
  {
    id: "Full Body Massage",
    label: "Full Body Massage",
    range: "1300 - 1500",
    min: 1300,
    max: 1500,
    icon: <User size={20} />,
  },
  {
    id: "Half Body Massage",
    label: "Half Body Massage",
    range: "800",
    min: 800,
    max: 1000,
    icon: <User size={20} />,
  },
  {
    id: "Pedicure",
    label: "Pedicure",
    range: "800",
    min: 800,
    max: 1000,
    icon: <Footprints size={20} />,
  },
  {
    id: "Screening",
    label: "Wellness Screening",
    range: "2000", // Fixed price display
    min: 2000,
    max: 2000,
    icon: <Stethoscope size={20} />, // Distinct icon
  },
];

function Massage() {
  const [selectedService, setSelectedService] = useState(services[0]);
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const fetchHistory = useCallback(async () => {
    if (!user?.id) return;
    setLoadingHistory(true);
    try {
      const res = await fetch(`${SERVER_URL}/api/massage`);
      const data = await res.json();

      if (res.ok) {
        const myRecords = data.filter((record) => {
          const agentId =
            typeof record.salesAgent === "object"
              ? record.salesAgent._id
              : record.salesAgent;
          return agentId === user.id;
        });
        setHistory(myRecords);
      }
    } catch (error) {
      console.error("Failed to load history");
    } finally {
      setLoadingHistory(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!price) return toast.error("Please enter a price");

    setLoading(true);

    try {
      const res = await fetch(`${SERVER_URL}/api/massage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType: selectedService.id,
          price: Number(price),
          addedBy: user?.id,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Service recorded successfully! 💆‍♀️");
        setPrice("");
        fetchHistory();
      } else {
        toast.error(data.message || "Failed to record.");
      }
    } catch (error) {
      toast.error("Server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pt-24 px-4 sm:px-6 lg:px-8 pb-12">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <Sparkles className="text-emerald-600" size={32} /> Wellness Sales
          </h1>
          <p className="text-gray-500 mt-2">
            Record massage, therapy, and screening sessions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* LEFT COLUMN: Input Form */}
          <div className="space-y-6">
            {/* Service Selection Cards */}
            <div className="grid grid-cols-1 gap-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  onClick={() => {
                    setSelectedService(service);
                    // ✅ Logic: If Screening is clicked, auto-fill 2000. Else clear.
                    if (service.id === "Screening") {
                      setPrice("2000");
                    } else {
                      setPrice("");
                    }
                  }}
                  className={`cursor-pointer p-3 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 ${
                    selectedService.id === service.id
                      ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                      : "border-white bg-white hover:border-emerald-200 text-gray-600"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      selectedService.id === service.id
                        ? "bg-emerald-200"
                        : "bg-gray-100"
                    }`}
                  >
                    {service.icon}
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold text-sm block">
                      {service.label}
                    </span>
                    <span className="text-xs opacity-70">
                      Est: {service.range} KES
                    </span>
                  </div>
                  {selectedService.id === service.id && (
                    <div className="w-3 h-3 bg-emerald-600 rounded-full"></div>
                  )}
                </div>
              ))}
            </div>

            {/* Amount Input Form */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Selected Service
                    </label>
                    <div className="text-base font-bold text-gray-800">
                      {selectedService.label}
                    </div>
                  </div>
                  <Sparkles className="text-emerald-300" size={24} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Sale Amount (KES)
                  </label>
                  <div className="relative">
                    <DollarSign
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder={`e.g. ${selectedService.min}`}
                      className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-lg font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-purple-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-purple-900/10 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <Save size={20} />
                  )}
                  Record Sale
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN: History Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full min-h-[400px]">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <History size={18} className="text-emerald-600" /> My Recent
                Sales
              </h3>
              <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                {history.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[600px] p-0">
              {loadingHistory ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                  <Loader2 className="animate-spin mb-2" size={24} />
                  <p className="text-xs">Loading history...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                  <p className="text-sm">No records found yet.</p>
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Service</th>
                      <th className="px-4 py-3 font-semibold">Price</th>
                      <th className="px-4 py-3 font-semibold text-right">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {history.map((record) => (
                      <tr
                        key={record._id}
                        className="hover:bg-emerald-50/30 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {record.serviceType}
                        </td>
                        <td className="px-4 py-3 font-bold text-green-600">
                          {record.price}
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-gray-500">
                          <div className="flex items-center justify-end gap-1">
                            <Calendar size={12} />
                            {new Date(record.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Massage;
