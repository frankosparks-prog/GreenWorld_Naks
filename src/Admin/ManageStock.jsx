// import React, { useEffect, useState } from "react";
// import { 
//   Package, 
//   Trash2, 
//   Edit3, 
//   Loader2, 
//   Search, 
//   Filter, 
//   X, 
//   Save, 
//   ChevronLeft, 
//   ChevronRight,
//   AlertTriangle,
//   CheckCircle2,
//   Calendar
// } from "lucide-react";
// import axios from "axios";
// import toast from "react-hot-toast";

// const SERVER_URL = process.env.REACT_APP_SERVER_URL;
// const ITEMS_PER_PAGE = 10;

// const ManageStock = () => {
//   const [stock, setStock] = useState([]);
//   const [filteredStock, setFilteredStock] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [page, setPage] = useState(1);
//   const [filterOption, setFilterOption] = useState("latest");
//   const [editItem, setEditItem] = useState(null);

//   // 🟢 Fetch Stock
//   useEffect(() => {
//     const fetchStock = async () => {
//       try {
//         setLoading(true);
//         const res = await axios.get(`${SERVER_URL}/api/stock`);
//         setStock(res.data);
//         setFilteredStock(res.data);
//       } catch {
//         toast.error("❌ Failed to fetch stock data");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchStock();
//   }, []);

//   // 🔍 Search Filter
//   useEffect(() => {
//     const filtered = stock.filter((item) =>
//       item.name.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//     setFilteredStock(filtered);
//     setPage(1);
//   }, [searchTerm, stock]);

//   // ⚙️ Sorting / Filter Options
//   useEffect(() => {
//     let sorted = [...filteredStock];
//     if (filterOption === "latest") {
//       sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//     } else if (filterOption === "oldest") {
//       sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
//     } else if (filterOption === "lowStock") {
//       sorted.sort((a, b) => a.quantity - b.quantity);
//     } else if (filterOption === "highStock") {
//       sorted.sort((a, b) => b.quantity - a.quantity);
//     }
//     setFilteredStock(sorted);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [filterOption]);

//   // ✅ Edit Stock
//   const handleEdit = (item) => setEditItem(item);

//   const handleUpdate = async () => {
//     if (!editItem.name || !editItem.quantity)
//       return toast.error("⚠️ All fields required!");
//     try {
//       const res = await axios.put(
//         `${SERVER_URL}/api/stock/${editItem._id}`,
//         editItem
//       );
//       setStock(stock.map((s) => (s._id === editItem._id ? res.data : s)));
//       setEditItem(null);
//       toast.success("✏️ Stock updated successfully!");
//     } catch {
//       toast.error("❌ Error updating stock!");
//     }
//   };

//   // ❌ Delete Stock
//   const handleDelete = async (id) => {
//     if (window.confirm("Delete this stock item?")) {
//       try {
//         await axios.delete(`${SERVER_URL}/api/stock/${id}`);
//         setStock(stock.filter((s) => s._id !== id));
//         toast.success("🗑️ Stock deleted!");
//       } catch {
//         toast.error("❌ Error deleting stock!");
//       }
//     }
//   };

//   // 📑 Pagination
//   const totalPages = Math.ceil(filteredStock.length / ITEMS_PER_PAGE);
//   const currentPageItems = filteredStock.slice(
//     (page - 1) * ITEMS_PER_PAGE,
//     page * ITEMS_PER_PAGE
//   );

//   return (
//     <div className="min-h-screen bg-gray-50/50 pb-12">
      
//       {/* Header */}
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
//         <div>
//             <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
//             <div className="p-2 bg-green-100 rounded-lg">
//                 <Package size={24} className="text-green-700" /> 
//             </div>
//             Admin Stock Management
//             </h1>
//             <p className="text-sm text-gray-500 mt-1 ml-1">Monitor inventory levels and update product details.</p>
//         </div>
//       </div>

//       {/* Controls: Search + Filter */}
//       <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
//         <div className="relative flex-1 max-w-md">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
//           <input
//             type="text"
//             placeholder="Search products by name..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all shadow-sm"
//           />
//         </div>

//         <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
//           <Filter className="text-gray-400" size={16} />
//           <span className="text-sm text-gray-500 font-medium">Sort by:</span>
//           <select
//             value={filterOption}
//             onChange={(e) => setFilterOption(e.target.value)}
//             className="outline-none bg-transparent text-gray-700 text-sm font-medium cursor-pointer"
//           >
//             <option value="latest">Latest Added</option>
//             <option value="oldest">Oldest First</option>
//             <option value="highStock">Highest Quantity</option>
//             <option value="lowStock">Lowest Quantity</option>
//           </select>
//         </div>
//       </div>

