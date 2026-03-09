import React, { useState } from "react";
import { User, Phone, Hash, Plus, Save } from "lucide-react";
import toast from "react-hot-toast";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

function Registration() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    idNumber: "",
    dob: "",
    dor: "",
    gender: "",
    nationality: "",
    otherNationality: "",
    amount: 1500,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.name.trim()) return "Full name is required.";
    if (!/^[0-9]{10,}$/.test(form.phone)) return "Enter a valid phone number.";
    if (!form.gender) return "Select gender.";
    if (!form.nationality) return "Select nationality.";
    if (form.nationality === "Other" && !form.otherNationality.trim())
      return "Specify other nationality.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return toast.error(err);

    const payload = {
      ...form,
      nationality:
        form.nationality === "Other" ? form.otherNationality : form.nationality,
    };
    delete payload.otherNationality;

    try {
      setLoading(true);
      const res = await fetch(`${SERVER_URL}/api/distributors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Distributor registered successfully.");
        setForm({
          name: "",
          phone: "",
          idNumber: "",
          dob: "",
          dor: "",
          gender: "",
          nationality: "",
          otherNationality: "",
          amount: 1500,
        });
      } else {
        toast.error(data.error || "Failed to register.");
      }
    } catch (e) {
      toast.error("Server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-24">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-emerald-900 flex items-center gap-2">
            <Plus size={18} className="text-emerald-600" /> Distributor
            Registration
          </h2>
          <p className="text-sm text-gray-500">Amount: KSh 1,500 (fixed)</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
              />
            </div>
          </div>

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
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="07..."
                  className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
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
                  name="idNumber"
                  value={form.idNumber}
                  onChange={handleChange}
                  placeholder="ID No."
                  className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Date of Birth
              </label>
              <input
                name="dob"
                value={form.dob}
                onChange={handleChange}
                type="date"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Reg. Date
              </label>
              <input
                name="dor"
                value={form.dor}
                onChange={handleChange}
                type="date"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
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
                value={form.nationality}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
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

          {form.nationality === "Other" && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Specify Nationality
              </label>
              <input
                name="otherNationality"
                value={form.otherNationality}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Amount (KSh)
            </label>
            <input
              name="amount"
              value={form.amount}
              readOnly
              disabled
              className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-700"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-bold tracking-wide shadow-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 hover:shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              {loading ? <Save size={16} /> : <Plus size={16} />} Submit
              Registration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Registration;
