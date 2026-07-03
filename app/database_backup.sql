-- =========================================================================
-- MEGA MINER BDT - 100% PROFESSIONAL ARCHITECTURE WITH DATABASE COMMENTS (2026)
-- =========================================================================

-- -------------------------------------------------------------------------
-- ১. USERS TABLE (মেইন ইউজার অ্যাকাউন্টস)
-- -------------------------------------------------------------------------
CREATE TABLE "users" (
    "user_id" SERIAL,                             
    "username" VARCHAR(50) UNIQUE NOT NULL,       
    "user_email" VARCHAR(100) UNIQUE NOT NULL,         
    "password_hash" VARCHAR(255) NOT NULL,        
    "referred_by" INTEGER NULL,                   
    "status" VARCHAR(20) DEFAULT 'active',         
    "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- টেবিল ও কলাম কমেন্টস
COMMENT ON TABLE "users" IS 'মেগা মাইনার অ্যাপের মূল ইউজার অ্যাকাউন্ট রেজিস্ট্রি টেবিল';
COMMENT ON COLUMN "users"."user_id" IS 'ইউজারের ইউনিক আইডেন্টিফিকেশন নম্বর (Primary Key)';
COMMENT ON COLUMN "users"."username" IS 'ইউজারের ইউনিক লগইন নাম';
COMMENT ON COLUMN "users"."user_email" IS 'ইউজারের ইউনিক ইমেইল এড্রেস';
COMMENT ON COLUMN "users"."password_hash" IS 'Bcrypt দ্বারা এনক্রিপ্ট করা পাসওয়ার্ড হ্যাশ';
COMMENT ON COLUMN "users"."referred_by" IS 'যিনি রেফার করেছেন তার user_id';
COMMENT ON COLUMN "users"."status" IS 'ইউজারের অ্যাকাউন্ট স্ট্যাটাস (active/suspended)';
COMMENT ON COLUMN "users"."created_at" IS 'অ্যাকাউন্ট তৈরির সঠিক সময়';


-- -------------------------------------------------------------------------
-- ২. USER_WALLETS TABLE (মাইনিং এবং ব্যালেন্স মেকানিজম)
-- -------------------------------------------------------------------------
CREATE TABLE "user_wallets" (
    "wallet_id" SERIAL,                           
    "user_id" INTEGER UNIQUE NOT NULL,            
    "user_email" VARCHAR(255) UNIQUE NOT NULL,     
    "username" VARCHAR(50) NULL,                  
    "total_coin" NUMERIC(20, 8) DEFAULT 100.00000000, 
    "total_dollar" NUMERIC(10, 2) DEFAULT 0.00,    
    "mining_speed" NUMERIC(5, 2) DEFAULT 1.50,     
    "daily_bonus" NUMERIC(10, 2) DEFAULT 0.00,
    "hybrid_speed" NUMERIC(5, 2) DEFAULT 0.00,
    "boost_power" NUMERIC(5, 2) DEFAULT 1.00,
    "last_claim_daily_bonus_time" TIMESTAMP WITH TIME ZONE NULL,
    "last_claim_reward_time" TIMESTAMP WITH TIME ZONE NULL,
    "mining_wallet" NUMERIC(20, 8) DEFAULT 0.00000000, 
    "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_wallets_pkey" PRIMARY KEY ("wallet_id"),
    CONSTRAINT "user_wallets_user_id_fkey" FOREIGN KEY ("user_id") 
        REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- টেবিল ও কলাম কমেন্টস
COMMENT ON TABLE "user_wallets" IS 'ইউজারদের মাইনিং ব্যালেন্স এবং কয়েন স্টোরেজ ওয়ালেট টেবিল';
COMMENT ON COLUMN "user_wallets"."wallet_id" IS 'ওয়ালেটের নিজস্ব ইউনিক আইডি';
COMMENT ON COLUMN "user_wallets"."user_id" IS 'users টেবিলের সাথে সংযুক্ত ইউজার আইডি (One-to-One Link)';
COMMENT ON COLUMN "user_wallets"."total_coin" IS 'ইউজারের মূল ভল্ট বা প্রধান কয়েন ব্যালেন্স';
COMMENT ON COLUMN "user_wallets"."mining_wallet" IS 'ইউজারের লাইভ মাইনিং কাউন্টার ওয়ালেট (যা ভল্টে সিঙ্ক করা হয়)';
COMMENT ON COLUMN "user_wallets"."mining_speed" IS 'ইউজারের বেসিক বা ডিফল্ট মাইনিং গতি';
COMMENT ON COLUMN "user_wallets"."boost_power" IS 'ইউজারের মাইনিং পাওয়ার বুস্টার মাল্টিপ্লায়ার';


-- -------------------------------------------------------------------------
-- ৩. SESSION TABLE (লগইন সেশন ও নিরাপত্তা)
-- -------------------------------------------------------------------------
CREATE TABLE "Session" (
    "session_id" SERIAL,                          
    "user_id" INTEGER NOT NULL,                   
    "session_token" VARCHAR(255) UNIQUE NOT NULL, 
    "expires" TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("session_id"),
    CONSTRAINT "Session_user_id_fkey" FOREIGN KEY ("user_id") 
        REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- টেবিল ও কলাম কমেন্টস
COMMENT ON TABLE "Session" IS 'ইউজারদের সক্রিয় লগইন সেশন এবং ডিভাইস ট্র্যাকিং টেবিল';
COMMENT ON COLUMN "Session"."session_id" IS 'সেশনের নিজস্ব অটো-ইনক্রিমেন্ট আইডি';
COMMENT ON COLUMN "Session"."user_id" IS 'সেশনটি যে ইউজারের তার আইডি';
COMMENT ON COLUMN "Session"."session_token" IS 'ব্রাউজার কুকিতে পাঠানো ইউনিক UUID সেশন টোকেন';
COMMENT ON COLUMN "Session"."expires" IS 'সেশনটির মেয়াদ শেষ হওয়ার শেষ সময় এবং তারিখ';


-- -------------------------------------------------------------------------
-- ৪. REFERRALS TABLE (রেফারেল নেটওয়ার্ক এবং বোনাস লজিংস)
-- -------------------------------------------------------------------------
CREATE TABLE "referrals" (
    "referral_id" SERIAL,                         
    "referrer_id" INTEGER NOT NULL,               
    "referrer_username" VARCHAR(50) NOT NULL,
    "referred_id" INTEGER NOT NULL,               
    "referred_username" VARCHAR(50) NOT NULL,
    "referrer_bonus_coins" INTEGER DEFAULT 500,   
    "referred_bonus_coins" INTEGER DEFAULT 100,   
    "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("referral_id"),
    CONSTRAINT "referrals_referrer_id_fkey" FOREIGN KEY ("referrer_id") REFERENCES "users"("user_id") ON DELETE CASCADE,
    CONSTRAINT "referrals_referred_id_fkey" FOREIGN KEY ("referred_id") REFERENCES "users"("user_id") ON DELETE CASCADE
);

-- টেবিল ও কলাম কমেন্টস
COMMENT ON TABLE "referrals" IS 'ইউজারদের রেফারেল ইতিহাস এবং বোনাস বিতরণের ট্র্যাকিং টেবিল';
COMMENT ON COLUMN "referrals"."referrer_id" IS 'যিনি আমন্ত্রণ বা রেফার করেছেন তার user_id';
COMMENT ON COLUMN "referrals"."referred_id" IS 'যিনি নতুন আমন্ত্রিত হয়ে জয়েন করেছেন তার user_id';
COMMENT ON COLUMN "referrals"."referrer_bonus_coins" IS 'রেফার করার জন্য পুরষ্কারস্বরূপ পাওয়া কয়েন বোনাস';
COMMENT ON COLUMN "referrals"."referred_bonus_coins" IS 'রেফারেল লিংক দিয়ে জয়েন করার জন্য নতুন ইউজারের পাওয়া সাইন-আপ বোনাস';


-- -------------------------------------------------------------------------
-- ⚡ দ্রুত কুয়েরি এক্সিকিউশনের জন্য পারফরম্যান্স বুস্টার ইনডেক্স
-- -------------------------------------------------------------------------
CREATE INDEX "user_wallets_user_id_idx" ON "user_wallets"("user_id");
CREATE INDEX "Session_user_id_idx" ON "Session"("user_id");
CREATE INDEX "referrals_referrer_id_idx" ON "referrals"("referrer_id");