//       {/* Stock Table */}
//       <div className="bg-white shadow-sm rounded-2xl border border-gray-200 overflow-hidden">
//         {loading ? (
//           <div className="flex flex-col justify-center items-center py-20 text-green-600">
//             <Loader2 size={32} className="animate-spin mb-3" />
//             <p className="text-sm text-gray-500 font-medium">Loading inventory...</p>
//           </div>
//         ) : currentPageItems.length === 0 ? (
//           <div className="text-center py-16">
//             <Package size={48} className="mx-auto text-gray-200 mb-3" />
//             <p className="text-gray-500 font-medium">No stock records found.</p>
//             <p className="text-sm text-gray-400">Try adjusting your search filters.</p>
//           </div>
//         ) : (
//           <>
//             <div className="overflow-x-auto">
//               <table className="min-w-full">
//                 <thead>
//                   <tr className="bg-gray-50/50 border-b border-gray-100">
//                     <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Details</th>
//                     <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
//                     <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">BV</th>
//                     <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Added By</th>
//                     <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Added</th>
//                     <th className="py-4 px-6 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-50">
//                   {currentPageItems.map((item) => (
//                     <tr key={item._id} className="group hover:bg-green-50/30 transition-colors">
//                       <td className="py-4 px-6">
//                         <p className="font-medium text-gray-900 text-sm">{item.name}</p>
//                         <p className="text-xs text-gray-400">ID: {item._id.slice(-6)}</p>
//                       </td>
//                       <td className="py-4 px-6">
//                         <span
//                           className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
//                             item.quantity <= 10
//                               ? "bg-red-50 text-red-700 border-red-100"
//                               : item.quantity < 20
//                               ? "bg-orange-50 text-orange-700 border-orange-100"
//                               : "bg-green-50 text-green-700 border-green-100"
//                           }`}
//                         >
//                           {item.quantity <= 10 ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
//                           {item.quantity} Units
//                         </span>
//                       </td>

//                       <td className="py-4 px-6 text-sm text-gray-600 font-medium">{item.bv}</td>
                      
//                       <td className="py-4 px-6">
//                         <div className="text-sm text-gray-700">
//                              {item.addedBy
//                                 ? item.addedBy.username || "Admin"
//                                 : <span className="text-gray-400 italic">System</span>}
//                         </div>
//                       </td>
                      
//                       <td className="py-4 px-6">
//                         <div className="flex items-center gap-2 text-sm text-gray-500">
//                             <Calendar size={14} className="text-gray-400" />
//                             {new Date(item.createdAt).toLocaleDateString()}
//                         </div>
//                       </td>
                      
//                       <td className="py-4 px-6 text-right">
//                         <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
//                           <button
//                             onClick={() => handleEdit(item)}
//                             className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
//                             title="Edit Item"
//                           >
//                             <Edit3 size={16} />
//                           </button>
//                           <button
//                             onClick={() => handleDelete(item._id)}
//                             className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//                             title="Delete Item"
//                           >
//                             <Trash2 size={16} />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* Pagination Controls */}
//             {totalPages > 1 && (
//                 <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 flex items-center justify-between">
//                     <p className="text-sm text-gray-500">
//                     Showing <span className="font-medium">{(page - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-medium">{Math.min(page * ITEMS_PER_PAGE, filteredStock.length)}</span> of <span className="font-medium">{filteredStock.length}</span> items
//                     </p>
//                     <div className="flex gap-2">
//                     <button
//                         disabled={page === 1}
//                         onClick={() => setPage(page - 1)}
//                         className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                     >
//                         <ChevronLeft size={18} />
//                     </button>
//                     <button
//                         disabled={page === totalPages}
//                         onClick={() => setPage(page + 1)}
//                         className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                     >
//                         <ChevronRight size={18} />
//                     </button>
//                     </div>
//                 </div>
//             )}
//           </>
//         )}
//       </div>

//       {/* Edit Modal */}
//       {editItem && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform scale-100 transition-all">
//             {/* Modal Header */}
//             <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
//                 <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
//                     <Edit3 size={18} className="text-blue-600" />
//                     Edit Inventory
//                 </h2>
//                 <button onClick={() => setEditItem(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
//                     <X size={20} />
//                 </button>
//             </div>

