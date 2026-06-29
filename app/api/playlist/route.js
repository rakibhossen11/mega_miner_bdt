// app/api/playlist/route.js
import { parseM3U } from '@/app/utils/parseM3U';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // তোমার দেওয়া URL
    // const playlistUrl = 'https://github.com/abusaeeidx/Mrgify-BDIX-IPTV/raw/main/playlist.m3u';
    // const playlistUrl = 'https://raw.githubusercontent.com/sydul104/main04/refs/heads/main/my';
    // const playlistUrl = 'https://github.com/abusaeeidx/Mrgify-BDIX-IPTV/raw/main/playlist.m3u';
    // const playlistUrl = 'https://iptv-org.github.io/iptv/index.m3u';
    const playlistUrl = 'https://github.com/abusaeeidx/Mrgify-BDIX-IPTV/raw/main/playlist.m3u';
    
    const response = await fetch(playlistUrl, {
      next: { revalidate: 3600 } // ১ ঘন্টা পর পর ক্যাশ রিফ্রেশ
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const m3uData = await response.text();
    const channels = parseM3U(m3uData);

    return NextResponse.json({ 
      success: true, 
      channels,
      total: channels.length 
    });
  } catch (error) {
    console.error('Error fetching playlist:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to load playlist',
      details: error.message 
    }, { status: 500 });
  }
}