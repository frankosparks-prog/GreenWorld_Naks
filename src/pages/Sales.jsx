import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  ShoppingBag,
  User,
  PlusCircle,
  Trash2,
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
  Filter,
  ShoppingCart,
  Wallet,
  X,
  RotateCcw,
  DollarSign,
  Download,
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

  const [cart, setCart] = useState([]);
  const [isDebtSale, setIsDebtSale] = useState(false);

  // Debt Payment & Return State
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [selectedDistributor, setSelectedDistributor] = useState("");
  const [unpaidSales, setUnpaidSales] = useState([]);
  const [payAmounts, setPayAmounts] = useState({});
  const [returnAmounts, setReturnAmounts] = useState({});
  const [expandedHistory, setExpandedHistory] = useState({});

  useEffect(() => {
    if (selectedDistributor) {
      axios
        .get(`${SERVER_URL}/api/sales/distributor/${selectedDistributor}/debt`)
        .then((res) => setUnpaidSales(res.data))
        .catch((err) => toast.error("Failed to load unpaid sales"));
    } else {
      setUnpaidSales([]);
    }
  }, [selectedDistributor]);

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

  // ✅ Handle Add to Cart
  const handleAddToCart = () => {
    if (!newSale.distributorId || !newSale.product || !newSale.quantity) {
      return toast.error("⚠️ Please fill all fields!");
    }

    const qty = parseInt(newSale.quantity, 10);
    if (isNaN(qty) || qty <= 0) return toast.error("Enter a valid quantity.");

    const selectedProduct = stock.find((p) => p.name === newSale.product);
    if (!selectedProduct) return toast.error("Product not found in stock.");

    const existingInCart = cart.find(
      (item) => item.product === newSale.product,
    );
    const totalQtyRequested =
      (existingInCart ? existingInCart.quantity : 0) + qty;

    if (totalQtyRequested > selectedProduct.quantity)
      return toast.error(`❌ Only ${selectedProduct.quantity} left in stock.`);

    const distributor = distributors.find(
      (d) => d._id === newSale.distributorId,
    );
    if (!distributor) return toast.error("Distributor not found.");

    const isNonMember = distributor.name === "Non-Member";
    const price =
      (isNonMember
        ? selectedProduct.retailPrice
        : selectedProduct.distributorPrice) || 0;

    const totalPrice = price * qty;
    const bv = selectedProduct.bv || 0;
    const totalBV = bv * qty;

    const newItem = {
      product: newSale.product,
      quantity: qty,
      bv,
      totalBV,
      price,
      totalPrice,
      isDebt: isDebtSale,
    };

    if (existingInCart) {
      setCart(
        cart.map((item) =>
          item.product === newSale.product
            ? {
                ...item,
                quantity: item.quantity + qty,
                totalBV: item.totalBV + totalBV,
                totalPrice: item.totalPrice + totalPrice,
              }
            : item,
        ),
      );
    } else {
      setCart([...cart, newItem]);
    }

    setNewSale({ ...newSale, product: "", quantity: "" });
    toast.success("Added to cart!");
  };

  const handleRemoveFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  // ✅ Handle Checkout
  const handleCheckout = async () => {
    if (cart.length === 0) return toast.error("Cart is empty.");
    if (!newSale.distributorId) return toast.error("Distributor not selected.");

    setLoading(true);
    try {
      await axios.post(`${SERVER_URL}/api/sales/cart`, {
        distributorId: newSale.distributorId,
        cartItems: cart,
        isDebt: isDebtSale,
      });

      toast.success("✅ Checkout successful!");
      setCart([]);
      setIsDebtSale(false);
      setNewSale({ distributorId: "", product: "", quantity: "" });
      fetchSales();
      fetchStock();
    } catch (err) {
      console.error("Checkout Error:", err);
      toast.error(err.response?.data?.error || "❌ Failed to checkout.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Specific Debt Payment
  const handlePaySpecificDebt = async (saleId) => {
    const amount = payAmounts[saleId];
    if (!amount || amount <= 0) return toast.error("Enter valid amount");
    try {
      setLoading(true);
      await axios.post(`${SERVER_URL}/api/sales/pay-debt`, {
        saleId,
        amount,
      });
      toast.success("Payment recorded!");
      setPayAmounts((prev) => ({ ...prev, [saleId]: "" }));
      fetchSales();
      axios
        .get(`${SERVER_URL}/api/sales/distributor/${selectedDistributor}/debt`)
        .then((res) => setUnpaidSales(res.data));
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to settle debt");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Specific Return Product
  const handleReturnSpecificProduct = async (saleId, maxQty) => {
    const returnQty = returnAmounts[saleId];
    if (!returnQty || returnQty <= 0)
      return toast.error("Enter valid return quantity");
    if (returnQty > maxQty)
      return toast.error("Exceeds max returnable quantity");
    try {
      setLoading(true);
      await axios.post(`${SERVER_URL}/api/sales/return`, {
        saleId,
        returnQuantity: returnQty,
      });
      toast.success("Return processed successfully!");
      setReturnAmounts((prev) => ({ ...prev, [saleId]: "" }));
      fetchSales();
      fetchStock();
      axios
        .get(`${SERVER_URL}/api/sales/distributor/${selectedDistributor}/debt`)
        .then((res) => setUnpaidSales(res.data));
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to process return");
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!filteredSales.length) return toast.error("No data to export.");

    const headers = [
      "Date",
      "Distributor",
      "Product",
      "Quantity",
      "Total Price",
      "Total BV",
      "Status",
      "Balance",
    ];
    const rows = filteredSales.map((s) => [
      new Date(s.createdAt).toLocaleString(),
      s.distributor?.name || "N/A",
      s.product,
      s.quantity,
      s.totalPrice || 0,
      s.totalBV || 0,
      s.paymentStatus || "Paid",
      s.balance || 0,
    ]);

    rows.push([]);
    rows.push(["TOTALS:", "", "", "", totalRevenue, totalBVSum, "", ""]);

    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "sales_report.csv");
    toast.success("Report downloaded!");
  };

  const calculateCartTotals = () => {
    return cart.reduce(
      (sums, item) => ({
        totalBV: sums.totalBV + item.totalBV,
        totalPrice: sums.totalPrice + item.totalPrice,
      }),
      { totalBV: 0, totalPrice: 0 },
    );
  };
  const cartTotals = calculateCartTotals();

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

          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            <button
              onClick={() => setShowDebtModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-2 rounded-xl font-medium shadow-sm transition-all shadow-md shadow-orange-500/20"
            >
              <Wallet size={18} /> Settle Debt
            </button>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm hidden sm:flex">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <Calculator size={20} className="text-emerald-700" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Total BV</p>
                <p className="text-lg font-bold text-gray-900 leading-none">
                  {totalBVSum?.toLocaleString() || "0"}
                </p>
              </div>
            </div>
            <button
              onClick={handleExportCSV}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-500/20 text-white px-4 py-2 rounded-xl font-medium shadow-sm transition-all"
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
                        disabled={cart.length > 0}
                        onChange={(e) =>
                          setNewSale({
                            ...newSale,
                            distributorId: e.target.value,
                          })
                        }
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm outline-none appearance-none disabled:bg-gray-100"
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
                      onClick={handleAddToCart}
                      className="w-full h-[46px] bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl shadow-sm transition-all active:scale-95 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                      <PlusCircle size={18} />
                      Add to Cart
                    </button>
                  </div>
                </div>

                {/* Cart View */}
                {cart.length > 0 && (
                  <div className="mt-6 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                        <ShoppingCart size={18} className="text-emerald-600" />
                        Current Cart
                      </h3>
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">
                        {cart.length} items
                      </span>
                    </div>
                    <div className="p-0 overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">
                              Product
                            </th>
                            <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 uppercase">
                              Qty
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase">
                              Price
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase">
                              BV
                            </th>
                            <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 uppercase">
                              Debt?
                            </th>
                            <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 uppercase">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {cart.map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm text-gray-800 font-medium whitespace-nowrap">
                                {item.product}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-600 text-center">
                                {item.quantity}
                              </td>
                              <td className="px-4 py-2 text-sm text-emerald-600 font-semibold text-right whitespace-nowrap">
                                {item.totalPrice.toLocaleString()} KES
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-600 text-right">
                                {item.totalBV}
                              </td>
                              <td className="px-4 py-2 text-center">
                                <input
                                  type="checkbox"
                                  checked={item.isDebt || false}
                                  onChange={(e) => {
                                    const newCart = [...cart];
                                    newCart[idx].isDebt = e.target.checked;
                                    setCart(newCart);
                                  }}
                                  className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                                />
                              </td>
                              <td className="px-4 py-2 text-center">
                                <button
                                  onClick={() => handleRemoveFromCart(idx)}
                                  className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="bg-gray-50 p-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-semibold">
                            Total Price
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {cartTotals.totalPrice.toLocaleString()} KES
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-semibold">
                            Total BV
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {cartTotals.totalBV}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
                          <input
                            type="checkbox"
                            id="debtToggle"
                            checked={isDebtSale}
                            onChange={(e) => {
                              setIsDebtSale(e.target.checked);
                              setCart(
                                cart.map((item) => ({
                                  ...item,
                                  isDebt: e.target.checked,
                                })),
                              );
                            }}
                            className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                          />
                          <label
                            htmlFor="debtToggle"
                            className="text-sm font-medium text-gray-700 cursor-pointer"
                          >
                            Mark All as Debt
                          </label>
                        </div>
                        <button
                          onClick={handleCheckout}
                          disabled={loading}
                          className="flex-1 sm:flex-none h-[42px] px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <CircleDollarSign size={18} />
                          )}
                          Checkout
                        </button>
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
                          <th className="py-3 px-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
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
                            <td className="py-3 px-4 text-center">
                              <div className="flex flex-col items-center gap-1">
                                <span
                                  className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    sale.paymentStatus === "Paid"
                                      ? "bg-green-100 text-green-700"
                                      : sale.paymentStatus === "Not Paid"
                                        ? "bg-red-100 text-red-700"
                                        : sale.paymentStatus === "Returned"
                                          ? "bg-gray-100 text-gray-700"
                                          : "bg-orange-100 text-orange-700"
                                  }`}
                                >
                                  {sale.paymentStatus || "Paid"}
                                </span>
                                {sale.paymentStatus !== "Paid" &&
                                  sale.balance > 0 && (
                                    <span className="text-xs font-medium text-red-600 whitespace-nowrap">
                                      Bal: {sale.balance.toLocaleString()}
                                    </span>
                                  )}
                              </div>
                            </td>
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

      {/* Settle Debt Modal */}
      {showDebtModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform scale-100 transition-all">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Wallet size={18} className="text-orange-500" />
                Settle Debt
              </h2>
              <button
                onClick={() => setShowDebtModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-1.5 sticky top-0 bg-white pb-4 z-10 border-b border-gray-100">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Select Distributor
                </label>
                <select
                  value={selectedDistributor}
                  onChange={(e) => setSelectedDistributor(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-sm transition-all"
                >
                  <option value="">Choose a distributor...</option>
                  {distributors.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedDistributor && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-800">
                    Unpaid Products
                  </h3>
                  {unpaidSales.length === 0 ? (
                    <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-xl text-center border border-dashed border-gray-200">
                      No outstanding debts found for this distributor.
                    </p>
                  ) : (
                    unpaidSales.map((sale) => {
                      const maxReturnable = sale.quantity;
                      return (
                        <div
                          key={sale._id}
                          className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3 relative overflow-hidden"
                        >
                          <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-gray-900 text-sm">
                                {sale.product}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(sale.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-red-600">
                                Bal: {sale.balance.toLocaleString()} KES
                              </p>
                              <p className="text-xs font-medium text-gray-500">
                                Total: {sale.totalPrice?.toLocaleString()} KES
                              </p>
                              <p className="text-xs text-gray-500">
                                Qty: {sale.quantity}
                              </p>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-gray-100 grid grid-cols-1 gap-3">
                            {/* Payment Section */}
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <DollarSign
                                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                                  size={14}
                                />
                                <input
                                  type="number"
                                  placeholder="Pay Amount"
                                  value={payAmounts[sale._id] || ""}
                                  onChange={(e) =>
                                    setPayAmounts({
                                      ...payAmounts,
                                      [sale._id]: e.target.value,
                                    })
                                  }
                                  className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-xs transition-all"
                                />
                              </div>
                              <button
                                onClick={() => handlePaySpecificDebt(sale._id)}
                                disabled={loading || !payAmounts[sale._id]}
                                className="px-3 py-2 bg-orange-50 text-orange-600 hover:bg-orange-100 font-semibold rounded-lg text-xs transition-colors disabled:opacity-50 border border-orange-200"
                              >
                                Pay
                              </button>
                            </div>

                            {/* Return Section */}
                            {maxReturnable > 0 && (
                              <div className="flex gap-2">
                                <div className="relative flex-1">
                                  <RotateCcw
                                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                                    size={14}
                                  />
                                  <input
                                    type="number"
                                    placeholder={`Return Qty (Max ${maxReturnable})`}
                                    max={maxReturnable}
                                    value={returnAmounts[sale._id] || ""}
                                    onChange={(e) =>
                                      setReturnAmounts({
                                        ...returnAmounts,
                                        [sale._id]: e.target.value,
                                      })
                                    }
                                    className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-500/20 focus:border-gray-500 outline-none text-xs transition-all"
                                  />
                                </div>
                                <button
                                  onClick={() =>
                                    handleReturnSpecificProduct(
                                      sale._id,
                                      maxReturnable,
                                    )
                                  }
                                  disabled={loading || !returnAmounts[sale._id]}
                                  className="px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold rounded-lg text-xs transition-colors disabled:opacity-50 border border-gray-200"
                                >
                                  Return
                                </button>
                              </div>
                            )}

                            {/* Payment History Toggle */}
                            <div className="pt-2 border-t border-gray-50">
                              <button
                                onClick={() =>
                                  setExpandedHistory((prev) => ({
                                    ...prev,
                                    [sale._id]: !prev[sale._id],
                                  }))
                                }
                                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                {expandedHistory[sale._id]
                                  ? "Hide Payment History"
                                  : "View Payment History"}
                              </button>

                              {expandedHistory[sale._id] &&
                                sale.payments?.length > 0 && (
                                  <div className="mt-2 space-y-1 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                                    {sale.payments.map((pay, i) => (
                                      <div
                                        key={i}
                                        className="flex justify-between items-center text-[10px] text-gray-600"
                                      >
                                        <span>
                                          {new Date(
                                            pay.date,
                                          ).toLocaleDateString()}{" "}
                                          {new Date(
                                            pay.date,
                                          ).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </span>
                                        <span className="font-bold text-gray-800">
                                          +{pay.amount.toLocaleString()} KES
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              {expandedHistory[sale._id] &&
                                (!sale.payments ||
                                  sale.payments.length === 0) && (
                                  <p className="mt-2 text-[10px] text-gray-400 italic">
                                    No payments recorded yet.
                                  </p>
                                )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDebtModal(false);
                  setSelectedDistributor("");
                  setPayAmounts({});
                  setReturnAmounts({});
                }}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 bg-white hover:bg-gray-50 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