//             {/* Modal Body */}
//             <div className="p-6 space-y-4">
//                 <div>
//                     <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Product Name</label>
//                     <input
//                         type="text"
//                         value={editItem.name}
//                         onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
//                         className="w-full border border-gray-200 px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
//                         placeholder="Product name"
//                     />
//                 </div>
                
//                 <div className="grid grid-cols-2 gap-4">
//                     <div>
//                         <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Quantity</label>
//                         <input
//                             type="number"
//                             value={editItem.quantity}
//                             onChange={(e) => setEditItem({ ...editItem, quantity: e.target.value })}
//                             className="w-full border border-gray-200 px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
//                             placeholder="0"
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">BV Points</label>
//                         <input
//                             type="number"
//                             value={editItem.bv}
//                             onChange={(e) => setEditItem({ ...editItem, bv: e.target.value })}
//                             className="w-full border border-gray-200 px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
//                             placeholder="0"
//                         />
//                     </div>
//                 </div>
//             </div>

//             {/* Modal Footer */}
//             <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
//               <button
//                 onClick={() => setEditItem(null)}
//                 className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleUpdate}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 shadow-lg shadow-blue-900/20 transition-all active:scale-95 flex items-center gap-2"
//               >
//                 <Save size={16} />
//                 Save Changes
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ManageStock;


