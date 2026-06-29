// app/utils/parseM3U.js
export function parseM3U(m3uData) {
  const lines = m3uData.split('\n');
  const channels = [];
  let currentChannel = { name: '', logo: '', group: '', src: '' };

  lines.forEach((line) => {
    line = line.trim();

    if (line.startsWith('#EXTINF:')) {
      // লোগো ও গ্রুপ টাইটেল বের করা
      const logoMatch = line.match(/tvg-logo="([^"]*)"/);
      const groupMatch = line.match(/group-title="([^"]*)"/);
      const nameMatch = line.split(',').pop() || 'Unknown Channel';

      currentChannel = {
        name: nameMatch.trim(),
        logo: logoMatch ? logoMatch[1] : '',
        group: groupMatch ? groupMatch[1] : '',
        src: '',
      };
    } else if (line && !line.startsWith('#') && currentChannel.name) {
      currentChannel.src = line;
      channels.push({ ...currentChannel });
      currentChannel = { name: '', logo: '', group: '', src: '' };
    }
  });

  return channels;
}