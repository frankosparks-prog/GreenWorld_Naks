import React, { useEffect, useState } from "react";
import { Package, ShoppingBag, Users, Award, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const Home = () => {
  const [stats, setStats] = useState({
    totalStock: 0,
    totalSales: 0,
    totalDistributors: 0,
    totalBV: 0,
  });
  const [loading, setLoading] = useState(true);

  // ✅ Fetch Summary Data from Backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stockRes, salesRes, distRes] = await Promise.all([
          fetch(`${SERVER_URL}/api/stock`),
          fetch(`${SERVER_URL}/api/sales`),
          fetch(`${SERVER_URL}/api/distributors`),
        ]);

        const [stockData, salesData, distData] = await Promise.all([
          stockRes.json(),
          salesRes.json(),
          distRes.json(),
        ]);

        if (!stockRes.ok || !salesRes.ok || !distRes.ok) {
          throw new Error("Failed to load dashboard data");
        }

        // 🧮 Calculate Totals
        const totalStock = stockData.reduce(
          (acc, item) => acc + (item.quantity || 0),
          0,
        );
        const totalSales = salesData.length;
        const totalDistributors = distData.length;

        // ✅ Correct Total BV (from all sales totalBV)
        const totalBV = salesData.reduce(
          (acc, sale) => acc + (sale.totalBV || 0),
          0,
        );

        setStats({ totalStock, totalSales, totalDistributors, totalBV });
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    {
      title: "Total Stock Items",
      value: stats.totalStock,
      icon: <Package className="w-6 h-6 text-emerald-600" />,
      bg: "bg-emerald-50 border-emerald-100",
      text: "text-emerald-600",
    },
    {
      title: "Sales Transactions",
      value: stats.totalSales,
      icon: <ShoppingBag className="w-6 h-6 text-blue-600" />,
      bg: "bg-blue-50 border-blue-100",
      text: "text-blue-600",
    },
    {
      title: "Active Distributors",
      value: stats.totalDistributors,
      icon: <Users className="w-6 h-6 text-yellow-600" />,
      bg: "bg-yellow-50 border-yellow-100",
      text: "text-yellow-600",
    },
    {
      title: "Total BV Awarded",
      value: stats.totalBV,
      icon: <Award className="w-6 h-6 text-purple-600" />,
      bg: "bg-purple-50 border-purple-100",
      text: "text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-gray-500 mt-1">
              Welcome to the Green World Stock & Sales System.
            </p>
          </div>
          <div className="hidden md:block">
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800 shadow-sm border border-emerald-200/50">
              🟢 System Operational
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 bg-white rounded-2xl shadow-sm border border-gray-100">
            <Loader2 className="animate-spin w-10 h-10 text-emerald-600 mb-3" />
            <p className="text-gray-500 font-medium animate-pulse">
              Synchronizing live data...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {stat.title}
                    </p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-2 tracking-tight">
                      {stat.value.toLocaleString()}
                    </h3>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bg} ${stat.text}`}>
                    {stat.icon}
                  </div>
                </div>
                {/* Decorative bottom fade */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        )}

        {/* System Info / Overview Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-100 rounded-lg shadow-sm border border-emerald-200/50">
                <Award className="h-6 w-6 text-emerald-700" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Performance Insights
              </h2>
            </div>

            <div className="prose prose-green max-w-none text-gray-600">
              <p className="leading-relaxed mb-4">
                The{" "}
                <span className="font-semibold text-emerald-700">
                  Green World Nakuru Branch
                </span>{" "}
                system centralizes your medicinal product inventory. Use this
                dashboard to monitor stock depletion rates and ensure BV points
                are accurately distributed to your sales agents.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Inventory Tracking
                  </h4>
                  <p className="text-sm text-gray-500">
                    Real-time updates on stock levels to prevent shortages.
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    BV Automation
                  </h4>
                  <p className="text-sm text-gray-500">
                    Automatic calculation of Bonus Value for every sale.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions / Side Panel (Optional Placeholder for UX balance) */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl shadow-lg shadow-emerald-700/20 p-8 text-white flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Branch Status</h3>
              <p className="text-emerald-100 opacity-90">
                Your system is currently running efficiently. All transactions
                are being recorded securely.
              </p>
            </div>
            <div className="mt-8 pt-8 border-t border-white/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-100">
                  Server Connection
                </span>
                <span className="flex items-center gap-2 text-sm font-bold">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
