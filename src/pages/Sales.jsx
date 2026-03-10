import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  ShoppingBag,
  User,
  PlusCircle,
  // Trash2,
  Calculator,
  Loader2,
  Search,
  CircleDollarSign,
  Package,
  Hash,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CreditCard,
  Download,
  Filter,
} from "lucide-react";
import { saveAs } from "file-saver";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const ITEMS_PER_PAGE = 10;

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [stock, setStock] = useState([]);

  // Form State
  const [newSale, setNewSale] = useState({
    distributorId: "",
    product: "",
    quantity: "",
  });

  // Filter States
  const [filterType, setFilterType] = useState("all");
  const [filterValue, setFilterValue] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // General search for the table

  // Loading & Pagination State
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Initial Fetch
  useEffect(() => {
    fetchSales();
    fetchDistributors();
    fetchStock();
  }, []);

  const fetchSales = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/sales`);
      setSales(res.data);
      setFilteredSales(res.data);
    } catch {
      toast.error("Failed to load sales data");
    }
  };

  const fetchDistributors = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/distributors`);
      setDistributors(res.data);
    } catch {
      toast.error("Failed to fetch distributors");
    }
  };

  const fetchStock = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/stock`);
      setStock(res.data);
    } catch {
      toast.error("Failed to fetch stock data");
    }
  };

  const getStockColor = (qty) => {
    if (qty >= 20) return null;
    if (qty > 10 && qty <= 20)
      return "bg-orange-50 text-orange-700 border-orange-100";
    return "bg-red-50 text-red-700 border-red-100";
  };

  // ✅ Advanced Filtering Logic
  useEffect(() => {
    let results = [...sales];

    // 1. Dropdown Filters (Distributor/Product)
    if (filterType === "distributor" && filterValue) {
      results = results.filter(
        (s) => s.distributor?.name?.toLowerCase() === filterValue.toLowerCase(),
      );
    } else if (filterType === "product" && filterValue) {
      results = results.filter((s) =>
        s.product?.toLowerCase().includes(filterValue.toLowerCase()),
      );
    }

    // 2. Date Range Filter
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

    // 3. General Search (Table Search Bar)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (s) =>
          s.distributor?.name?.toLowerCase().includes(query) ||
          s.product?.toLowerCase().includes(query),
      );
    }

    setFilteredSales(results);
    setCurrentPage(1); // Reset pagination on filter change
  }, [filterType, filterValue, fromDate, toDate, searchQuery, sales]);

  // ✅ Pagination Logic
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentSales = filteredSales.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSales.length / ITEMS_PER_PAGE);

  // ✅ Totals Calculation (Based on Filtered Results)
  const totalBVSum = useMemo(
    () => filteredSales.reduce((sum, s) => sum + (s.totalBV || 0), 0),
    [filteredSales],
  );

  const totalRevenue = useMemo(
    () => filteredSales.reduce((sum, s) => sum + (s.totalPrice || 0), 0),
    [filteredSales],
  );

  // ✅ Handle Add Sale
  const handleAddSale = async () => {
    if (!newSale.distributorId || !newSale.product || !newSale.quantity) {
      return toast.error("⚠️ Please fill all fields!");
    }

    const qty = parseInt(newSale.quantity, 10);
    if (isNaN(qty) || qty <= 0) return toast.error("Enter a valid quantity.");

    const selectedProduct = stock.find((p) => p.name === newSale.product);
    if (!selectedProduct) return toast.error("Product not found in stock.");

    if (qty > selectedProduct.quantity)
      return toast.error(`❌ Only ${selectedProduct.quantity} left in stock.`);

    const distributor = distributors.find(
      (d) => d._id === newSale.distributorId,
    );
    if (!distributor) return toast.error("Distributor not found.");

    const isNonMember = distributor.name === "Non-Member";
    // 🛡️ Safety check: default to 0 if price is missing
    const price =
      (isNonMember
        ? selectedProduct.retailPrice
        : selectedProduct.distributorPrice) || 0;

    const totalPrice = price * qty;
    const bv = selectedProduct.bv || 0;
    const totalBV = bv * qty;

    const payload = {
      distributorId: newSale.distributorId,
      product: newSale.product,
      quantity: qty,
      bv,
      totalBV,
      price,
      totalPrice,
    };

    setLoading(true);
    try {
      await axios.post(`${SERVER_URL}/api/sales`, payload);
      await axios.patch(`${SERVER_URL}/api/stock/decrement`, {
        name: newSale.product,
        quantity: qty,
      });

      toast.success("✅ Sale recorded successfully!");
      fetchSales();
      fetchStock();

      const updatedStock = selectedProduct.quantity - qty;
      if (updatedStock <= 0)
        toast.error(`${newSale.product} is now out of stock!`);
      else if (updatedStock <= 5)
        toast(`Low stock: only ${updatedStock} left.`, {
          icon: "⚠️",
          style: { background: "#fff3cd", color: "#856404" },
        });

      setNewSale({ distributorId: "", product: "", quantity: "" });
    } catch (err) {
      console.error("Sale Error:", err);
      toast.error("❌ Failed to record sale.");
    } finally {
      setLoading(false);
    }
  };

  // const handleDelete = async (id) => {
  //   if (window.confirm("Delete this sale?")) {
  //     try {
  //       await axios.delete(`${SERVER_URL}/api/sales/${id}`);
  //       toast.success("Sale deleted!");
  //       fetchSales();
  //     } catch {
  //       toast.error("Failed to delete sale");
  //     }
  //   }
  // };

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
      s.totalPrice || 0,
      s.totalBV || 0,
      new Date(s.createdAt).toLocaleString(),
    ]);

    rows.push([]);
    rows.push(["", "", "TOTALS:", totalRevenue, totalBVSum, ""]);

    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "sales_report.csv");
    toast.success("Report downloaded!");
  };

  // ✅ Safe Calculation Helper
  const calculateTotals = () => {
    if (!newSale.product || !newSale.quantity) return null;

    const qty = parseInt(newSale.quantity, 10);
    if (isNaN(qty) || qty <= 0) return null;

    const selectedProduct = stock.find((p) => p.name === newSale.product);
    if (!selectedProduct) return null;

    const distributor = distributors.find(
      (d) => d._id === newSale.distributorId,
    );

    // 🛡️ Default values to prevent undefined errors
    const isNonMember = distributor?.name === "Non-Member";
    const price =
      (isNonMember
        ? selectedProduct.retailPrice
        : selectedProduct.distributorPrice) || 0;

    return {
      totalPrice: price * qty,
      totalBV: (selectedProduct.bv || 0) * qty,
      pricePerUnit: price,
    };
  };

  const currentTotals = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-50/50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="text-emerald-600" size={28} /> Sales
              Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Record transactions and analyze performance.
            </p>
          </div>

          <div className="flex gap-3">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <Calculator size={20} className="text-emerald-700" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">
                  Total BV Awarded
                </p>
                {/* ✅ Uses optional chaining for safety */}
                <p className="text-lg font-bold text-gray-900 leading-none">
                  {totalBVSum?.toLocaleString() || "0"}
                </p>
              </div>
            </div>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-500/20 text-white px-4 py-2 rounded-xl font-medium shadow-sm transition-all"
            >
              <Download size={18} /> Export
            </button>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col lg:flex-row gap-4 items-center">
          {/* Filter Controls */}
          <div className="flex flex-1 gap-2 w-full">
            <div className="relative min-w-[140px]">
              <Filter
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <select
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
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
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              {filterType === "distributor" ? (
                <select
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
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
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none disabled:bg-gray-50 disabled:text-gray-400"
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  disabled={filterType === "all"}
                />
              )}
            </div>
          </div>

          {/* Date Filters */}
          <div className="flex items-center gap-2 w-full lg:w-auto bg-gray-50 p-1 rounded-xl border border-gray-200">
            <div className="flex items-center px-3 gap-2">
              <Calendar size={16} className="text-gray-400" />
              <input
                type="date"
                className="bg-transparent text-sm text-gray-600 outline-none"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <span className="text-gray-300">|</span>
            <div className="flex items-center px-3 gap-2">
              <input
                type="date"
                className="bg-transparent text-sm text-gray-600 outline-none"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                  <PlusCircle size={18} className="text-emerald-600" /> Record
                  New Transaction
                </h2>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-500">
                      Distributor
                    </label>
                    <div className="relative">
                      <User
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={16}
                      />
                      <select
                        value={newSale.distributorId}
                        onChange={(e) =>
                          setNewSale({
                            ...newSale,
                            distributorId: e.target.value,
                          })
                        }
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm outline-none appearance-none"
                      >
                        <option value="">Select Distributor...</option>
                        {distributors.map((d) => (
                          <option key={d._id} value={d._id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-500">
                      Product
                    </label>
                    <div className="relative">
                      <Package
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={16}
                      />
                      <select
                        value={newSale.product}
                        onChange={(e) =>
                          setNewSale({ ...newSale, product: e.target.value })
                        }
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm outline-none appearance-none"
                      >
                        <option value="">Select Product...</option>
                        {stock.map((p) => (
                          <option
                            key={p._id}
                            value={p.name}
                            disabled={p.quantity <= 0}
                          >
                            {p.name} (
                            {p.quantity <= 0
                              ? "Out of Stock"
                              : `${p.quantity} left`}
                            )
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-500">
                      Quantity
                    </label>
                    <div className="relative">
                      <Hash
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={16}
                      />
                      <input
                        type="number"
                        placeholder="0"
                        value={newSale.quantity}
                        onChange={(e) =>
                          setNewSale({ ...newSale, quantity: e.target.value })
                        }
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={handleAddSale}
                      disabled={loading}
                      className="w-full h-[46px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-500/30 transition-all active:scale-95 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <CircleDollarSign size={18} />
                      )}
                      {loading ? "Processing..." : "Process Sale"}
                    </button>
                  </div>
                </div>

                {/* Live Estimates Panel - Added Safety Checks */}
                {currentTotals && (
                  <div className="mt-6 bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 flex flex-col sm:flex-row gap-4 sm:gap-8 items-start sm:items-center">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-lg border border-green-100 shadow-sm">
                        <Calculator className="text-emerald-600" size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                          Total BV
                        </p>
                        <p className="text-lg font-bold text-emerald-700">
                          {currentTotals.totalBV}
                        </p>
                      </div>
                    </div>
                    <div className="hidden sm:block w-px h-10 bg-green-200"></div>
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-lg border border-green-100 shadow-sm">
                        <CreditCard className="text-emerald-600" size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                          Total Price
                        </p>
                        {/* ✅ Optional Chaining Safety */}
                        <p className="text-lg font-bold text-emerald-700">
                          {currentTotals.totalPrice?.toLocaleString() || "0"}{" "}
                          KES
                        </p>
                        <p className="text-[10px] text-gray-400">
                          @{" "}
                          {currentTotals.pricePerUnit?.toLocaleString() || "0"}{" "}
                          / unit
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sales History Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-base font-semibold text-gray-800">
                  Transaction History
                </h2>
                <div className="relative w-full sm:w-64">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Search in table..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              {currentSales.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingBag
                    size={40}
                    className="mx-auto text-gray-200 mb-3"
                  />
                  <p className="text-gray-500 font-medium">
                    No sales records found.
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-50/80 border-b border-gray-100">
                          <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Distributor
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th className="py-3 px-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Qty
                          </th>
                          <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            BV
                          </th>
                          {/* <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Action
                          </th> */}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {currentSales.map((sale) => (
                          <tr
                            key={sale._id}
                            className="hover:bg-emerald-50/30 transition-colors"
                          >
                            <td className="py-3 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-2 text-gray-600 text-sm">
                                <Calendar
                                  size={14}
                                  className="text-gray-400 shrink-0"
                                />
                                <div className="flex flex-col">
                                  <span>
                                    {new Date(
                                      sale.createdAt,
                                    ).toLocaleDateString()}
                                  </span>
                                  <span className="text-[11px] text-gray-400 mt-0.5">
                                    {new Date(
                                      sale.createdAt,
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm font-medium text-gray-800">
                              {sale.distributor?.name || "N/A"}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {sale.product}
                            </td>
                            <td className="py-3 px-4 text-center text-sm text-gray-700">
                              {sale.quantity}
                            </td>
                            {/* ✅ Added Optional Chaining here */}
                            <td className="py-3 px-4 text-right text-sm font-semibold text-emerald-700">
                              {sale.totalPrice?.toLocaleString() || "0"} KES
                            </td>
                            <td className="py-3 px-4 text-right text-sm font-medium text-gray-800">
                              {sale.totalBV}
                            </td>
                            {/* <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => handleDelete(sale._id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td> */}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-3 flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        Page {currentPage} of {totalPages}
                      </p>
                      <div className="flex gap-2">
                        <button
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage((p) => p - 1)}
                          className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage((p) => p + 1)}
                          className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
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

          {/* Right Column: Low Stock */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
              <div className="border-b border-gray-100 bg-red-50/50 px-5 py-4">
                <h2 className="text-base font-semibold text-red-800 flex items-center gap-2">
                  <AlertTriangle size={18} /> Low Stock Alerts
                </h2>
              </div>
              <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto space-y-3 custom-scrollbar">
                {stock.filter((item) => getStockColor(item.quantity)).length ===
                0 ? (
                  <div className="text-center py-8">
                    <Package
                      size={32}
                      className="mx-auto text-green-200 mb-2"
                    />
                    <p className="text-sm text-gray-500">
                      Inventory levels are healthy.
                    </p>
                  </div>
                ) : (
                  stock
                    .filter((item) => getStockColor(item.quantity))
                    .map((item) => (
                      <div
                        key={item._id}
                        className={`p-3 rounded-xl border ${getStockColor(
                          item.quantity,
                        )} transition-all`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-medium text-sm leading-tight">
                            {item.name}
                          </p>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs opacity-80">Remaining:</span>
                          <span className="text-sm font-bold bg-white/50 px-2 py-0.5 rounded-md">
                            {item.quantity}
                          </span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;
