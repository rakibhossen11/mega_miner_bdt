// app/components/VideoPlayer.jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import {
  PlayIcon,
  PauseIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ForwardIcon,
  BackwardIcon,
  ArrowsRightLeftIcon,
} from '@heroicons/react/24/solid';

export default function VideoPlayer({ src, channelName, channelLogo, onNext, onPrev }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPiP, setIsPiP] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // HLS সেটআপ
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    setLoading(true);
    setError('');

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false);
        video.play().catch(() => setLoading(false));
      });

      hls.on(Hls.Events.ERROR, (e, data) => {
        if (data.fatal) {
          setError('ভিডিও লোড করতে সমস্যা হচ্ছে');
          setLoading(false);
        }
      });

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        setLoading(false);
        video.play().catch(() => setLoading(false));
      });
    } else {
      setError('এই ব্রাউজার HLS সাপোর্ট করে না');
      setLoading(false);
    }
  }, [src]);

  // কন্ট্রোল অটো-হাইড
  useEffect(() => {
    let timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      return () => {
        container.removeEventListener('mousemove', handleMouseMove);
        clearTimeout(timeout);
      };
    }
  }, []);

  // প্লে/পজ টগল
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  // ভলিউম পরিবর্তন
  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  // মিউট টগল
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
    if (!video.muted) {
      setVolume(video.volume);
    } else {
      setVolume(0);
    }
  };

  // ফুলস্ক্রিন টগল
  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // PiP টগল
  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (document.pictureInPictureEnabled) {
      if (!document.pictureInPictureElement) {
        await video.requestPictureInPicture();
        setIsPiP(true);
      } else {
        await document.exitPictureInPicture();
        setIsPiP(false);
      }
    }
  };

  // সময় আপডেট
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);
      setDuration(video.duration || 0);
    }
  };

  // স্লাইডার দিয়ে সময় পরিবর্তন
  const handleSeek = (e) => {
    const val = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  // ফরম্যাট সময়
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // চ্যানেল পরিবর্তন
  const handleChannelChange = (direction) => {
    if (direction === 'next' && onNext) {
      onNext();
    } else if (direction === 'prev' && onPrev) {
      onPrev();
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black rounded-2xl overflow-hidden group"
      style={{ aspectRatio: '16/9' }}
    >
      {/* ভিডিও এলিমেন্ট */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
        playsInline
      />

      {/* লোডিং স্টেট */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent" />
        </div>
      )}

      {/* এরর স্টেট */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <div className="text-white text-center p-4">
            <p className="text-xl mb-2">⚠️ {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              আবার চেষ্টা করুন
            </button>
          </div>
        </div>
      )}

      {/* চ্যানেলের নাম ও লোগো (ওভারলে) */}
      {channelName && (
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
          <div className="flex items-center gap-3">
            {channelLogo && (
              <img
                src={channelLogo}
                alt={channelName}
                className="w-10 h-10 rounded-lg object-cover bg-white/10"
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
            <span className="text-white font-semibold text-lg drop-shadow-lg">
              {channelName}
            </span>
          </div>
        </div>
      )}

      {/* কন্ট্রোল ওভারলে */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* সেন্টার কন্ট্রোল (প্লে/পজ) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="bg-white/20 backdrop-blur-md rounded-full p-4 hover:bg-white/30 transition-all transform hover:scale-110"
          >
            {isPlaying ? (
              <PauseIcon className="w-12 h-12 text-white" />
            ) : (
              <PlayIcon className="w-12 h-12 text-white" />
            )}
          </button>
        </div>

        {/* নীচের কন্ট্রোল বার */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
          {/* প্রগ্রেস বার */}
          <div className="flex items-center gap-3">
            <span className="text-white text-sm font-mono min-w-[4rem]">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-blue-500 
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 
                [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full 
                [&::-webkit-slider-thumb]:bg-blue-500"
            />
            <span className="text-white text-sm font-mono min-w-[4rem]">
              {formatTime(duration)}
            </span>
          </div>

          {/* বাটন ও কন্ট্রোল */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* প্রিভিয়াস চ্যানেল */}
              <button
                onClick={() => handleChannelChange('prev')}
                className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition"
                title="পূর্ববর্তী চ্যানেল"
              >
                <BackwardIcon className="w-5 h-5" />
              </button>

              {/* প্লে/পজ */}
              <button
                onClick={togglePlay}
                className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition"
              >
                {isPlaying ? (
                  <PauseIcon className="w-6 h-6" />
                ) : (
                  <PlayIcon className="w-6 h-6" />
                )}
              </button>

              {/* নেক্সট চ্যানেল */}
              <button
                onClick={() => handleChannelChange('next')}
                className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition"
                title="পরবর্তী চ্যানেল"
              >
                <ForwardIcon className="w-5 h-5" />
              </button>

              {/* ভলিউম কন্ট্রোল */}
              <div className="flex items-center gap-2 group/volume">
                <button
                  onClick={toggleMute}
                  className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition"
                >
                  {isMuted || volume === 0 ? (
                    <SpeakerXMarkIcon className="w-5 h-5" />
                  ) : (
                    <SpeakerWaveIcon className="w-5 h-5" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 sm:w-28 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-blue-500
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 
                    [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full 
                    [&::-webkit-slider-thumb]:bg-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* PiP */}
              {document.pictureInPictureEnabled && (
                <button
                  onClick={togglePiP}
                  className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition"
                  title="পিকচার-ইন-পিকচার"
                >
                  <ArrowsRightLeftIcon className="w-5 h-5" />
                </button>
              )}

              {/* ফুলস্ক্রিন */}
              <button
                onClick={toggleFullscreen}
                className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition"
                title="ফুলস্ক্রিন"
              >
                {isFullscreen ? (
                  <ArrowsPointingInIcon className="w-5 h-5" />
                ) : (
                  <ArrowsPointingOutIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}