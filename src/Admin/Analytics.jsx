import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TrendingUp,
  DollarSign,
  PackageSearch,
  Activity,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingDown,
} from "lucide-react";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const StatCard = ({ title, value, icon, bgClass, textClass, subtitle }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start justify-between relative overflow-hidden group">
    <div className="z-10">
      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
        {title}
      </p>
      <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
      {subtitle && (
        <p className="text-xs font-medium text-gray-400">{subtitle}</p>
      )}
    </div>
    <div
      className={`p-4 rounded-xl ${bgClass} ${textClass} z-10 transition-transform group-hover:scale-110 duration-300`}
    >
      {icon}
    </div>
    <div
      className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full ${bgClass} opacity-20 group-hover:scale-150 transition-transform duration-500`}
    ></div>
  </div>
);

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token =
          localStorage.getItem("adminToken") || localStorage.getItem("token");
        const res = await axios.get(`${SERVER_URL}/api/analytics/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        console.error("Failed to load analytics", err);
        setError("Failed to load analytics data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col h-[80vh] items-center justify-center text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Oops! Something went wrong.
        </h2>
        <p className="text-gray-500">{error || "Could not fetch data"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">
          Overview of sales performance, inventory status, and recent activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Actual Revenue"
          value={`KSh ${data.actualRevenue.toLocaleString()}`}
          subtitle={`Total Expected: KSh ${data.totalRevenue.toLocaleString()}`}
          icon={<DollarSign size={24} />}
          bgClass="bg-emerald-50"
          textClass="text-emerald-600"
        />
        <StatCard
          title="Pending Debt"
          value={`KSh ${data.pendingDebt.toLocaleString()}`}
          subtitle="Awaiting payment"
          icon={<AlertCircle size={24} />}
          bgClass="bg-red-50"
          textClass="text-red-600"
        />
        <StatCard
          title="Total BV"
          value={data.totalBV.toLocaleString()}
          subtitle="Bonus value points"
          icon={<Activity size={24} />}
          bgClass="bg-blue-50"
          textClass="text-blue-600"
        />
        <StatCard
          title="Total Sales Volume"
          value={data.totalQuantitySold.toLocaleString()}
          subtitle="Items sold"
          icon={<TrendingUp size={24} />}
          bgClass="bg-purple-50"
          textClass="text-purple-600"
        />
        <StatCard
          title="Stock Inventory"
          value={data.totalStockItems.toLocaleString()}
          subtitle="Items in stock"
          icon={<PackageSearch size={24} />}
          bgClass="bg-amber-50"
          textClass="text-amber-600"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Selling Products */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Top Selling Products
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Ranked by quantity sold
              </p>
            </div>
            <div className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm text-gray-500">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                    Items Sold
                  </th>
                  <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                    Revenue
                  </th>
                  <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                    BV Points
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.topProducts.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            i === 0
                              ? "bg-amber-100 text-amber-700"
                              : i === 1
                                ? "bg-gray-200 text-gray-700"
                                : i === 2
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {i + 1}
                        </span>
                        <span className="font-medium text-gray-900">
                          {p._id}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center text-sm text-gray-600 font-medium">
                      {p.quantitySold.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-center text-sm font-semibold text-emerald-600">
                      KSh {p.revenue.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-center text-sm text-blue-600 font-medium">
                      {p.bv.toLocaleString()}
                    </td>
                  </tr>
                ))}
                {data.topProducts.length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="py-8 text-center text-sm text-gray-500"
                    >
                      No sales data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Low Stock Alerts */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col max-h-[400px]">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-red-50/30">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle size={18} />
                <h2 className="text-sm font-bold">Low Stock Alerts</h2>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                {data.lowStock.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {data.lowStock.length > 0 ? (
                <div className="space-y-2">
                  {data.lowStock.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-3 rounded-xl bg-gray-50 border border-gray-100"
                    >
                      <p className="font-medium text-sm text-gray-800 line-clamp-1">
                        {item.name}
                      </p>
                      <span className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-bold">
                        {item.quantity} left
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center flex flex-col items-center justify-center h-full text-gray-400">
                  <PackageSearch size={32} className="mb-2 text-gray-300" />
                  <p className="text-sm font-medium">No low stock items!</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Sales Activity */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col flex-1">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
              <Clock size={18} className="text-blue-500" />
              <h2 className="text-sm font-bold text-gray-800">Recent Sales</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
              {data.recentSales.map((sale, idx) => (
                <div
                  key={idx}
                  className="relative pl-4 border-l-2 border-blue-100 pb-1 last:pb-0 last:border-transparent group"
                >
                  <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-blue-400 ring-4 ring-white group-hover:bg-blue-600 transition-colors"></div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-xs text-gray-500 font-medium">
                        {new Date(sale.createdAt).toLocaleDateString()} at{" "}
                        {new Date(sale.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        sale.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' :
                        sale.paymentStatus === 'Not Paid' ? 'bg-red-100 text-red-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {sale.paymentStatus || 'Paid'}
                      </span>
                    </div>
                  <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl hover:bg-white hover:border-blue-100 hover:shadow-sm transition-all duration-200 cursor-default">
                    <p className="text-sm font-semibold text-gray-900">
                      {sale.quantity}x {sale.product}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-500">
                        Dist:{" "}
                        <span className="font-medium text-gray-700">
                          {sale.distributor?.name || "Unknown"}
                        </span>
                      </p>
                      <div className="flex flex-col items-end">
                        <p className={`text-xs font-bold ${sale.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-gray-900'}`}>
                          KSh {sale.totalPrice?.toLocaleString()}
                        </p>
                        {sale.paymentStatus !== 'Paid' && sale.balance > 0 && (
                          <p className="text-[10px] font-bold text-red-500">
                            Bal: {sale.balance.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {data.recentSales.length === 0 && (
                <div className="text-center text-gray-400 py-6 text-sm">
                  No recent sales activity.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
