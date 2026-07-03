// app/api/auth/login/route.js (নিশ্চিত করুন ফোল্ডার নাম 'login' নাকি 'signin')
import { NextResponse } from "next/server";
import { query } from "@/app/lib/db"; 
import bcrypt from "bcryptjs";
import { createSession } from "@/app/lib/auth"; 

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body; 

    // ১. ইনপুট ভ্যালিডেশন
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Please enter your email or username and password." },
        { status: 400 }
      );
    }

    const cleanIdentifier = email.trim().toLowerCase();

    // ২. ডাটাবেজ কুয়েরি: আপনার রিকোয়েস্ট অনুযায়ী টেবিলের নাম "users" করা হলো
    const userQuery = 'SELECT "id", "username", "email", "password_hash", "status" FROM "users" WHERE "username" = $1 OR "email" = $2';
    const userRes = await query(userQuery, [cleanIdentifier, cleanIdentifier]);

    if (userRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials. User not found." },
        { status: 401 }
      );
    }

    const user = userRes.rows[0];

    // ৩. অ্যাকাউন্ট স্ট্যাটাস চেক
    if (user.status === "suspended") {
      return NextResponse.json(
        { success: false, error: "Your account has been suspended. Contact support." },
        { status: 403 }
      );
    }

    // ৪. পাসওয়ার্ড ভেরিফিকেশন
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials. Wrong password." },
        { status: 401 }
      );
    }

    // ৫. ডাটাবেজ ভিত্তিক সেশন তৈরি এবং কুকি সেট করা
    await createSession(user.id);

    // ৬. সাকসেস রেসপন্স পাঠানো
    return NextResponse.json(
      { 
        success: true, 
        message: "Login successful! Redirecting...",
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email 
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Authentication Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error during login." },
      { status: 500 }
    );
  }
}

// import { NextResponse } from "next/server";
// import { query } from "@/app/lib/db"; // আপনার db কানেকশন অনুযায়ী পাথ ঠিক রাখবেন
// import bcrypt from "bcryptjs";
// import { createSession } from "@/app/lib/auth"; // আপনার সেশন ফাংশনটি যেখানে আছে সেখান থেকে ইম্পোর্ট করুন

// export async function POST(request) {
//   try {
//     const body = await request.json();
//     // console.log("Login Request Body:", body);
    
//     // 🔄 ফিক্সড: ক্লায়েন্ট সাইড থেকে পাঠানো 'email' প্রোপার্টি রিসিভ করা হচ্ছে
//     // (যা ইমেইল বা ইউজারনেম যেকোনো একটি হতে পারে)
//     const { email, password } = body; 

//     // ১. ইনপুট ভ্যালিডেশন
//     if (!email || !password) {
//       return NextResponse.json(
//         { success: false, error: "Please enter your email or username and password." },
//         { status: 400 }
//       );
//     }

//     const cleanIdentifier = email.trim().toLowerCase();

//     // ২. ডাটাবেজ কুয়েরি: ইউজার টেবিল এবং কলামের নাম আপনার pgAdmin স্ক্রিনশট অনুযায়ী মেলানো হয়েছে
//     const userQuery = 'SELECT "id", "username", "email", "password_hash", "status" FROM "users" WHERE "username" = $1 OR "email" = $2';
//     const userRes = await query(userQuery, [cleanIdentifier, cleanIdentifier]);

//     if (userRes.rows.length === 0) {
//       return NextResponse.json(
//         { success: false, error: "Invalid credentials. User not found." },
//         { status: 401 }
//       );
//     }

//     const user = userRes.rows[0];

//     // ৩. অ্যাকাউন্ট স্ট্যাটাস চেক
//     if (user.status === "suspended") {
//       return NextResponse.json(
//         { success: false, error: "Your account has been suspended. Contact support." },
//         { status: 403 }
//       );
//     }

//     // ৪. পাসওয়ার্ড ভেরিফিকেশন
//     const isPasswordValid = await bcrypt.compare(password, user.password_hash);
//     if (!isPasswordValid) {
//       return NextResponse.json(
//         { success: false, error: "Invalid credentials. Wrong password." },
//         { status: 401 }
//       );
//     }

//     // ৫. ডাটাবেজ ভিত্তিক সেশন তৈরি এবং কুকি সেট করা
//     await createSession(user.id);

//     // ৬. সাকসেস রেসপন্স পাঠানো
//     return NextResponse.json(
//       { 
//         success: true, 
//         message: "Login successful! Redirecting...",
//         user: { 
//           id: user.id, 
//           username: user.username, 
//           email: user.email 
//         }
//       },
//       { status: 200 }
//     );

//   } catch (error) {
//     console.error("Authentication Error:", error);
//     return NextResponse.json(
//       { success: false, error: "Internal Server Error during login." },
//       { status: 500 }
//     );
//   }
// }