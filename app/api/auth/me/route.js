import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/auth'; // 🚀 আমাদের তৈরি করা আপডেট সেশন চেকার

export async function GET() {
  try {
    // ১. কুকি ও ডাটাবেজ থেকে সক্রিয় সেশন ডাটা আনা
    const userSession = await getSession();
    console.log('Auth Me API Route Check:', userSession);
    
    if (!userSession) {
      console.error('❌ No valid database session found or session expired');
      return NextResponse.json(
        { success: false, message: 'Not authenticated or session expired' },
        { status: 401 }
      );
    }

    console.log('✅ Active session user verified:', userSession.username);

    // ২. সাকসেস রেসপন্স পাঠানো 
    // getSession() থেকে আসা অবজেক্ট প্রপার্টির (id, username, email) সাথে মিল রেখে রেসপন্স
    return NextResponse.json({ 
      success: true, 
      data: {
        userId: parseInt(userSession.id),        // user_id (integer)
        username: userSession.username,           // username
        userEmail: userSession.email,             // user_email
        totalCoin: parseFloat(userSession.totalCoin || 0),
        miningWallet: parseFloat(userSession.miningWallet || 0)
      }
    }, { status: 200 });

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