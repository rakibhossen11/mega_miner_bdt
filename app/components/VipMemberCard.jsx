"use client";
import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

export default function VipMemberCard() {
  return (
    <div
      onClick={() => router.push("/dashboard/upgrade")}
      className="bg-[#4f46e5] rounded-[20px] p-4 my-5 flex items-center justify-between cursor-pointer"
    >
      <div className="flex-1 mr-[10px]">
        <h3 className="text-white text-[16px] font-bold">
          Upgrade VIP Membership
        </h3>
        <p className="text-[#c7d2fe] text-[12px] mt-1">
          Get 2x faster mining rate & ad-free experience.
        </p>
      </div>
      <ArrowRight color="#fff" size={20} />
    </div>
  );
}
