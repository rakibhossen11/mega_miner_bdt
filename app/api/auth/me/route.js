// app/api/auth/me/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSession } from '@/app/lib/auth'; // 🚀 ফিক্সড: আমাদের তৈরি করা সেশন চেকার ইম্পোর্ট করলাম

export async function GET() {
  try {
    // ১. Next.js লেটেস্ট স্ট্যান্ডার্ড অনুযায়ী সেশন চেক করা
    // getSession() ফাংশনটি নিজে থেকেই কুকি থেকে 'session_token' রিড করবে এবং ডাটাবেজ চেক করবে
    const userSession = await getSession();
    console.log('me page',userSession);
    
    if (!userSession) {
      console.error('No valid database session found or session expired');
      return NextResponse.json(
        { success: false, message: 'Not authenticated or session expired' },
        { status: 401 }
      );
    }

    console.log('Active session user found:', userSession);

    // ২. সাকসেস রেসপন্স পাঠানো 
    // getSession() অলরেডি ডাটাবেজ থেকে u."id", u."username", u."email" নিয়ে এসেছে
    return NextResponse.json({ 
      success: true, 
      data: {
        id: userSession.id,
        username: userSession.username,
        email: userSession.email
      }
    });

  } catch (error) {
    console.error('Unexpected error in /api/auth/me:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}