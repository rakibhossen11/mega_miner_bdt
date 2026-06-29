"use client";
import { useEffect, useRef } from "react";

export default function AdsterraBanner() {
  const bannerRef = useRef(null);

  useEffect(() => {
    // ⚠️ আপনার Adsterra ড্যাশবোর্ড থেকে পাওয়া 'atOptions' এর ভেতরের 'key' এবং 'format' এখানে বসাবেন।
    // আপাতত একটি স্ট্যান্ডার্ড ৭২৮x৯০ ব্যানার সাইজের কনফিগারেশন দেওয়া হলো।
    const atOptions = {
      key: "c3b5d5e2f6a7b8c9d0e1f2a3b4c5d6e7", // 👈 এখানে Adsterra থেকে দেওয়া আসল Key বসান
      format: "iframe",
      height: 90,
      width: 728,
      params: {},
    };

    if (bannerRef.current && !bannerRef.current.firstChild) {
      const confScript = document.createElement("script");
      confScript.type = "text/javascript";
      confScript.innerHTML = `atOptions = ${JSON.stringify(atOptions)}`;

      const invokeScript = document.createElement("script");
      invokeScript.type = "text/javascript";
      invokeScript.src = `http${window.location.protocol === "https:" ? "s" : ""}://www.highperformanceformat.com/${atOptions.key}/invoke.js`;

      bannerRef.current.appendChild(confScript);
      bannerRef.current.appendChild(invokeScript);
    }
  }, []);

  return (
    <div className="w-full flex justify-center items-center my-6 overflow-hidden">
      {/* 💻 অ্যাডভার্টাইজমেন্ট কন্টেইনার */}
      <div 
        ref={bannerRef} 
        className="min-h-[90px] min-w-[320px] bg-[#0d160f]/30 border border-lime-950/20 rounded-xl flex items-center justify-center text-zinc-600 text-xs tracking-widest uppercase font-mono shadow-inner"
      >
        {/* অ্যাড লোড হওয়ার আগে এই লেখাটি দেখাবে */}
        <span className="animate-pulse p-2 text-center">Sponsored Node Loading...</span>
      </div>
    </div>
  );
}