"use client";
import { useState } from "react";

export default function AdminDashboard() {
  // Mock States - অ্যাডমিন প্যানেলের নকল ডেটা
  const [totalUsers, setTotalUsers] = useState(1420);
  const [totalPendingAmount, setTotalPendingAmount] = useState(3450); // মোট পেন্ডিং টাকা
  
  // উইথড্র রিকোয়েস্টের তালিকা (বিকাশ ও নগদ)
  const [withdrawRequests, setWithdrawRequests] = useState([
    { id: 1, username: "rahim_99", method: "bKash", number: "01712345678", amount: 150, status: "Pending", date: "2026-06-15" },
    { id: 2, username: "arif_khan", method: "Nagad", number: "01998765432", amount: 50, status: "Pending", date: "2026-06-16" },
    { id: 3, username: "sumon_vau", method: "bKash", number: "01555555555", amount: 500, status: "Pending", date: "2026-06-16" },
  ]);

  // রিকোয়েস্ট অ্যাপ্রুভ করার ফাংশন
  const handleApprove = (id, amount) => {
    setWithdrawRequests(prev =>
      prev.map(req => req.id === id ? { ...req, status: "Approved" } : req)
    );
    setTotalPendingAmount(prev => prev - amount);
    alert("রিকোয়েস্টটি সফলভাবে অনুমোদিত (Approved) হয়েছে!");
  };

  // রিকোয়েস্ট রিজেক্ট করার ফাংশন
  const handleReject = (id, amount) => {
    setWithdrawRequests(prev =>
      prev.map(req => req.id === id ? { ...req, status: "Rejected" } : req)
    );
    setTotalPendingAmount(prev => prev - amount);
    alert("রিকোয়েস্টটি বাতিল (Rejected) করা হয়েছে!");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      {/* অ্যাডমিন হেডার বার */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-red-500 to-rose-400 bg-clip-text text-transparent">
            MegaMiner BD - Admin Control Panel
          </h1>
          <p className="text-slate-400 text-xs mt-1">সিস্টেম মনিটরিং এবং ইউজার পেমেন্ট ম্যানেজমেন্ট</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-xl">
          <span className="text-sm font-bold text-red-400 font-mono">Role: Super Admin</span>
        </div>
      </div>

      {/* অ্যাডমিন স্ট্যাটস কার্ডস */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <p className="text-slate-400 text-sm mb-1">Total Registered Users</p>
          <h2 className="text-3xl font-black text-slate-100">{totalUsers} <span className="text-xs text-slate-500">Active</span></h2>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl border-l-4 border-l-amber-500">
          <p className="text-slate-400 text-sm mb-1">Pending Requests</p>
          <h2 className="text-3xl font-black text-amber-400">
            {withdrawRequests.filter(r => r.status === "Pending").length} <span className="text-xs text-slate-500">Tickets</span>
          </h2>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl border-l-4 border-l-rose-500">
          <p className="text-slate-400 text-sm mb-1">Total Pending Cashout</p>
          <h2 className="text-3xl font-black text-rose-400">৳{totalPendingAmount.toFixed(2)}</h2>
        </div>
      </div>

      {/* উইথড্র রিকোয়েস্ট ম্যানেজমেন্ট টেবিল */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-slate-200 mb-4">📥 Pending Withdrawal Requests</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="text-xs uppercase bg-slate-950 text-slate-300 border-b border-slate-800">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Method</th>
                <th className="p-4">Account Number</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {withdrawRequests.map((req) => (
                <tr key={req.id} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                  <td className="p-4 font-medium text-slate-200">{req.username}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      req.method === "bKash" ? "bg-pink-500/10 text-pink-400" : "bg-orange-500/10 text-orange-400"
                    }`}>
                      {req.method}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-slate-300">{req.number}</td>
                  <td className="p-4 text-emerald-400 font-bold">৳{req.amount}.00</td>
                  <td className="p-4 text-xs">{req.date}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      req.status === "Pending" ? "bg-amber-500/10 text-amber-400" :
                      req.status === "Approved" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="p-4 flex gap-2 justify-center">
                    {req.status === "Pending" ? (
                      <>
                        <button
                          onClick={() => handleApprove(req.id, req.amount)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg transition-all active:scale-95"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(req.id, req.amount)}
                          className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all active:scale-95"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-slate-600 italic">No action needed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}