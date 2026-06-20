"use client";
import { Provider } from "react-redux";
import { store } from "./store";
import { useState, useEffect } from "react";

export function ReduxProvider({ children }) {
  const [mounted, setMounted] = useState(false);

  // সার্ভার এবং ক্লায়েন্টের Hydration কনফ্লিক্ট থেকে পেজ প্রটেক্ট করার জন্য
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // মাউন্ট হওয়ার আগে ব্ল্যাঙ্ক বা ডিফল্ট লেআউট দেখাবে যাতে ক্র্যাশ না করে
  }

  return <Provider store={store}>{children}</Provider>;
}