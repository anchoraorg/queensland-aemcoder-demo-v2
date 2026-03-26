// YouTube video mappings — map image alt text to YouTube video IDs
const VIDEO_MAP = {
  'That Holiday Feeling video': 'X9FUaB-127Y',
};

function getYouTubeIdFromUrl(url) {
  if (!url) return null;
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) return watchMatch[1];
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) return shortMatch[1];
  const thumbMatch = url.match(/img\.youtube\.com\/vi\/([^/]+)/);
  if (thumbMatch) return thumbMatch[1];
  return null;
}

function getYouTubeIdFromAlt(alt) {
  if (!alt) return null;
  const match = alt.match(/\[yt:([^\]]+)\]/);
  if (match) return match[1];
  return VIDEO_MAP[alt] || null;
}

function createYouTubeEmbed(videoId) {
  const iframe = document.createElement('iframe');
  iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=0&mute=0&controls=1&rel=0&modestbranding=1`;
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
  iframe.title = 'YouTube Video Player';
  return iframe;
}

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-cta-${cols.length}-cols`);

  // setup image and video columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      // detect YouTube thumbnail images and convert to embedded iframe
      const img = col.querySelector('img');
      if (img) {
        let videoId = getYouTubeIdFromUrl(img.src);
        if (!videoId) videoId = getYouTubeIdFromAlt(img.alt);
        if (videoId) {
          const iframe = createYouTubeEmbed(videoId);
          col.textContent = '';
          col.appendChild(iframe);
          col.classList.add('columns-cta-video-col');
          return;
        }
      }

      // detect YouTube links and convert to embedded iframe
      const link = col.querySelector('a');
      if (link) {
        const videoId = getYouTubeIdFromUrl(link.href);
        if (videoId) {
          const iframe = createYouTubeEmbed(videoId);
          col.textContent = '';
          col.appendChild(iframe);
          col.classList.add('columns-cta-video-col');
          return;
        }
      }

      // regular image column
      const pic = col.querySelector('picture') || col.querySelector('img');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          picWrapper.classList.add('columns-cta-img-col');
        }
      }
    });
  });
}
