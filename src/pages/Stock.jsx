import React, { useEffect, useState } from "react";
import {
  Package,
  PlusCircle,
  // Trash2,
  Edit3,
  Loader2,
  Search,
  DollarSign,
  Hash,
  Tag,
  Activity,
  ChevronLeft,
  ChevronRight,
  Save,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

// 🧾 Product BV List (Data Retained)
const productBVList = [
  {
    name: "Cordyceps Plus Capsule",
    bv: 22.5,
    distributorPrice: 2365,
    retailPrice: 2850,
  },
  { name: "Spirulina", bv: 21.5, distributorPrice: 2260, retailPrice: 2750 },
  {
    name: "Propolis Plus Capsule",
    bv: 29,
    distributorPrice: 3045,
    retailPrice: 3700,
  },
  {
    name: "Cardio Power Capsule",
    bv: 21,
    distributorPrice: 2205,
    retailPrice: 2700,
  },
  {
    name: "A-Power Capsule",
    bv: 45,
    distributorPrice: 4725,
    retailPrice: 5800,
  },
  {
    name: "Soy Power Capsule",
    bv: 22,
    distributorPrice: 2310,
    retailPrice: 2800,
  },
  {
    name: "VigPower Capsule per tablet",
    bv: 4.916,
    distributorPrice: 650,
    retailPrice: 1000,
  },
  {
    name: "Ginseng RHs Capsule",
    bv: 39,
    distributorPrice: 4095,
    retailPrice: 4950,
  },
  {
    name: "Kuding Plus Tea",
    bv: 9.8,
    distributorPrice: 1470,
    retailPrice: 2000,
  },
  {
    name: "Ganoderma Coffee",
    bv: 11.2,
    distributorPrice: 1680,
    retailPrice: 2200,
  },
  {
    name: "Ganoderma Plus Capsule",
    bv: 26,
    distributorPrice: 2730,
    retailPrice: 3300,
  },
  {
    name: "Lipid Care Tea",
    bv: 8.4,
    distributorPrice: 1260,
    retailPrice: 2000,
  },
  {
    name: "Protein Powder",
    bv: 39.5,
    distributorPrice: 4150,
    retailPrice: 5000,
  },
  {
    name: "Multivitamin Tablet (Adults)",
    bv: 26,
    distributorPrice: 2730,
    retailPrice: 3300,
  },
  {
    name: "Calcium Tablet (Adults)",
    bv: 29,
    distributorPrice: 3045,
    retailPrice: 3800,
  },
  {
    name: "Zinc Tablet (Adults)",
    bv: 19,
    distributorPrice: 1995,
    retailPrice: 2400,
  },
  {
    name: "Lecithin Softgel",
    bv: 25,
    distributorPrice: 2625,
    retailPrice: 3150,
  },
  {
    name: "Deep Sea Fish Oil Softgel",
    bv: 29.8,
    distributorPrice: 3130,
    retailPrice: 3800,
  },
  {
    name: "Meal Cellulose Tablet",
    bv: 22,
    distributorPrice: 2310,
    retailPrice: 2800,
  },
  {
    name: "Garlic Oil Capsule",
    bv: 22,
    distributorPrice: 2310,
    retailPrice: 2800,
  },
  {
    name: "Eye Care Softgel",
    bv: 28,
    distributorPrice: 2940,
    retailPrice: 3600,
  },
  {
    name: "Chitosan Capsule",
    bv: 22,
    distributorPrice: 2310,
    retailPrice: 2800,
  },
  {
    name: "Aloe Vera Plus Capsule",
    bv: 22,
    distributorPrice: 2310,
    retailPrice: 2800,
  },
  {
    name: "Compound Marrow Powder",
    bv: 27,
    distributorPrice: 2835,
    retailPrice: 3500,
  },
  {
    name: "Ginkgo Biloba Capsule",
    bv: 25,
    distributorPrice: 2625,
    retailPrice: 3150,
  },
  {
    name: "Pine Pollen Tea",
    bv: 9.3,
    distributorPrice: 1405,
    retailPrice: 2000,
  },
  {
    name: "Intestine Cleansing Tea",
    bv: 9.1,
    distributorPrice: 1365,
    retailPrice: 2000,
  },
  {
    name: "Balsam Pear Tea",
    bv: 9.4,
    distributorPrice: 1420,
    retailPrice: 2000,
  },
  {
    name: "B-Carotene & Lycopene Capsule",
    bv: 22,
    distributorPrice: 2310,
    retailPrice: 2800,
  },
  {
    name: "Livergen Capsule",
    bv: 28,
    distributorPrice: 2940,
    retailPrice: 3600,
  },
  {
    name: "Royal Jelly Softgel",
    bv: 20,
    distributorPrice: 2100,
    retailPrice: 2600,
  },
  { name: "Ishine Capsule", bv: 24, distributorPrice: 2520, retailPrice: 3100 },
  {
    name: "Parashield Capsule",
    bv: 18,
    distributorPrice: 1890,
    retailPrice: 2300,
  },
  {
    name: "Magic Detoxin Pad",
    bv: 22,
    distributorPrice: 2310,
    retailPrice: 2800,
  },
  {
    name: "Slimming Capsule",
    bv: 25,
    distributorPrice: 2625,
    retailPrice: 3150,
  },
  { name: "Pro-Slim Tea", bv: 9.4, distributorPrice: 1420, retailPrice: 2000 },
  {
    name: "Joint Health Plus Capsule",
    bv: 25,
    distributorPrice: 2625,
    retailPrice: 3150,
  },
  {
    name: "Super Co-Q10 Capsule",
    bv: 30,
    distributorPrice: 3150,
    retailPrice: 3800,
  },
  {
    name: "Vitamin C Tablet",
    bv: 12.5,
    distributorPrice: 1315,
    retailPrice: 1600,
  },
  {
    name: "Vitamin E Capsule",
    bv: 21,
    distributorPrice: 2205,
    retailPrice: 2700,
  },
  {
    name: "Super Nutrition Powder",
    bv: 45,
    distributorPrice: 4725,
    retailPrice: 5800,
  },
  {
    name: "Glucoblock Capsule",
    bv: 19,
    distributorPrice: 1995,
    retailPrice: 2400,
  },
  {
    name: "ProstaSure Capsule",
    bv: 35,
    distributorPrice: 3675,
    retailPrice: 4450,
  },
  {
    name: "Kidney Tonifying Capsule (Men)",
    bv: 30,
    distributorPrice: 3150,
    retailPrice: 3800,
  },
  {
    name: "Kidney Tonifying Capsule (Women)",
    bv: 30,
    distributorPrice: 3150,
    retailPrice: 3800,
  },
  {
    name: "Blueberry Juice High VC",
    bv: 21,
    distributorPrice: 2205,
    retailPrice: 2700,
  },
  {
    name: "Nutriplant Organic Fertilizer (1L)",
    bv: 24,
    distributorPrice: 3150,
    retailPrice: 3800,
  },
  {
    name: "Nutriplant Organic Fertilizer (100ml)",
    bv: 3.2,
    distributorPrice: 420,
    retailPrice: 650,
  },
  { name: "Toothpaste", bv: 6, distributorPrice: 790, retailPrice: 1000 },
  {
    name: "Fresh Drink Clear",
    bv: 10,
    distributorPrice: 1050,
    retailPrice: 1500,
  },
  { name: "Olive Soap", bv: 2.5, distributorPrice: 335, retailPrice: 500 },
  {
    name: "Breast Care Tea",
    bv: 10.5,
    distributorPrice: 1575,
    retailPrice: 2000,
  },
  {
    name: "Uterus Cleansing Pill",
    bv: 32,
    distributorPrice: 3360,
    retailPrice: 4100,
  },
  { name: "Jinpure Tea", bv: 10.1, distributorPrice: 1525, retailPrice: 2000 },
  {
    name: "NMN Longevity Capsule",
    bv: 175,
    distributorPrice: 18375,
    retailPrice: 22500,
  },
  {
    name: "Golden Knight Spray",
    bv: 15,
    distributorPrice: 1575,
    retailPrice: 2500,
  },
  {
    name: "Silver Eva Spray",
    bv: 13.5,
    distributorPrice: 1420,
    retailPrice: 2000,
  },
  {
    name: "Calcium Powder (Children)",
    bv: 20,
    distributorPrice: 2100,
    retailPrice: 2600,
  },
  {
    name: "Calcium Powder (Adult)",
    bv: 22,
    distributorPrice: 2310,
    retailPrice: 2800,
  },
  {
    name: "Calcium With Blood sugar support",
    bv: 22,
    distributorPrice: 2310,
    retailPrice: 2800,
  },
  {
    name: "Bone Care Plaster",
    bv: 20,
    distributorPrice: 2100,
    retailPrice: 2600,
  },
  { name: "Women Care Gel", bv: 18, distributorPrice: 1890, retailPrice: 2500 },
  { name: "Jinpure caps", bv: 22, distributorPrice: 2310, retailPrice: 2800 },
  { name: "Selenium", bv: 15.2, distributorPrice: 1995, retailPrice: 2400 },
  {
    name: "Ovary Nutrition",
    bv: 22,
    distributorPrice: 2520,
    retailPrice: 3100,
  },
  {
    name: "Gastric Health",
    bv: 12.8,
    distributorPrice: 1580,
    retailPrice: 2500,
  },
  { name: "Pantyliner", bv: 0, distributorPrice: 500, retailPrice: 800 },
  { name: "Family Planning", bv: 0, distributorPrice: 350, retailPrice: 350 },
  { name: "T-shirt", bv: 0, distributorPrice: 1000, retailPrice: 1000 },
];

const ITEMS_PER_PAGE = 10;

const Stock = () => {
  const [stock, setStock] = useState([]);
  const [filteredStock, setFilteredStock] = useState([]);
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: "",
    bv: "",
    distributorPrice: "",
    retailPrice: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  // 🟢 Fetch Stock
  useEffect(() => {
    const fetchStock = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${SERVER_URL}/api/stock`);
        setStock(res.data);
        setFilteredStock(res.data);
      } catch {
        toast.error("❌ Failed to fetch stock data");
      } finally {
        setLoading(false);
      }
    };
    fetchStock();
  }, []);

  // 🔍 Search Filter
  useEffect(() => {
    const filtered = stock.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredStock(filtered);
    setPage(1);
  }, [searchTerm, stock]);

  // ✅ Add or Update Stock (merge quantities)
  const handleAddStock = async () => {
    if (!newItem.name || !newItem.quantity)
      return toast.error("⚠️ Please fill all fields!");

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.id) {
        return toast.error("User info missing. Please re-login.");
      }

      const stockData = {
        ...newItem,
        addedBy: user.id,
      };

      const existing = stock.find(
        (item) => item.name.toLowerCase() === newItem.name.toLowerCase(),
      );

      if (existing) {
        // Update quantity if exists
        const updatedItem = {
          ...existing,
          quantity: Number(existing.quantity) + Number(newItem.quantity),
        };
        const res = await axios.put(
          `${SERVER_URL}/api/stock/${existing._id}`,
          updatedItem,
        );
        setStock(stock.map((s) => (s._id === existing._id ? res.data : s)));
        toast.success("🔄 Quantity updated successfully!");
      } else {
        // Add new item with agent info
        const res = await axios.post(`${SERVER_URL}/api/stock`, stockData);
        setStock([...stock, res.data]);
        toast.success("✅ Stock added successfully!");
      }

      setNewItem({
        name: "",
        quantity: "",
        bv: "",
        distributorPrice: "",
        retailPrice: "",
      });
    } catch {
      toast.error("❌ Error adding stock!");
    }
  };

  // ✅ Delete Stock
  // const handleDelete = async (id) => {
  //   if (window.confirm("Delete this product?")) {
  //     try {
  //       await axios.delete(`${SERVER_URL}/api/stock/${id}`);
  //       setStock(stock.filter((item) => item._id !== id));
  //       toast.success("🗑️ Product deleted!");
  //     } catch {
  //       toast.error("❌ Error deleting stock!");
  //     }
  //   }
  // };

  // ✅ Edit Stock
  // const handleEdit = (item) => {
  //   setIsEditing(true);
  //   setEditItem(item);
  //   window.scrollTo({ top: 0, behavior: "smooth" });
  // };

  const handleUpdate = async () => {
    if (!editItem.name || !editItem.quantity)
      return toast.error("⚠️ All fields required!");
    try {
      const res = await axios.put(
        `${SERVER_URL}/api/stock/${editItem._id}`,
        editItem,
      );
      setStock(stock.map((s) => (s._id === editItem._id ? res.data : s)));
      setIsEditing(false);
      setEditItem(null);
      toast.success("✏️ Stock updated successfully!");
    } catch {
      toast.error("❌ Error updating stock!");
    }
  };

  const handleProductSelect = (e) => {
    const selected = productBVList.find((p) => p.name === e.target.value);
    const bvValue = selected ? selected.bv : "";
    const distributorPrice = selected ? selected.distributorPrice : "";
    const retailPrice = selected ? selected.retailPrice : "";

    if (isEditing) {
      setEditItem({
        ...editItem,
        name: e.target.value,
        bv: bvValue,
        distributorPrice,
        retailPrice,
      });
    } else {
      setNewItem({
        ...newItem,
        name: e.target.value,
        bv: bvValue,
        distributorPrice,
        retailPrice,
      });
    }
  };

  // 📑 Pagination
  const totalPages = Math.ceil(filteredStock.length / ITEMS_PER_PAGE);
  const currentPageItems = filteredStock.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  return (
    <div className="min-h-screen bg-gray-50/50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="text-emerald-600" size={28} /> Stock Inventory
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your product quantities, prices, and Bonus Values (BV).
            </p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
            <span className="text-sm text-gray-500">Total Items:</span>
            <span className="ml-2 font-bold text-gray-900">
              {filteredStock.length}
            </span>
          </div>
        </div>

        {/* Action Card: Add/Edit Stock */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              {isEditing ? (
                <Edit3 size={18} className="text-blue-500" />
              ) : (
                <PlusCircle size={18} className="text-emerald-500" />
              )}
              {isEditing ? "Update Product Details" : "Add New Inventory"}
            </h2>
            {isEditing && (
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditItem(null);
                }}
                className="text-xs text-red-500 hover:text-red-700 font-medium"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5">
              {/* Product Select */}
              <div className="lg:col-span-2 space-y-1.5">
                <label className="text-xs font-medium text-gray-500">
                  Product Name
                </label>
                <div className="relative">
                  <Tag
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <select
                    value={isEditing ? editItem?.name : newItem.name}
                    onChange={handleProductSelect}
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm outline-none appearance-none"
                  >
                    <option value="">Select Product from list...</option>
                    {productBVList.map((p, i) => (
                      <option key={i} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quantity */}
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
                    value={isEditing ? editItem?.quantity : newItem.quantity}
                    onChange={(e) =>
                      isEditing
                        ? setEditItem({ ...editItem, quantity: e.target.value })
                        : setNewItem({ ...newItem, quantity: e.target.value })
                    }
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm outline-none"
                  />
                </div>
              </div>

              {/* BV */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">
                  BV Points
                </label>
                <div className="relative">
                  <Activity
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="0.0"
                    value={isEditing ? editItem?.bv : newItem.bv}
                    readOnly
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 text-sm outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Distributor Price */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">
                  Dist. Price
                </label>
                <div className="relative">
                  <DollarSign
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={14}
                  />
                  <input
                    type="number"
                    placeholder="0.00"
                    value={
                      isEditing
                        ? editItem?.distributorPrice
                        : newItem.distributorPrice
                    }
                    onChange={(e) =>
                      isEditing
                        ? setEditItem({
                            ...editItem,
                            distributorPrice: e.target.value,
                          })
                        : setNewItem({
                            ...newItem,
                            distributorPrice: e.target.value,
                          })
                    }
                    className="w-full pl-8 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm outline-none"
                  />
                </div>
              </div>

              {/* Retail Price */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">
                  Retail Price
                </label>
                <div className="relative">
                  <DollarSign
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={14}
                  />
                  <input
                    type="number"
                    placeholder="0.00"
                    value={
                      isEditing ? editItem?.retailPrice : newItem.retailPrice
                    }
                    onChange={(e) =>
                      isEditing
                        ? setEditItem({
                            ...editItem,
                            retailPrice: e.target.value,
                          })
                        : setNewItem({
                            ...newItem,
                            retailPrice: e.target.value,
                          })
                    }
                    className="w-full pl-8 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="mt-6 flex justify-end">
              {isEditing ? (
                <button
                  onClick={handleUpdate}
                  className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-medium rounded-xl px-6 py-2.5 shadow-md hover:shadow-lg transition-all active:scale-95"
                >
                  <Save size={18} /> Update Item
                </button>
              ) : (
                <button
                  onClick={handleAddStock}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium rounded-xl px-6 py-2.5 shadow-md hover:shadow-lg hover:shadow-emerald-500/30 transition-all active:scale-95"
                >
                  <PlusCircle size={18} /> Add to Stock
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search products by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm"
          />
        </div>

        {/* Stock Table */}
        <div className="bg-white shadow-sm rounded-2xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-20 text-emerald-600">
              <Loader2 size={32} className="animate-spin mb-3" />
              <p className="text-sm font-medium text-gray-500">
                Loading inventory data...
              </p>
            </div>
          ) : currentPageItems.length === 0 ? (
            <div className="text-center py-20">
              <Package size={48} className="mx-auto text-gray-200 mb-3" />
              <p className="text-gray-500 font-medium">No stock items found.</p>
              <p className="text-sm text-gray-400">
                Try adjusting your search or add a new item.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100">
                      <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Product Name
                      </th>
                      <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        BV
                      </th>
                      <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Dist. Price
                      </th>
                      <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Retail Price
                      </th>
                      {/* <th className="py-4 px-6 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th> */}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {currentPageItems.map((item) => (
                      <tr
                        key={item._id}
                        className="group hover:bg-emerald-50/30 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <p className="font-medium text-gray-800 text-sm">
                            {item.name}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${item.quantity < 10 ? "bg-red-500" : item.quantity < 20 ? "bg-orange-500" : "bg-green-500"}`}
                            ></span>
                            <span className="text-sm font-medium text-gray-700">
                              {item.quantity} units
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {item.bv}
                        </td>
                        <td className="py-4 px-6 text-sm font-medium text-emerald-700">
                          {item.distributorPrice
                            ? `KSh ${item.distributorPrice.toLocaleString()}`
                            : "--"}
                        </td>
                        <td className="py-4 px-6 text-sm font-medium text-gray-600">
                          {item.retailPrice
                            ? `KSh ${item.retailPrice.toLocaleString()}`
                            : "--"}
                        </td>
                        <td className="py-4 px-6 text-right">
                          {/* ✅ ACTIONS RESTORED AND ALWAYS VISIBLE */}
                          {/*  <div className="flex items-center justify-end gap-2">
                            <button
                                onClick={() => handleEdit(item)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit Item"
                            >
                                <Edit3 size={18} />
                            </button>
                             <button
                                onClick={() => handleDelete(item._id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Item"
                            >
                                <Trash2 size={18} />
                            </button> 
                          </div> */}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-medium">
                    {(page - 1) * ITEMS_PER_PAGE + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(page * ITEMS_PER_PAGE, filteredStock.length)}
                  </span>{" "}
                  of <span className="font-medium">{filteredStock.length}</span>{" "}
                  items
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stock;
