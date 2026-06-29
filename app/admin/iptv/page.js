// app/iptv/page.js
'use client';

import { useState, useEffect } from 'react';
import VideoPlayer from '@/app/components/VideoPlayer';
import ChannelList from '@/app/components/ChannelList';

export default function IPTVPage() {
  const [channels, setChannels] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // প্লেলিস্ট লোড করা
  useEffect(() => {
    const loadPlaylist = async () => {
      try {
        setLoading(true);
        setError('');
        
        const res = await fetch('/api/playlist');
        const data = await res.json();
        
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to load playlist');
        }
        
        setChannels(data.channels);
        setSelectedIndex(0);
      } catch (err) {
        setError(err.message);
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPlaylist();
  }, []);

  // পরবর্তী চ্যানেল
  const goToNext = () => {
    if (channels.length === 0) return;
    setSelectedIndex((prev) => (prev + 1) % channels.length);
  };

  // পূর্ববর্তী চ্যানেল
  const goToPrev = () => {
    if (channels.length === 0) return;
    setSelectedIndex((prev) => (prev - 1 + channels.length) % channels.length);
  };

  const currentChannel = channels[selectedIndex] || null;

  // লোডিং স্টেট
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">⏳ চ্যানেল লোড হচ্ছে...</p>
      </div>
    );
  }

  // এরর স্টেট
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full text-center">
          <p className="text-red-600 text-xl">❌ {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            আবার চেষ্টা করুন
          </button>
        </div>
      </div>
    );
  }

  // কোনো চ্যানেল নেই
  if (channels.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md w-full text-center">
          <p className="text-yellow-600 text-xl">📺 কোনো চ্যানেল পাওয়া যায়নি</p>
          <p className="text-gray-500 mt-2">প্লেলিস্টে কোনো চ্যানেল নাও থাকতে পারে</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* হেডার */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            📺 প্রিমিয়াম IPTV
          </h1>
          <span className="text-sm text-gray-400 bg-white/10 px-3 py-1 rounded-full">
            {channels.length} টি চ্যানেল
          </span>
        </div>

        {/* ভিডিও প্লেয়ার */}
        {currentChannel && (
          <VideoPlayer
            src={currentChannel.src}
            channelName={currentChannel.name}
            channelLogo={currentChannel.logo}
            onNext={goToNext}
            onPrev={goToPrev}
          />
        )}

        {/* বর্তমান চ্যানেলের গ্রুপ */}
        {currentChannel?.group && (
          <p className="text-sm text-gray-400 text-center mt-2">
            {currentChannel.group}
          </p>
        )}

        {/* কীবোর্ড শর্টকাট ইন্ডিকেটর */}
        <div className="text-center text-xs text-gray-500 mt-2">
          ⌨️ ← → দিয়ে চ্যানেল পরিবর্তন করুন
        </div>

        {/* চ্যানেল লিস্ট */}
        <ChannelList
          channels={channels}
          onSelect={(channel) => {
            const index = channels.findIndex((ch) => ch.src === channel.src);
            if (index !== -1) setSelectedIndex(index);
          }}
          currentChannel={currentChannel}
        />
      </div>
    </div>
  );
}