import React, { useEffect, useState } from "react";
import {
  Package,
  Trash2,
  Edit3,
  Loader2,
  Search,
  Filter,
  X,
  Save,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  User,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const ITEMS_PER_PAGE = 10;

const ManageStock = () => {
  const [stock, setStock] = useState([]);
  const [filteredStock, setFilteredStock] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [filterOption, setFilterOption] = useState("latest");
  const [editItem, setEditItem] = useState(null);

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
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStock(filtered);
    setPage(1);
  }, [searchTerm, stock]);

  // ⚙️ Sorting / Filter Options
  useEffect(() => {
    let sorted = [...filteredStock];
    if (filterOption === "latest") {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (filterOption === "oldest") {
      sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (filterOption === "lowStock") {
      sorted.sort((a, b) => a.quantity - b.quantity);
    } else if (filterOption === "highStock") {
      sorted.sort((a, b) => b.quantity - a.quantity);
    }
    setFilteredStock(sorted);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterOption]);

  // ✅ Detect Mobile Screen Size
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Edit Stock
  const handleEdit = (item) => setEditItem(item);

  const handleUpdate = async () => {
    if (!editItem.name || !editItem.quantity)
      return toast.error("⚠️ All fields required!");
    try {
      const res = await axios.put(
        `${SERVER_URL}/api/stock/${editItem._id}`,
        editItem
      );
      setStock(stock.map((s) => (s._id === editItem._id ? res.data : s)));
      setEditItem(null);
      toast.success("✏️ Stock updated successfully!");
    } catch {
      toast.error("❌ Error updating stock!");
    }
  };

  // ❌ Delete Stock
  const handleDelete = async (id) => {
    if (window.confirm("Delete this stock item?")) {
      try {
        await axios.delete(`${SERVER_URL}/api/stock/${id}`);
        setStock(stock.filter((s) => s._id !== id));
        toast.success("🗑️ Stock deleted!");
      } catch {
        toast.error("❌ Error deleting stock!");
      }
    }
  };

  // 📑 Pagination
  const totalPages = Math.ceil(filteredStock.length / ITEMS_PER_PAGE);
  const currentPageItems = filteredStock.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 px-4 sm:px-6 lg:px-8 pt-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg shrink-0">
              <Package size={24} className="text-green-700" />
            </div>
            Admin Stock Management
          </h1>
          <p className="text-sm text-gray-500 mt-1 ml-1">
            Monitor inventory levels and update product details.
          </p>
        </div>
      </div>

      {/* Controls: Search + Filter */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all shadow-sm text-sm"
          />
        </div>

        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm w-full md:w-auto">
          <Filter className="text-gray-400 shrink-0" size={16} />
          <span className="text-sm text-gray-500 font-medium whitespace-nowrap">Sort:</span>
          <select
            value={filterOption}
            onChange={(e) => setFilterOption(e.target.value)}
            className="outline-none bg-transparent text-gray-700 text-sm font-medium cursor-pointer w-full"
          >
            <option value="latest">Latest Added</option>
            <option value="oldest">Oldest First</option>
            <option value="highStock">Highest Quantity</option>
            <option value="lowStock">Lowest Quantity</option>
          </select>
        </div>
      </div>

      {/* Stock List / Table */}
      <div className="bg-white shadow-sm rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 text-green-600">
            <Loader2 size={32} className="animate-spin mb-3" />
            <p className="text-sm text-gray-500 font-medium">
              Loading inventory...
            </p>
          </div>
        ) : currentPageItems.length === 0 ? (
          <div className="text-center py-16">
            <Package size={48} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-500 font-medium">
              No stock records found.
            </p>
            <p className="text-sm text-gray-400">
              Try adjusting your search filters.
            </p>
          </div>
        ) : isMobile ? (
          /* 📱 MOBILE VIEW: Cards */
          <div className="divide-y divide-gray-100">
            {currentPageItems.map((item) => (
              <div key={item._id} className="p-4 flex flex-col gap-3 relative">
                <div className="flex justify-between items-start pr-16">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm truncate max-w-[200px]">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      ID: {item._id.slice(-6)}
                    </p>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${
                      item.quantity <= 10
                        ? "bg-red-50 text-red-700 border-red-100"
                        : item.quantity < 20
                        ? "bg-orange-50 text-orange-700 border-orange-100"
                        : "bg-green-50 text-green-700 border-green-100"
                    }`}
                  >
                    {item.quantity <= 10 ? (
                      <AlertTriangle size={10} />
                    ) : (
                      <CheckCircle2 size={10} />
                    )}
                    {item.quantity} Units
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                    BV: {item.bv}
                  </span>
                </div>

                {/* Metadata */}
                <div className="flex items-center justify-between text-xs text-gray-500 mt-1 bg-gray-50 p-2 rounded-lg">
                  <div className="flex items-center gap-1.5">
                    <User size={12} />
                    <span className="truncate max-w-[80px]">
                      {item.addedBy ? item.addedBy.username || "Admin" : "System"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} />
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions (Absolute Positioned Top Right) */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors border border-gray-200"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors border border-gray-200"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* 💻 DESKTOP VIEW: Table */
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Product Details
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    BV
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Added By
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date Added
                  </th>
                  <th className="py-4 px-6 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentPageItems.map((item) => (
                  <tr
                    key={item._id}
                    className="group hover:bg-green-50/30 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <p className="font-medium text-gray-900 text-sm">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        ID: {item._id.slice(-6)}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                          item.quantity <= 10
                            ? "bg-red-50 text-red-700 border-red-100"
                            : item.quantity < 20
                            ? "bg-orange-50 text-orange-700 border-orange-100"
                            : "bg-green-50 text-green-700 border-green-100"
                        }`}
                      >
                        {item.quantity <= 10 ? (
                          <AlertTriangle size={12} />
                        ) : (
                          <CheckCircle2 size={12} />
                        )}
                        {item.quantity} Units
                      </span>
                    </td>

                    <td className="py-4 px-6 text-sm text-gray-600 font-medium">
                      {item.bv}
                    </td>

                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-700">
                        {item.addedBy ? (
                          item.addedBy.username || "Admin"
                        ) : (
                          <span className="text-gray-400 italic">System</span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar size={14} className="text-gray-400" />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Item"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Item"
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
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 text-center sm:text-left">
              Showing <span className="font-medium">{(page - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(page * ITEMS_PER_PAGE, filteredStock.length)}
              </span>{" "}
              of <span className="font-medium">{filteredStock.length}</span> items
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl transform transition-all scale-100 overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Edit3 size={18} className="text-blue-600" />
                Edit Inventory
              </h2>
              <button
                onClick={() => setEditItem(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Product Name
                </label>
                <input
                  type="text"
                  value={editItem.name}
                  onChange={(e) =>
                    setEditItem({ ...editItem, name: e.target.value })
                  }
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="Product name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={editItem.quantity}
                    onChange={(e) =>
                      setEditItem({ ...editItem, quantity: e.target.value })
                    }
                    className="w-full border border-gray-200 px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    BV Points
                  </label>
                  <input
                    type="number"
                    value={editItem.bv}
                    onChange={(e) =>
                      setEditItem({ ...editItem, bv: e.target.value })
                    }
                    className="w-full border border-gray-200 px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setEditItem(null)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 shadow-lg shadow-blue-900/20 transition-all active:scale-95 flex items-center gap-2"
              >
                <Save size={16} />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStock;