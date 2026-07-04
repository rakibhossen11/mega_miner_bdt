import { NextResponse } from 'next/server';
import { deleteSession } from '@/app/lib/auth'; // 🚀 আমাদের আপডেট করা সেশন ডিলিটার মেথড

export async function POST() {
  try {
    // ১. ডাটাবেজ থেকে সেশন রো ডিলিট এবং ব্রাউজার কুকি ক্লিয়ার করা
    // deleteSession() ফাংশনটি নিজে থেকেই কুকি থেকে 'session_token' রিড করে ডাটাবেজ থেকে তা রিমুভ করবে
    await deleteSession();

    console.log('✅ Secure node session purged successfully.');

    // ২. সাকসেস রেসপন্স পাঠানো
    return NextResponse.json(
      { 
        success: true, 
        message: "Logged out successfully from node system." 
      }, 
      { status: 200 }
    );

  } catch (error) {
    console.error('Purge Session API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Internal Server Error during session clearance." 
      }, 
      { status: 500 }
    );
  }
}