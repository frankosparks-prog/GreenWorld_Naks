import React, { useEffect, useState, useMemo } from "react";
import {
  Download,
  RefreshCcw,
  Calendar,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Award,
  User,
  Package,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import { saveAs } from "file-saver";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const ITEMS_PER_PAGE = 10;

function ManageSales() {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [distributors, setDistributors] = useState([]);

  // Filter States
  const [filterType, setFilterType] = useState("all");
  const [filterValue, setFilterValue] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ Fetch all sales
  const fetchSales = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/sales`);
      const data = await res.json();
      if (res.ok) {
        setSales(data);
        setFilteredSales(data);
        toast.success("Sales refreshed!");
      } else {
        toast.error(data.error || "Failed to fetch sales");
      }
    } catch (err) {
      toast.error("Server error while fetching sales.");
    }
  };

  // ✅ Fetch distributors for dropdown
  const fetchDistributors = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/distributors`);
      const data = await res.json();
      if (res.ok) setDistributors(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSales();
    fetchDistributors();
  }, []);

  // ✅ Filtering logic
  useEffect(() => {
    let results = [...sales];

    if (filterType === "distributor" && filterValue) {
      results = results.filter(
        (s) => s.distributor?.name?.toLowerCase() === filterValue.toLowerCase(),
      );
    } else if (filterType === "product" && filterValue) {
      results = results.filter((s) =>
        s.product?.toLowerCase().includes(filterValue.toLowerCase()),
      );
    }

    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);

      if (from <= to) {
        results = results.filter((s) => {
          const saleDate = new Date(s.createdAt);
          return saleDate >= from && saleDate <= to;
        });
      }
    }

    setFilteredSales(results);
    setCurrentPage(1);
  }, [filterType, filterValue, fromDate, toDate, sales]);

  // ✅ Calculate Pagination
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = filteredSales.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSales.length / ITEMS_PER_PAGE);

  // ✅ Calculate totals
  const totalBV = useMemo(
    () => filteredSales.reduce((sum, s) => sum + (s.totalBV || 0), 0),
    [filteredSales],
  );

  const totalP = useMemo(
    () => filteredSales.reduce((sum, s) => sum + (s.totalPrice || 0), 0),
    [filteredSales],
  );

  // ✅ Export as CSV
  const handleExportCSV = () => {
    if (!filteredSales.length) return toast.error("No data to export.");

    const headers = [
      "Distributor",
      "Product",
      "Quantity",
      "Total Price",
      "Total BV",
      "Date",
    ];
    const rows = filteredSales.map((s) => [
      s.distributor?.name || "N/A",
      s.product,
      s.quantity,
      s.totalPrice,
      s.bv,
      new Date(s.createdAt).toLocaleString(),
    ]);

    rows.push([]);
    rows.push(["", "", "TOTALS:", totalP, totalBV, ""]);

    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "sales_report.csv");
    toast.success("Sales exported as CSV!");
  };

  return (
    <div className="space-y-6 px-4 pb-20 md:px-0 md:pb-0">
      {/* Added px-4 for mobile spacing and pb-20 to prevent content cutoff at bottom on mobile */}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
            Sales Records
            <button
              onClick={fetchSales}
              className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-all text-gray-500 hover:text-green-600"
              title="Refresh Data"
            >
              <RefreshCcw size={16} />
            </button>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View and filter transaction history.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-lg shadow-green-900/10 transition-all active:scale-95 text-sm"
        >
          <Download size={18} />
          Export Report
        </button>
      </div>

      {/* Filters Toolbar - Stacked on Mobile, Row on Desktop */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col lg:flex-row gap-4 items-center">
        {/* Filter Type & Value */}
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:flex-1">
          <div className="relative w-full sm:w-[150px]">
            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <select
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none appearance-none"
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setFilterValue("");
              }}
            >
              <option value="all">All Records</option>
              <option value="distributor">Distributor</option>
              <option value="product">Product</option>
            </select>
          </div>

          <div className="relative w-full sm:flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            {filterType === "distributor" ? (
              <select
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
              >
                <option value="">All Distributors</option>
                {distributors.map((d) => (
                  <option key={d._id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder={
                  filterType === "product"
                    ? "Search product name..."
                    : "Filter not active"
                }
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none disabled:bg-gray-50 disabled:text-gray-400"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                disabled={filterType === "all"}
              />
            )}
          </div>
        </div>

        {/* Date Range - Flexible stack */}
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto bg-gray-50 p-1 rounded-xl border border-gray-200">
          <div className="flex items-center px-3 gap-2 w-full sm:w-auto border-b sm:border-b-0 border-gray-200 pb-1 sm:pb-0">
            <Calendar size={16} className="text-gray-400" />
            <input
              type="date"
              className="bg-transparent text-sm text-gray-600 outline-none w-full sm:w-auto"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <span className="text-gray-300 hidden sm:block">|</span>
          <div className="flex items-center px-3 gap-2 w-full sm:w-auto pt-1 sm:pt-0">
            <input
              type="date"
              className="bg-transparent text-sm text-gray-600 outline-none w-full sm:w-auto"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 🟢 VIEW SWITCHER: Table for Desktop, Cards for Mobile */}

      {/* 1. DESKTOP VIEW (Hidden on mobile) */}
      <div className="hidden md:block bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Distributor
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Price (Total)
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Qty
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  BV (Total)
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <p className="text-gray-500 font-medium">No sales found.</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Try adjusting your filters.
                    </p>
                  </td>
                </tr>
              ) : (
                currentItems.map((s) => (
                  <tr
                    key={s._id}
                    className="hover:bg-green-50/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {s.distributor?.name || "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Package size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {s.product}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {s.totalPrice?.toLocaleString()} KES
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {s.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-green-700">
                        {s.totalBV}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">
                          {new Date(s.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-[11px] text-gray-400 mt-0.5">
                          {new Date(s.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. MOBILE CARD VIEW (Hidden on desktop) */}
      <div className="md:hidden space-y-4">
        {currentItems.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 font-medium">No sales found.</p>
          </div>
        ) : (
          currentItems.map((s) => (
            <div
              key={s._id}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-50 rounded-lg text-green-600">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {s.distributor?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(s.createdAt).toLocaleDateString()} •{" "}
                      {new Date(s.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {s.totalPrice?.toLocaleString()} KES
                </span>
              </div>

              <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 flex items-center gap-2">
                    <Package size={14} /> Product
                  </span>
                  <span className="font-medium text-gray-700 truncate max-w-[150px]">
                    {s.product}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 flex items-center gap-2">
                    <layers size={14} /> Quantity
                  </span>
                  <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium">
                    {s.quantity}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 flex items-center gap-2">
                    <Award size={14} /> BV Points
                  </span>
                  <span className="text-green-600 font-bold">{s.totalBV}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination - Simplified for Mobile */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <p className="text-sm text-gray-500 order-2 sm:order-1 text-center sm:text-left">
            Page <span className="font-medium">{currentPage}</span> of{" "}
            <span className="font-medium">{totalPages}</span>
          </p>
          <div className="flex gap-2 order-1 sm:order-2 w-full sm:w-auto justify-center">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="flex-1 sm:flex-none p-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
            >
              <ChevronLeft size={16} />{" "}
              <span className="ml-1 sm:hidden text-sm">Prev</span>
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="flex-1 sm:flex-none p-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
            >
              <span className="mr-1 sm:hidden text-sm">Next</span>{" "}
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Footer Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg text-green-600">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">
                Total Revenue
              </p>
              <p className="text-xs md:text-sm text-gray-400">
                Based on filtered selection
              </p>
            </div>
          </div>
          <p className="text-lg md:text-xl font-bold text-gray-900 text-right">
            {totalP.toLocaleString()}{" "}
            <span className="text-sm font-normal text-gray-500 block md:inline">
              KES
            </span>
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <Award size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">
                Total BV
              </p>
              <p className="text-xs md:text-sm text-gray-400">Points Awarded</p>
            </div>
          </div>
          <p className="text-lg md:text-xl font-bold text-gray-900">
            {totalBV.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ManageSales;
