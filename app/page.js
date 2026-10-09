'use client';

import { useState } from 'react';
import Image from 'next/image';
import LoginPage from './auth/login/page';

export default function Home() {

  return (
    <div className="">
      <main className="">
        <LoginPage />
      </main>
    </div>
  );
}