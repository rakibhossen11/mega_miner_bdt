// app/components/ChannelList.jsx
'use client';

export default function ChannelList({ channels, onSelect, currentChannel }) {
  if (!channels || channels.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>কোনো চ্যানেল পাওয়া যায়নি</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-4">
      {channels.map((channel, index) => (
        <div
          key={channel.id || index}
          onClick={() => onSelect(channel)}
          className={`cursor-pointer rounded-lg p-2 transition-all hover:scale-105 border-2 ${
            currentChannel?.src === channel.src
              ? 'border-blue-500 bg-blue-50 shadow-lg'
              : 'border-transparent hover:border-gray-300 hover:shadow-md'
          }`}
        >
          <div className="relative w-full aspect-video bg-gray-200 rounded-lg overflow-hidden">
            {channel.logo ? (
              <img
                src={channel.logo}
                alt={channel.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 text-4xl">
                📺
              </div>
            )}
          </div>
          <p className="text-xs text-center font-medium mt-1 line-clamp-2">
            {channel.name || 'Unknown Channel'}
          </p>
          {channel.group && (
            <p className="text-[10px] text-center text-gray-500 truncate">
              {channel.group}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}